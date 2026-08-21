/**
 * Anatomical body map — front and back, drawn as SVG.
 *
 * A list of muscle groups with percentages tells you the numbers but not the
 * shape of them. A figure does: one look and you can see the whole back is
 * lit up and the legs have not been touched all week, which is the question
 * the recovery tab exists to answer.
 *
 * Drawing notes:
 *
 *  - One 120×300 grid shared by both views, so the two figures line up
 *    beside each other and a shoulder sits at the same height in both.
 *  - The body is symmetrical, so every limb region is drawn once for the
 *    left side and emitted twice, the second copy flipped about the centre
 *    line. Two hand-drawn halves would never have matched.
 *  - The regions ARE the body. An earlier version drew a silhouette and
 *    laid regions over it, and the two drifted apart — a deltoid hanging
 *    off the end of a shoulder, a trapezius spilling down the ribs. The
 *    silhouette now supplies only what no region covers (head, hands,
 *    feet, front shins) and sits underneath as a backing shape.
 *  - Shapes are stylised, not anatomical. Each figure is about 150px wide
 *    on a phone, where a faithful pec or a serratus would be a smudge.
 *    What matters is that a region is recognisable and big enough to hit.
 *  - Regions cover every muscle in the taxonomy, some in pairs where they
 *    are too small to draw separately at this size. A region takes the
 *    *highest* fatigue among its muscles, matching how a group takes the
 *    highest of its own — an average lets a fresh neighbour hide a cooked
 *    muscle.
 *
 * Landmarks both views are built from: shoulders y=52, armpit y=80,
 * waist y=118, hips y=146, crotch y=168, knee y=212, ankle y=272.
 */

const CENTRE = 120;

/** Flip about the centre line — used for the second copy of a limb. */
const MIRROR = `translate(${CENTRE},0) scale(-1,1)`;

/**
 * The shape underneath the regions.
 *
 * `centre` is drawn once; `side` is drawn twice, mirrored. Kept as several
 * simple pieces rather than one outline: a single closed path around a
 * human figure is long, unreadable and impossible to adjust by hand.
 */
const SILHOUETTE = {
  centre: [
    // Head and neck.
    '<ellipse cx="60" cy="24" rx="12" ry="15"/>',
    '<path d="M53 36h14v14H53z"/>',
    // Torso: wide at the shoulders, in at the waist, out again at the hips.
    '<path d="M34 54c10-7 42-7 52 0l-4 42-6 22 2 28H42l2-28-6-22z"/>',
    // Pelvis.
    '<path d="M42 144h36l-4 24-14 6-14-6z"/>',
  ],
  side: [
    // Arm as one tapered shape, shoulder to wrist. Drawn in pieces it grew
    // a seam at every joint and read as a mannequin rather than a body.
    '<path d="M41 52C27 56 21 68 21 82c0 22 2 42 4 58 1 12 2 24 2 32h9c0-8 1-20 2-32 2-16 4-36 4-58V52z"/>',
    '<path d="M27 172h10l-1 12h-9z"/>',
    // Leg, likewise: hip to ankle in one taper, foot separate.
    '<path d="M42 160c-2 20-1 40 1 52 1 18 2 38 2 58h11c0-20 1-40 2-58 1-12 2-32 1-52z"/>',
    '<path d="M45 270h11l3 13H41z"/>',
  ],
};

/**
 * @typedef {object} Region
 * @property {string} id       stable key, also the i18n suffix
 * @property {string} group    muscle group it belongs to, for tap-through
 * @property {string[]} muscles taxonomy names it covers
 * @property {string} d        path data, left side only unless `solo`
 * @property {boolean} [solo]  centre-line region, drawn once
 */

