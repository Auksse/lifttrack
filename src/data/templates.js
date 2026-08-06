/**
 * Workout templates.
 *
 * The old app maintained *two* parallel template systems — `DEFAULT_TEMPLATES`
 * seeded into custom storage, and `BUILTIN_TEMPLATE_DEFAULTS` held separately —
 * and rendered both into the same picker. That is why the template list showed
 * "Push, Pull, Legs, Upper, Push, Pull": the same names from two sources.
 *
 * There is now one list. Built-in templates are seeded once per profile and
 * from then on are ordinary, editable templates like any other.
 */

import { userKey } from '../state/storage.js';

const STARTER_TEMPLATES = [
  {
    name: 'Push',
    focus: 'Push',
    exercises: [
      'Dumbbell Flat Press',
      'Dumbbell Incline Press',
      'Dumbbell Overhead Press',
      'Cable Lateral Raise',
      'Cable Overhead Triceps Extension',
    ],
  },
  {
    name: 'Pull',
    focus: 'Pull',
    exercises: [
      'Lat Pulldown Machine',
      'Seated Row Machine',
      'Rear Delt Machine',
      'Cable Face Pull',
      'Dumbbell Curl',
    ],
  },
  {
    name: 'Legs',
    focus: 'Legs',
    exercises: [
      'Leg Press Machine',
      'Dumbbell Bulgarian Split Squat',
      'Leg Curl Machine',
      'Leg Extension Machine',
      'Standing Calf Raise Machine',
    ],
  },
  {
    name: 'Upper',
    focus: 'Upper',
    exercises: [
      'Barbell Bench Press',
      'Dumbbell Incline Press',
      'Dumbbell Overhead Press',
      'Lat Pulldown Machine',
      'Seated Row Machine',
      'Barbell Curl',
      'Cable Triceps Pushdown',
    ],
  },
];

const SEEDED_FLAG = 'templates_seeded';

/**
 * Carry forward the previous version's built-in templates.
 *
 * The old app kept two template systems. Alongside `templates` (custom ones)
 * it stored the four built-ins — Push, Pull, Legs, Upper — separately:
 *
 *   builtin_tmpl     { Push: [exercise, …], … }   user-edited exercise lists
 *   builtin_colors   { Push: '#rrggbb', … }       user-picked colours
 *   hidden_builtins  [ 'Upper', … ]               ones the user removed
 *
 * Those lists were editable, so they hold real user work. Seeding the
 * factory defaults over the top would silently discard it — if you had
 * added Pec Deck to your Push day, it would just be gone.
 *
 * So: prefer the stored version of a built-in, fall back to the factory
 * default, and skip any the user had hidden.
 *
 * @returns {Array|null} migrated templates, or null if there is nothing to migrate
 */
function migrateLegacyBuiltins(userId) {
  const stored = localStorage.getItem(userKey(userId, 'builtin_tmpl'));
  if (!stored) return null;

  const customised = safeParseObject(stored, {});
  const colors = safeParseObject(localStorage.getItem(userKey(userId, 'builtin_colors')), {});
  const hidden = new Set(safeParse(localStorage.getItem(userKey(userId, 'hidden_builtins')), []));

  const migrated = [];
  const names = new Set([...Object.keys(customised), ...STARTER_TEMPLATES.map((tpl) => tpl.name)]);

  names.forEach((name) => {
    if (hidden.has(name)) return;

    const exercises = Array.isArray(customised[name])
      ? customised[name]
      : STARTER_TEMPLATES.find((tpl) => tpl.name === name)?.exercises;
    if (!exercises?.length) return;

    migrated.push({
      id: crypto.randomUUID(),
      name,
      focus: name,
      exercises: [...exercises],
      ...(colors[name] ? { color: colors[name] } : {}),
    });
  });

  return migrated.length ? migrated : null;
}

export function loadTemplates(userId) {
  const raw = localStorage.getItem(userKey(userId, 'templates'));
  const templates = raw ? safeParse(raw, []) : [];

  // Seed once. After that the user owns the list — including deleting from it.
  if (!localStorage.getItem(userKey(userId, SEEDED_FLAG))) {
    const existing = new Set(templates.map((tpl) => tpl.name.toLowerCase()));

    // An upgrading user gets their edited built-ins; a new user gets factory
    // defaults. Either way, never add a name they already have — that is the
    // bug that made the old picker show "Push, Pull, Legs, Upper, Push, Pull".
    const incoming = migrateLegacyBuiltins(userId) || STARTER_TEMPLATES;

    incoming.forEach((tpl) => {
      if (existing.has(tpl.name.toLowerCase())) return;
      existing.add(tpl.name.toLowerCase());
      templates.push({
        id: tpl.id || crypto.randomUUID(),
        name: tpl.name,
        focus: tpl.focus || tpl.name,
        exercises: [...tpl.exercises],
        ...(tpl.color ? { color: tpl.color } : {}),
      });
    });

    localStorage.setItem(userKey(userId, SEEDED_FLAG), '1');
    saveTemplates(userId, templates);
  }

  return templates;
}

export function saveTemplates(userId, templates) {
  localStorage.setItem(userKey(userId, 'templates'), JSON.stringify(templates));
}

export function createTemplate(name, exercises = [], focus = null) {
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    focus: focus || name.trim(),
    exercises: [...exercises],
  };
}

function safeParse(raw, fallback) {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function safeParseObject(raw, fallback) {
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}
