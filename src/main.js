/**
 * Application entry point.
 */

// Self-hosted fonts — no Google Fonts request at runtime, so typography
// survives being offline. The old build fetched all three from a CDN.
import '@fontsource/bebas-neue/400.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource-variable/dm-sans';

import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';

import { state, setState, update, subscribe, invalidate } from './state/store.js';
import {
  loadUsers, saveUsers, loadCurrentUserId, setCurrentUserId,
  loadSettings, saveSettings, saveDraft, loadDraft,
} from './state/storage.js';
import { getRepository } from './data/repository.js';
import { loadTemplates } from './data/templates.js';
import { initLanguage, setLanguage, t, tFocus } from './i18n/index.js';
import { installDelegation, onAction, onInput, esc } from './ui/actions.js';
import { icon } from './ui/icons.js';
import { cue, haptic, primeAudio, setHapticsEnabled, setSoundEnabled } from './ui/feedback.js';
import { renderLogScreen } from './ui/screens/log.js';
import { renderWorkoutScreen } from './ui/screens/workout.js';
import { renderProfileGate } from './ui/screens/profile.js';
import { renderMusclesScreen } from './ui/screens/muscles.js';
import { renderStatsScreen } from './ui/screens/stats.js';
import { renderPlanScreen } from './ui/screens/plan.js';
import { renderSheet } from './ui/screens/sheets.js';
import { saveTemplates, createTemplate } from './data/templates.js';
import { cleanUpLegacyServiceWorker, reloadOnWorkerActivation } from './legacy-cleanup.js';
import { isPersonalRecord } from './domain/stats.js';
import { suggestNext, getProfile } from './domain/progression.js';

const app = document.getElementById('app');
const toastEl = document.getElementById('toast');

// ---------------------------------------------------------------- toast

