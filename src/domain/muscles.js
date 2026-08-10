/**
 * Muscle model: taxonomy, weekly volume, and recovery.
 *
 * The interesting part is the recovery model. Every set you log deposits
 * *stimulus* into the muscles that exercise trains, weighted by how much
 * each muscle actually contributes (the 1–5 score in the exercise database).
 * That stimulus then decays over time. What's left is fatigue; what's
 * missing is readiness.
 *
 * This is what lets the app answer "what should I train today" with
 * something better than a fixed Push/Pull/Legs rotation: it can see that
 * your chest is still cooked from Tuesday but your back is fresh.
 *
 * The numbers are evidence-informed, not precise science:
 *  - Volume is counted in *hard sets per muscle per week*, the standard unit
 *    in the hypertrophy literature. 10–20 sets/week is the usual productive
 *    band; below 8 is maintenance, above 22 is likely junk volume.
 *  - Recovery is modelled as exponential decay. Large muscle groups that
 *    absorb heavy compound loading are given a longer half-life than small
 *    isolation-trained ones.
 */

import { EXERCISES } from '../data/exercise-db.js';

const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

// ---------------------------------------------------------------- taxonomy

/**
 * Display groups. `muscles` are the granular names that appear in the
 * exercise database's `muscles[].name`.
 */
export const MUSCLE_GROUPS = [
  // `short` is for the dense readiness rail, where six labels share the
  // screen width and the full names truncate to "SHOULDE…".
  { id: 'chest',    label: 'Chest',         short: 'Chest', color: 'var(--focus-push)',
    muscles: ['Chest', 'Upper Chest', 'Lower Chest'] },
  { id: 'back',     label: 'Back',          short: 'Back',  color: 'var(--focus-pull)',
    muscles: ['Lats', 'Upper Back', 'Mid Back', 'Rhomboids', 'Upper Traps', 'Mid Traps', 'Mid/Lower Traps', 'Spinal Erectors'] },
  { id: 'shoulders', label: 'Shoulders',    short: 'Delts', color: 'var(--gold)',
    muscles: ['Front Delts', 'Side Delts', 'Rear Delts', 'Rotator Cuff'] },
  { id: 'arms',     label: 'Arms',          short: 'Arms',  color: 'var(--focus-upper)',
    muscles: ['Biceps', 'Brachialis', 'Triceps', 'Triceps Long Head', 'Other Triceps Heads', 'Forearms', 'Brachioradialis'] },
  { id: 'core',     label: 'Core',          short: 'Core',  color: 'var(--warning)',
    muscles: ['Abs', 'Obliques', 'Deep Core', 'Hip Flexors', 'Serratus'] },
  { id: 'legs',     label: 'Legs & Glutes', short: 'Legs',  color: 'var(--focus-legs)',
    muscles: ['Quads', 'Hamstrings', 'Glutes', 'Adductors', 'Calves', 'Gastrocnemius', 'Soleus'] },
];

/**
 * Recovery half-life in hours, per group. Larger muscles trained with heavy
 * compound movements clear fatigue more slowly than small ones trained with
 * light isolation work.
 */
const HALF_LIFE_HOURS = {
  chest: 48,
  back: 54,
  shoulders: 40,
  arms: 36,
  core: 30,
  legs: 60,
};

/** Weekly hard-set landmarks, per group. */
const VOLUME_LANDMARKS = {
  chest:     { maintenance: 6,  min: 10, max: 20 },
  back:      { maintenance: 8,  min: 12, max: 22 },
  shoulders: { maintenance: 6,  min: 10, max: 20 },
  arms:      { maintenance: 4,  min: 8,  max: 18 },
  core:      { maintenance: 4,  min: 6,  max: 16 },
  legs:      { maintenance: 6,  min: 10, max: 20 },
};

const groupOfMuscle = new Map();
MUSCLE_GROUPS.forEach((group) => {
  group.muscles.forEach((m) => groupOfMuscle.set(m.toLowerCase(), group.id));
});

