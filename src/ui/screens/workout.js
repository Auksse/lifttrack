/**
 * Active workout — the set-entry screen.
 *
 * This is the screen you actually stand in a gym holding, so it is built
 * around three rules:
 *
 *   1. A set can be marked done. Ticking a set is the primary action of the
 *      whole app and the previous version had no way to do it.
 *   2. Nothing floats over the sets. The old rest timer was an absolutely
 *      positioned pill that sat on top of sets 2 and 3.
 *   3. Numbers are big, monospaced and centred, and every numeric field
 *      opens the numeric keypad rather than the QWERTY keyboard.
 */

import { state } from '../../state/store.js';
import { icon } from '../icons.js';
import { esc } from '../actions.js';
import { suggestNext } from '../../domain/progression.js';
import { t, formatDate } from '../../i18n/index.js';
import { focusColor } from '../../domain/focus.js';

/** Sets that count as "done" for progress purposes. */
const isDone = (set) => !!set.done;
const isFilled = (set) => Number(set.r) > 0 && set.w !== '' && set.w != null;

/**
 * Seconds as m:ss.
 * Integer-divide the minutes — `s / 60` rendered 90 seconds as "1.5:30".
 */
function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  return `${m}:${String(seconds % 60).padStart(2, '0')}`;
}

function elapsed(startedAt) {
  const secs = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
  const m = Math.floor(secs / 60);
  const h = Math.floor(m / 60);
  return h > 0
    ? `${h}:${String(m % 60).padStart(2, '0')}`
    : `${m}:${String(secs % 60).padStart(2, '0')}`;
}

/** Circular set-completion indicator for an exercise. */
function progressRing(done, total) {
  const r = 12;
  const circumference = 2 * Math.PI * r;
  const pct = total ? done / total : 0;
  const offset = circumference * (1 - pct);
  return `
    <div class="exercise-progress">
      <svg width="30" height="30" viewBox="0 0 30 30">
        <circle class="exercise-progress-track" cx="15" cy="15" r="${r}" fill="none" stroke-width="2.5"/>
        <circle class="exercise-progress-fill" cx="15" cy="15" r="${r}" fill="none" stroke-width="2.5"
                stroke-linecap="round"
                stroke-dasharray="${circumference.toFixed(2)}"
                stroke-dashoffset="${offset.toFixed(2)}"/>
      </svg>
      <div class="exercise-progress-text">${done}/${total}</div>
    </div>`;
}

function renderSetRow(exIndex, setIndex, set) {
  const done = isDone(set);
  return `
    <div class="set-row ${done ? 'is-done' : ''}">
      <div class="set-index">${setIndex + 1}</div>

      <div class="set-field">
        <input class="set-input"
               type="text"
               inputmode="numeric"
               pattern="[0-9]*"
               value="${esc(set.r ?? '')}"
               placeholder="—"
               aria-label="${t('reps')} ${setIndex + 1}"
               data-input="set:reps" data-ex="${exIndex}" data-set="${setIndex}">
        <span class="set-unit">${t('reps_short')}</span>
      </div>

      <div class="set-field">
        <input class="set-input"
               type="text"
               inputmode="decimal"
               value="${esc(set.w ?? '')}"
               placeholder="—"
               aria-label="${t('weight')} ${setIndex + 1}"
               data-input="set:weight" data-ex="${exIndex}" data-set="${setIndex}">
        <span class="set-unit">${state.settings.units}</span>
      </div>

      <button class="set-check ${done ? 'is-done' : ''}"
              data-action="set:toggle" data-ex="${exIndex}" data-set="${setIndex}"
              aria-pressed="${done}"
              aria-label="${done ? t('set_done') : t('mark_set_done')}">
        ${icon('check', { size: 20, stroke: 2.4 })}
      </button>

      <button class="set-remove"
              data-action="set:remove" data-ex="${exIndex}" data-set="${setIndex}"
              aria-label="${t('remove_set')} ${setIndex + 1}">
        ${icon('close', { size: 16 })}
      </button>
    </div>`;
}

/**
 * Reference strip above an exercise's sets.
 *
 * Sets are already pre-filled with the progression target, so repeating
 * that target here would be noise. What you actually want between sets is
 * what you managed *last* time — so that leads, and the target follows as
 * the smaller line.
 */
function renderSuggestion(exerciseName, exIndex) {
  const previous = [...state.sessions]
    .reverse()
    .find((s) => s.exercises.some((e) => e.name === exerciseName));
  if (!previous) return '';

  const lastSets = previous.exercises.find((e) => e.name === exerciseName)?.sets || [];
  if (!lastSets.length) return '';

  const suggestion = suggestNext(exerciseName, lastSets);
  const unit = state.settings.units;
  const lastSummary = lastSets.map((s) => `${s.r}×${s.w}`).join('  ');

  return `
    <div class="suggestion">
      <span class="suggestion-icon">
        ${icon(suggestion?.type === 'increase' ? 'arrowUp' : 'timer', { size: 20 })}
      </span>
      <div class="suggestion-text">
        <div class="suggestion-label">${t('last_time')} · ${formatDate(previous.date)}</div>
        <div class="suggestion-value">${esc(lastSummary)}</div>
      </div>
      ${suggestion
        ? `<button class="btn btn--sm btn--secondary"
                   data-action="suggestion:apply" data-ex="${exIndex}"
                   data-sets="${suggestion.sets}" data-reps="${suggestion.reps}" data-weight="${suggestion.weight}"
                   title="${suggestion.sets}×${suggestion.reps} @ ${suggestion.weight}${unit}">
             ${suggestion.sets}×${suggestion.reps}
           </button>`
        : ''}
    </div>`;
}

