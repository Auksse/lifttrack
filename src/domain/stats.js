/**
 * Derived training statistics.
 *
 * All functions are pure: sessions in, numbers out. That makes them
 * trivially testable and means the UI can call them freely during render
 * without worrying about side effects.
 */

import { estimate1RM } from './progression.js';

const DAY_MS = 86_400_000;

/** Parse a 'YYYY-MM-DD' at midday so DST shifts can never move the date. */
export function parseDate(dateStr) {
  return new Date(`${dateStr}T12:00:00`);
}

export function daysSince(dateStr) {
  return Math.floor((Date.now() - parseDate(dateStr).getTime()) / DAY_MS);
}

/** Total load moved in a session: Σ reps × weight. Bodyweight-assisted
 *  (negative) loads clamp to 0 rather than subtracting from volume. */
export function sessionVolume(session) {
  return session.exercises.reduce(
    (total, ex) => total + ex.sets.reduce((sum, set) => sum + Number(set.r || 0) * Math.max(Number(set.w || 0), 0), 0),
    0,
  );
}

export function totalVolume(sessions) {
  return sessions.reduce((total, s) => total + sessionVolume(s), 0);
}

/** Monday-based week start — the training week, not the US calendar week. */
export function weekStart(date) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

export function sessionsThisWeek(sessions) {
  const start = weekStart(new Date()).getTime();
  return sessions.filter((s) => parseDate(s.date).getTime() >= start).length;
}

/**
 * Consecutive weeks (ending with the current or previous week) containing
 * at least one session. Counting from the previous week means the streak
 * doesn't read as broken on a Monday morning before you've trained.
 */
export function currentStreak(sessions) {
  if (!sessions.length) return 0;

  const weeks = new Set(sessions.map((s) => weekStart(parseDate(s.date)).getTime()));
  const thisWeek = weekStart(new Date()).getTime();

  let cursor = weeks.has(thisWeek) ? thisWeek : thisWeek - 7 * DAY_MS;
  if (!weeks.has(cursor)) return 0;

  let streak = 0;
  while (weeks.has(cursor)) {
    streak += 1;
    cursor -= 7 * DAY_MS;
  }
  return streak;
}

/**
 * Was this session a personal record for the given exercise?
 * A PR means beating the heaviest load ever previously lifted on it.
 */
export function isPersonalRecord(sessions, session, exerciseName) {
  const exercise = session.exercises.find((e) => e.name === exerciseName);
  if (!exercise?.sets?.length) return false;

  const best = Math.max(...exercise.sets.map((s) => Number(s.w) || 0));
  if (!(best > 0)) return false;

  const previous = sessions
    .filter((s) => s.date < session.date || (s.date === session.date && s.id !== session.id))
    .flatMap((s) => s.exercises.filter((e) => e.name === exerciseName))
    .flatMap((e) => e.sets.map((s) => Number(s.w) || 0));

  if (!previous.length) return false;
  return best > Math.max(...previous);
}

/** Total load moved by one exercise: reps × weight, summed over its sets. */
export function exerciseVolume(exercise) {
  return (exercise?.sets || []).reduce(
    (total, s) => total + (Number(s.r) || 0) * Math.max(Number(s.w) || 0, 0),
    0,
  );
}

/**
 * Did this exercise move more than the last time it was done?
 *
 * Compares against the most recent earlier session containing the same
 * exercise, not against the all-time best — the question is "was today
 * better than last time", which is a different and more encouraging
 * measure than a personal record.
 *
 * Bodyweight work logs a weight of zero, which would make every session
 * tie at zero volume. When both sides carry no load, total reps decide
 * instead, so an extra push-up still counts as progress.
 *
 * Returns false the first time an exercise appears: there is nothing to
 * have improved on.
 */