let toastTimer = null;
function toast(message, variant = '') {
  toastEl.textContent = message;
  toastEl.className = `toast is-visible ${variant ? `is-${variant}` : ''}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.className = 'toast';
  }, 2600);
}

// ---------------------------------------------------------------- render

const TABS = [
  { id: 'log', icon: 'log', label: 'tab_log' },
  { id: 'plan', icon: 'plan', label: 'tab_plan' },
  { id: 'muscles', icon: 'muscles', label: 'tab_muscles' },
  { id: 'stats', icon: 'stats', label: 'tab_stats' },
];

function renderDock() {
  const inWorkout = !!state.workout && state.tab === 'workout';
  const left = TABS.slice(0, 2);
  const right = TABS.slice(2);

  const tabButton = (tab) => `
    <button class="dock-tab ${state.tab === tab.id ? 'is-active' : ''}"
            data-action="nav:tab" data-tab="${tab.id}"
            aria-label="${t(tab.label)}" aria-current="${state.tab === tab.id}">
      ${icon(tab.icon, { size: 22 })}
      <span class="dock-tab-label">${t(tab.label)}</span>
    </button>`;

  return `
    <nav class="dock" aria-label="Main">
      ${left.map(tabButton).join('')}
      <div class="dock-action">
        <button class="dock-action-btn ${inWorkout ? 'is-active' : ''}"
                data-action="${inWorkout ? 'workout:leave' : 'workout:quickstart'}"
                aria-label="${inWorkout ? t('close') : t('start_workout')}">
          ${icon('plus', { size: 26, stroke: 2.4 })}
        </button>
      </div>
      ${right.map(tabButton).join('')}
    </nav>`;
}

function screenFor(tab) {
  switch (tab) {
    case 'workout': return renderWorkoutScreen();
    case 'plan':    return renderPlanScreen();
    case 'muscles': return renderMusclesScreen();
    case 'stats':   return renderStatsScreen();
    case 'log':
    default:        return renderLogScreen();
  }
}

function render() {
  if (!state.ready) return;

  // No profile chosen yet — the gate owns the whole screen.
  if (!state.user) {
    app.innerHTML = renderProfileGate();
    return;
  }

  const scrollTop = document.getElementById('content')?.scrollTop ?? 0;
  const screen = screenFor(state.tab);

  app.innerHTML = `
    <header class="screen-header">${screen.header}</header>
    <main class="content" id="content">
      <div class="content-inner">${screen.body}</div>
    </main>
    ${screen.footer || ''}
    ${state.tab === 'workout' ? '' : renderDock()}
    ${renderSheet()}
  `;

  const content = document.getElementById('content');
  if (content) content.scrollTop = scrollTop;
}

subscribe(render);

// ---------------------------------------------------------------- workout

/**
 * Build the set rows for an exercise you are about to perform.
 *
 * Starting every exercise with a single blank set (what the old app did)
 * means tapping "add set" three times before you can log anything. Instead
 * we pre-build the right number of rows and pre-fill them with the
 * progression target, so the common case is: lift, tick, done.
 */
function initialSetsFor(name) {
  const previous = [...state.sessions]
    .reverse()
    .find((s) => s.exercises.some((e) => e.name === name));

  const lastSets = previous?.exercises.find((e) => e.name === name)?.sets;
  const suggestion = suggestNext(name, lastSets);
  const profile = getProfile(name);

  const count = suggestion?.sets || profile.sets;
  const reps = suggestion ? String(suggestion.reps) : '';
  const weight = suggestion ? String(suggestion.weight) : '';

  return Array.from({ length: count }, () => ({ r: reps, w: weight, done: false }));
}

function newWorkout(focus, exercises = []) {
  return {
    date: new Date().toISOString().slice(0, 10),
    focus,
    startedAt: Date.now(),
    templateFrom: null,
    exercises: exercises.map((name) => ({ name, sets: initialSetsFor(name) })),
  };
}

function persistDraft() {
  saveDraft(state.user?.id, state.workout);
}

// ---------------------------------------------------------------- actions

onAction('nav:tab', ({ tab }) => setState({ tab, expandedSessionId: null }));

onAction('workout:quickstart', () => {
  if (state.workout) {
    setState({ tab: 'workout' });
    return;
  }
  setState({ sheet: { type: 'template-picker' } });
  openTemplatePicker();
});

onAction('workout:start', ({ focus }) => {
  const template = state.templates.find((tpl) => tpl.name === focus || tpl.focus === focus);
  update((s) => {
    s.workout = newWorkout(focus, template?.exercises || []);
    s.tab = 'workout';
  });
  persistDraft();
  haptic('select');
});

onAction('workout:resume', () => setState({ tab: 'workout' }));

onAction('workout:leave', () => {
  setState({ tab: 'log' });
});

onAction('workout:save', async () => {
  const w = state.workout;
  if (!w) return;

  /**
   * Decide what actually happened.
   *
   * Sets arrive pre-filled with the progression target, so "has numbers in
   * it" is not evidence a set was performed — an exercise you skipped
   * entirely would otherwise be saved as a full completed exercise.
   *
   * So: if anything was ticked, ticked sets are the record. If nothing was
   * ticked at all, fall back to filled rows, because that means the user
   * logged by typing and never used the checkmark, and silently discarding
   * their whole session would be far worse.
   */
  const anyTicked = w.exercises.some((ex) => ex.sets.some((s) => s.done));
  const keep = anyTicked
    ? (s) => s.done && Number(s.r) > 0
    : (s) => Number(s.r) > 0;

  const exercises = w.exercises
    .map((ex) => ({
      name: ex.name,
      sets: ex.sets.filter(keep).map((s) => ({ r: Number(s.r), w: Number(s.w) || 0 })),
    }))
    .filter((ex) => ex.name && ex.sets.length);

  if (!exercises.length) {
    toast(t('add_at_least'), 'error');
    cue('error');
    return;
  }

  const repo = getRepository(state.user.id);
  const saved = await repo.add({ date: w.date, focus: w.focus, exercises });

  const sessions = await repo.list();
  const gotPR = saved.exercises.some((ex) => isPersonalRecord(sessions, saved, ex.name));

  update((s) => {
    s.sessions = sessions;
    s.workout = null;
    s.restEndsAt = null;
    s.tab = 'log';
  });
  persistDraft();

  cue(gotPR ? 'pr' : 'saved');
  toast(gotPR ? `${t('session_saved')} · ${t('new_pr')}!` : t('session_saved'), 'success');
});

// ---- sets ----

onInput('set:reps', (value, { ex, set }) => {
  state.workout.exercises[+ex].sets[+set].r = value.replace(/[^\d]/g, '');
  persistDraft();
  // No re-render: the input already shows the value, and re-rendering
  // mid-keystroke would steal focus and collapse the keyboard.
});

onInput('set:weight', (value, { ex, set }) => {
  state.workout.exercises[+ex].sets[+set].w = value.replace(/[^\d.,]/g, '').replace(',', '.');
  persistDraft();
});

onAction('set:toggle', ({ ex, set }) => {
  const target = state.workout.exercises[+ex].sets[+set];
  target.done = !target.done;

  if (target.done) {
    cue('setComplete');
    // Auto-start the rest timer when a set is ticked — the whole reason
    // you look at your phone between sets.
    if (!state.restEndsAt) startRest(90);
  } else {
    haptic('tap');
  }
  persistDraft();
  invalidate();
});

onAction('set:add', ({ ex }) => {
  const sets = state.workout.exercises[+ex].sets;
  const previous = sets.at(-1);
  // Carry the previous set's numbers forward — you usually repeat them.
  sets.push({ r: previous?.r ?? '', w: previous?.w ?? '', done: false });
  persistDraft();
  invalidate();
});

onAction('exercise:remove', ({ ex }) => {
  state.workout.exercises.splice(+ex, 1);
  persistDraft();
  invalidate();
});

onAction('suggestion:apply', ({ ex, sets, reps, weight }) => {
  state.workout.exercises[+ex].sets = Array.from({ length: +sets }, () => ({
    r: String(reps), w: String(weight), done: false,
  }));
  persistDraft();
  haptic('select');
  invalidate();
});

// ---- rest timer ----

let restInterval = null;

function startRest(seconds) {
  update((s) => {
    s.restEndsAt = Date.now() + seconds * 1000;
    s.restDuration = seconds;
  });
  clearInterval(restInterval);
  restInterval = setInterval(tickRest, 250);
}

function tickRest() {
  if (!state.restEndsAt) return;
  const remaining = Math.max(0, Math.ceil((state.restEndsAt - Date.now()) / 1000));

  // Update the two live nodes directly rather than re-rendering the whole
  // screen four times a second — that would fight with the keyboard.
  const timeEl = document.getElementById('rest-remaining');
  const fillEl = document.getElementById('rest-fill');
  if (timeEl) timeEl.textContent = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`;
  if (fillEl) fillEl.style.width = `${(remaining / state.restDuration) * 100}%`;

  if (remaining <= 0) {
    clearInterval(restInterval);
    restInterval = null;
    cue('restOver');
    setState({ restEndsAt: null, restDuration: 0 });
  }
}

