/**
 * Anatomical body map — front and back, drawn as SVG.
 *
 * A list of muscle groups with percentages tells you the numbers but not the
 * shape of them. A figure does: one look and you can see the whole back is
 * lit up and the legs have not been touched all week, which is the question
 * the recovery tab exists to answer.
 *
 * PROPORTIONS
 *
 * A 200×600 grid holding a classical seven-and-a-half-head figure, so the
 * landmarks fall where they do on a person rather than where they were
 * convenient to draw. The viewBox is cropped to the figure's own bounds so
 * it fills its column instead of floating in a field of padding:
 *
 *   head 0–80 · chin 80 · acromion 126 · nipple 168 · elbow 250 · navel 252
 *   wrist 312 · crotch 318 (half the total height) · fingertips 372
 *   knee 442 · ankle 566 · sole 592
 *
 *   shoulders two heads wide · waist ~1.1 heads · hips ~1.3 heads
 *   elbow at the navel, wrist at the crotch, fingertips at mid-thigh
 *
 * CONSTRUCTION
 *
 *  - Both views share the grid, so a shoulder sits at the same height in
 *    each and the pair reads as one body seen twice.
 *  - Everything except the head and neck is drawn as a LEFT HALF and
 *    emitted twice, the second copy mirrored about the centre line. Two
 *    hand-drawn halves would never have matched, and a torso that is
 *    subtly lopsided reads as wrong long before you can say why.
 *  - The regions are the body. An earlier version drew a silhouette and
 *    laid regions over it; the two drifted, leaving a deltoid hanging off
 *    the end of a shoulder. The silhouette now supplies only what no
 *    region covers — head, neck, hands, feet, shins on the front — and
 *    backs the rest.
 *  - Muscle outlines follow real ones: the pec fans from the sternum with
 *    its lower border sweeping up to the armpit; the deltoid caps the
 *    joint and points into the humerus; the trapezius is a kite from skull
 *    to T12; the lat is widest at the armpit and narrows to the spine; the
 *    gastrocnemius is two heads over a soleus that tapers to the Achilles.
 *  - A layer of hairlines on top carries what fills cannot: the linea alba
 *    and the tendinous intersections that make an abdomen read as an
 *    abdomen, the sternal gap between the pecs, the split between the calf
 *    heads. Cheap, and they do most of the work of looking anatomical.
 */

const CENTRE = 200;

/** Flip about the centre line — used for the second copy of every half. */
const MIRROR = `translate(${CENTRE},0) scale(-1,1)`;

/** Head and neck: symmetrical already, so drawn once. */
const HEAD = [
  '<ellipse cx="100" cy="42" rx="25" ry="40"/>',
  '<path d="M87 70h26v38H87z"/>',
];

/**
 * The shape underneath the regions — left half only.
 *
 * Limbs are single tapered paths rather than a piece per segment. Drawn
 * joint by joint they grew a seam at every elbow and read as a mannequin.
 */
const SILHOUETTE = [
  // Torso and pelvis: clavicle out to the acromion, in at the waist, out
  // over the hip, down to the crotch.
  `M100 94 L86 100
   C72 106 58 114 48 128
   C43 148 42 166 45 184
   C50 214 55 234 58 254
   C56 272 52 284 52 296
   C62 312 80 320 100 322 Z`,
  // Arm: deltoid through to the wrist.
  `M48 126
   C29 137 21 158 21 182
   C21 210 24 234 26 252
   C28 282 30 300 32 312
   L48 312
   C48 300 48 282 49 252
   C51 234 52 210 52 186
   C52 160 52 140 48 126 Z`,
  // Hand.
  'M32 312h16l-1 58c-3 6-11 6-14 0z',
  // Leg: hip to ankle in one taper.
  `M52 296
   C46 340 52 392 60 442
   C56 486 64 530 70 566
   L86 566
   C88 530 92 486 89 442
   C95 392 99 344 99 310 Z`,
  // Foot.
  'M70 566h16l6 26H60z',
];

/**
 * @typedef {object} Region
 * @property {string} id       stable key, also the i18n suffix
 * @property {string} group    muscle group it belongs to, for tap-through
 * @property {string[]} muscles taxonomy names it covers
 * @property {string} d        path data, left half unless `solo`
 * @property {boolean} [solo]  crosses the centre line, so drawn once
 */

/**
 * @type {Record<'front'|'back', Region[]>}
 *
 * Order is draw order, and it matters where muscles overlap. The deltoid
 * is listed last in each view because it lies over the top of the upper
 * arm; the erectors come after the lats for the same reason.
 */
