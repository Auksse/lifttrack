// ─── Exercise DB Generation Script ──────────────────────────────────────────
// Run: node data/gen-exercise-db.js > data/lifttrack-exercise-db.js
// Merges LiftTrack families + free-exercise-db enrichment.

const fs = require('fs');
const freeDb = JSON.parse(fs.readFileSync('data/exercises.json'));

function getFree(id) {
  return id ? (freeDb.find(e => e.id === id) || null) : null;
}

// ─── LiftTrack family data (from exerciseDatabase.js) ────────────────────────
const families = [
  {
    familyName: "Flat Press", category: "chest", repRangeCategory: "compound",
    bodyweight: "Push-Up", dumbbells: "Dumbbell Flat Press", barbell: "Barbell Bench Press",
    cable: "Cable Chest Press", machine: "Chest Press Machine", plateLoaded: "Plate-Loaded Chest Press",
    muscles: [
      { name: "Chest", score: 5, role: "primary" },
      { name: "Front Delts", score: 3, role: "secondary" },
      { name: "Triceps", score: 4, role: "secondary" }
    ]
  },
  {
    familyName: "Incline Press", category: "chest", repRangeCategory: "compound",
    bodyweight: "Feet-Elevated Push-Up", dumbbells: "Dumbbell Incline Press", barbell: "Barbell Incline Bench Press",
    cable: "Cable Incline Press", machine: "Incline Press Machine", plateLoaded: "Plate-Loaded Incline Press",
    muscles: [
      { name: "Upper Chest", score: 5, role: "primary" },
      { name: "Front Delts", score: 4, role: "secondary" },
      { name: "Triceps", score: 3, role: "secondary" }
    ]
  },
  {
    familyName: "Chest Fly", category: "chest", repRangeCategory: "isolation_pump",
    bodyweight: null, dumbbells: "Dumbbell Fly", barbell: null,
    cable: "Cable Fly", machine: "Pec Deck", plateLoaded: "Plate-Loaded Fly",
    muscles: [
      { name: "Chest", score: 5, role: "primary" },
      { name: "Front Delts", score: 2, role: "secondary" }
    ]
  },
  {
    familyName: "Chest Dip", category: "chest", repRangeCategory: "compound",
    bodyweight: "Chest Dip", dumbbells: "Weighted Dip", barbell: null,
    cable: null, machine: "Assisted Dip Machine", plateLoaded: "Plate-Loaded Dip",
    muscles: [
      { name: "Lower Chest", score: 5, role: "primary" },
      { name: "Triceps", score: 4, role: "secondary" },
      { name: "Front Delts", score: 3, role: "secondary" }
    ]
  },
  {
    familyName: "Pullover", category: "chest", repRangeCategory: "controlled",
    bodyweight: null, dumbbells: "Dumbbell Pullover", barbell: "Barbell Pullover",
    cable: "Cable Straight-Arm Pulldown", machine: "Pullover Machine", plateLoaded: "Plate-Loaded Pullover",
    muscles: [
      { name: "Lats", score: 4, role: "primary" },
      { name: "Chest", score: 3, role: "secondary" },
      { name: "Serratus", score: 2, role: "secondary" }
    ]
  },
  {
    familyName: "Vertical Press", category: "shoulders", repRangeCategory: "compound",
    bodyweight: "Pike Push-Up", dumbbells: "Dumbbell Overhead Press", barbell: "Barbell Overhead Press",
    cable: "Cable Shoulder Press", machine: "Shoulder Press Machine", plateLoaded: "Plate-Loaded Shoulder Press",
    muscles: [
      { name: "Front Delts", score: 5, role: "primary" },
      { name: "Triceps", score: 4, role: "secondary" },
      { name: "Side Delts", score: 3, role: "secondary" },
      { name: "Upper Chest", score: 2, role: "secondary" }
    ]
  },
  {
    familyName: "Lateral Raise", category: "shoulders", repRangeCategory: "isolation_pump",
    bodyweight: null, dumbbells: "Dumbbell Lateral Raise", barbell: null,
    cable: "Cable Lateral Raise", machine: "Lateral Raise Machine", plateLoaded: "Plate-Loaded Lateral Raise",
    muscles: [
      { name: "Side Delts", score: 5, role: "primary" },
      { name: "Upper Traps", score: 2, role: "secondary" }
    ]
  },
  {
    familyName: "Front Raise", category: "shoulders", repRangeCategory: "isolation_pump",
    bodyweight: null, dumbbells: "Dumbbell Front Raise", barbell: "Barbell Front Raise",
    cable: "Cable Front Raise", machine: "Front Raise Machine", plateLoaded: null,
    muscles: [
      { name: "Front Delts", score: 5, role: "primary" },
      { name: "Upper Chest", score: 2, role: "secondary" }
    ]
  },
  {
    familyName: "Rear Delt Fly", category: "shoulders", repRangeCategory: "isolation_pump",
    bodyweight: null, dumbbells: "Dumbbell Rear Delt Fly", barbell: null,
    cable: "Cable Rear Delt Fly", machine: "Rear Delt Machine", plateLoaded: "Plate-Loaded Rear Delt Fly",
    muscles: [
      { name: "Rear Delts", score: 5, role: "primary" },
      { name: "Mid Traps", score: 3, role: "secondary" },
      { name: "Rhomboids", score: 3, role: "secondary" }
    ]
  },
  {
    familyName: "Face Pull", category: "shoulders", repRangeCategory: "isolation_pump",
    bodyweight: null, dumbbells: null, barbell: null,
    cable: "Cable Face Pull", machine: "Reverse Pec Deck", plateLoaded: null,
    muscles: [
      { name: "Rear Delts", score: 5, role: "primary" },
      { name: "Mid/Lower Traps", score: 4, role: "secondary" },
      { name: "Rotator Cuff", score: 3, role: "secondary" }
    ]
  },
  {
    familyName: "Shrug", category: "shoulders", repRangeCategory: "controlled",
    bodyweight: "Scapular Pull-Up", dumbbells: "Dumbbell Shrug", barbell: "Barbell Shrug",
    cable: "Cable Shrug", machine: "Shrug Machine", plateLoaded: "Plate-Loaded Shrug",
    muscles: [
      { name: "Upper Traps", score: 5, role: "primary" },
      { name: "Forearms", score: 2, role: "secondary" }
    ]
  },
  {
    familyName: "Vertical Pull", category: "back", repRangeCategory: "compound",
    bodyweight: "Pull-Up", dumbbells: null, barbell: null,
    cable: "Cable Lat Pulldown", machine: "Lat Pulldown Machine", plateLoaded: "Plate-Loaded Pulldown",
    muscles: [
      { name: "Lats", score: 5, role: "primary" },
      { name: "Biceps", score: 3, role: "secondary" },
      { name: "Upper Back", score: 3, role: "secondary" }
    ]
  },
  {
    familyName: "Chin-Up Pattern", category: "back", repRangeCategory: "compound",
    bodyweight: "Chin-Up", dumbbells: null, barbell: null,
    cable: "Supinated Lat Pulldown", machine: "Supinated Pulldown Machine", plateLoaded: "Plate-Loaded Supinated Pulldown",
    muscles: [
      { name: "Biceps", score: 5, role: "primary" },
      { name: "Lats", score: 4, role: "secondary" },
      { name: "Upper Back", score: 3, role: "secondary" }
    ]
  },
  {
    familyName: "Horizontal Row", category: "back", repRangeCategory: "compound",
    bodyweight: "Inverted Row", dumbbells: "One-Arm Dumbbell Row", barbell: "Barbell Bent-Over Row",
    cable: "Seated Cable Row", machine: "Seated Row Machine", plateLoaded: "Plate-Loaded Row",
    muscles: [
      { name: "Mid Back", score: 5, role: "primary" },
      { name: "Lats", score: 4, role: "secondary" },
      { name: "Rear Delts", score: 3, role: "secondary" },
      { name: "Biceps", score: 3, role: "secondary" }
    ]
  },
  {
    familyName: "Chest-Supported Row", category: "back", repRangeCategory: "controlled",
    bodyweight: null, dumbbells: "Chest-Supported Dumbbell Row", barbell: "Seal Row",
    cable: "Chest-Supported Cable Row", machine: "Chest-Supported Row Machine", plateLoaded: "Plate-Loaded Chest-Supported Row",
    muscles: [
      { name: "Mid Back", score: 5, role: "primary" },
      { name: "Rear Delts", score: 3, role: "secondary" },
      { name: "Biceps", score: 3, role: "secondary" },
      { name: "Lats", score: 3, role: "secondary" }
    ]
  },
  {
    familyName: "Back Extension", category: "back", repRangeCategory: "controlled",
    bodyweight: "Superman", dumbbells: "Dumbbell Back Extension", barbell: "Barbell Good Morning",
    cable: "Cable Pull-Through", machine: "Back Extension Machine", plateLoaded: "Plate-Loaded Back Extension",
    muscles: [
      { name: "Spinal Erectors", score: 5, role: "primary" },
      { name: "Glutes", score: 3, role: "secondary" },
      { name: "Hamstrings", score: 2, role: "secondary" }
    ]
  },
  {
    familyName: "Romanian Deadlift", category: "legs_glutes", repRangeCategory: "compound",
    bodyweight: "Single-Leg Hip Hinge", dumbbells: "Dumbbell Romanian Deadlift", barbell: "Barbell Romanian Deadlift",
    cable: "Cable Romanian Deadlift", machine: "Smith Machine Romanian Deadlift", plateLoaded: null,
    muscles: [
      { name: "Hamstrings", score: 5, role: "primary" },
      { name: "Glutes", score: 4, role: "secondary" },
      { name: "Spinal Erectors", score: 3, role: "secondary" }
    ]
  },
  {
    familyName: "Conventional Deadlift", category: "legs_glutes", repRangeCategory: "heavy",
    bodyweight: null, dumbbells: "Dumbbell Deadlift", barbell: "Barbell Deadlift",
    cable: null, machine: "Smith Machine Deadlift", plateLoaded: null,
    muscles: [
      { name: "Glutes", score: 5, role: "primary" },
      { name: "Hamstrings", score: 4, role: "secondary" },
      { name: "Spinal Erectors", score: 4, role: "secondary" },
      { name: "Upper Back", score: 3, role: "secondary" },
      { name: "Quads", score: 2, role: "secondary" }
    ]
  },
  {
    familyName: "Squat", category: "legs_glutes", repRangeCategory: "compound",
    bodyweight: "Bodyweight Squat", dumbbells: "Goblet Squat", barbell: "Barbell Back Squat",
    cable: "Cable Squat", machine: "Smith Machine Squat", plateLoaded: "Plate-Loaded V-Squat",
    muscles: [
      { name: "Quads", score: 5, role: "primary" },
      { name: "Glutes", score: 4, role: "secondary" },
      { name: "Adductors", score: 3, role: "secondary" },
      { name: "Spinal Erectors", score: 3, role: "secondary" }
    ]
  },
  {
    familyName: "Front Squat", category: "legs_glutes", repRangeCategory: "compound",
    bodyweight: "Heels-Elevated Squat", dumbbells: "Dumbbell Front Squat", barbell: "Barbell Front Squat",
    cable: "Cable Front Squat", machine: "Smith Front Squat", plateLoaded: null,
    muscles: [
      { name: "Quads", score: 5, role: "primary" },
      { name: "Glutes", score: 3, role: "secondary" },
      { name: "Upper Back", score: 3, role: "secondary" },
      { name: "Core", score: 3, role: "secondary" }
    ]
  },
  {
    familyName: "Hack Squat Pattern", category: "legs_glutes", repRangeCategory: "controlled",
    bodyweight: null, dumbbells: "Dumbbell Hack Squat", barbell: "Barbell Hack Squat",
    cable: null, machine: "Hack Squat Machine", plateLoaded: "Pendulum Squat",
    muscles: [
      { name: "Quads", score: 5, role: "primary" },
      { name: "Glutes", score: 3, role: "secondary" }
    ]
  },
  {
    familyName: "Split Squat", category: "legs_glutes", repRangeCategory: "controlled",
    bodyweight: "Split Squat", dumbbells: "Dumbbell Bulgarian Split Squat", barbell: "Barbell Bulgarian Split Squat",
    cable: "Cable Split Squat", machine: "Split Squat Machine", plateLoaded: null,
    muscles: [
      { name: "Quads", score: 5, role: "primary" },
      { name: "Glutes", score: 4, role: "secondary" },
      { name: "Adductors", score: 3, role: "secondary" }
    ]
  },
  {
    familyName: "Walking Lunge", category: "legs_glutes", repRangeCategory: "controlled",
    bodyweight: "Walking Lunge", dumbbells: "Dumbbell Walking Lunge", barbell: "Barbell Walking Lunge",
    cable: "Cable Walking Lunge", machine: null, plateLoaded: null,
    muscles: [
      { name: "Quads", score: 4, role: "primary" },
      { name: "Glutes", score: 4, role: "primary" },
      { name: "Adductors", score: 2, role: "secondary" },
      { name: "Hamstrings", score: 2, role: "secondary" }
    ]
  },
  {
    familyName: "Step-Up", category: "legs_glutes", repRangeCategory: "controlled",
    bodyweight: "Step-Up", dumbbells: "Dumbbell Step-Up", barbell: "Barbell Step-Up",
    cable: "Cable Step-Up", machine: null, plateLoaded: null,
    muscles: [
      { name: "Quads", score: 4, role: "primary" },
      { name: "Glutes", score: 4, role: "primary" },
      { name: "Hamstrings", score: 2, role: "secondary" }
    ]
  },
  {
    familyName: "Hip Thrust", category: "legs_glutes", repRangeCategory: "controlled",
    bodyweight: "Glute Bridge", dumbbells: "Dumbbell Hip Thrust", barbell: "Barbell Hip Thrust",
    cable: "Cable Hip Thrust", machine: "Glute Drive Machine", plateLoaded: "Plate-Loaded Hip Thrust",
    muscles: [
      { name: "Glutes", score: 5, role: "primary" },
      { name: "Hamstrings", score: 3, role: "secondary" },
      { name: "Quads", score: 1, role: "secondary" }
    ]
  },
  {
    familyName: "Glute Kickback", category: "legs_glutes", repRangeCategory: "isolation_pump",
    bodyweight: "Donkey Kick", dumbbells: "Dumbbell Glute Kickback", barbell: null,
    cable: "Cable Glute Kickback", machine: "Glute Kickback Machine", plateLoaded: "Plate-Loaded Glute Kickback",
    muscles: [
      { name: "Glutes", score: 5, role: "primary" },
      { name: "Hamstrings", score: 2, role: "secondary" }
    ]
  },
  {
    familyName: "Leg Curl", category: "legs_glutes", repRangeCategory: "isolation_pump",
    bodyweight: "Nordic Curl", dumbbells: "Dumbbell Leg Curl", barbell: null,
    cable: "Cable Leg Curl", machine: "Leg Curl Machine", plateLoaded: "Plate-Loaded Leg Curl",
    muscles: [
      { name: "Hamstrings", score: 5, role: "primary" },
      { name: "Calves", score: 1, role: "secondary" }
    ]
  },
  {
    familyName: "Leg Extension", category: "legs_glutes", repRangeCategory: "isolation_pump",
    bodyweight: "Sissy Squat", dumbbells: null, barbell: null,
    cable: "Cable Leg Extension", machine: "Leg Extension Machine", plateLoaded: "Plate-Loaded Leg Extension",
    muscles: [
      { name: "Quads", score: 5, role: "primary" }
    ]
  },
  {
    familyName: "Standing Calf Raise", category: "legs_glutes", repRangeCategory: "isolation_pump",
    bodyweight: "Standing Calf Raise", dumbbells: "Dumbbell Standing Calf Raise", barbell: "Barbell Standing Calf Raise",
    cable: "Cable Standing Calf Raise", machine: "Standing Calf Raise Machine", plateLoaded: "Plate-Loaded Standing Calf Raise",
    muscles: [
      { name: "Gastrocnemius", score: 5, role: "primary" },
      { name: "Soleus", score: 3, role: "secondary" }
    ]
  },
  {
    familyName: "Seated Calf Raise", category: "legs_glutes", repRangeCategory: "isolation_pump",
    bodyweight: "Seated Calf Raise", dumbbells: "Dumbbell Seated Calf Raise", barbell: "Barbell Seated Calf Raise",
    cable: "Cable Seated Calf Raise", machine: "Seated Calf Raise Machine", plateLoaded: "Plate-Loaded Seated Calf Raise",
    muscles: [
      { name: "Soleus", score: 5, role: "primary" },
      { name: "Gastrocnemius", score: 2, role: "secondary" }
    ]
  },
  {
    familyName: "Curl", category: "arms", repRangeCategory: "isolation_pump",
    bodyweight: null, dumbbells: "Dumbbell Curl", barbell: "Barbell Curl",
    cable: "Cable Curl", machine: "Biceps Curl Machine", plateLoaded: "Plate-Loaded Curl",
    muscles: [
      { name: "Biceps", score: 5, role: "primary" },
      { name: "Forearms", score: 3, role: "secondary" }
    ]
  },
  {
    familyName: "Hammer Curl", category: "arms", repRangeCategory: "isolation_pump",
    bodyweight: null, dumbbells: "Dumbbell Hammer Curl", barbell: null,
    cable: "Rope Hammer Curl", machine: "Hammer Curl Machine", plateLoaded: null,
    muscles: [
      { name: "Brachialis", score: 5, role: "primary" },
      { name: "Brachioradialis", score: 4, role: "secondary" },
      { name: "Biceps", score: 3, role: "secondary" }
    ]
  },
  {
    familyName: "Preacher Curl", category: "arms", repRangeCategory: "isolation_pump",
    bodyweight: null, dumbbells: "Dumbbell Preacher Curl", barbell: "EZ-Bar Preacher Curl",
    cable: "Cable Preacher Curl", machine: "Preacher Curl Machine", plateLoaded: "Plate-Loaded Preacher Curl",
    muscles: [
      { name: "Biceps", score: 5, role: "primary" },
      { name: "Forearms", score: 2, role: "secondary" }
    ]
  },
  {
    familyName: "Triceps Pushdown", category: "arms", repRangeCategory: "isolation_pump",
    bodyweight: null, dumbbells: null, barbell: null,
    cable: "Cable Triceps Pushdown", machine: "Triceps Pushdown Machine", plateLoaded: null,
    muscles: [
      { name: "Triceps", score: 5, role: "primary" }
    ]
  },
  {
    familyName: "Overhead Triceps Extension", category: "arms", repRangeCategory: "isolation_pump",
    bodyweight: "Bodyweight Triceps Extension", dumbbells: "Dumbbell Overhead Triceps Extension", barbell: "Barbell Overhead Triceps Extension",
    cable: "Cable Overhead Triceps Extension", machine: "Triceps Extension Machine", plateLoaded: null,
    muscles: [
      { name: "Triceps Long Head", score: 5, role: "primary" },
      { name: "Other Triceps Heads", score: 3, role: "secondary" }
    ]
  },
  {
    familyName: "Skull Crusher", category: "arms", repRangeCategory: "isolation_pump",
    bodyweight: null, dumbbells: "Dumbbell Skull Crusher", barbell: "Barbell Skull Crusher",
    cable: "Cable Skull Crusher", machine: null, plateLoaded: null,
    muscles: [
      { name: "Triceps", score: 5, role: "primary" }
    ]
  },
  {
    familyName: "Crunch", category: "core", repRangeCategory: "isolation_pump",
    bodyweight: "Crunch", dumbbells: "Dumbbell Crunch", barbell: "Barbell Crunch",
    cable: "Cable Crunch", machine: "Ab Crunch Machine", plateLoaded: "Plate-Loaded Ab Crunch",
    muscles: [
      { name: "Abs", score: 5, role: "primary" },
      { name: "Hip Flexors", score: 2, role: "secondary" }
    ]
  },
  {
    familyName: "Leg Raise", category: "core", repRangeCategory: "isolation_pump",
    bodyweight: "Hanging Leg Raise", dumbbells: null, barbell: null,
    cable: "Cable Reverse Crunch", machine: "Vertical Knee Raise Machine", plateLoaded: null,
    muscles: [
      { name: "Abs", score: 4, role: "primary" },
      { name: "Hip Flexors", score: 4, role: "secondary" }
    ]
  },
  {
    familyName: "Rotation Core", category: "core", repRangeCategory: "isolation_pump",
    bodyweight: "Side Plank Rotation", dumbbells: "Dumbbell Russian Twist", barbell: "Landmine Rotation",
    cable: "Cable Woodchop", machine: "Rotary Torso Machine", plateLoaded: "Plate-Loaded Rotary Torso",
    muscles: [
      { name: "Obliques", score: 5, role: "primary" },
      { name: "Abs", score: 3, role: "secondary" },
      { name: "Shoulders", score: 2, role: "secondary" }
    ]
  },
  {
    familyName: "Plank", category: "core", repRangeCategory: "isolation_pump",
    bodyweight: "Plank", dumbbells: "Dumbbell Plank Drag", barbell: "Barbell Rollout",
    cable: "Cable Iso Hold", machine: null, plateLoaded: null,
    muscles: [
      { name: "Deep Core", score: 5, role: "primary" },
      { name: "Abs", score: 4, role: "secondary" },
      { name: "Glutes", score: 2, role: "secondary" },
      { name: "Serratus", score: 2, role: "secondary" }
    ]
  },
  {
    familyName: "Leg Press", category: "legs_glutes", repRangeCategory: "compound",
    bodyweight: null, dumbbells: null, barbell: null,
    cable: null, machine: "Leg Press Machine", plateLoaded: "Plate-Loaded Leg Press",
    muscles: [
      { name: "Quads", score: 5, role: "primary" },
      { name: "Glutes", score: 4, role: "secondary" },
      { name: "Hamstrings", score: 2, role: "secondary" }
    ]
  }
];