onAction('rest:start', ({ seconds }) => startRest(+seconds));
onAction('rest:cancel', () => {
  clearInterval(restInterval);
  restInterval = null;
  setState({ restEndsAt: null, restDuration: 0 });
});

// ---- sessions ----

onAction('session:toggle', ({ id }) =>
  setState({ expandedSessionId: state.expandedSessionId === id ? null : id }));

onAction('session:delete', async ({ id }) => {
  if (!confirm(t('delete_confirm'))) return;
  const repo = getRepository(state.user.id);
  await repo.remove(id);
  setState({ sessions: await repo.list(), expandedSessionId: null });
  toast(t('deleted'));
});

onAction('session:repeat', ({ id }) => {
  const source = state.sessions.find((s) => s.id === id);
  if (!source) return;
  update((s) => {
    s.workout = {
      date: new Date().toISOString().slice(0, 10),
      focus: source.focus,
      startedAt: Date.now(),
      templateFrom: source.date,
      exercises: source.exercises.map((ex) => ({
        name: ex.name,
        sets: ex.sets.map((set) => ({ r: String(set.r), w: String(set.w), done: false })),
      })),
    };
    s.tab = 'workout';
  });
  persistDraft();
});

// ---- profile ----

onInput('profile:name', (value) => { pendingName = value; });
let pendingName = '';

onAction('profile:create', async () => {
  const name = pendingName.trim();
  if (!name) { toast(t('enter_name'), 'error'); return; }
  if (state.users.some((u) => u.name.toLowerCase() === name.toLowerCase())) {
    toast(t('name_taken'), 'error');
    return;
  }
  const user = { id: crypto.randomUUID(), name };
  const users = [...state.users, user];
  saveUsers(users);
  setCurrentUserId(user.id);
  setState({ users });
  await activateUser(user);
});

onAction('profile:select', async ({ id }) => {
  const user = state.users.find((u) => u.id === id);
  if (!user) return;
  setCurrentUserId(id);
  await activateUser(user);
});

onAction('profile:switch', () => {
  setCurrentUserId(null);
  update((s) => {
    s.user = null;
    s.sessions = [];
    s.workout = null;
    s.sheet = null;
  });
});

// ---- sheets ----

onAction('sheet:close', () => setState({ sheet: null }));
onAction('settings:open', () => setState({ sheet: { type: 'settings' } }));

onAction('exercise:browse', () => setState({ sheet: { type: 'library' }, libraryQuery: '' }));

onAction('exercise:info', ({ name }) =>
  setState({ sheet: { type: 'exercise-detail', props: { name } } }));

