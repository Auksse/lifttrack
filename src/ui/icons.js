/**
 * Icon set — hand-tuned 24×24 stroked glyphs on a shared grid.
 *
 * These replace the emoji the app used for navigation. Emoji were the single
 * biggest visual liability: they render as a different artwork on every OS
 * and version, they cannot inherit colour, and they mixed pictographic
 * (📋 💪) with typographic (◎) forms in the same row.
 *
 * Every path here is drawn on a 24-unit grid with a 1.75 stroke, round caps
 * and round joins, so the whole set shares one optical weight. Colour comes
 * from `currentColor`, so icons tint with their container.
 */

const paths = {
  // ---- Navigation -----------------------------------------------------
  log: `<path d="M7 4h10a1 1 0 0 1 1 1v15l-6-3-6 3V5a1 1 0 0 1 1-1Z"/><path d="M9.5 9h5"/>`,

  plan: `<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/><circle cx="8.5" cy="14" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="14" r="1.1" fill="currentColor" stroke="none"/>`,

  // A dumbbell, drawn properly rather than the 💪 emoji.
  muscles: `<path d="M4 9.5v5M7 7.5v9M17 7.5v9M20 9.5v5"/><path d="M7 12h10"/>`,

  stats: `<path d="M4 19.5h16"/><path d="M7 19.5v-6M12 19.5V7M17 19.5v-9"/>`,

  plus: `<path d="M12 5.5v13M5.5 12h13"/>`,

  // ---- Actions --------------------------------------------------------
  // Sliders rather than a cogwheel: a gear's teeth collapse into a sun-like
  // blob below ~24px, which is exactly the size the header renders it at.
  settings: `<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2.2"/><circle cx="8" cy="17" r="2.2"/>`,
  close: `<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>`,
  check: `<path d="M5 12.5l4.5 4.5L19 7.5"/>`,
  chevronRight: `<path d="M9.5 5.5 16 12l-6.5 6.5"/>`,
  chevronLeft: `<path d="M14.5 5.5 8 12l6.5 6.5"/>`,
  chevronDown: `<path d="M5.5 9.5 12 16l6.5-6.5"/>`,
  chevronUp: `<path d="M5.5 14.5 12 8l6.5 6.5"/>`,
  trash: `<path d="M4.5 7h15M9.5 7V4.8a.8.8 0 0 1 .8-.8h3.4a.8.8 0 0 1 .8.8V7"/><path d="M6.5 7l.9 12.3a1.5 1.5 0 0 0 1.5 1.4h6.2a1.5 1.5 0 0 0 1.5-1.4L17.5 7"/><path d="M10.5 11v6M13.5 11v6"/>`,
  edit: `<path d="M4.5 19.5h4l10-10a2.1 2.1 0 0 0-3-3l-10 10v3Z"/><path d="M14.5 6.5l3 3"/>`,
  copy: `<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 5.5h-9a2 2 0 0 0-2 2v9"/>`,
  search: `<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>`,
  info: `<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5"/><circle cx="12" cy="7.9" r="1.05" fill="currentColor" stroke="none"/>`,
  timer: `<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 1.8M9.5 2.5h5"/>`,
  flame: `<path d="M12 3s5.5 4.2 5.5 9.2a5.5 5.5 0 1 1-11 0C6.5 9.6 8 8 8 8s.6 2 2 2.6C10.6 8.4 12 6.4 12 3Z"/>`,
  trophy: `<path d="M7.5 4.5h9v4.2a4.5 4.5 0 1 1-9 0V4.5Z"/><path d="M7.5 6H5.2a2.2 2.2 0 0 0 2.3 3M16.5 6h2.3a2.2 2.2 0 0 1-2.3 3"/><path d="M12 13.2v3.3M9 20h6M10 16.5h4l.6 3.5h-5.2l.6-3.5Z"/>`,
  arrowUp: `<path d="M12 19V5M6 11l6-6 6 6"/>`,
  arrowRight: `<path d="M5 12h14M13 6l6 6-6 6"/>`,
  drag: `<circle cx="9" cy="7" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="7" r="1.3" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="9" cy="17" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="17" r="1.3" fill="currentColor" stroke="none"/>`,
  swap: `<path d="M4 8h13l-3.5-3.5M20 16H7l3.5 3.5"/>`,

  // Two links of a chain, for exercises joined into a superset.
  link: `<path d="M10 14a4 4 0 0 1 0-5.6l2.2-2.2a4 4 0 0 1 5.6 5.6L16.6 13"/><path d="M14 10a4 4 0 0 1 0 5.6l-2.2 2.2a4 4 0 0 1-5.6-5.6L7.4 11"/>`,

  // A weight coming down against resistance: the arrow descends, the two
  // short bars are the brakes. Reads as "lower it slowly" at 15px, which
  // an ordinary down-arrow does not.
  slowDown: `<path d="M12 4v11M8 11.5l4 4 4-4"/><path d="M6.5 19h11"/>`,
  user: `<circle cx="12" cy="8.5" r="3.8"/><path d="M4.8 20.2a7.4 7.4 0 0 1 14.4 0"/>`,
  download: `<path d="M12 4v10M7.5 10l4.5 4.5 4.5-4.5M4.5 19.5h15"/>`,
  upload: `<path d="M12 15.5v-10M7.5 9.5 12 5l4.5 4.5M4.5 19.5h15"/>`,
  bolt: `<path d="M13.5 3 5.5 13.5h5L10 21l8.5-10.5h-5L13.5 3Z"/>`,
};

/**
 * Render an icon as an inline SVG string.
 *
 * @param {string} name   key from `paths`
 * @param {object} [opts]
 * @param {number} [opts.size=24]     px, applied to both axes
 * @param {number} [opts.stroke=1.75] stroke width on the 24-unit grid
 * @param {string} [opts.className]
 * @returns {string} SVG markup, or '' for an unknown name
 */
export function icon(name, opts = {}) {
  const d = paths[name];
  if (!d) {
    // Loud in dev, silent in production — a missing icon is a typo, not a crash.
    if (import.meta.env?.DEV) console.warn(`[icons] unknown icon: "${name}"`);
    return '';
  }
  const { size = 24, stroke = 1.75, className = '' } = opts;
  return `<svg class="icon ${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${d}</svg>`;
}

export const iconNames = Object.keys(paths);