// ─── Free-db ID mapping (LiftTrack name → free-db exercise id) ───────────────
const ID_MAP = {
  // Flat Press
  "Push-Up":                             "Pushups",
  "Dumbbell Flat Press":                 "Dumbbell_Bench_Press",
  "Barbell Bench Press":                 "Barbell_Bench_Press_-_Medium_Grip",
  "Feet-Elevated Push-Up":              "Push-Ups_With_Feet_Elevated",
  "Cable Incline Press":                 "Incline_Cable_Chest_Press",
  "Chest Press Machine":                 "Machine_Bench_Press",
  "Incline Press Machine":              "Leverage_Incline_Chest_Press",
  // Incline Press
  "Dumbbell Incline Press":              "Incline_Dumbbell_Press",
  "Barbell Incline Bench Press":         "Barbell_Incline_Bench_Press_-_Medium_Grip",
  // Chest Fly
  "Dumbbell Fly":                        "Dumbbell_Flyes",
  "Cable Fly":                           "Flat_Bench_Cable_Flyes",
  "Pec Deck":                            "Butterfly",
  // Chest Dip
  "Chest Dip":                           "Dips_-_Chest_Version",
  "Weighted Dip":                        "Parallel_Bar_Dip",
  "Assisted Dip Machine":               "Dip_Machine",
  // Pullover
  "Dumbbell Pullover":                   "Straight-Arm_Dumbbell_Pullover",
  "Barbell Pullover":                    "Bent-Arm_Barbell_Pullover",
  "Cable Straight-Arm Pulldown":         "Straight-Arm_Pulldown",
  // Vertical Press
  "Dumbbell Overhead Press":             "Dumbbell_Shoulder_Press",
  "Barbell Overhead Press":              "Standing_Military_Press",
  "Shoulder Press Machine":             "Machine_Shoulder_Military_Press",
  // Lateral Raise
  "Dumbbell Lateral Raise":              "Side_Lateral_Raise",
  "Cable Lateral Raise":                 "Cable_Seated_Lateral_Raise",
  "Lateral Raise Machine":              "Seated_Side_Lateral_Raise",
  // Front Raise
  "Dumbbell Front Raise":               "Front_Dumbbell_Raise",
  "Cable Front Raise":                  "Front_Cable_Raise",
  // Rear Delt Fly
  "Dumbbell Rear Delt Fly":             "Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench",
  "Cable Rear Delt Fly":                "Cable_Rear_Delt_Fly",
  "Rear Delt Machine":                  "Reverse_Machine_Flyes",
  "Reverse Pec Deck":                   "Reverse_Machine_Flyes",
  // Face Pull
  "Cable Face Pull":                     "Face_Pull",
  // Shrug
  "Scapular Pull-Up":                    "Scapular_Pull-Up",
  "Dumbbell Shrug":                      "Dumbbell_Shrug",
  "Barbell Shrug":                       "Barbell_Shrug",
  "Cable Shrug":                         "Cable_Shrugs",
  "Shrug Machine":                       "Leverage_Shrug",
  // Vertical Pull
  "Pull-Up":                             "Pullups",
  "Cable Lat Pulldown":                  "Wide-Grip_Lat_Pulldown",
  "Lat Pulldown Machine":               "Full_Range-Of-Motion_Lat_Pulldown",
  // Chin-Up Pattern
  "Chin-Up":                             "Chin-Up",
  "Supinated Lat Pulldown":              "Close-Grip_Front_Lat_Pulldown",
  // Horizontal Row
  "Inverted Row":                        "Inverted_Row",
  "One-Arm Dumbbell Row":               "One-Arm_Dumbbell_Row",
  "Barbell Bent-Over Row":              "Bent_Over_Barbell_Row",
  "Seated Cable Row":                    "Seated_Cable_Rows",
  "Chest-Supported Dumbbell Row":       "Dumbbell_Incline_Row",
  // Back Extension
  "Superman":                            "Superman",
  "Dumbbell Back Extension":            "Hyperextensions_Back_Extensions",
  "Barbell Good Morning":               "Good_Morning",
  "Cable Pull-Through":                  "Pull_Through",
  "Back Extension Machine":             "Hyperextensions_Back_Extensions",
  // Romanian Deadlift
  "Barbell Romanian Deadlift":          "Romanian_Deadlift",
  "Dumbbell Romanian Deadlift":         "Stiff-Legged_Dumbbell_Deadlift",
  "Smith Machine Romanian Deadlift":    "Smith_Machine_Stiff-Legged_Deadlift",
  // Conventional Deadlift
  "Barbell Deadlift":                    "Barbell_Deadlift",
  // Squat
  "Bodyweight Squat":                    "Bodyweight_Squat",
  "Goblet Squat":                        "Goblet_Squat",
  "Barbell Back Squat":                  "Barbell_Squat",
  // Front Squat
  "Barbell Front Squat":                 "Front_Barbell_Squat",
  // Hack Squat Pattern
  "Barbell Hack Squat":                  "Barbell_Hack_Squat",
  "Hack Squat Machine":                  "Hack_Squat",
  // Split Squat
  "Split Squat":                         "Split_Squats",
  "Dumbbell Bulgarian Split Squat":     "Split_Squat_with_Dumbbells",
  "Barbell Bulgarian Split Squat":      "Barbell_Side_Split_Squat",
  // Walking Lunge
  "Walking Lunge":                       "Bodyweight_Walking_Lunge",
  "Dumbbell Walking Lunge":             "Dumbbell_Lunges",
  "Barbell Walking Lunge":              "Barbell_Walking_Lunge",
  // Step-Up
  "Step-Up":                             "Step-up_with_Knee_Raise",
  "Dumbbell Step-Up":                   "Dumbbell_Step_Ups",
  "Barbell Step-Up":                    "Barbell_Step_Ups",
  // Hip Thrust
  "Glute Bridge":                        "Single_Leg_Glute_Bridge",
  "Barbell Hip Thrust":                  "Barbell_Hip_Thrust",
  // Glute Kickback
  "Cable Glute Kickback":               "Glute_Kickback",
  "Glute Kickback Machine":             "One-Legged_Cable_Kickback",
  // Leg Curl
  "Nordic Curl":                         "Natural_Glute_Ham_Raise",
  "Dumbbell Leg Curl":                  "Lying_Leg_Curls",
  "Cable Leg Curl":                     "Standing_Leg_Curl",
  "Leg Curl Machine":                    "Lying_Leg_Curls",
  // Leg Extension
  "Sissy Squat":                         "Weighted_Sissy_Squat",
  "Leg Extension Machine":              "Leg_Extensions",
  // Standing Calf Raise
  "Standing Calf Raise":                "Standing_Calf_Raises",
  "Dumbbell Standing Calf Raise":       "Standing_Dumbbell_Calf_Raise",
  "Barbell Standing Calf Raise":        "Standing_Barbell_Calf_Raise",
  // Seated Calf Raise
  "Dumbbell Seated Calf Raise":         "Dumbbell_Seated_One-Leg_Calf_Raise",
  "Barbell Seated Calf Raise":          "Barbell_Seated_Calf_Raise",
  "Seated Calf Raise Machine":          "Seated_Calf_Raise",
  // Curl
  "Dumbbell Curl":                       "Dumbbell_Alternate_Bicep_Curl",
  "Barbell Curl":                        "Barbell_Curl",
  "Cable Curl":                          "Standing_Biceps_Cable_Curl",
  "Biceps Curl Machine":                "Machine_Bicep_Curl",
  // Hammer Curl
  "Dumbbell Hammer Curl":               "Alternate_Hammer_Curl",
  "Rope Hammer Curl":                   "Cable_Hammer_Curls_-_Rope_Attachment",
  // Preacher Curl
  "Dumbbell Preacher Curl":             "One_Arm_Dumbbell_Preacher_Curl",
  "EZ-Bar Preacher Curl":               "Preacher_Curl",
  "Cable Preacher Curl":                "Cable_Preacher_Curl",
  "Preacher Curl Machine":              "Machine_Preacher_Curls",
  // Triceps Pushdown
  "Cable Triceps Pushdown":             "Triceps_Pushdown_-_Rope_Attachment",
  "Triceps Pushdown Machine":           "Triceps_Pushdown",
  // Overhead Triceps Extension
  "Bodyweight Triceps Extension":       "Body_Tricep_Press",
  "Dumbbell Overhead Triceps Extension": "Standing_Dumbbell_Triceps_Extension",
  "Barbell Overhead Triceps Extension": "Standing_Overhead_Barbell_Triceps_Extension",
  "Cable Overhead Triceps Extension":   "Cable_Rope_Overhead_Triceps_Extension",
  "Triceps Extension Machine":          "Machine_Triceps_Extension",
  // Skull Crusher
  "Dumbbell Skull Crusher":             "Lying_Dumbbell_Tricep_Extension",
  "Barbell Skull Crusher":              "EZ-Bar_Skullcrusher",
  "Cable Skull Crusher":                "Cable_Lying_Triceps_Extension",
  // Crunch
  "Crunch":                              "Crunches",
  "Cable Crunch":                        "Cable_Crunch",
  "Ab Crunch Machine":                  "Ab_Crunch_Machine",
  // Leg Raise
  "Hanging Leg Raise":                  "Hanging_Leg_Raise",
  "Vertical Knee Raise Machine":        "Knee_Hip_Raise_On_Parallel_Bars",
  // Rotation Core
  "Dumbbell Russian Twist":             "Russian_Twist",
  "Cable Woodchop":                     "Standing_Cable_Wood_Chop",
  "Landmine Rotation":                  "Landmine_180s",
  "Rotary Torso Machine":               "Torso_Rotation",
  // Plank
  "Plank":                               "Plank",
  "Barbell Rollout":                     "Barbell_Ab_Rollout",
  // Leg Press
  "Leg Press Machine":                  "Leg_Press",
};