export function improvedOnLast(sessions, session, exerciseName) {
  const current = session.exercises.find((e) => e.name === exerciseName);
  if (!current?.sets?.length) return false;

  const earlier = sessions
    .filter((s) => s.date < session.date || (s.date === session.date && s.id !== session.id))
    .filter((s) => s.exercises.some((e) => e.name === exerciseName));
  if (!earlier.length) return false;

  const previous = earlier[earlier.length - 1].exercises.find((e) => e.name === exerciseName);

  const load = exerciseVolume(current);
  const previousLoad = exerciseVolume(previous);
  if (load > 0 || previousLoad > 0) return load > previousLoad;

  const reps = (a) => (a?.sets || []).reduce((n, s) => n + (Number(s.r) || 0), 0);
  return reps(current) > reps(previous);
}

export function countPersonalRecords(sessions) {
  let count = 0;
  sessions.forEach((session) => {
    session.exercises.forEach((ex) => {
      if (isPersonalRecord(sessions, session, ex.name)) count += 1;
    });
  });
  return count;
}

/** Exercise names logged at least `min` times, most frequent first. */
export function frequentExercises(sessions, min = 2) {
  const counts = new Map();
  sessions.forEach((s) =>
    s.exercises.forEach((e) => counts.set(e.name, (counts.get(e.name) || 0) + 1)),
  );
  return [...counts.entries()]
    .filter(([, n]) => n >= min)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);
}

/** Per-session history for one exercise — the series behind a trend chart. */
export function exerciseHistory(sessions, name) {
  return sessions
    .filter((s) => s.exercises.some((e) => e.name === name))
    .map((s) => {
      const ex = s.exercises.find((e) => e.name === name);
      const valid = ex.sets.filter((set) => Number(set.w) > 0 && Number(set.r) > 0);
      return {
        date: s.date,
        topWeight: Math.max(...ex.sets.map((set) => Number(set.w) || 0)),
        volume: Math.round(
          ex.sets.reduce((t, set) => t + Number(set.r || 0) * Math.max(Number(set.w || 0), 0), 0),
        ),
        best1RM: valid.length ? Math.max(...valid.map((set) => estimate1RM(set.w, set.r))) : 0,
      };
    });
}

/** The most recent session with a given focus, or null. */
export function lastSessionWithFocus(sessions, focus) {
  for (let i = sessions.length - 1; i >= 0; i -= 1) {
    if (sessions[i].focus === focus) return sessions[i];
  }
  return null;
}

/**
 * What to train next. Rotates Push → Pull → Legs when the last session was
 * part of that rotation; otherwise picks whichever has gone longest untrained.
 */
export function suggestNextFocus(sessions) {
  const rotation = ['Push', 'Pull', 'Legs'];
  if (!sessions.length) return { focus: 'Push', reason: 'First session' };

  const last = sessions[sessions.length - 1];
  const gap = daysSince(last.date);

  if (rotation.includes(last.focus)) {
    const next = rotation[(rotation.indexOf(last.focus) + 1) % rotation.length];
    return { focus: next, reason: `${last.focus} was ${gap}d ago` };
  }

  const lastDate = {};
  sessions.forEach((s) => {
    if (rotation.includes(s.focus)) lastDate[s.focus] = s.date;
  });
  const next = [...rotation].sort((a, b) => (lastDate[a] || '0').localeCompare(lastDate[b] || '0'))[0];
  return { focus: next, reason: 'Least recently trained' };
}

/** Group sessions by 'YYYY-MM' for month-headed lists. */
export function groupByMonth(sessions) {
  const groups = new Map();
  sessions.forEach((s) => {
    const key = s.date.slice(0, 7);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(s);
  });
  return groups;
}

/** How many sessions the focus split suggests per week, from recent history. */
export function weeklyTarget(sessions) {
  if (sessions.length < 4) return 0;
  const recent = sessions.slice(-12);
  const spanWeeks = Math.max(
    1,
    Math.round((parseDate(recent.at(-1).date) - parseDate(recent[0].date)) / (7 * DAY_MS)),
  );
  return Math.max(1, Math.round(recent.length / spanWeeks));
}