export function getGroup(id) {
  return MUSCLE_GROUPS.find((g) => g.id === id) || null;
}

// ---------------------------------------------------------------- lookup

const byName = new Map();
const byAlias = new Map();
EXERCISES.forEach((ex) => {
  byName.set(ex.name.toLowerCase(), ex);
  (ex.aliases || []).forEach((a) => byAlias.set(a.toLowerCase(), ex));
});

/** Find an exercise record by canonical name or alias. */
export function findExercise(name) {
  if (!name) return null;
  const key = String(name).toLowerCase().trim();
  return byName.get(key) || byAlias.get(key) || null;
}

/**
 * Muscle involvement for an exercise as `{ muscleName: score 1-5 }`.
 * Unknown exercises return an empty map rather than throwing — the log is
 * full of free-text names from before the database existed.
 */
export function musclesFor(exerciseName) {
  const ex = findExercise(exerciseName);
  if (!ex?.muscles?.length) return {};
  return Object.fromEntries(ex.muscles.map((m) => [m.name, m.score]));
}

// ---------------------------------------------------------------- volume

/**
 * Effective hard sets contributed to each muscle group by one session.
 *
 * A set on an exercise where a muscle scores 5/5 counts as a full set for
 * that muscle; a 2/5 secondary contribution counts as 0.4. This is the
 * "fractional set" approach — cruder than measuring tension, but it stops
 * a bench press from being counted as full triceps volume.
 */
export function sessionSetsByMuscle(session) {
  const totals = {};
  session.exercises.forEach((ex) => {
    const setCount = ex.sets.length;
    if (!setCount) return;
    Object.entries(musclesFor(ex.name)).forEach(([muscle, score]) => {
      const key = muscle.toLowerCase();
      if (!groupOfMuscle.has(key)) return;
      totals[key] = (totals[key] || 0) + setCount * (score / 5);
    });
  });
  return totals;
}

/**
 * Reduce per-muscle figures to one number per group by taking the hardest
 * hit muscle, not the sum.
 *
 * Summing was wrong in a way that mattered. The 10-20 sets/week landmarks
 * these numbers are shown against are defined *per muscle*, but a squat
 * credits quads, glutes, hamstrings and adductors all at once — so one
 * real set counted as 2.4 "leg sets". A normal 13-set leg day reported
 * 24.6 of 10-20 sets/week: one session over the weekly maximum. Measured
 * across the database the inflation ran 1.68x for legs and 1.49x for core
 * against 0.78x for chest, so the groups were not even comparable with
 * each other.
 *
 * The maximum keeps the figure on the same scale as the landmark, and
 * makes a group's readiness identical to its most fatigued muscle — so
 * the headline and the per-muscle breakdown beneath it agree by
 * construction rather than by hope.
 */
function byGroupFromMuscles(perMuscle, { sparse = false } = {}) {
  const totals = sparse ? {} : Object.fromEntries(MUSCLE_GROUPS.map((g) => [g.id, 0]));

  MUSCLE_GROUPS.forEach((group) => {
    let peak = 0;
    group.muscles.forEach((name) => {
      const value = perMuscle[name.toLowerCase()] || 0;
      if (value > peak) peak = value;
    });
    if (peak > 0 || !sparse) totals[group.id] = peak;
  });

  return totals;
}

/** Effective hard sets each group took in one session. */
export function sessionSetsByGroup(session) {
  return byGroupFromMuscles(sessionSetsByMuscle(session), { sparse: true });
}

/** Hard sets per group over the trailing `days`. */
export function volumeByGroup(sessions, days = 7) {
  // Reduce to groups only after totalling the window, not per session: a
  // muscle worked twice in a week should show the week's total.
  return byGroupFromMuscles(volumeByMuscle(sessions, days));
}

/**
 * Classify weekly volume against the landmarks.
 * @returns {'none'|'low'|'optimal'|'high'}
 */