// ─── Category → Split mapping ─────────────────────────────────────────────────
const BICEPS_FAMILIES = new Set(["Curl", "Hammer Curl", "Preacher Curl"]);
const TRICEPS_FAMILIES = new Set(["Triceps Pushdown", "Overhead Triceps Extension", "Skull Crusher"]);

function getSplit(fam) {
  if (fam.category === 'arms') {
    if (BICEPS_FAMILIES.has(fam.familyName)) return 'Pull';
    if (TRICEPS_FAMILIES.has(fam.familyName)) return 'Push';
    return 'Push';
  }
  if (fam.category === 'core') return 'Core';
  const map = { chest: 'Push', shoulders: 'Push', back: 'Pull', legs_glutes: 'Legs' };
  return map[fam.category] || null;
}

// ─── Generate flat rows ───────────────────────────────────────────────────────
const EQUIP_KEYS = ['bodyweight', 'dumbbells', 'barbell', 'cable', 'machine', 'plateLoaded'];
const rows = [];
const seenNames = new Set();

for (const fam of families) {
  const split = getSplit(fam);
  const primaryMuscles = fam.muscles.filter(m => m.role === 'primary').map(m => m.name);
  const secondaryMuscles = fam.muscles.filter(m => m.role === 'secondary').map(m => m.name);

  for (const equip of EQUIP_KEYS) {
    const name = fam[equip];
    if (!name) continue;

    seenNames.add(name.toLowerCase());
    const freeId = ID_MAP[name] || null;
    const free = getFree(freeId);

    // Build a clean id from name if no free-db match
    const id = freeId || name.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '');

    rows.push({
      id,
      name,
      aliases: [],
      familyName: fam.familyName,
      category: fam.category,
      split,
      equipment: equip,
      repRangeCategory: fam.repRangeCategory,
      level: free ? free.level : null,
      mechanic: free ? free.mechanic : null,
      force: free ? free.force : null,
      sourceCategory: free ? free.category : null,
      primaryMuscles,
      secondaryMuscles,
      muscles: fam.muscles,
      instructions: free ? free.instructions : [],
      images: free ? free.images : [],
    });
  }
}