export const REGIONS = {
  front: [
    // Upper trapezius: the slope from neck to the point of the shoulder.
    { id: 'traps', group: 'back', muscles: ['Upper Traps'],
      d: `M100 92 L87 99
          C74 105 61 113 51 126
          L59 137
          C69 128 82 121 93 118
          L100 116 Z` },

    // Pectoralis major: fans from the sternum and clavicle to the armpit.
    // Its inferior border is close to a straight line running UP and out —
    // curve it downward and the pair reads as one dome across the ribs.
    { id: 'chest', group: 'chest', muscles: ['Chest', 'Upper Chest', 'Lower Chest'],
      d: `M96 120
          C82 122 68 126 58 133
          C53 145 52 160 55 172
          C67 180 82 185 96 188 Z` },

    { id: 'biceps', group: 'arms', muscles: ['Biceps', 'Brachialis'],
      d: `M48 198
          C36 203 28 214 27 230
          C27 242 31 251 36 257
          L49 254
          C49 241 49 222 49 210
          C49 202 49 199 48 198 Z` },

    // Forearm flexors: the mass just below the elbow, tapering to a narrow
    // wrist.
    { id: 'forearms', group: 'arms', muscles: ['Forearms', 'Brachioradialis'],
      d: `M37 262
          C31 271 29 284 30 298
          C31 306 32 310 33 312
          L47 312
          C47 302 48 288 48 276
          C48 268 48 263 48 260 Z` },

    // Rectus abdominis runs across the midline, so it is drawn once.
    { id: 'abs', group: 'core', muscles: ['Abs', 'Deep Core'], solo: true,
      d: `M81 196
          C79 224 79 252 81 274
          C85 292 92 306 100 314
          C108 306 115 292 119 274
          C121 252 121 224 119 196
          C111 193 89 193 81 196 Z` },

    // External obliques: lower ribs down and forward to the iliac crest.
    // Kept narrow — widened out they became two ellipses flanking the abs
    // and the waist lost its taper.
    { id: 'obliques', group: 'core', muscles: ['Obliques', 'Serratus', 'Hip Flexors'],
      d: `M79 204
          C71 213 65 228 62 246
          C61 264 64 280 69 292
          C74 300 79 304 83 306
          C79 292 77 250 79 204 Z` },

    { id: 'quads', group: 'legs', muscles: ['Quads'],
      d: `M88 322
          C72 326 62 340 58 362
          C55 388 57 415 63 441
          C69 453 79 457 86 452
          C88 429 89 395 89 363
          C89 343 89 330 88 322 Z` },

    // Adductors: the inner thigh, from the groin to about mid-thigh.
    { id: 'adductors', group: 'legs', muscles: ['Adductors'],
      d: `M99 318
          C92 324 88 334 86 352
          C85 370 87 388 91 400
          C95 386 98 362 99 342 Z` },

    // Deltoid: caps the joint and points into the humerus a third of the
    // way down, which is what stops it reading as a shoulder pad. Drawn
    // last: it lies over the top of the biceps.
    { id: 'delts', group: 'shoulders', muscles: ['Front Delts', 'Side Delts', 'Rotator Cuff'],
      d: `M52 128
          C34 139 25 158 25 182
          C25 193 26 201 28 208
          L45 205
          C46 184 48 158 52 138 Z` },
  ],

  back: [
    // Trapezius: the kite — skull, out to both acromions, down to a point
    // at the bottom of the ribcage.
    { id: 'traps', group: 'back', muscles: ['Upper Traps', 'Mid Traps', 'Mid/Lower Traps'],
      d: `M100 84
          C88 88 74 98 60 114
          L52 128
          C66 140 76 156 82 176
          C88 204 93 230 100 252 Z` },

    // Rhomboids, teres and mid back: the patch left over between the
    // trapezius edge, the deltoid and the top of the lat.
    { id: 'upper_back', group: 'back', muscles: ['Rhomboids', 'Upper Back', 'Mid Back'],
      d: `M64 140
          C56 150 51 163 49 179
          C52 190 58 198 66 204
          C72 194 77 178 79 163
          C74 151 69 144 64 140 Z` },

    // Latissimus dorsi: widest at the armpit, narrowing into the spine.
    // Its top edge sits BELOW the trapezius — run it higher and the kite
    // that makes a back read as a back disappears underneath it.
    { id: 'lats', group: 'back', muscles: ['Lats'],
      d: `M53 202
          C45 221 45 243 51 263
          C59 279 73 289 88 294
          C94 296 98 296 100 296
          C94 279 88 257 84 235
          C80 215 67 204 58 202 Z` },

    // Erector spinae: two columns either side of the lumbar spine, so one
    // path with two subpaths rather than a mirrored half.
    { id: 'lower_back', group: 'back', muscles: ['Spinal Erectors'], solo: true,
      d: `M89 256 C86 274 86 294 88 309 L97 311 C97 293 97 273 98 256 Z
          M111 256 C114 274 114 294 112 309 L103 311 C103 293 103 273 102 256 Z` },

    { id: 'triceps', group: 'arms', muscles: ['Triceps', 'Triceps Long Head', 'Other Triceps Heads'],
      d: `M48 196
          C36 202 28 213 27 229
          C27 242 31 251 37 258
          L49 254
          C49 241 49 221 49 208
          C49 200 49 197 48 196 Z` },

    { id: 'forearms', group: 'arms', muscles: ['Forearms', 'Brachioradialis'],
      d: `M37 262
          C31 271 29 284 30 298
          C31 306 32 310 33 312
          L47 312
          C47 302 48 288 48 276
          C48 268 48 263 48 260 Z` },

    // Gluteus maximus. The medial edge stops short of the centre line: run
    // the two halves together and the hips become one circle.
    { id: 'glutes', group: 'legs', muscles: ['Glutes'],
      d: `M97 290
          C84 290 71 296 64 308
          C59 320 58 334 63 345
          C71 354 84 357 95 355
          C97 342 97 314 97 290 Z` },

    { id: 'hamstrings', group: 'legs', muscles: ['Hamstrings'],
      d: `M96 362
          C82 362 70 370 64 386
          C60 408 62 429 68 447
          C76 455 88 455 94 449
          C96 425 96 390 96 362 Z` },

    // Gastrocnemius over a soleus that tapers into the Achilles.
    { id: 'calves', group: 'legs', muscles: ['Calves', 'Gastrocnemius', 'Soleus'],
      d: `M92 462
          C82 460 72 468 68 482
          C64 500 66 518 73 530
          C76 542 78 554 79 562
          L88 562
          C89 548 91 528 92 508
          C93 490 93 474 92 462 Z` },

    // Drawn last, over the top of the triceps.
    { id: 'rear_delts', group: 'shoulders', muscles: ['Rear Delts', 'Rotator Cuff'],
      d: `M52 128
          C34 139 25 158 25 182
          C25 193 26 201 28 208
          L45 205
          C46 184 48 158 52 138 Z` },
  ],
};

