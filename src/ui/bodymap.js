/**
 * Anatomical body map — front and back, drawn as SVG.
 *
 * A list of muscle groups with percentages tells you the numbers but not the
 * shape of them. A figure does: one look and you can see the whole back is
 * lit up and the legs have not been touched all week, which is the question
 * the recovery tab exists to answer.
 *
 * HOW IT IS DRAWN
 *
 * Every shape here is a list of LANDMARK POINTS run through a Catmull-Rom
 * spline, not a hand-written string of Bézier handles. Three earlier
 * versions were hand-written, and each one came out a mannequin: getting a
 * shoulder to look like a shoulder means moving a control point, checking,
 * and moving it again, and the numbers in the file stop meaning anything
 * anatomical. A point list is a table of measurements — "the deltoid is
 * widest at y=160, 81 units from the midline" — which can be reasoned about
 * and corrected. The curve between the points is the computer's problem.
 *
 * PROPORTIONS
 *
 * A 200x610 grid holding a seven-and-a-half-head figure:
 *
 *   crown 2 · chin 79 · neck base 100 · acromion 124 · shoulder widest 160
 *   nipple 172 · armpit 206 · elbow 254 · navel 258 · crotch 318
 *   wrist 330 · fingertips 387 · knee 456 · ankle 570 · sole 602
 *
 *   shoulders 162 wide (27% of height) · waist 80 (13%) · hips 106 (17%)
 *   elbow at the navel · wrist at the crotch · fingertips at mid-thigh
 *
 * CONSTRUCTION
 *
 * The body is an OUTLINE, not a fill: one continuous unclosed stroke per
 * half, down the outside of the arm, around the fist, back up the inside to
 * the armpit, then the flank, the leg and the foot. Unclosed matters —
 * closing it would draw a line straight up the centre of the figure. The
 * clip closes it implicitly, which is wanted there and not here.
 *
 * Muscles sit inside as separate islands, each stroked in the page colour so
 * a gap opens between neighbours, and clipped to the outline so a limb can
 * be filled by a generous band and the body decides where it stops.
 *
 * Everything except the head is a LEFT HALF, emitted twice with the second
 * copy mirrored. Two hand-drawn halves would never have matched, and a
 * subtly lopsided torso reads as wrong long before you can say why.
 */

const CENTRE = 200;

/** Flip about the centre line — used for the second copy of every half. */
const MIRROR = `translate(${CENTRE},0) scale(-1,1)`;

/**
 * A smooth path through a list of points (Catmull-Rom as cubic Béziers).
 *
 * Repeating a point makes the curve turn a corner there rather than
 * rounding it off — which is how the armpit stays a cusp.
 */