export function volumeStatus(groupId, sets) {
  const marks = VOLUME_LANDMARKS[groupId];
  if (!marks || sets <= 0) return 'none';
  if (sets < marks.maintenance) return 'low';
  if (sets < marks.min) return 'low';
  if (sets <= marks.max) return 'optimal';
  return 'high';
}

export function volumeTarget(groupId) {
  return VOLUME_LANDMARKS[groupId] || { maintenance: 6, min: 10, max: 20 };
}

// ---------------------------------------------------------------- recovery

/**
 * Current fatigue per muscle group, 0 (fully recovered) to 1 (fully cooked).
 *
 * Each session deposits stimulus proportional to its effective set count,
 * normalised against that group's optimal weekly volume so a "hard session"
 * means the same thing for calves as for quads. Stimulus then decays with
 * the group's half-life.
 */
/**
 * Hours since a session, or null if it should not count towards fatigue.
 *
 * Sessions are dated, not timestamped, so we assume an evening session.
 * That assumption used to discard anything with a negative age — which
 * silently threw away *today's* session for the whole day until 18:00.
 * Train at 09:00 and the app reported you completely fresh at 10:00,
 * which is precisely when the answer matters most.
 *
 * A session dated today now counts as just finished; only sessions dated
 * later than today are excluded, because those are planned rather than
 * performed. Dates are compared in UTC, matching how they are written.
 */
function hoursSinceSession(session, now) {
  const hours = (now - new Date(`${session.date}T18:00:00`).getTime()) / HOUR_MS;
  if (hours > 24 * 14) return null; // beyond 2 weeks: gone
  if (hours >= 0) return hours;
  return session.date > new Date(now).toISOString().slice(0, 10) ? null : 0;
}

export function fatigueByGroup(sessions, now = Date.now()) {
  // A group is as tired as its most tired muscle — see byGroupFromMuscles
  // for why this is a maximum and not a sum.
  return byGroupFromMuscles(fatigueByMuscle(sessions, now));
}

/** Readiness is the inverse of fatigue: 0 = cooked, 1 = fresh. */
export function readinessByGroup(sessions, now = Date.now()) {
  const fatigue = fatigueByGroup(sessions, now);
  return Object.fromEntries(Object.entries(fatigue).map(([id, f]) => [id, 1 - f]));
}

// ------------------------------------------------------- per-muscle detail

/**
 * The same fatigue model, one level down — keyed by individual muscle
 * rather than by group.
 *
 * A group average hides the thing you usually want to know. "Arms 57%"
 * can mean both heads are half-cooked, or that triceps are wrecked and
 * biceps are untouched, and those imply completely different sessions.
 *
 * Deliberately identical to `fatigueByGroup` in half-life, per-session
 * dose and saturation, so a group and its dominant muscle read in the same
 * units and a breakdown can never contradict the headline it sits under.
 * The only difference is that contributions are not summed across the
 * muscles of a group.
 *
 * @returns {Object<string, number>} fatigue 0-1, keyed by lowercased name
 */
export function fatigueByMuscle(sessions, now = Date.now()) {
  const fatigue = {};

  sessions.forEach((session) => {
    const hoursAgo = hoursSinceSession(session, now);
    if (hoursAgo === null) return;

    session.exercises.forEach((ex) => {
      const setCount = ex.sets.length;
      if (!setCount) return;

      Object.entries(musclesFor(ex.name)).forEach(([muscle, score]) => {
        const key = muscle.toLowerCase();
        const groupId = groupOfMuscle.get(key);
        if (!groupId) return;

        const decay = Math.pow(0.5, hoursAgo / (HALF_LIFE_HOURS[groupId] || 48));
        const perSessionDose = volumeTarget(groupId).max / 3;
        fatigue[key] = (fatigue[key] || 0) + ((setCount * (score / 5)) / perSessionDose) * decay;
      });
    });
  });

  Object.keys(fatigue).forEach((key) => {
    fatigue[key] = 1 - Math.exp(-fatigue[key]);
  });
  return fatigue;
}

