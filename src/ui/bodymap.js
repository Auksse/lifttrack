/**
 * Anatomical body map — front and back, drawn as SVG.
 *
 * A list of muscle groups with percentages tells you the numbers but not the
 * shape of them. A figure does: one look and you can see the whole back is
 * lit up and the legs have not been touched all week, which is the question
 * the recovery tab exists to answer.
 *
 * HOW IT IS BUILT
 *
 * The body is an OUTLINE, not a fill. One continuous unclosed stroke per
 * half traces head, neck, shoulder, the outside of the arm, the fist, back
 * up the inside of the arm to the armpit notch, then down the flank, the
 * leg and around the foot. Unclosed matters: closing it would draw a line
 * straight up the centre of the figure. The clip below closes it
 * implicitly, which is what is wanted there and not here.
 *
 * Muscles sit inside that outline as separate islands, each stroked in the
 * page colour so a gap opens between neighbours. That gap is what makes a
 * chart read as anatomy rather than as a tinted mannequin, and it is
 * steadier than trying to leave real space between forty hand-drawn paths.
 *
 * Muscles are clipped to the outline, so a limb can be filled by a generous
 * band and the body decides where it stops. Fitting each one by eye meant
 * tracing it against a limb it shared no coordinate with, and any of them
 * could drift a few units and hang off the edge.
 *
 * PROPORTIONS
 *
 * A 200x600 grid holding a classical seven-and-a-half-head figure, so the
 * landmarks fall where they do on a person rather than where they were
 * convenient to draw:
 *
 *   head 0-80 · chin 80 · acromion 126 · nipple 168 · elbow 252
 *   wrist 315 · crotch 318 (half the total height) · fingertips 372
 *   knee 442 · ankle 566 · sole 592
 *
 *   shoulders two heads wide · waist ~1.1 heads · hips ~1.3 heads
 *   elbow at the navel · wrist at the crotch · fingertips at mid-thigh
 *
 * The arms are carried slightly away from the body. Hanging dead straight
 * they merge with the flank all the way to the hip and the torso loses its
 * silhouette; angled out, the armpit opens into a wedge at about the bottom
 * of the ribcage, where a real one appears.
 *
 * Everything except the head is drawn as a LEFT HALF and emitted twice, the
 * second copy mirrored. Two hand-drawn halves would never have matched, and
 * a subtly lopsided torso reads as wrong long before you can say why.
 */

const CENTRE = 200;

/** Flip about the centre line — used for the second copy of every half. */
const MIRROR = `translate(${CENTRE},0) scale(-1,1)`;

/**
 * The whole left half of the figure in one unclosed stroke.
 *
 * The turn at the armpit — up the inside of the arm, then straight back
 * down the flank — is the only tricky part. It is a cusp, not a corner:
 * above it the arm and the ribs are one mass, below it they separate.
 *
 * It starts a few units PAST the centre line so the two halves overlap at
 * the crown; ending them both exactly on it left a nick at the top of the
 * head where the two round caps met.
 */
const OUTLINE = `
  M104 5
  C86 5 72 19 72 39
  C72 53 76 65 84 72
  C86 78 87 86 86 94
  C76 98 64 104 54 113
  C50 116 47 120 45 125
  C33 134 25 150 24 170
  C23 190 24 208 25 224
  C25 238 24 248 22 256
  C19 276 16 294 15 310
  C13 322 12 332 13 340
  C9 347 8 357 11 365
  C14 372 21 374 27 371
  C33 373 37 368 37 360
  C37 351 36 345 34 339
  C35 325 37 309 39 293
  C41 277 43 262 45 248
  C46 232 47 216 47 203
  C51 222 55 238 58 254
  C56 272 53 284 53 296
  C48 328 52 378 60 428
  C57 462 62 502 67 534
  C69 550 70 558 70 566
  C66 574 60 581 58 586
  C57 590 61 593 67 593
  L92 593
  C95 593 96 588 94 582
  C92 576 90 572 89 566
  C89 548 88 532 88 512
  C89 484 92 458 91 434
  C95 396 100 352 100 318
`;

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
 * Order is draw order, and it matters where muscles overlap. The deltoid is
 * listed last in each view because it lies over the top of the upper arm;
 * the erectors come after the lats for the same reason.
 */
