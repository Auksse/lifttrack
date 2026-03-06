// ═══════════════════════════════════════════════
// EXERCISE DATABASE
// One row per exercise family; six equipment columns.
// ═══════════════════════════════════════════════

/**
 * @typedef {"primary"|"secondary"} MuscleRole
 *
 * @typedef {{ name: string, score: 1|2|3|4|5, role: MuscleRole }} ExerciseMuscle
 *
 * @typedef {{
 *   familyName: string,
 *   category: "chest"|"shoulders"|"back"|"legs_glutes"|"arms"|"core",
 *   bodyweight: string|null,
 *   dumbbells: string|null,
 *   barbell: string|null,
 *   cable: string|null,
 *   machine: string|null,
 *   plateLoaded: string|null,
 *   muscles: ExerciseMuscle[]
 * }} ExerciseFamily
 */

/** @type {ExerciseFamily[]} */
const exerciseDatabase = [
  {
    familyName: "Flat Press",
    category: "chest",
    bodyweight: "Push-Up",
    dumbbells: "Dumbbell Flat Press",
    barbell: "Barbell Bench Press",
    cable: "Cable Chest Press",
    machine: "Chest Press Machine",
    plateLoaded: "Plate-Loaded Chest Press",
    muscles: [
      { name: "Chest", score: 5, role: "primary" },
      { name: "Front Delts", score: 3, role: "secondary" },
      { name: "Triceps", score: 4, role: "secondary" }
    ]
  },
  {
    familyName: "Incline Press",
    category: "chest",
    bodyweight: "Feet-Elevated Push-Up",
    dumbbells: "Dumbbell Incline Press",
    barbell: "Barbell Incline Bench Press",
    cable: "Cable Incline Press",
    machine: "Incline Press Machine",
    plateLoaded: "Plate-Loaded Incline Press",
    muscles: [
      { name: "Upper Chest", score: 5, role: "primary" },
      { name: "Front Delts", score: 4, role: "secondary" },
      { name: "Triceps", score: 3, role: "secondary" }
    ]
  },
  {
    familyName: "Chest Fly",
    category: "chest",
    bodyweight: null,
    dumbbells: "Dumbbell Fly",
    barbell: null,
    cable: "Cable Fly",
    machine: "Pec Deck",
    plateLoaded: "Plate-Loaded Fly",
    muscles: [
      { name: "Chest", score: 5, role: "primary" },
      { name: "Front Delts", score: 2, role: "secondary" }
    ]
  },
  {
    familyName: "Chest Dip",
    category: "chest",
    bodyweight: "Chest Dip",
    dumbbells: "Weighted Dip",
    barbell: null,
    cable: null,
    machine: "Assisted Dip Machine",
    plateLoaded: "Plate-Loaded Dip",
    muscles: [
      { name: "Lower Chest", score: 5, role: "primary" },
      { name: "Triceps", score: 4, role: "secondary" },
      { name: "Front Delts", score: 3, role: "secondary" }
    ]
  },
  {
    familyName: "Pullover",
    category: "chest",
    bodyweight: null,
    dumbbells: "Dumbbell Pullover",
    barbell: "Barbell Pullover",
    cable: "Cable Straight-Arm Pulldown",
    machine: "Pullover Machine",
    plateLoaded: "Plate-Loaded Pullover",
    muscles: [
      { name: "Lats", score: 4, role: "primary" },
      { name: "Chest", score: 3, role: "secondary" },
      { name: "Serratus", score: 2, role: "secondary" }
    ]
  },
  {
    familyName: "Vertical Press",
    category: "shoulders",
    bodyweight: "Pike Push-Up",
    dumbbells: "Dumbbell Overhead Press",
    barbell: "Barbell Overhead Press",
    cable: "Cable Shoulder Press",
    machine: "Shoulder Press Machine",
    plateLoaded: "Plate-Loaded Shoulder Press",
    muscles: [
      { name: "Front Delts", score: 5, role: "primary" },
      { name: "Triceps", score: 4, role: "secondary" },
      { name: "Side Delts", score: 3, role: "secondary" },
      { name: "Upper Chest", score: 2, role: "secondary" }
    ]
  },
  {
    familyName: "Lateral Raise",
    category: "shoulders",
    bodyweight: null,
    dumbbells: "Dumbbell Lateral Raise",
    barbell: null,
    cable: "Cable Lateral Raise",
    machine: "Lateral Raise Machine",
    plateLoaded: "Plate-Loaded Lateral Raise",
    muscles: [
      { name: "Side Delts", score: 5, role: "primary" },
      { name: "Upper Traps", score: 2, role: "secondary" }
    ]
  },
  {
    familyName: "Front Raise",
    category: "shoulders",
    bodyweight: null,
    dumbbells: "Dumbbell Front Raise",
    barbell: "Barbell Front Raise",
    cable: "Cable Front Raise",
    machine: "Front Raise Machine",
    plateLoaded: null,
    muscles: [
      { name: "Front Delts", score: 5, role: "primary" },
      { name: "Upper Chest", score: 2, role: "secondary" }
    ]
  },
  {
    familyName: "Rear Delt Fly",
    category: "shoulders",
    bodyweight: null,
    dumbbells: "Dumbbell Rear Delt Fly",
    barbell: null,
    cable: "Cable Rear Delt Fly",
    machine: "Rear Delt Machine",
    plateLoaded: "Plate-Loaded Rear Delt Fly",
    muscles: [
      { name: "Rear Delts", score: 5, role: "primary" },
      { name: "Mid Traps", score: 3, role: "secondary" },
      { name: "Rhomboids", score: 3, role: "secondary" }
    ]
  },
  {
    familyName: "Face Pull",
    category: "shoulders",
    bodyweight: null,
    dumbbells: null,
    barbell: null,
    cable: "Cable Face Pull",
    machine: "Reverse Pec Deck",
    plateLoaded: null,
    muscles: [
      { name: "Rear Delts", score: 5, role: "primary" },
      { name: "Mid/Lower Traps", score: 4, role: "secondary" },
      { name: "Rotator Cuff", score: 3, role: "secondary" }
    ]
  },
  {
    familyName: "Shrug",
    category: "shoulders",
    bodyweight: "Scapular Pull-Up",
    dumbbells: "Dumbbell Shrug",
    barbell: "Barbell Shrug",
    cable: "Cable Shrug",
    machine: "Shrug Machine",
    plateLoaded: "Plate-Loaded Shrug",
    muscles: [
      { name: "Upper Traps", score: 5, role: "primary" },
      { name: "Forearms", score: 2, role: "secondary" }
    ]
  },
  {
    familyName: "Vertical Pull",
    category: "back",
    bodyweight: "Pull-Up",
    dumbbells: null,
    barbell: null,
    cable: "Cable Lat Pulldown",
    machine: "Lat Pulldown Machine",
    plateLoaded: "Plate-Loaded Pulldown",
    muscles: [
      { name: "Lats", score: 5, role: "primary" },
      { name: "Biceps", score: 3, role: "secondary" },
      { name: "Upper Back", score: 3, role: "secondary" }
    ]
  },
  {
    familyName: "Chin-Up Pattern",
    category: "back",
    bodyweight: "Chin-Up",
    dumbbells: null,
    barbell: null,
    cable: "Supinated Lat Pulldown",
    machine: "Supinated Pulldown Machine",
    plateLoaded: "Plate-Loaded Supinated Pulldown",
    muscles: [
      { name: "Biceps", score: 5, role: "primary" },
      { name: "Lats", score: 4, role: "secondary" },
      { name: "Upper Back", score: 3, role: "secondary" }
    ]
  },
  {
    familyName: "Horizontal Row",
    category: "back",
    bodyweight: "Inverted Row",
    dumbbells: "One-Arm Dumbbell Row",
    barbell: "Barbell Bent-Over Row",
    cable: "Seated Cable Row",
    machine: "Seated Row Machine",
    plateLoaded: "Plate-Loaded Row",
    muscles: [
      { name: "Mid Back", score: 5, role: "primary" },
      { name: "Lats", score: 4, role: "secondary" },
      { name: "Rear Delts", score: 3, role: "secondary" },
      { name: "Biceps", score: 3, role: "secondary" }
    ]
  },
  {
    familyName: "Chest-Supported Row",
    category: "back",
    bodyweight: null,
    dumbbells: "Chest-Supported Dumbbell Row",
    barbell: "Seal Row",
    cable: "Chest-Supported Cable Row",
    machine: "Chest-Supported Row Machine",
    plateLoaded: "Plate-Loaded Chest-Supported Row",
    muscles: [
      { name: "Mid Back", score: 5, role: "primary" },
      { name: "Rear Delts", score: 3, role: "secondary" },
      { name: "Biceps", score: 3, role: "secondary" },
      { name: "Lats", score: 3, role: "secondary" }
    ]
  },
  {
    familyName: "Back Extension",
    category: "back",
    bodyweight: "Superman",
    dumbbells: "Dumbbell Back Extension",
    barbell: "Barbell Good Morning",
    cable: "Cable Pull-Through",
    machine: "Back Extension Machine",
    plateLoaded: "Plate-Loaded Back Extension",
    muscles: [
      { name: "Spinal Erectors", score: 5, role: "primary" },
      { name: "Glutes", score: 3, role: "secondary" },
      { name: "Hamstrings", score: 2, role: "secondary" }
    ]
  },
  {
    familyName: "Romanian Deadlift",
    category: "legs_glutes",
    bodyweight: "Single-Leg Hip Hinge",
    dumbbells: "Dumbbell Romanian Deadlift",
    barbell: "Barbell Romanian Deadlift",
    cable: "Cable Romanian Deadlift",
    machine: "Smith Machine Romanian Deadlift",
    plateLoaded: null,
    muscles: [
      { name: "Hamstrings", score: 5, role: "primary" },
      { name: "Glutes", score: 4, role: "secondary" },
      { name: "Spinal Erectors", score: 3, role: "secondary" }
    ]
  },
  {
    familyName: "Conventional Deadlift",
    category: "legs_glutes",
    bodyweight: null,
    dumbbells: "Dumbbell Deadlift",
    barbell: "Barbell Deadlift",
    cable: null,
    machine: "Smith Machine Deadlift",
    plateLoaded: null,
    muscles: [
      { name: "Glutes", score: 5, role: "primary" },
      { name: "Hamstrings", score: 4, role: "secondary" },
      { name: "Spinal Erectors", score: 4, role: "secondary" },
      { name: "Upper Back", score: 3, role: "secondary" },
      { name: "Quads", score: 2, role: "secondary" }
    ]
  },
  {
    familyName: "Squat",
    category: "legs_glutes",
    bodyweight: "Bodyweight Squat",
    dumbbells: "Goblet Squat",
    barbell: "Barbell Back Squat",
    cable: "Cable Squat",
    machine: "Smith Machine Squat",
    plateLoaded: "Plate-Loaded V-Squat",
    muscles: [
      { name: "Quads", score: 5, role: "primary" },
      { name: "Glutes", score: 4, role: "secondary" },
      { name: "Adductors", score: 3, role: "secondary" },
      { name: "Spinal Erectors", score: 3, role: "secondary" }
    ]
  },
  {
    familyName: "Front Squat",
    category: "legs_glutes",
    bodyweight: "Heels-Elevated Squat",
    dumbbells: "Dumbbell Front Squat",
    barbell: "Barbell Front Squat",
    cable: "Cable Front Squat",
    machine: "Smith Front Squat",
    plateLoaded: null,
    muscles: [
      { name: "Quads", score: 5, role: "primary" },
      { name: "Glutes", score: 3, role: "secondary" },
      { name: "Upper Back", score: 3, role: "secondary" },
      { name: "Core", score: 3, role: "secondary" }
    ]
  },
  {
    familyName: "Hack Squat Pattern",
    category: "legs_glutes",
    bodyweight: null,
    dumbbells: "Dumbbell Hack Squat",
    barbell: "Barbell Hack Squat",
    cable: null,
    machine: "Hack Squat Machine",
    plateLoaded: "Pendulum Squat",
    muscles: [
      { name: "Quads", score: 5, role: "primary" },
      { name: "Glutes", score: 3, role: "secondary" }
    ]
  },
  {
    familyName: "Split Squat",
    category: "legs_glutes",
    bodyweight: "Split Squat",
    dumbbells: "Dumbbell Bulgarian Split Squat",
    barbell: "Barbell Bulgarian Split Squat",
    cable: "Cable Split Squat",
    machine: "Split Squat Machine",
    plateLoaded: null,
    muscles: [
      { name: "Quads", score: 5, role: "primary" },
      { name: "Glutes", score: 4, role: "secondary" },
      { name: "Adductors", score: 3, role: "secondary" }
    ]
  },
  {
    familyName: "Walking Lunge",
    category: "legs_glutes",
    bodyweight: "Walking Lunge",
    dumbbells: "Dumbbell Walking Lunge",
    barbell: "Barbell Walking Lunge",
    cable: "Cable Walking Lunge",
    machine: null,
    plateLoaded: null,
    muscles: [
      { name: "Quads", score: 4, role: "primary" },
      { name: "Glutes", score: 4, role: "primary" },
      { name: "Adductors", score: 2, role: "secondary" },
      { name: "Hamstrings", score: 2, role: "secondary" }
    ]
  },
  {
    familyName: "Step-Up",
    category: "legs_glutes",
    bodyweight: "Step-Up",
    dumbbells: "Dumbbell Step-Up",
    barbell: "Barbell Step-Up",
    cable: "Cable Step-Up",
    machine: null,
    plateLoaded: null,
    muscles: [
      { name: "Quads", score: 4, role: "primary" },
      { name: "Glutes", score: 4, role: "primary" },
      { name: "Hamstrings", score: 2, role: "secondary" }
    ]
  },
  {
    familyName: "Hip Thrust",
    category: "legs_glutes",
    bodyweight: "Glute Bridge",
    dumbbells: "Dumbbell Hip Thrust",
    barbell: "Barbell Hip Thrust",
    cable: "Cable Pull-Through",
    machine: "Glute Drive Machine",
    plateLoaded: "Plate-Loaded Hip Thrust",
    muscles: [
      { name: "Glutes", score: 5, role: "primary" },
      { name: "Hamstrings", score: 3, role: "secondary" },
      { name: "Quads", score: 1, role: "secondary" }
    ]
  },
  {
    familyName: "Glute Kickback",
    category: "legs_glutes",
    bodyweight: "Donkey Kick",
    dumbbells: "Dumbbell Glute Kickback",
    barbell: null,
    cable: "Cable Glute Kickback",
    machine: "Glute Kickback Machine",
    plateLoaded: "Plate-Loaded Glute Kickback",
    muscles: [
      { name: "Glutes", score: 5, role: "primary" },
      { name: "Hamstrings", score: 2, role: "secondary" }
    ]
  },
  {
    familyName: "Leg Curl",
    category: "legs_glutes",
    bodyweight: "Nordic Curl",
    dumbbells: "Dumbbell Leg Curl",
    barbell: null,
    cable: "Cable Leg Curl",
    machine: "Leg Curl Machine",
    plateLoaded: "Plate-Loaded Leg Curl",
    muscles: [
      { name: "Hamstrings", score: 5, role: "primary" },
      { name: "Calves", score: 1, role: "secondary" }
    ]
  },
  {
    familyName: "Leg Extension",
    category: "legs_glutes",
    bodyweight: "Sissy Squat",
    dumbbells: null,
    barbell: null,
    cable: "Cable Leg Extension",
    machine: "Leg Extension Machine",
    plateLoaded: "Plate-Loaded Leg Extension",
    muscles: [
      { name: "Quads", score: 5, role: "primary" }
    ]
  },
  {
    familyName: "Standing Calf Raise",
    category: "legs_glutes",
    bodyweight: "Standing Calf Raise",
    dumbbells: "Dumbbell Standing Calf Raise",
    barbell: "Barbell Standing Calf Raise",
    cable: "Cable Standing Calf Raise",
    machine: "Standing Calf Raise Machine",
    plateLoaded: "Plate-Loaded Standing Calf Raise",
    muscles: [
      { name: "Gastrocnemius", score: 5, role: "primary" },
      { name: "Soleus", score: 3, role: "secondary" }
    ]
  },
  {
    familyName: "Seated Calf Raise",
    category: "legs_glutes",
    bodyweight: "Seated Calf Raise",
    dumbbells: "Dumbbell Seated Calf Raise",
    barbell: "Barbell Seated Calf Raise",
    cable: "Cable Seated Calf Raise",
    machine: "Seated Calf Raise Machine",
    plateLoaded: "Plate-Loaded Seated Calf Raise",
    muscles: [
      { name: "Soleus", score: 5, role: "primary" },
      { name: "Gastrocnemius", score: 2, role: "secondary" }
    ]
  },
  {
    familyName: "Curl",
    category: "arms",
    bodyweight: null,
    dumbbells: "Dumbbell Curl",
    barbell: "Barbell Curl",
    cable: "Cable Curl",
    machine: "Biceps Curl Machine",
    plateLoaded: "Plate-Loaded Curl",
    muscles: [
      { name: "Biceps", score: 5, role: "primary" },
      { name: "Forearms", score: 3, role: "secondary" }
    ]
  },
  {
    familyName: "Hammer Curl",
    category: "arms",
    bodyweight: null,
    dumbbells: "Dumbbell Hammer Curl",
    barbell: null,
    cable: "Rope Hammer Curl",
    machine: "Hammer Curl Machine",
    plateLoaded: null,
    muscles: [
      { name: "Brachialis", score: 5, role: "primary" },
      { name: "Brachioradialis", score: 4, role: "secondary" },
      { name: "Biceps", score: 3, role: "secondary" }
    ]
  },
  {
    familyName: "Preacher Curl",
    category: "arms",
    bodyweight: null,
    dumbbells: "Dumbbell Preacher Curl",
    barbell: "EZ-Bar Preacher Curl",
    cable: "Cable Preacher Curl",
    machine: "Preacher Curl Machine",
    plateLoaded: "Plate-Loaded Preacher Curl",
    muscles: [
      { name: "Biceps", score: 5, role: "primary" },
      { name: "Forearms", score: 2, role: "secondary" }
    ]
  },
  {
    familyName: "Triceps Pushdown",
    category: "arms",
    bodyweight: null,
    dumbbells: null,
    barbell: null,
    cable: "Cable Triceps Pushdown",
    machine: "Triceps Pushdown Machine",
    plateLoaded: null,
    muscles: [
      { name: "Triceps", score: 5, role: "primary" }
    ]
  },
  {
    familyName: "Overhead Triceps Extension",
    category: "arms",
    bodyweight: "Bodyweight Triceps Extension",
    dumbbells: "Dumbbell Overhead Triceps Extension",
    barbell: "Barbell Overhead Triceps Extension",
    cable: "Cable Overhead Triceps Extension",
    machine: "Triceps Extension Machine",
    plateLoaded: null,
    muscles: [
      { name: "Triceps Long Head", score: 5, role: "primary" },
      { name: "Other Triceps Heads", score: 3, role: "secondary" }
    ]
  },
  {
    familyName: "Skull Crusher",
    category: "arms",
    bodyweight: null,
    dumbbells: "Dumbbell Skull Crusher",
    barbell: "Barbell Skull Crusher",
    cable: "Cable Skull Crusher",
    machine: null,
    plateLoaded: null,
    muscles: [
      { name: "Triceps", score: 5, role: "primary" }
    ]
  },
  {
    familyName: "Crunch",
    category: "core",
    bodyweight: "Crunch",
    dumbbells: "Dumbbell Crunch",
    barbell: "Barbell Crunch",
    cable: "Cable Crunch",
    machine: "Ab Crunch Machine",
    plateLoaded: "Plate-Loaded Ab Crunch",
    muscles: [
      { name: "Abs", score: 5, role: "primary" },
      { name: "Hip Flexors", score: 2, role: "secondary" }
    ]
  },
  {
    familyName: "Leg Raise",
    category: "core",
    bodyweight: "Hanging Leg Raise",
    dumbbells: null,
    barbell: null,
    cable: "Cable Reverse Crunch",
    machine: "Vertical Knee Raise Machine",
    plateLoaded: null,
    muscles: [
      { name: "Abs", score: 4, role: "primary" },
      { name: "Hip Flexors", score: 4, role: "secondary" }
    ]
  },
  {
    familyName: "Rotation Core",
    category: "core",
    bodyweight: "Side Plank Rotation",
    dumbbells: "Dumbbell Russian Twist",
    barbell: "Landmine Rotation",
    cable: "Cable Woodchop",
    machine: "Rotary Torso Machine",
    plateLoaded: "Plate-Loaded Rotary Torso",
    muscles: [
      { name: "Obliques", score: 5, role: "primary" },
      { name: "Abs", score: 3, role: "secondary" },
      { name: "Shoulders", score: 2, role: "secondary" }
    ]
  },
  {
    familyName: "Plank",
    category: "core",
    bodyweight: "Plank",
    dumbbells: "Dumbbell Plank Drag",
    barbell: "Barbell Rollout",
    cable: "Cable Iso Hold",
    machine: null,
    plateLoaded: null,
    muscles: [
      { name: "Deep Core", score: 5, role: "primary" },
      { name: "Abs", score: 4, role: "secondary" },
      { name: "Glutes", score: 2, role: "secondary" },
      { name: "Serratus", score: 2, role: "secondary" }
    ]
  }
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Equipment columns on each ExerciseFamily */
const DB_EQUIPMENT_KEYS = ['bodyweight','dumbbells','barbell','cable','machine','plateLoaded'];

/**
 * Returns every non-null exercise name across all families and equipment types.
 * @returns {string[]}
 */
function getDbExerciseNames() {
  const names = [];
  for (const family of exerciseDatabase) {
    for (const key of DB_EQUIPMENT_KEYS) {
      if (family[key]) names.push(family[key]);
    }
  }
  return names;
}

/**
 * Finds the ExerciseFamily that contains the given exercise name (any equipment column).
 * @param {string} name
 * @returns {ExerciseFamily|null}
 */
function getDbFamily(name) {
  for (const family of exerciseDatabase) {
    for (const key of DB_EQUIPMENT_KEYS) {
      if (family[key] === name) return family;
    }
  }
  return null;
}

/**
 * Returns a MUSCLE_MAP-compatible object {muscleName: score} for the given
 * exercise name, sourced from the database. Returns null if not found.
 * @param {string} name
 * @returns {Object.<string,number>|null}
 */
function getDbMuscleMap(name) {
  const family = getDbFamily(name);
  if (!family) return null;
  return family.muscles.reduce((acc, m) => { acc[m.name] = m.score; return acc; }, {});
}