/**
 * Hairlines drawn over the fills. Left half unless noted; these are what
 * make an abdomen read as an abdomen rather than a shield.
 */
const DETAIL = {
  front: [
    'M100 118 V196',                                  // sternal gap
    'M100 202 V312',                                  // linea alba
    'M82 232 H118', 'M83 262 H117', 'M86 288 H114',   // ab intersections
    'M98 116 C86 119 70 124 57 133',                  // clavicle
    'M45 210 C47 200 49 190 51 180',                  // delt / biceps split
    'M63 441 C71 448 82 449 88 444',                  // knee
  ],
  back: [
    'M100 96 V300',                                   // spine
    'M80 170 C70 178 62 190 56 202',                  // scapula edge
    'M62 346 C74 356 88 358 97 355',                  // gluteal fold
    'M80 464 V532',                                   // gastrocnemius heads
    'M39 254 C43 245 46 232 47 218',                  // triceps horseshoe
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
  const both = (markup) => markup + `<g transform="${MIRROR}">${markup}</g>`;

  /**
   * Built as a flat list of shapes, each carrying its own mirror, rather
   * than a mirrored group. `clipPath` ignores `<g>` children outright, so
   * grouping the second half silently clipped away every muscle on the
   * right-hand side of both figures.
   */
  const outline =
    HEAD.join('') +
    SILHOUETTE.map((d) => `<path d="${d}"/><path d="${d}" transform="${MIRROR}"/>`).join('');
  const body = `<g class="bm-body">${outline}</g>`;

  /**
   * Regions are clipped to the silhouette rather than hand-fitted inside
   * it. Containing them by eye meant every muscle had to be traced against
   * a limb it did not share a single coordinate with, and any of them
   * could drift a few units and hang off the edge of the body. Clipping
   * makes that impossible by construction, and lets a muscle be drawn to
   * its real outline and let the body decide where it stops.
   */
  const clipId = `bm-clip-${view}`;

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

  const detail = `
    <g class="bm-detail">
      ${both(DETAIL[view].map((d) => `<path d="${d}"/>`).join(''))}
    </g>`;

  return `
    <svg class="bm-svg" viewBox="18 -4 164 604" role="img"
         preserveAspectRatio="xMidYMid meet">
      <defs><clipPath id="${clipId}">${outline}</clipPath></defs>
      ${body}
      <g clip-path="url(#${clipId})">${regions}</g>
      ${detail}
    </svg>`;
}