onInput('library:search', (value) => {
  state.libraryQuery = value;
  invalidate();
});

onAction('library:filter', ({ group }) =>
  setState({ libraryGroup: group || null }));

onAction('library:add', ({ name }) => {
  if (!state.workout) {
    // Browsing from the Muscles tab: start a workout around this exercise.
    update((s) => {
      s.workout = newWorkout('Other', [name]);
      s.tab = 'workout';
      s.sheet = null;
    });
  } else {
    state.workout.exercises.push({ name, sets: initialSetsFor(name) });
    setState({ sheet: null });
  }
  persistDraft();
  haptic('select');
});

onAction('library:manual', () => {
  const name = prompt(t('ex_name_ph'));
  if (!name?.trim()) return;
  if (!state.workout) return;
  state.workout.exercises.push({ name: name.trim(), sets: [{ r: '', w: '', done: false }] });
  persistDraft();
  setState({ sheet: null });
});

// ---- templates ----

onAction('template:use', ({ id }) => {
  const tpl = state.templates.find((x) => x.id === id);
  if (!tpl) return;
  update((s) => {
    s.workout = newWorkout(tpl.focus || tpl.name, tpl.exercises);
    s.tab = 'workout';
    s.sheet = null;
  });
  persistDraft();
  haptic('select');
});

onAction('template:blank', () => {
  update((s) => {
    s.workout = newWorkout('Other', []);
    s.tab = 'workout';
    s.sheet = null;
  });
  persistDraft();
});

onAction('template:toggle', ({ id }) =>
  setState({ expandedTemplateId: state.expandedTemplateId === id ? null : id }));

onAction('template:delete', ({ id }) => {
  if (!confirm(t('delete_confirm'))) return;
  const templates = state.templates.filter((x) => x.id !== id);
  saveTemplates(state.user.id, templates);
  setState({ templates, expandedTemplateId: null });
  toast(t('deleted'));
});

onAction('template:remove-ex', ({ id, index }) => {
  const tpl = state.templates.find((x) => x.id === id);
  if (!tpl) return;
  tpl.exercises.splice(+index, 1);
  saveTemplates(state.user.id, state.templates);
  invalidate();
});

onAction('template:add-ex', ({ id }) => {
  const name = prompt(t('ex_name_ph'));
  if (!name?.trim()) return;
  const tpl = state.templates.find((x) => x.id === id);
  if (!tpl) return;
  tpl.exercises.push(name.trim());
  saveTemplates(state.user.id, state.templates);
  invalidate();
});

onAction('template:create', () => {
  const name = prompt(t('tmpl_name_ph'));
  if (!name?.trim()) return;
  if (state.templates.some((x) => x.name.toLowerCase() === name.trim().toLowerCase())) {
    toast(t('tmpl_exists'), 'error');
    return;
  }
  const templates = [...state.templates, createTemplate(name)];
  saveTemplates(state.user.id, templates);
  setState({ templates });
  toast(t('tmpl_created'), 'success');
});

// ---- muscles / stats / plan ----

onAction('muscle:subtab', ({ sub }) => setState({ muscleSubtab: sub }));
onAction('muscle:open', ({ group }) =>
  setState({ muscleSubtab: 'library', libraryGroup: group }));

onAction('stats:exercise', ({ name }) => setState({ statsExercise: name }));
onAction('stats:metric', ({ metric }) => setState({ statsMetric: metric }));

onAction('plan:prev', () => shiftMonth(-1));
onAction('plan:next', () => shiftMonth(1));
onAction('plan:day', ({ date }) =>
  setState({ planSelectedDate: state.planSelectedDate === date ? null : date }));

function shiftMonth(delta) {
  const now = new Date();
  let year = state.planYear ?? now.getFullYear();
  let month = (state.planMonth ?? now.getMonth()) + delta;
  if (month < 0) { month = 11; year -= 1; }
  if (month > 11) { month = 0; year += 1; }
  setState({ planYear: year, planMonth: month, planSelectedDate: null });
}

// ---- settings ----

onAction('settings:lang', ({ lang }) => {
  setLanguage(lang);
  invalidate();
});

onAction('settings:toggle', ({ key }) => {
  const settings = { ...state.settings, [key]: !state.settings[key] };
  saveSettings(state.user.id, settings);
  if (key === 'haptics') setHapticsEnabled(settings.haptics);
  if (key === 'sound') setSoundEnabled(settings.sound);
  setState({ settings });
  if (settings[key]) cue(key === 'sound' ? 'setComplete' : 'setComplete');
});