export const REGIONS = {
  front: [
    // Upper trapezius: the slope from neck to the point of the shoulder.
    { id: 'traps', group: 'back', muscles: ['Upper Traps'],
      d: `M100 91 L88 96
          C79 100 70 105 63 112
          L69 123
          C77 117 87 113 96 111
          L100 110 Z` },

    // Pectoralis major: fans from the sternum and clavicle to the armpit.
    // Its inferior border is close to a straight line running UP and out —
    // curve it downward and the pair reads as one dome across the ribs.
    { id: 'chest', group: 'chest', muscles: ['Chest', 'Upper Chest', 'Lower Chest'],
      d: `M96 115
          C82 118 68 123 57 131
          C52 142 51 157 54 169
          C67 177 82 181 96 183 Z` },

    // Limb muscles are generous bands; the clip gives them the limb's own
    // outline, which is steadier than tracing a taper by hand.
    { id: 'biceps', group: 'arms', muscles: ['Biceps', 'Brachialis'],
      d: `M48 200
          C32 208 22 224 21 244
          C21 254 23 262 26 268
          L46 260
          C45 244 46 222 48 208 Z` },

    { id: 'forearms', group: 'arms', muscles: ['Forearms', 'Brachioradialis'],
      d: `M45 270
          C33 280 24 296 19 314
          C16 324 15 332 15 338
          L36 332
          C37 320 40 304 45 290 Z` },

    // Rectus abdominis runs across the midline, so it is drawn once.
    { id: 'abs', group: 'core', muscles: ['Abs', 'Deep Core'], solo: true,
      d: `M81 198
          C79 224 79 252 81 274
          C85 292 92 306 100 314
          C108 306 115 292 119 274
          C121 252 121 224 119 198
          C111 195 89 195 81 198 Z` },

    // External obliques: lower ribs down and forward to the iliac crest.
    // Kept narrow — widened out they became two ellipses flanking the abs
    // and the waist lost its taper.
    { id: 'obliques', group: 'core', muscles: ['Obliques', 'Serratus', 'Hip Flexors'],
      d: `M79 207
          C73 216 69 230 67 248
          C66 264 68 279 72 291
          C76 299 80 303 83 305
          C79 292 77 251 79 207 Z` },

    { id: 'quads', group: 'legs', muscles: ['Quads'],
      d: `M88 324
          C72 328 62 342 58 364
          C55 390 57 417 63 443
          C69 455 79 459 86 454
          C88 431 89 397 89 365
          C89 345 89 332 88 324 Z` },

    // Adductors: the inner thigh, from the groin to about mid-thigh.
    { id: 'adductors', group: 'legs', muscles: ['Adductors'],
      d: `M99 320
          C92 326 88 336 86 354
          C85 372 87 390 91 402
          C95 388 98 364 99 344 Z` },

    // Deltoid: caps the joint and points into the humerus a third of the
    // way down, which is what stops it reading as a shoulder pad. Drawn
    // last: it lies over the top of the biceps.
    { id: 'delts', group: 'shoulders', muscles: ['Front Delts', 'Side Delts', 'Rotator Cuff'],
      d: `M55 118
          C34 128 21 148 20 176
          C20 188 22 198 25 206
          L47 199
          C47 176 50 146 55 128 Z` },
  ],

  back: [
    // Trapezius: the kite — skull, out to both acromions, down to a point
    // at the bottom of the ribcage.
    { id: 'traps', group: 'back', muscles: ['Upper Traps', 'Mid Traps', 'Mid/Lower Traps'],
      d: `M100 84
          C88 88 74 98 58 112
          L50 126
          C64 138 76 156 82 176
          C88 204 93 230 100 252 Z` },

    // Rhomboids, teres and mid back: the patch left over between the
    // trapezius edge, the deltoid and the top of the lat.
    { id: 'upper_back', group: 'back', muscles: ['Rhomboids', 'Upper Back', 'Mid Back'],
      d: `M63 139
          C55 149 50 163 48 179
          C51 190 57 198 65 204
          C71 194 76 178 78 163
          C73 150 68 143 63 139 Z` },

    // Latissimus dorsi: widest at the armpit, narrowing into the spine. Its
    // top edge sits BELOW the trapezius — run it higher and the kite that
    // makes a back read as a back disappears underneath it.
    { id: 'lats', group: 'back', muscles: ['Lats'],
      d: `M52 202
          C44 221 44 243 50 263
          C58 279 72 289 87 294
          C93 296 97 296 100 296
          C94 279 88 257 84 235
          C80 215 66 204 57 202 Z` },

    // Erector spinae: two columns either side of the lumbar spine, so one
    // path with two subpaths rather than a mirrored half.
    { id: 'lower_back', group: 'back', muscles: ['Spinal Erectors'], solo: true,
      d: `M89 256 C86 274 86 294 88 309 L97 311 C97 293 97 273 98 256 Z
          M111 256 C114 274 114 294 112 309 L103 311 C103 293 103 273 102 256 Z` },

    { id: 'triceps', group: 'arms', muscles: ['Triceps', 'Triceps Long Head', 'Other Triceps Heads'],
      d: `M48 198
          C32 206 22 222 21 242
          C21 252 23 260 26 266
          L46 258
          C45 242 46 220 48 206 Z` },

    { id: 'forearms', group: 'arms', muscles: ['Forearms', 'Brachioradialis'],
      d: `M45 270
          C33 280 24 296 19 314
          C16 324 15 332 15 338
          L36 332
          C37 320 40 304 45 290 Z` },

    // Gluteus maximus. The medial edge stops short of the centre line: run
    // the two halves together and the hips become one circle.
    { id: 'glutes', group: 'legs', muscles: ['Glutes'],
      d: `M97 292
          C84 292 71 298 64 310
          C59 322 58 336 63 347
          C71 356 84 359 95 357
          C97 344 97 316 97 292 Z` },

    { id: 'hamstrings', group: 'legs', muscles: ['Hamstrings'],
      d: `M96 364
          C82 364 70 372 64 388
          C60 410 62 431 68 449
          C76 457 88 457 94 451
          C96 427 96 392 96 364 Z` },

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
      d: `M55 118
          C34 128 21 148 20 176
          C20 188 22 198 25 206
          L47 199
          C47 176 50 146 55 128 Z` },
  ],
};

