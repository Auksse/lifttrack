/**
 * Weight units.
 *
 * Weights used to be bare numbers labelled with a single profile-wide
 * setting, so flipping that setting silently reinterpreted every number
 * ever logged — 50 kg became 50 lb. It also made a gym with imperial
 * plates on one machine impossible to record honestly.
 *
 * Now the unit a weight was *entered* in travels with the exercise, and
 * anything that adds weights together normalises to kilograms first.
 * Aggregates — session volume, totals, records — are therefore always in
 * kg, and the profile setting governs which unit new exercises default to
 * rather than relabelling history.
 *
 * An exercise with no unit recorded is read as a raw number, exactly as
 * before, so nothing already logged changes value.
 *
 * The toggle in the UI relabels rather than converts. The reason to touch
 * it is almost always "the machine was in pounds and the app said kg" —
 * the number is right, the unit is wrong — so 100 must stay 100.
 */

export const UNITS = ['kg', 'lb'];

/** Exact by definition since 1959. */
const KG_PER_LB = 0.45359237;

/** The unit an exercise was logged in, falling back to the profile default. */
export function unitOf(exercise, fallback = 'kg') {
  return exercise?.u === 'lb' || exercise?.u === 'kg' ? exercise.u : fallback;
}

/** Convert a logged weight to kilograms for comparison or summing. */
export function toKg(weight, unit) {
  const value = Number(weight) || 0;
  return unit === 'lb' ? value * KG_PER_LB : value;
}
