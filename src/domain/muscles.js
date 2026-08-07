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
export function sessionSetsByGroup(session) {
  const totals = {};
  session.exercises.forEach((ex) => {
    const involvement = musclesFor(ex.name);
    const setCount = ex.sets.length;
    if (!setCount) return;

    Object.entries(involvement).forEach(([muscle, score]) => {
      const groupId = groupOfMuscle.get(muscle.toLowerCase());
      if (!groupId) return;
      totals[groupId] = (totals[groupId] || 0) + setCount * (score / 5);
    });
  });
  return totals;
}

/** Hard sets per group over the trailing `days`. */
export function volumeByGroup(sessions, days = 7) {
  const cutoff = Date.now() - days * DAY_MS;
  const totals = Object.fromEntries(MUSCLE_GROUPS.map((g) => [g.id, 0]));

  sessions.forEach((session) => {
    if (new Date(`${session.date}T12:00:00`).getTime() < cutoff) return;
    Object.entries(sessionSetsByGroup(session)).forEach(([groupId, sets]) => {
      totals[groupId] += sets;
    });
  });

  return totals;
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
  const fatigue = Object.fromEntries(MUSCLE_GROUPS.map((g) => [g.id, 0]));

  sessions.forEach((session) => {
    const hoursAgo = hoursSinceSession(session, now);
    if (hoursAgo === null) return;

    Object.entries(sessionSetsByGroup(session)).forEach(([groupId, sets]) => {
      const halfLife = HALF_LIFE_HOURS[groupId] || 48;
      const decay = Math.pow(0.5, hoursAgo / halfLife);

      // A session hitting a third of the weekly optimum is one "full" dose.
      const perSessionDose = volumeTarget(groupId).max / 3;
      fatigue[groupId] += (sets / perSessionDose) * decay;
    });
  });

  // Saturate rather than clip linearly: stacking three hard sessions should
  // approach, not exceed, "completely fried".
  Object.keys(fatigue).forEach((id) => {
    fatigue[id] = 1 - Math.exp(-fatigue[id]);
  });

  return fatigue;
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

/** A short human explanation for a group's current state. */
export function describeRecovery(readiness) {
  if (readiness >= 0.9) return 'fresh';
  if (readiness >= 0.7) return 'ready';
  if (readiness >= 0.45) return 'recovering';
  if (readiness >= 0.2) return 'fatigued';
  return 'cooked';
}
