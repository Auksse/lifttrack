/**
 * Progressive overload.
 *
 * Each exercise has a target rep range and a sensible load increment —
 * you add 2.5 kg to a squat and 0.5 kg to a lateral raise, not the same
 * number to both. Given the sets you did last time, we decide whether to
 * push the weight up, chase another rep, or hold and consolidate.
 */

/** @typedef {{min:number,max:number,inc:number,sets:number}} Profile */

const PROFILES = {
  'barbell bench press':                 { min: 5,  max: 8,  inc: 2.5,  sets: 4 },
  'dumbbell flat press':                 { min: 8,  max: 12, inc: 2,    sets: 4 },
  'dumbbell incline press':              { min: 8,  max: 12, inc: 2,    sets: 3 },
  'dumbbell overhead press':             { min: 6,  max: 10, inc: 2,    sets: 3 },
  'barbell overhead press':              { min: 6,  max: 10, inc: 2.5,  sets: 3 },
  'lat pulldown machine':                { min: 8,  max: 12, inc: 2.5,  sets: 4 },
  'seated row machine':                  { min: 8,  max: 12, inc: 2.5,  sets: 4 },
  'assisted dip machine':                { min: 10, max: 15, inc: 5,    sets: 3 },
  'leg press machine':                   { min: 10, max: 15, inc: 5,    sets: 4 },
  'plate-loaded leg press':              { min: 10, max: 15, inc: 5,    sets: 4 },
  'leg curl machine':                    { min: 10, max: 15, inc: 2.5,  sets: 3 },
  'leg extension machine':               { min: 10, max: 15, inc: 2.5,  sets: 3 },
  'dumbbell bulgarian split squat':      { min: 8,  max: 12, inc: 2,    sets: 3 },
  'barbell back squat':                  { min: 5,  max: 8,  inc: 2.5,  sets: 4 },
  'plate-loaded hip thrust':             { min: 12, max: 20, inc: 5,    sets: 3 },
  'barbell romanian deadlift':           { min: 8,  max: 12, inc: 2.5,  sets: 3 },
  'barbell curl':                        { min: 10, max: 15, inc: 1.25, sets: 3 },
  'biceps curl machine':                 { min: 10, max: 15, inc: 2.5,  sets: 3 },
  'dumbbell curl':                       { min: 10, max: 15, inc: 1,    sets: 3 },
  'dumbbell hammer curl':                { min: 10, max: 15, inc: 1,    sets: 3 },
  'cable triceps pushdown':              { min: 12, max: 15, inc: 1,    sets: 3 },
  'cable overhead triceps extension':    { min: 12, max: 15, inc: 1,    sets: 3 },
  'dumbbell overhead triceps extension': { min: 12, max: 15, inc: 1,    sets: 3 },
  'cable lateral raise':                 { min: 12, max: 20, inc: 0.5,  sets: 3 },
  'dumbbell lateral raise':              { min: 12, max: 20, inc: 0.5,  sets: 3 },
  'rear delt machine':                   { min: 15, max: 20, inc: 2.5,  sets: 3 },
  'cable face pull':                     { min: 15, max: 20, inc: 1,    sets: 3 },
  'pec deck':                            { min: 10, max: 14, inc: 3.5,  sets: 3 },
  'dumbbell fly':                        { min: 10, max: 14, inc: 2,    sets: 3 },
  'cable straight-arm pulldown':         { min: 10, max: 15, inc: 1,    sets: 3 },
  'standing calf raise machine':         { min: 15, max: 25, inc: 5,    sets: 3 },
  'standing calf raise':                 { min: 15, max: 25, inc: 5,    sets: 3 },
};

const FALLBACK_PROFILE = { min: 8, max: 12, inc: 2.5, sets: 3 };

/** @returns {Profile} */
export function getProfile(name) {
  return PROFILES[String(name || '').toLowerCase()] || FALLBACK_PROFILE;
}

/**
 * @typedef {Object} Suggestion
 * @property {'increase'|'progress'|'consolidate'} type
 * @property {string} reason   what happened last time
 * @property {number} sets
 * @property {number} reps
 * @property {number} weight
 */

/**
 * Suggest the next prescription for an exercise.
 *
 * - Every set hit the top of the range → add load, reset to the bottom.
 * - Every set cleared the bottom       → hold load, chase one more rep.
 * - Otherwise                          → hold everything and consolidate.
 *
 * @param {string} name
 * @param {Array<{r:number|string,w:number|string}>} lastSets
 * @returns {Suggestion|null} null when there is nothing useful to say
 */
export function suggestNext(name, lastSets) {
  if (!lastSets?.length) return null;

  const profile = getProfile(name);
  const valid = lastSets
    .map((s) => ({ r: Number(s.r), w: Number(s.w) }))
    .filter((s) => s.r > 0 && Number.isFinite(s.w) && s.w > 0);
  if (!valid.length) return null;

  const topWeight = Math.max(...valid.map((s) => s.w));
  const avgReps = valid.reduce((total, s) => total + s.r, 0) / valid.length;
  const setCount = valid.length;

  if (valid.every((s) => s.r >= profile.max)) {
    return {
      type: 'increase',
      reason: `Hit ${profile.max}+ on every set`,
      sets: setCount,
      reps: profile.min,
      weight: round(topWeight + profile.inc),
    };
  }

  if (valid.every((s) => s.r >= profile.min)) {
    return {
      type: 'progress',
      reason: `Averaged ${Math.round(avgReps)} reps`,
      sets: setCount,
      reps: Math.min(Math.round(avgReps) + 1, profile.max),
      weight: topWeight,
    };
  }

  return {
    type: 'consolidate',
    reason: `Averaged ${Math.round(avgReps)}, target ${profile.min}+`,
    sets: setCount,
    reps: profile.min,
    weight: topWeight,
  };
}

/** Trim floating point noise from load maths (0.1 + 0.2 problems). */
function round(n) {
  return Math.round(n * 100) / 100;
}

/**
 * Estimated one-rep max (Epley). Used for trend charts, where a consistent
 * formula matters more than which formula.
 */
export function estimate1RM(weight, reps) {
  const w = Number(weight);
  const r = Number(reps);
  if (!(w > 0) || !(r > 0)) return 0;
  return Math.round(w * (1 + r / 30) * 10) / 10;
}