/** Effective hard sets per individual muscle over the trailing `days`. */
export function volumeByMuscle(sessions, days = 7) {
  const cutoff = Date.now() - days * DAY_MS;
  const totals = {};

  sessions.forEach((session) => {
    if (new Date(`${session.date}T12:00:00`).getTime() < cutoff) return;
    session.exercises.forEach((ex) => {
      const setCount = ex.sets.length;
      if (!setCount) return;
      Object.entries(musclesFor(ex.name)).forEach(([muscle, score]) => {
        const key = muscle.toLowerCase();
        totals[key] = (totals[key] || 0) + setCount * (score / 5);
      });
    });
  });

  return totals;
}

/**
 * Muscle names the exercise database actually references. The group
 * taxonomy lists a few finer distinctions than any exercise records, and
 * showing those as permanently-100% rows would be noise.
 */
const referencedMuscles = new Set();
EXERCISES.forEach((ex) =>
  (ex.muscles || []).forEach((m) => referencedMuscles.add(m.name.toLowerCase())),
);

/**
 * Per-muscle readiness for one group, most fatigued first — which is the
 * order the question is asked in ("what exactly is tired?").
 *
 * @returns {Array<{name: string, readiness: number, sets: number}>}
 */
export function muscleBreakdown(sessions, groupId, now = Date.now()) {
  const group = getGroup(groupId);
  if (!group) return [];

  const fatigue = fatigueByMuscle(sessions, now);
  const volume = volumeByMuscle(sessions, 7);

  return group.muscles
    .filter((name) => referencedMuscles.has(name.toLowerCase()))
    .map((name) => {
      const key = name.toLowerCase();
      return {
        name,
        readiness: 1 - (fatigue[key] || 0),
        sets: Math.round((volume[key] || 0) * 10) / 10,
      };
    })
    .sort((a, b) => a.readiness - b.readiness);
}

/**
 * Recommend what to train next.
 *
 * Scores every group on how ready it is *and* how far below its weekly
 * volume target it is, then returns them best-first. This replaces the fixed
 * Push → Pull → Legs rotation with something that responds to what you have
 * actually been doing.
 */
export function recommendTraining(sessions, now = Date.now()) {
  const readiness = readinessByGroup(sessions, now);
  const volume = volumeByGroup(sessions, 7);

  return MUSCLE_GROUPS.map((group) => {
    const ready = readiness[group.id];
    const sets = volume[group.id];
    const target = volumeTarget(group.id);

    // How much of this week's target is still owed, 0–1.
    const deficit = Math.max(0, Math.min(1, (target.min - sets) / target.min));

    // Readiness gates: training a cooked muscle is worse than useless, so it
    // weighs more heavily than the volume debt.
    const score = ready * 0.65 + deficit * 0.35;

    return {
      ...group,
      readiness: ready,
      sets: Math.round(sets * 10) / 10,
      target,
      status: volumeStatus(group.id, sets),
      score,
    };
  }).sort((a, b) => b.score - a.score);
}

/**
 * Groups carrying the largest weekly volume debt, worst first.
 *
 * "Least recently trained" on the Log hero was a statement about the
 * Push/Pull/Legs rotation, not about you — it could not tell you that your
 * back had two sets this week while your legs had twelve. This reads the
 * same numbers the Muscles tab shows and names the groups actually going
 * short.
 *
 * Ties are broken by how long ago the group was last trained, which
 * matters for a fresh log where every group is equally at zero.
 */
export function undertrainedGroups(sessions, limit = 3) {
  const volume = volumeByGroup(sessions, 7);

  const lastTrained = {};
  sessions.forEach((session) => {
    const when = new Date(`${session.date}T18:00:00`).getTime();
    Object.keys(sessionSetsByGroup(session)).forEach((id) => {
      lastTrained[id] = Math.max(lastTrained[id] || 0, when);
    });
  });

  return MUSCLE_GROUPS.map((group) => {
    const sets = volume[group.id] || 0;
    const target = volumeTarget(group.id);
    return {
      ...group,
      sets: Math.round(sets * 10) / 10,
      deficit: Math.max(0, (target.min - sets) / target.min),
      lastTrained: lastTrained[group.id] || 0,
    };
  })
    .filter((g) => g.deficit > 0)
    .sort((a, b) => b.deficit - a.deficit || a.lastTrained - b.lastTrained)
    .slice(0, limit);
}

