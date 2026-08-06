/**
 * Session focus types and their colours.
 *
 * Colours are read from CSS custom properties so the palette lives in one
 * place (tokens.css) rather than being duplicated as hex literals across
 * JavaScript — which is how the old code ended up with two different
 * greens for "Legs".
 */

const FOCUS_VARS = {
  Push: '--focus-push',
  Pull: '--focus-pull',
  Legs: '--focus-legs',
  Upper: '--focus-upper',
};

/** Deterministic fallback hue for user-created template names. */
function hashHue(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return Math.abs(hash) % 360;
}

export function focusColor(focus) {
  const varName = FOCUS_VARS[focus];
  if (varName) return `var(${varName})`;
  // Fixed saturation/lightness keeps generated colours in family with the
  // curated ones and guarantees they clear contrast on the dark surface.
  return `hsl(${hashHue(String(focus || ''))} 62% 66%)`;
}

export const BUILT_IN_FOCUSES = Object.keys(FOCUS_VARS);