/** @type {Record<'front'|'back', Region[]>} */
export const REGIONS = {
  front: [
    // The yoke between neck and shoulder.
    { id: 'traps', group: 'back', muscles: ['Upper Traps'],
      d: 'M53 47h6v10c-7 1-13 3-18 6l-3-8c5-3 12-6 18-8z' },

    // Deltoid cap, wrapping the point of the shoulder.
    { id: 'delts', group: 'shoulders', muscles: ['Front Delts', 'Side Delts', 'Rotator Cuff'],
      d: 'M41 53c-12 4-19 15-19 29l18 1c0-12 0-23 1-30z' },

    // Pec: sternum out to the armpit, lower edge running up and out.
    { id: 'chest', group: 'chest', muscles: ['Chest', 'Upper Chest', 'Lower Chest'],
      d: 'M59 61l-14 3c-3 2-5 7-5 13 0 7 2 14 4 18l15 2z' },

    { id: 'biceps', group: 'arms', muscles: ['Biceps', 'Brachialis'],
      d: 'M39 82H24c-2 13-3 29-1 43h15c0-14 1-30 1-43z' },

    { id: 'forearms', group: 'arms', muscles: ['Forearms', 'Brachioradialis'],
      d: 'M38 128H24c-1 13-1 28 1 41h11c0-14 1-28 2-41z' },

    // Abs run down the midline, so they are drawn once across it.
    { id: 'abs', group: 'core', muscles: ['Abs', 'Deep Core'], solo: true,
      d: 'M50 99h20c1 12 0 25-1 33l-9 13-9-13c-1-8-2-21-1-33z' },

    { id: 'obliques', group: 'core', muscles: ['Obliques', 'Serratus', 'Hip Flexors'],
      d: 'M49 99l-7 1c-1 14 1 28 6 38l2-4z' },

    // Adductors ride with the quads: a 6px strip of inner thigh is too
    // narrow to see or tap at this size.
    { id: 'quads', group: 'legs', muscles: ['Quads', 'Adductors'],
      d: 'M59 166H44c-3 15-3 32-1 47h16z' },
  ],

  back: [
    // The trapezius yoke, wider at the back than the front.
    { id: 'traps', group: 'back', muscles: ['Upper Traps', 'Mid Traps', 'Mid/Lower Traps'],
      d: 'M53 47h6v23l-15 3-8-11c5-7 10-12 17-15z' },

    { id: 'rear_delts', group: 'shoulders', muscles: ['Rear Delts', 'Rotator Cuff'],
      d: 'M41 53c-12 4-19 15-19 29l18 1c0-12 0-23 1-30z' },

    // Rhomboids and mid back: the inner column between the blades.
    { id: 'upper_back', group: 'back', muscles: ['Rhomboids', 'Upper Back', 'Mid Back'],
      d: 'M59 72l-11 2-1 25 12 2z' },

    // Lats: widest at the armpit, tapering into the waist.
    { id: 'lats', group: 'back', muscles: ['Lats'],
      d: 'M47 74l-7 2c-3 14-3 31 1 44l4 6 8-7-6-22z' },

    { id: 'lower_back', group: 'back', muscles: ['Spinal Erectors'], solo: true,
      d: 'M52 101h16c1 11 0 22-1 30l-7 12-7-12c-1-8-2-19-1-30z' },

    { id: 'triceps', group: 'arms', muscles: ['Triceps', 'Triceps Long Head', 'Other Triceps Heads'],
      d: 'M39 82H24c-2 13-3 29-1 43h15c0-14 1-30 1-43z' },

    { id: 'forearms', group: 'arms', muscles: ['Forearms', 'Brachioradialis'],
      d: 'M38 128H24c-1 13-1 28 1 41h11c0-14 1-28 2-41z' },

    { id: 'glutes', group: 'legs', muscles: ['Glutes'],
      d: 'M59 146l-14 2c-4 7-5 19-3 27l17 2z' },

    { id: 'hamstrings', group: 'legs', muscles: ['Hamstrings'],
      d: 'M59 179H44c-2 11-2 23-1 33h16z' },

    { id: 'calves', group: 'legs', muscles: ['Calves', 'Gastrocnemius', 'Soleus'],
      d: 'M57 217H45c-2 15-2 33-1 48l11-1z' },
  ],
};

/**
 * One view of the figure.
 *
 * @param {'front'|'back'} view
 * @param {(region: Region) => {fill: string, opacity: number, title: string}} styleFor
 *        Colour policy lives with the screen, not with the geometry.
 */
export function renderBody(view, styleFor) {
  const silhouette = `
    <g class="bm-body">
      ${SILHOUETTE.centre.join('')}
      ${SILHOUETTE.side.join('')}
      <g transform="${MIRROR}">${SILHOUETTE.side.join('')}</g>
    </g>`;

  const regions = REGIONS[view]
    .map((region) => {
      const { fill, opacity, title } = styleFor(region);
      const shape = (transform) => `
        <path class="bm-region" d="${region.d}"
              ${transform ? `transform="${transform}"` : ''}
              fill="${fill}" fill-opacity="${opacity}"
              data-action="muscle:toggle" data-group="${region.group}">
          <title>${title}</title>
        </path>`;
      return region.solo ? shape() : shape() + shape(MIRROR);
    })
    .join('');

  return `
    <svg class="bm-svg" viewBox="0 0 120 296" role="img"
         preserveAspectRatio="xMidYMid meet">
      ${silhouette}
      ${regions}
    </svg>`;
}