onAction('settings:units', ({ units }) => {
  const settings = { ...state.settings, units };
  saveSettings(state.user.id, settings);
  setState({ settings });
});

// ---- data export / import ----

onAction('data:export', () => {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    profile: state.user.name,
    sessions: state.sessions,
    templates: state.templates,
    settings: state.settings,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lifttrack-${state.user.name}-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast(t('export_data'), 'success');
});

onAction('data:import', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      const payload = JSON.parse(await file.text());
      if (!Array.isArray(payload.sessions)) throw new Error('no sessions array');

      const repo = getRepository(state.user.id);
      // Merge rather than replace: re-id everything so an import can never
      // silently overwrite a session that happens to share an id.
      await repo.bulkPut(payload.sessions.map((s) => ({ ...s, id: crypto.randomUUID() })));

      if (Array.isArray(payload.templates) && payload.templates.length) {
        const merged = [...state.templates];
        payload.templates.forEach((tpl) => {
          if (!merged.some((x) => x.name.toLowerCase() === tpl.name?.toLowerCase())) {
            merged.push({ ...tpl, id: crypto.randomUUID() });
          }
        });
        saveTemplates(state.user.id, merged);
        setState({ templates: merged });
      }

      setState({ sessions: await repo.list(), sheet: null });
      toast(`${payload.sessions.length} ${t('sessions_lbl')}`, 'success');
    } catch (err) {
      console.error('[import] failed', err);
      toast(t('import_failed'), 'error');
    }
  };
  input.click();
});

// ---------------------------------------------------------------- bootstrap

/**
 * Bring forward data written by the previous version.
 *
 * The old app stored an in-progress session under the key `draft` with a
 * different shape (`{date, focus, exercises:[{name, sets:[{r,w}]}]}` and no
 * `done` flags or `startedAt`). Reading that straight into the new workout
 * state would produce a session with no start time and untickable sets.
 *
 * Sessions themselves need no migration — the IndexedDB store name, key path
 * and record shape are unchanged, and the v1→v2 upgrade in repository.js
 * backfills the new `updatedAt` index.
 */
function migrateDraft(raw) {
  if (!raw || typeof raw !== 'object') return null;
  if (typeof raw.startedAt === 'number') return raw; // already current

  return {
    date: raw.date || new Date().toISOString().slice(0, 10),
    focus: raw.focus || 'Other',
    startedAt: Date.now(),
    templateFrom: raw.templateFrom ?? null,
    exercises: (raw.exercises || []).map((ex) => ({
      name: ex.name || '',
      sets: (ex.sets || []).map((set) => ({
        r: set.r ?? '',
        w: set.w ?? '',
        // Anything already written down was, by definition, performed.
        done: Number(set.r) > 0,
      })),
    })),
  };
}

async function activateUser(user) {
  setState({ loading: true });

  const settings = loadSettings(user.id);
  setHapticsEnabled(settings.haptics);
  setSoundEnabled(settings.sound);

  const repo = getRepository(user.id);
  let sessions = [];
  try {
    sessions = await repo.list();
  } catch (err) {
    console.error('[bootstrap] failed to load sessions', err);
    toast(t('failed_load'), 'error');
  }

  update((s) => {
    s.user = user;
    s.settings = settings;
    s.sessions = sessions;
    s.templates = loadTemplates(user.id);
    s.workout = migrateDraft(loadDraft(user.id));
    s.loading = false;
    s.tab = 'log';
  });
}

function openTemplatePicker() {
  // Placeholder until the picker sheet lands; start from the suggestion.
  toast(t('choose_template'));
}

async function boot() {
  // Hand over from the previous hand-written service worker before anything
  // else, so an already-installed home-screen app can't boot from its cache.
  cleanUpLegacyServiceWorker();
  reloadOnWorkerActivation();

  initLanguage();
  installDelegation();
  primeAudio();

  const users = loadUsers();
  setState({ users, ready: true });

  const savedId = loadCurrentUserId();
  const saved = users.find((u) => u.id === savedId);
  if (saved) await activateUser(saved);
  else invalidate();

  // Keep the workout elapsed clock honest without re-rendering.
  setInterval(() => {
    if (state.tab !== 'workout' || !state.workout) return;
    const el = document.getElementById('workout-elapsed');
    if (!el) return;
    const secs = Math.floor((Date.now() - state.workout.startedAt) / 1000);
    const m = Math.floor(secs / 60);
    el.textContent = `${m}:${String(secs % 60).padStart(2, '0')}`;
  }, 1000);
}

boot();
