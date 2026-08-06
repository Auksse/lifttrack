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

export function loadTemplates(userId) {
  const raw = localStorage.getItem(userKey(userId, 'templates'));
  let templates = raw ? safeParse(raw, []) : [];

  // Seed once. After that the user owns the list — including deleting them.
  if (!localStorage.getItem(userKey(userId, SEEDED_FLAG))) {
    const existing = new Set(templates.map((tpl) => tpl.name.toLowerCase()));
    STARTER_TEMPLATES.forEach((tpl) => {
      if (!existing.has(tpl.name.toLowerCase())) {
        templates.push({ id: crypto.randomUUID(), ...tpl, exercises: [...tpl.exercises] });
      }
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
