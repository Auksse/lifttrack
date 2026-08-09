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

/**
 * The colours a template may be assigned, as design tokens rather than
 * literals — a stored `var(--focus-push)` keeps following the palette if
 * the palette changes, which a stored hex would not.
 */
export const TEMPLATE_COLORS = [
  'var(--focus-push)',
  'var(--focus-pull)',
  'var(--focus-legs)',
  'var(--focus-upper)',
  'var(--gold)',
  'var(--plate-white)',
];

/**
 * Colour for a session focus or template name.
 *
 * `templates` is optional but should be passed wherever it is available.
 * A template can carry an explicit `color`, and that choice has to win
 * everywhere the template's work shows up — otherwise the Plan tab shows
 * the colour you picked while the Log tab shows the hashed fallback for
 * the same training, which is exactly the mismatch this fixes.
 *
 * Matching is by focus first, then name: a renamed template keeps its
 * focus, and sessions logged before the rename still carry the old one.
 */
export function focusColor(focus, templates) {
  const key = String(focus ?? '');

  if (Array.isArray(templates)) {
    const owner = templates.find((tpl) => tpl.focus === key || tpl.name === key);
    if (owner?.color) return owner.color;
  }

  const varName = FOCUS_VARS[key];
  if (varName) return `var(${varName})`;
  // Fixed saturation/lightness keeps generated colours in family with the
  // curated ones and guarantees they clear contrast on the dark surface.
  return `hsl(${hashHue(key)} 62% 66%)`;
}

export const BUILT_IN_FOCUSES = Object.keys(FOCUS_VARS);
