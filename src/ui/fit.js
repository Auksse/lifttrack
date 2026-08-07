/**
 * Shrink text to fit its line.
 *
 * Some lines carry variable content — the Log hero's meta line names two
 * or three muscle groups, and "Shoulders · Legs & Glutes · Back · 12d rest"
 * is nearly twice the width of "Core · Back · 2d rest". A fixed size either
 * wraps to two lines on the long case or wastes the width on the short one.
 *
 * CSS cannot do this: `clamp()` with viewport units scales with the screen,
 * not with the content, so it cannot know the string got longer. Measuring
 * is the only honest way.
 *
 * Mark up the element as:
 *
 *   <div data-fit-line data-fit-max="15" data-fit-min="10">…</div>
 *
 * and give it `white-space: nowrap; overflow: hidden` so overflow shows up
 * as scrollWidth exceeding clientWidth.
 */

/** Step size in px. Small enough to look continuous, big enough to converge. */
const STEP = 0.5;

export function fitLines(root = document) {
  root.querySelectorAll('[data-fit-line]').forEach((el) => {
    const max = parseFloat(el.dataset.fitMax) || 15;
    const min = parseFloat(el.dataset.fitMin) || 10;

    // Always start from the maximum: the element may be a reused node from
    // a previous render whose content is now shorter, and it should be
    // allowed to grow back.
    let size = max;
    el.style.fontSize = `${size}px`;

    // clientWidth is 0 for a hidden element (a sheet mid-animation, a
    // collapsed panel); shrinking against that would run to the minimum
    // for no reason.
    if (!el.clientWidth) return;

    while (size > min && el.scrollWidth > el.clientWidth) {
      size -= STEP;
      el.style.fontSize = `${size}px`;
    }
  });
}