function renderExercise(exercise, exIndex) {
  const total = exercise.sets.length;
  const done = exercise.sets.filter(isDone).length;
  const complete = total > 0 && done === total;
  const collapsed = !!exercise.collapsed;

  /**
   * The ring and the name are the toggle, rather than a separate chevron
   * button: it is the biggest target in the header and the one a thumb
   * naturally lands on. The info and remove buttons still win their own
   * taps, because delegation resolves to the nearest `[data-action]`.
   */
  return `
    <article class="exercise-card ${complete ? 'is-complete' : ''} ${collapsed ? 'is-collapsed' : ''}"
             data-card-ex="${exIndex}">
      <header class="exercise-head">
        <span class="exercise-grip" data-drag-handle data-ex="${exIndex}"
              role="button" tabindex="0" aria-label="${t('reorder_exercise')}">
          ${icon('drag', { size: 18 })}
        </span>
        <button class="exercise-toggle" data-action="exercise:toggle" data-ex="${exIndex}"
                aria-expanded="${!collapsed}"
                aria-label="${collapsed ? t('expand_exercise') : t('collapse_exercise')}">
          ${progressRing(done, total)}
          <h3 class="exercise-name">${esc(exercise.name || t('unnamed_exercise'))}</h3>
          <span class="exercise-caret">${icon(collapsed ? 'chevronRight' : 'chevronUp', { size: 18 })}</span>
        </button>
        <button class="icon-btn" data-action="exercise:info" data-name="${esc(exercise.name)}"
                data-ex="${exIndex}" aria-label="${t('exercise_info')}">
          ${icon('info', { size: 20 })}
        </button>
        <button class="icon-btn icon-btn--danger" data-action="exercise:remove" data-ex="${exIndex}"
                aria-label="${t('remove_exercise')}">
          ${icon('close', { size: 20 })}
        </button>
      </header>

      ${collapsed
        ? ''
        : `<div class="exercise-body">
             ${renderSuggestion(exercise.name, exIndex)}
             ${exercise.sets.map((set, i) => renderSetRow(exIndex, i, set)).join('')}
             <button class="btn btn--sm btn--ghost btn--block" data-action="set:add" data-ex="${exIndex}"
                     style="margin-top:var(--space-2)">
               ${icon('plus', { size: 16 })} ${t('add_set')}
             </button>
           </div>`}
    </article>`;
}

/** Docked rest timer. Participates in layout — never overlaps content. */
export function renderRestBar() {
  const { restEndsAt, restDuration } = state;

  if (!restEndsAt) {
    return `
      <div class="rest-bar">
        <span class="suggestion-icon">${icon('timer', { size: 20 })}</span>
        <span class="metric-label" style="flex:1">${t('rest_timer')}</span>
        <div class="rest-presets">
          ${[60, 90, 120, 180]
            .map(
              (s) => `<button class="rest-preset" data-action="rest:start" data-seconds="${s}">
                        ${formatDuration(s)}
                      </button>`,
            )
            .join('')}
        </div>
      </div>`;
  }

  const remaining = Math.max(0, Math.ceil((restEndsAt - Date.now()) / 1000));
  const pct = restDuration ? (remaining / restDuration) * 100 : 0;
  return `
    <div class="rest-bar">
      <span class="rest-time" id="rest-remaining">
        ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}
      </span>
      <div class="rest-track">
        <div class="rest-fill" id="rest-fill" style="width:${pct}%"></div>
      </div>
      <button class="btn btn--sm btn--ghost" data-action="rest:cancel">${t('skip')}</button>
    </div>`;
}

export function renderWorkoutScreen() {
  const w = state.workout;
  const color = focusColor(w.focus, state.templates);

  const totalSets = w.exercises.reduce((n, e) => n + e.sets.length, 0);
  const doneSets = w.exercises.reduce((n, e) => n + e.sets.filter(isDone).length, 0);

  // Only completed sets count toward volume. Sets are pre-filled with the
  // progression target, so counting merely-filled rows would show a full
  // session's tonnage before you had lifted anything.
  const volume = w.exercises.reduce(
    (total, e) =>
      total +
      e.sets
        .filter((set) => isDone(set) && isFilled(set))
        .reduce((s, set) => s + Number(set.r) * Math.max(Number(set.w), 0), 0),
    0,
  );

  return {
    header: `
      <button class="icon-btn" data-action="workout:leave" aria-label="${t('close')}">
        ${icon('chevronDown', { size: 22 })}
      </button>
      <div style="flex:1;min-width:0">
        <h1 class="screen-title" style="font-size:var(--text-xl)">
          <span style="color:${color}">${esc(w.focus)}</span>
        </h1>
        <div class="metric-label" style="margin-top:2px">
          <span id="workout-elapsed">${elapsed(w.startedAt)}</span> ·
          ${doneSets}/${totalSets} ${t('sets')} · ${Math.round(volume)}${state.settings.units}
        </div>
      </div>
      <button class="btn btn--sm btn--primary" data-action="workout:save">${t('finish')}</button>
    `,

    body: `
      ${w.exercises.length
        ? w.exercises.map(renderExercise).join('')
        : `<div class="empty">
             <div class="empty-icon">${icon('muscles', { size: 30 })}</div>
             <h2 class="empty-title">${t('no_exercises_yet')}</h2>
             <p class="empty-body">${t('no_exercises_body')}</p>
           </div>`}

      <button class="btn btn--secondary btn--block" data-action="exercise:browse"
              style="margin-top:var(--space-4)">
        ${icon('plus', { size: 18 })} ${t('add_exercise')}
      </button>
    `,

    footer: renderRestBar(),
  };
}