/**
 * Substitutes for an exercise, best first.
 *
 * The question this answers is a gym-floor one: the machine you wanted is
 * occupied, so what else trains the same thing right now? That makes
 * *different equipment* a feature rather than a mismatch — another
 * variation of the same movement on the same machine is useless to you.
 *
 * Two signals, in order of trust:
 *
 *   familyName  The database already groups movements — "Flat Press"
 *               covers the push-up, dumbbell, barbell and machine
 *               versions. A family sibling is a direct swap.
 *   primary muscle overlap
 *               For anything without family siblings, how much of the
 *               original's primary work the candidate reproduces,
 *               penalised for pulling in a lot of unrelated primaries so
 *               a whole-body lift is not offered as a substitute for a
 *               calf raise.
 */
export function alternativesFor(name, limit = 6) {
  const source = findExercise(name);
  if (!source) return [];

  const primary = new Map(
    (source.muscles || [])
      .filter((m) => m.role === 'primary')
      .map((m) => [m.name.toLowerCase(), m.score]),
  );
  const sourcePrimaryTotal = [...primary.values()].reduce((a, b) => a + b, 0);

  return EXERCISES.map((ex) => {
    if (ex.id === source.id || ex.name === source.name) return null;

    const sameFamily = !!source.familyName && ex.familyName === source.familyName;

    let overlap = 0;
    let candidateTotal = 0;
    (ex.muscles || [])
      .filter((m) => m.role === 'primary')
      .forEach((m) => {
        candidateTotal += m.score;
        const shared = primary.get(m.name.toLowerCase());
        if (shared) overlap += Math.min(shared, m.score);
      });

    if (!sameFamily && !overlap) return null;

    const coverage = sourcePrimaryTotal ? overlap / sourcePrimaryTotal : 0;
    const focus = candidateTotal ? overlap / candidateTotal : 0;
    // Different kit is the point of the question, so it is a real bonus
    // rather than a tiebreak — but not enough to beat a much better match.
    const equipmentBonus = ex.equipment !== source.equipment ? 1.2 : 1;

    return {
      ...ex,
      sameFamily,
      score: (sameFamily ? 1 + coverage : coverage * focus) * equipmentBonus,
    };
  })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// ------------------------------------------------------- session builder

/** Equipment the database actually carries, in the order it is offered. */
export const EQUIPMENT = [
  'barbell', 'dumbbells', 'machine', 'plateLoaded', 'cable', 'bodyweight',
];

/**
 * How much each muscle wants work right now, 0-1.
 *
 * Two factors, multiplied rather than added, because they gate each other:
 * volume debt says a muscle is owed work, readiness says it can take it.
 * A muscle that is both behind and fresh scores high; one that is behind
 * but cooked scores near zero, which is correct — programming it today is
 * how you end up training a muscle that cannot adapt.
 */
function muscleNeeds(sessions, now = Date.now()) {
  const volume = volumeByMuscle(sessions, 7);
  const fatigue = fatigueByMuscle(sessions, now);
  const needs = {};

  MUSCLE_GROUPS.forEach((group) => {
    const target = volumeTarget(group.id).min;
    group.muscles.forEach((name) => {
      const key = name.toLowerCase();
      if (!referencedMuscles.has(key)) return;
      const debt = Math.max(0, (target - (volume[key] || 0)) / target);
      needs[key] = debt * (1 - (fatigue[key] || 0));
    });
  });

  return needs;
}

/**
 * Build a session that covers what is actually behind.
 *
 * Greedy set-cover rather than a fixed split: pick the exercise that best
 * serves the muscles currently most in need, credit the work it would do,
 * then pick again against what is left. That is what makes it answer "my
 * upper back has had nothing this week" with an exercise that trains upper
 * back, instead of with whichever day the rotation happens to be on.
 *
 * One exercise per movement family, so a plan cannot be three variations
 * of the same press.
 *
 * @param {object[]} sessions
 * @param {{equipment?: string[], size?: number, setsPerExercise?: number}} options
 * @returns {Array<{name, equipment, targets: string[], covers: number}>}
 */
export function buildSessionPlan(sessions, options = {}) {
  const { equipment = [], size = 5, setsPerExercise = 3, now = Date.now() } = options;

  const needs = muscleNeeds(sessions, now);
  const allowed = new Set(equipment);

  // An empty selection means "no preference" rather than "nothing allowed";
  // a filter that excludes everything would return an empty plan and look
  // broken rather than restrictive.
  let pool = EXERCISES.filter((ex) => !allowed.size || allowed.has(ex.equipment));
  if (!pool.length) pool = EXERCISES;

  /**
   * The muscle an exercise is chiefly for — its highest-scoring primary.
   * Two exercises that lead on the same muscle are the same slot in a
   * session, whatever their names say.
   */
  const leadMuscle = (ex) => {
    let lead = null;
    (ex.muscles || []).forEach((m) => {
      if (m.role !== 'primary') return;
      if (!lead || m.score > lead.score) lead = m;
    });
    return lead?.name.toLowerCase() ?? null;
  };

  const plan = [];
  const usedFamilies = new Set();
  const usedNames = new Set();
  const usedLeads = new Set();

  for (let pick = 0; pick < size; pick += 1) {
    let best = null;
    let bestScore = 0;

    pool.forEach((ex) => {
      if (usedNames.has(ex.name)) return;
      if (ex.familyName && usedFamilies.has(ex.familyName)) return;

      /**
       * One exercise per lead muscle.
       *
       * Weekly debt alone kept returning a trap bar deadlift *and* a
       * dumbbell deadlift: three sets clears only a third of a weekly
       * target, so the second still scored well, and the family check
       * misses it because those are different families. Weekly volume
       * says do more of it; a single session says spread it out.
       */
      const lead = leadMuscle(ex);
      if (lead && usedLeads.has(lead)) return;

      let score = 0;
      (ex.muscles || []).forEach((m) => {
        const key = m.name.toLowerCase();
        if (needs[key]) score += needs[key] * (m.score / 5);
      });

      if (score > bestScore) {
        bestScore = score;
        best = ex;
      }
    });

    // Nothing left that serves a muscle still in debt — a short plan is a
    // more honest answer than padding it with work you do not need.
    if (!best) break;

    usedNames.add(best.name);
    if (best.familyName) usedFamilies.add(best.familyName);
    const bestLead = leadMuscle(best);
    if (bestLead) usedLeads.add(bestLead);

    // Credit the work this exercise would do, so the next pick moves on.
    const targets = [];
    (best.muscles || []).forEach((m) => {
      const key = m.name.toLowerCase();
      if (needs[key] === undefined) return;
      const group = groupOfMuscle.get(key);
      const target = volumeTarget(group).min;
      const credited = (setsPerExercise * (m.score / 5)) / target;
      if (m.role === 'primary' && needs[key] > 0) targets.push(m.name);

      needs[key] = Math.max(0, needs[key] - credited);
    });

    plan.push({
      name: best.name,
      equipment: best.equipment,
      targets,
      covers: Math.round(bestScore * 100) / 100,
    });
  }

  return plan;
}

/** A short human explanation for a group's current state. */
export function describeRecovery(readiness) {
  if (readiness >= 0.9) return 'fresh';
  if (readiness >= 0.7) return 'ready';
  if (readiness >= 0.45) return 'recovering';
  if (readiness >= 0.2) return 'fatigued';
  return 'cooked';
}