// ─── Output JS file ───────────────────────────────────────────────────────────
const header = `// ═══════════════════════════════════════════════════════════════════
// LIFTTRACK UNIFIED EXERCISE DATABASE
// Auto-generated — do NOT edit manually. Run: node data/gen-exercise-db.js
// Merges LiftTrack exercise families with free-exercise-db enrichment.
// ${rows.length} exercises total.
// ═══════════════════════════════════════════════════════════════════

/**
 * @typedef {"bodyweight"|"dumbbells"|"barbell"|"cable"|"machine"|"plateLoaded"} EquipmentKey
 * @typedef {"Push"|"Pull"|"Legs"|"Core"} SplitCategory
 * @typedef {"heavy"|"compound"|"controlled"|"isolation_pump"} RepRangeCategory
 * @typedef {"primary"|"secondary"} MuscleRole
 * @typedef {{ name: string, score: 1|2|3|4|5, role: MuscleRole }} ExerciseMuscle
 *
 * @typedef {{
 *   id: string,
 *   name: string,
 *   aliases: string[],
 *   familyName: string,
 *   category: string,
 *   split: SplitCategory,
 *   equipment: EquipmentKey,
 *   repRangeCategory: RepRangeCategory,
 *   level: string|null,
 *   mechanic: string|null,
 *   force: string|null,
 *   sourceCategory: string|null,
 *   primaryMuscles: string[],
 *   secondaryMuscles: string[],
 *   muscles: ExerciseMuscle[],
 *   instructions: string[],
 *   images: string[]
 * }} LiftTrackExercise
 */

/** @type {LiftTrackExercise[]} */
window.LIFTTRACK_EXERCISE_DB = `;

process.stdout.write(header);
process.stdout.write(JSON.stringify(rows, null, 2));
process.stdout.write(';\n');

// Stats
process.stderr.write(`Generated ${rows.length} exercises from ${families.length} families.\n`);