/**
 * Lines cut through the fills in the page colour, splitting a muscle where
 * a real one is split. The abdomen is why this layer exists: as one
 * unbroken shield it reads as a breastplate, and four hairlines turn it
 * into an abdomen.
 */
const DETAIL = {
  front: [
    'M100 200 V312',                                  // linea alba
    'M83 232 H117', 'M84 260 H116', 'M87 286 H113',   // tendinous intersections
    'M100 116 V190',                                  // sternum, between the pecs
  ],
  back: [
    'M100 88 V300',                                   // spine
    'M80 466 V530',                                   // between the calf heads
  ],
};

/**
 * One view of the figure.
 *
 * Muscles are drawn twice: once flat in the idle colour, then again in the
 * heat colour at an opacity set by how hard the muscle was worked. The
 * result composites grey → colour smoothly, which a single translucent
 * fill cannot do here — the body has no fill of its own, so a half-opaque
 * muscle would blend with the page and go dark rather than pale.
 *
 * @param {'front'|'back'} view
 * @param {(region: Region) => {fill: string, alpha: number, title: string}} styleFor
 *        Colour policy lives with the screen, not with the geometry.
 */
export function renderBody(view, styleFor) {
  /**
   * Both halves as a flat list of shapes, each carrying its own mirror,
   * rather than a mirrored group. `clipPath` ignores `<g>` children
   * outright, so grouping the second half silently clipped away every
   * muscle on the right-hand side of both figures.
   */
  const halves = (d, inner = '', attrs = '') =>
    `<path d="${d}" ${attrs}>${inner}</path>` +
    `<path d="${d}" transform="${MIRROR}" ${attrs}>${inner}</path>`;

  const layer = (attrsFor, innerFor = () => '') =>
    REGIONS[view]
      .map((region) =>
        region.solo
          ? `<path d="${region.d}" ${attrsFor(region)}>${innerFor(region)}</path>`
          : halves(region.d, innerFor(region), attrsFor(region)),
      )
      .join('');

  // The shapes themselves: flat idle colour, stroked in the page colour so
  // neighbours are separated by a gap. This layer owns the tap target.
  const shapes = layer(
    (region) => `class="bm-muscle" data-action="muscle:toggle" data-group="${region.group}"`,
    (region) => `<title>${styleFor(region).title}</title>`,
  );

  // The heat on top, unstroked so it never softens the gaps below it.
  const heat = layer((region) => {
    const { fill, alpha } = styleFor(region);
    return `class="bm-heat" fill="${fill}" fill-opacity="${alpha}"`;
  });

  const clipId = `bm-clip-${view}`;

  return `
    <svg class="bm-svg" viewBox="4 -4 192 604" role="img"
         preserveAspectRatio="xMidYMid meet">
      <defs><clipPath id="${clipId}">${halves(OUTLINE)}</clipPath></defs>

      <g clip-path="url(#${clipId})">
        ${shapes}
        ${heat}
        <g class="bm-detail">${halves(DETAIL[view].join(' '))}</g>
      </g>

      <g class="bm-body">${halves(OUTLINE)}</g>
    </svg>`;
}