function smooth(points, closed = false) {
  const p = points;
  const n = p.length;
  const at = (i) => (closed ? p[(i + n) % n] : p[Math.min(Math.max(i, 0), n - 1)]);
  const last = closed ? n : n - 1;

  let d = `M${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < last; i += 1) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return closed ? `${d} Z` : d;
}

/**
 * The left half of the figure, crown to crotch.
 *
 * Read it as a walk down the outside and back up the inside: skull, jaw,
 * neck, the trapezius ridge out to the shoulder, over the deltoid, down the
 * arm past the elbow and the wrist, round the hand, back up the inside of
 * the arm to the armpit — then the flank, the hip, the leg and the foot.
 *
 * The armpit point is repeated so the spline turns a corner there instead
 * of rounding it: above it the arm and the ribs are one mass, below it they
 * separate, and that cusp is the whole reason the torso has a silhouette.
 */
const OUTLINE = smooth([
  [100, 2], [86, 4], [76, 14], [72, 29],          // crown, broad rather than pointed
  [71, 46], [74, 63], [80, 74], [88, 80],         // temple, cheek, jaw, chin
  [91, 89], [88, 99],                             // neck
  [79, 103], [66, 108], [54, 114],                // trapezius ridge
  [41, 120], [30, 129], [24, 142], [22, 156],     // acromion, deltoid cap
  [23, 173], [25, 192], [27, 214], [28, 236],     // upper arm
  [27, 252], [26, 264],                           // elbow
  [23, 280], [21, 298], [22, 314],                // forearm, angling clear of the hip
  [23, 326], [23, 334],                           // wrist
  [19, 342], [17, 355], [18, 369],                // hand, outer edge
  [22, 381], [29, 386], [35, 382],                // knuckles
  [38, 371], [38, 356], [37, 344], [36, 336],     // back up the hand
  [37, 322], [39, 304], [42, 287],                // inner forearm
  [45, 269], [47, 257],                           // inner elbow
  [50, 239], [53, 221], [55, 206], [55, 206],     // inner upper arm, armpit cusp
  [56, 224], [57, 242], [58, 258],                // flank to the waist
  [56, 272], [52, 285], [48, 297], [46, 311],     // iliac crest, hip
  [44, 333], [43, 359], [45, 385],                // thigh
  [49, 411], [54, 434], [57, 452],                // to the knee
  [58, 464],                                      // knee
  [55, 480], [53, 498], [55, 518],                // calf, bulging high outside
  [60, 542], [65, 562], [68, 580],                // to the ankle
  [65, 589], [60, 596], [59, 602],                // heel and sole
  [63, 605], [92, 605], [95, 601],                // toes
  [93, 593], [90, 584],                           // back up
  [89, 572], [89, 558],                           // inner ankle
  [91, 536], [92, 514], [91, 492], [91, 471],     // inner calf, bulging lower
  [92, 458], [93, 446],                           // inner knee
  [95, 419], [97, 391], [99, 361],                // inner thigh
  [100, 337], [100, 318],                         // crotch
]);

/**
 * @typedef {object} Region
 * @property {string} id       stable key, also the i18n suffix
 * @property {string} group    muscle group it belongs to, for tap-through
 * @property {string[]} muscles taxonomy names it covers
 * @property {[number, number][]} points  outline, left half unless `solo`
 * @property {boolean} [solo]  crosses the centre line, so drawn once
 */

/**
 * Muscles, as landmark points like the body.
 *
 * Order is draw order, and it matters where they overlap. The deltoid is
 * last in each view because it lies over the top of the upper arm; the
 * erectors come after the lats for the same reason.
 */
const MUSCLES = {
  front: [
    // Upper trapezius: the slope from neck to the point of the shoulder.
    { id: 'traps', group: 'back', muscles: ['Upper Traps'],
      points: [[93, 96], [86, 99], [76, 104], [65, 110], [57, 117],
               [62, 127], [72, 121], [82, 116], [90, 112], [94, 107]] },

    // Pectoralis major: fans from the sternum and clavicle to the armpit.
    // Its inferior border runs UP and out — curve it down and the pair
    // reads as one dome across the ribs.
    { id: 'chest', group: 'chest', muscles: ['Chest', 'Upper Chest', 'Lower Chest'],
      points: [[97, 117], [87, 119], [76, 123], [66, 129], [59, 138],
               [57, 150], [57, 163], [61, 173], [71, 178], [84, 181], [97, 182]] },

    { id: 'biceps', group: 'arms', muscles: ['Biceps', 'Brachialis'],
      points: [[50, 200], [41, 204], [32, 212], [26, 226], [24, 242],
               [25, 256], [28, 265], [37, 261], [46, 257], [47, 241],
               [48, 223], [49, 209]] },

    { id: 'forearms', group: 'arms', muscles: ['Forearms', 'Brachioradialis'],
      points: [[43, 276], [34, 282], [26, 294], [20, 310], [17, 324],
               [17, 334], [21, 340], [28, 336], [34, 332], [36, 318],
               [38, 302], [40, 288]] },

    // Rectus abdominis runs across the midline, so it is drawn once.
    { id: 'abs', group: 'core', muscles: ['Abs', 'Deep Core'], solo: true,
      points: [[82, 198], [80, 220], [80, 246], [82, 268], [86, 288],
               [93, 304], [100, 314], [107, 304], [114, 288], [118, 268],
               [120, 246], [120, 220], [118, 198], [110, 195], [90, 195]] },

    // External obliques: lower ribs down and forward to the iliac crest.
    { id: 'obliques', group: 'core', muscles: ['Obliques', 'Serratus', 'Hip Flexors'],
      points: [[80, 205], [73, 212], [68, 225], [65, 241], [64, 259],
               [66, 276], [70, 291], [76, 300], [82, 305], [80, 285],
               [78, 250], [79, 222]] },

    { id: 'quads', group: 'legs', muscles: ['Quads'],
      points: [[89, 322], [78, 326], [68, 334], [60, 348], [56, 368],
               [55, 392], [57, 417], [62, 440], [70, 454], [80, 458],
               [87, 453], [89, 429], [90, 397], [90, 363], [90, 339]] },

    // Adductors: the inner thigh, from the groin to about mid-thigh.
    { id: 'adductors', group: 'legs', muscles: ['Adductors'],
      points: [[99, 320], [94, 325], [89, 333], [86, 347], [85, 363],
               [86, 381], [89, 397], [93, 401], [96, 385], [98, 363],
               [99, 341]] },

    // Deltoid: caps the joint and points into the humerus a third of the
    // way down, which is what stops it reading as a shoulder pad.
    { id: 'delts', group: 'shoulders', muscles: ['Front Delts', 'Side Delts', 'Rotator Cuff'],
      points: [[52, 117], [41, 123], [31, 132], [25, 145], [23, 160],
               [23, 178], [25, 194], [29, 205], [38, 202], [46, 198],
               [48, 180], [49, 158], [51, 138], [52, 125]] },
  ],

  back: [
    // Trapezius: the kite — skull, out to both acromions, down to a point
    // at the bottom of the ribcage.
    { id: 'traps', group: 'back', muscles: ['Upper Traps', 'Mid Traps', 'Mid/Lower Traps'],
      points: [[100, 96], [93, 99], [83, 105], [71, 112], [59, 120],
               [53, 131], [62, 141], [72, 153], [79, 168], [85, 191],
               [90, 216], [95, 237], [100, 254]] },

    // Rhomboids, teres and mid back: the patch left over between the
    // trapezius edge, the deltoid and the top of the lat.
    { id: 'upper_back', group: 'back', muscles: ['Rhomboids', 'Upper Back', 'Mid Back'],
      points: [[66, 144], [59, 152], [54, 164], [52, 179], [55, 193],
               [61, 203], [68, 209], [73, 199], [78, 183], [80, 165],
               [75, 151]] },

    // Latissimus dorsi: widest at the armpit, narrowing into the spine. Its
    // top edge sits BELOW the trapezius — run it higher and the kite that
    // makes a back read as a back disappears underneath it.
    { id: 'lats', group: 'back', muscles: ['Lats'],
      points: [[57, 205], [52, 219], [50, 236], [51, 255], [56, 271],
               [65, 285], [77, 295], [89, 300], [97, 301], [92, 284],
               [86, 260], [82, 238], [78, 218], [69, 207]] },

    // Erector spinae: two columns either side of the lumbar spine.
    { id: 'lower_back', group: 'back', muscles: ['Spinal Erectors'], solo: true,
      points: [[90, 258], [87, 276], [87, 296], [89, 311], [98, 313],
               [98, 295], [98, 275], [99, 258]] },
    { id: 'lower_back_r', group: 'back', muscles: ['Spinal Erectors'], solo: true,
      points: [[110, 258], [113, 276], [113, 296], [111, 311], [102, 313],
               [102, 295], [102, 275], [101, 258]] },

    { id: 'triceps', group: 'arms', muscles: ['Triceps', 'Triceps Long Head', 'Other Triceps Heads'],
      points: [[50, 198], [41, 202], [32, 210], [26, 224], [24, 240],
               [25, 254], [28, 263], [37, 259], [46, 255], [47, 239],
               [48, 221], [49, 207]] },

    { id: 'forearms', group: 'arms', muscles: ['Forearms', 'Brachioradialis'],
      points: [[43, 276], [34, 282], [26, 294], [20, 310], [17, 324],
               [17, 334], [21, 340], [28, 336], [34, 332], [36, 318],
               [38, 302], [40, 288]] },

    // Gluteus maximus. The medial edge stops short of the centre line: run
    // the two halves together and the hips become one circle.
    { id: 'glutes', group: 'legs', muscles: ['Glutes'],
      points: [[98, 292], [89, 292], [78, 297], [68, 306], [61, 318],
               [60, 332], [64, 344], [73, 352], [84, 356], [94, 356],
               [97, 345], [98, 322]] },

    { id: 'hamstrings', group: 'legs', muscles: ['Hamstrings'],
      points: [[96, 365], [86, 365], [74, 371], [65, 383], [60, 401],
               [59, 423], [62, 443], [68, 457], [78, 463], [89, 461],
               [95, 453], [96, 425], [96, 393]] },

    // Gastrocnemius over a soleus that tapers into the Achilles.
    { id: 'calves', group: 'legs', muscles: ['Calves', 'Gastrocnemius', 'Soleus'],
      points: [[92, 466], [83, 466], [73, 474], [66, 488], [63, 506],
               [65, 524], [71, 538], [75, 554], [78, 572], [87, 572],
               [89, 550], [91, 526], [92, 502], [93, 482]] },

    { id: 'rear_delts', group: 'shoulders', muscles: ['Rear Delts', 'Rotator Cuff'],
      points: [[52, 117], [41, 123], [31, 132], [25, 145], [23, 160],
               [23, 178], [25, 194], [29, 205], [38, 202], [46, 198],
               [48, 180], [49, 158], [51, 138], [52, 125]] },
  ],
};

/** The same list with each point set resolved to a path. */
export const REGIONS = Object.fromEntries(
  Object.entries(MUSCLES).map(([view, list]) => [
    view,
    list.map((region) => ({ ...region, d: smooth(region.points, true) })),
  ]),
);

/**
 * Lines cut through the fills in the page colour, splitting a muscle where
 * a real one is split. The abdomen is why this layer exists: as one
 * unbroken shield it reads as a breastplate, and four hairlines turn it
 * into an abdomen.
 */
const DETAIL = {
  front: [
    'M100 200 V312',                                  // linea alba
    'M83 234 H117', 'M84 262 H116', 'M87 288 H113',   // tendinous intersections
    'M100 116 V184',                                  // sternum, between the pecs
  ],
  back: [
    'M100 88 V300',                                   // spine
    'M80 478 V542',                                   // between the calf heads
  ],
};

/**
 * One view of the figure.
 *
 * Muscles are drawn twice: once flat in the idle colour, then again in the
 * heat colour at an opacity set by how hard the muscle was worked. The
 * result composites grey → colour smoothly, which a single translucent fill
 * cannot do here — the body has no fill of its own, so a half-opaque muscle
 * would blend with the page and go dark rather than pale.
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
    <svg class="bm-svg" viewBox="4 -6 192 618" role="img"
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
