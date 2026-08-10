/**
 * Bottom sheets: template picker, exercise library, exercise detail, settings.
 *
 * All four share the `.sheet` chrome and are rendered from one place so the
 * backdrop, grip, dismiss behaviour and safe-area padding stay identical.
 */

import { state } from '../../state/store.js';
import { icon } from '../icons.js';
import { esc } from '../actions.js';
import { t, getLanguage, SUPPORTED_LANGUAGES } from '../../i18n/index.js';
import { FR_INSTRUCTIONS } from '../../i18n/fr-instructions.js';
import { focusColor } from '../../domain/focus.js';
import {
  MUSCLE_GROUPS, findExercise, alternativesFor, buildSessionPlan, EQUIPMENT,
} from '../../domain/muscles.js';
import { EXERCISES } from '../../data/exercise-db.js';
import { viewportReport } from '../viewport.js';
import { equipmentLabel } from './muscles.js';

function shell(title, body, { action = '', modifier = '' } = {}) {
  return `
    <div class="sheet-backdrop" data-action="sheet:close"></div>
    <section class="sheet ${modifier}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <div class="sheet-grip"></div>
      <header class="sheet-head">
        <h2 class="sheet-title">${esc(title)}</h2>
        ${action}
        <button class="icon-btn" data-action="sheet:close" aria-label="${t('close')}">
          ${icon('close', { size: 20 })}
        </button>
      </header>
      <div class="sheet-body">${body}</div>
    </section>`;
}

// ---------------------------------------------------------- template picker

function templatePicker() {
  const templates = state.templates || [];

  return shell(
    t('choose_template'),
    `
    ${templates
      .map((tpl) => {
        const color = tpl.color || focusColor(tpl.focus || tpl.name);
        return `
        <button class="card card--interactive" data-action="template:use" data-id="${tpl.id}"
                style="display:flex;align-items:center;gap:var(--space-3);width:100%;
                       text-align:left;margin-bottom:var(--space-2);border-left:3px solid ${color}">
          <span style="flex:1;min-width:0">
            <span style="display:block;font-family:var(--font-display);font-size:var(--text-lg);
                         letter-spacing:var(--tracking-wide);text-transform:uppercase;color:${color}">
              ${esc(tpl.name)}
            </span>
            <span class="metric-label" style="display:block;margin-top:2px">
              ${tpl.exercises.length} ${t('ex_lbl')} · ${esc(tpl.exercises.slice(0, 3).join(', '))}${tpl.exercises.length > 3 ? '…' : ''}
            </span>
          </span>
          <span style="color:var(--text-faint)">${icon('chevronRight', { size: 18 })}</span>
        </button>`;
      })
      .join('')}

    <button class="btn btn--secondary btn--block" data-action="template:blank"
            style="margin-top:var(--space-3)">
      ${icon('plus', { size: 18 })} ${t('blank_workout')}
    </button>`,
  );
}

// ---------------------------------------------------------- session builder

/**
 * A generated session, with the equipment filter that produced it.
 *
 * The preferences live in settings rather than in the sheet, because the
 * answer to "what can I train on" is a property of your gym, not of this
 * one visit. The plan itself is recomputed on every render so toggling a
 * chip re-plans immediately.
 */
function planBuilder() {
  const chosen = state.settings.equipment || [];
  const size = state.planSize || 5;
  const plan = buildSessionPlan(state.sessions, { equipment: chosen, size });

  const chip = (value, label, active) => `
    <button class="chip" data-action="plan:equipment" data-value="${value}"
            aria-pressed="${active}"
            style="--chip-color:${active ? 'var(--gold)' : 'var(--text-tertiary)'};flex:none">
      ${esc(label)}
    </button>`;

  return shell(
    t('build_session'),
    `
    <p style="font-size:var(--text-xs);color:var(--text-faint);margin:0 0 var(--space-3)">
      ${t('build_session_hint')}
    </p>

    <div class="metric-label">${t('equipment')}</div>
    <div class="chip-rail" style="margin-bottom:var(--space-4)">
      ${chip('', t('all'), !chosen.length)}
      ${EQUIPMENT.map((eq) => chip(eq, equipmentLabel(eq), chosen.includes(eq))).join('')}
    </div>

    <div class="metric-label">${t('exercises_lbl')}</div>
    <div class="chip-rail" style="margin-bottom:var(--space-4)">
      ${[3, 4, 5, 6, 7]
        .map(
          (n) => `
        <button class="chip" data-action="plan:size" data-size="${n}"
                aria-pressed="${n === size}"
                style="--chip-color:${n === size ? 'var(--gold)' : 'var(--text-tertiary)'};flex:none">
          ${n}
        </button>`,
        )
        .join('')}
    </div>

    ${plan.length
      ? plan
          .map(
            (item, i) => `
        <div class="row gap-2" style="padding:var(--space-3) 0;border-bottom:1px solid var(--line-subtle)">
          <span class="metric-label" style="min-width:18px">${i + 1}</span>
          <span style="flex:1;min-width:0">
            <span style="display:block;font-size:var(--text-sm);font-weight:600;
                         overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
              ${esc(item.name)}
            </span>
            <span class="metric-label" style="display:block;margin-top:2px">
              ${esc(item.targets.slice(0, 3).join(' · ') || equipmentLabel(item.equipment))}
            </span>
          </span>
          <span class="metric-label" style="flex:none">${esc(equipmentLabel(item.equipment))}</span>
        </div>`,
          )
          .join('')
      : `<p class="empty-body" style="margin:var(--space-6) auto">${t('plan_nothing_due')}</p>`}

    ${plan.length
      ? `<div class="row gap-2" style="margin-top:var(--space-5);flex-wrap:wrap">
           <button class="btn btn--sm btn--primary" style="flex:1" data-action="plan:start">
             ${icon('bolt', { size: 15 })} ${t('start_workout')}
           </button>
           <button class="btn btn--sm btn--secondary" data-action="plan:save">
             ${icon('plan', { size: 15 })} ${t('save_template')}
           </button>
         </div>`
      : ''}`,
    { modifier: 'sheet--tall' },
  );
}

// ---------------------------------------------------------- exercise library

/**
 * The filtered exercise list, on its own so it can be re-rendered without
 * the search field above it.
 *
 * Typing used to schedule a full app render, which replaced the whole of
 * `#app` — including the input being typed into. The browser dropped focus
 * with it, so you got exactly one character before the keyboard closed.
 * Now `library:search` patches `#library-results` and leaves the input
 * element itself untouched.
 */
export function libraryResults() {
  const query = (state.libraryQuery || '').toLowerCase().trim();
  const groupFilter = state.libraryGroup || null;

  let results = EXERCISES;
  if (groupFilter) {
    const group = MUSCLE_GROUPS.find((g) => g.id === groupFilter);
    const names = new Set(group.muscles.map((m) => m.toLowerCase()));
    results = results.filter((ex) => (ex.muscles || []).some((m) => names.has(m.name.toLowerCase())));
  }
  if (query) {
    results = results.filter(
      (ex) =>
        ex.name.toLowerCase().includes(query) ||
        (ex.aliases || []).some((a) => a.toLowerCase().includes(query)),
    );
  }

  if (!results.length) {
    return `<p class="empty-body" style="margin:var(--space-8) auto">${t('no_results')}</p>`;
  }

  return results
    .slice(0, 60)
    .map((ex) => {
      const primary = (ex.muscles || []).filter((m) => m.role === 'primary').map((m) => m.name);
      return `
      <button class="card card--interactive" data-action="library:add" data-name="${esc(ex.name)}"
              style="display:flex;align-items:center;gap:var(--space-3);width:100%;
                     text-align:left;margin-bottom:var(--space-2)">
        <span style="flex:1;min-width:0">
          <span style="display:block;font-size:var(--text-base);font-weight:700;
                       overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
            ${esc(ex.name)}
          </span>
          <span class="metric-label" style="display:block;margin-top:2px">
            ${esc(primary.join(' · ') || ex.category)}
          </span>
        </span>
        <span style="color:var(--gold)">${icon('plus', { size: 18 })}</span>
      </button>`;
    })
    .join('');
}

function exerciseLibrary() {
  const groupFilter = state.libraryGroup || null;

  return shell(
    t('library'),
    `
    <input class="text-input" placeholder="${t('search_exercises')}"
           value="${esc(state.libraryQuery || '')}"
           data-input="library:search" autofocus
           style="margin-bottom:var(--space-3)">

    <div class="chip-rail">
      <button class="chip" data-action="library:filter" data-group=""
              style="--chip-color:${!groupFilter ? 'var(--gold)' : 'var(--text-tertiary)'};flex:none">
        ${t('all')}
      </button>
      ${MUSCLE_GROUPS.map(
        (g) => `
        <button class="chip" data-action="library:filter" data-group="${g.id}"
                style="--chip-color:${groupFilter === g.id ? g.color : 'var(--text-tertiary)'};flex:none">
          ${esc(g.label)}
        </button>`,
      ).join('')}
    </div>

    <div id="library-results">${libraryResults()}</div>

    <button class="btn btn--ghost btn--block" data-action="library:manual" style="margin-top:var(--space-3)">
      ${t('manual_ex')}
    </button>`,
    /**
     * Fixed height, not content height.
     *
     * The sheet is anchored to the bottom of the screen, so a shorter
     * sheet has a lower top edge. Filtering the list down to two results
     * therefore dragged the search field down the screen and under the
     * keyboard — the field moved away as you typed into it. At a fixed
     * height the field stays where it started and the list scrolls
     * beneath it.
     */
    { modifier: 'sheet--tall' },
  );
}

// ---------------------------------------------------------- exercise detail

/**
 * Substitutes, with a one-tap swap when this exercise is in the session
 * you are currently doing.
 *
 * Swapping preserves what you actually lifted. If sets are already ticked
 * they stay attached to the original exercise and the alternative is
 * inserted after it — rewriting the name would file three sets of leg
 * press under "Hack Squat", which is a lie in your own log.
 */
function alternativesSection(ex) {
  const options = alternativesFor(ex.name, 5);
  if (!options.length) return '';

  const exIndex = state.sheet.props?.ex;
  const inWorkout = !!state.workout && exIndex != null;

  return `
    <h3 class="section-label" style="margin-top:var(--space-5)">${t('alternatives')}</h3>
    <p style="font-size:var(--text-xs);color:var(--text-faint);margin:0 0 var(--space-3)">
      ${t('alternatives_hint')}
    </p>

    ${options
      .map(
        (alt) => `
      <div class="row gap-2" style="padding:var(--space-2) 0;border-bottom:1px solid var(--line-subtle)">
        <span style="flex:1;min-width:0">
          <span style="display:block;font-size:var(--text-sm);font-weight:600;
                       overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
            ${esc(alt.name)}
          </span>
          <span class="metric-label" style="display:block;margin-top:2px">
            ${esc(alt.equipment ? equipmentLabel(alt.equipment) : '')}${alt.sameFamily ? ` · ${t('same_movement')}` : ''}
          </span>
        </span>
        ${inWorkout
          ? `<button class="btn btn--sm btn--secondary" data-action="exercise:swap"
                     data-ex="${exIndex}" data-name="${esc(alt.name)}">
               ${icon('swap', { size: 14 })} ${t('swap')}
             </button>`
          : `<button class="icon-btn" data-action="exercise:info" data-name="${esc(alt.name)}"
                     aria-label="${t('exercise_info')}">
               ${icon('chevronRight', { size: 18 })}
             </button>`}
      </div>`,
      )
      .join('')}`;
}

function exerciseDetail() {
  const name = state.sheet.props?.name;
  const ex = findExercise(name);

  if (!ex) {
    return shell(name || t('exercise_info'), `<p class="empty-body">${t('no_details')}</p>`);
  }

  const primary = (ex.muscles || []).filter((m) => m.role === 'primary');
  const secondary = (ex.muscles || []).filter((m) => m.role === 'secondary');

  // Prefer translated instructions where they exist. Coverage is partial
  // (118 of 216 exercises), so fall back to English rather than showing
  // an exercise with no instructions at all.
  const instructions =
    (getLanguage() === 'fr' && FR_INSTRUCTIONS[ex.id]) || ex.instructions || [];

  const muscleList = (list) =>
    list
      .map(
        (m) => `
        <div class="row gap-2" style="padding:var(--space-2) 0">
          <span style="flex:1;font-size:var(--text-sm)">${esc(m.name)}</span>
          <span style="display:flex;gap:2px">
            ${Array.from({ length: 5 }, (_, i) =>
              `<span style="width:6px;height:6px;border-radius:50%;
                            background:${i < m.score ? 'var(--gold)' : 'var(--line-default)'}"></span>`,
            ).join('')}
          </span>
        </div>`,
      )
      .join('');

  return shell(
    ex.name,
    `
    <div class="row gap-2" style="flex-wrap:wrap;margin-bottom:var(--space-4)">
      ${[ex.level, ex.mechanic, ex.force, ex.equipment]
        .filter(Boolean)
        .map((tag) => `<span class="chip" style="--chip-color:var(--text-tertiary)">${esc(tag)}</span>`)
        .join('')}
    </div>

    ${primary.length ? `<h3 class="section-label">${t('primary')}</h3>${muscleList(primary)}` : ''}
    ${secondary.length
      ? `<h3 class="section-label" style="margin-top:var(--space-4)">${t('secondary')}</h3>${muscleList(secondary)}`
      : ''}

    ${alternativesSection(ex)}

    ${instructions.length
      ? `<h3 class="section-label" style="margin-top:var(--space-5)">${t('instructions')}</h3>
         <ol style="margin:0;padding-left:var(--space-5);color:var(--text-secondary);
                    font-size:var(--text-sm);line-height:1.65">
           ${instructions.map((step) => `<li style="margin-bottom:var(--space-2)">${esc(step)}</li>`).join('')}
         </ol>`
      : ''}`,
  );
}

// ---------------------------------------------------------- settings

function toggleRow(label, key, on) {
  return `
    <div class="row gap-3" style="padding:var(--space-3) 0;border-bottom:1px solid var(--line-subtle)">
      <span style="flex:1;font-size:var(--text-base);font-weight:600">${label}</span>
      <button data-action="settings:toggle" data-key="${key}"
              role="switch" aria-checked="${on}" aria-label="${label}"
              style="width:50px;height:30px;border-radius:var(--radius-pill);flex:none;
                     background:${on ? 'var(--gold)' : 'var(--surface-elevated)'};
                     border:1px solid ${on ? 'transparent' : 'var(--line-default)'};
                     position:relative;transition:background var(--duration-fast) var(--ease-out)">
        <span style="position:absolute;top:3px;left:${on ? '23px' : '3px'};
                     width:22px;height:22px;border-radius:50%;
                     background:${on ? 'var(--gold-ink)' : 'var(--text-tertiary)'};
                     transition:left var(--duration-fast) var(--ease-spring)"></span>
      </button>
    </div>`;
}

function settingsSheet() {
  const { settings, user } = state;
  const lang = getLanguage();

  return shell(
    t('settings'),
    `
    <h3 class="section-label">${t('profile')}</h3>
    <div class="row gap-3" style="padding:var(--space-3) 0;border-bottom:1px solid var(--line-subtle)">
      <span style="color:var(--gold)">${icon('user', { size: 20 })}</span>
      <span style="flex:1;font-size:var(--text-base);font-weight:700">${esc(user?.name || '')}</span>
      <button class="btn btn--sm btn--secondary" data-action="profile:switch">${t('switch_user')}</button>
    </div>

    <h3 class="section-label" style="margin-top:var(--space-5)">${t('language')}</h3>
    <div class="segmented" style="width:100%;display:flex">
      ${SUPPORTED_LANGUAGES.map(
        (code) => `
        <button class="segmented-option ${lang === code ? 'is-active' : ''}"
                data-action="settings:lang" data-lang="${code}" style="flex:1">
          ${code.toUpperCase()}
        </button>`,
      ).join('')}
    </div>

    <h3 class="section-label" style="margin-top:var(--space-5)">${t('feedback')}</h3>
    ${toggleRow(t('haptics'), 'haptics', settings.haptics)}
    ${toggleRow(t('sound'), 'sound', settings.sound)}

    <h3 class="section-label" style="margin-top:var(--space-5)">${t('units')}</h3>
    <div class="segmented" style="width:100%;display:flex">
      ${['kg', 'lb'].map(
        (unit) => `
        <button class="segmented-option ${settings.units === unit ? 'is-active' : ''}"
                data-action="settings:units" data-units="${unit}" style="flex:1">
          ${unit.toUpperCase()}
        </button>`,
      ).join('')}
    </div>

    <h3 class="section-label" style="margin-top:var(--space-5)">${t('data')}</h3>
    <div class="row gap-2">
      <button class="btn btn--secondary" data-action="data:export" style="flex:1">
        ${icon('download', { size: 17 })} ${t('export_data')}
      </button>
      <button class="btn btn--secondary" data-action="data:import" style="flex:1">
        ${icon('upload', { size: 17 })} ${t('import_data')}
      </button>
    </div>
    <p style="margin-top:var(--space-3);font-size:var(--text-xs);color:var(--text-faint);line-height:1.6">
      ${t('data_local_notice')}
    </p>

    ${renderLayoutDiagnostic()}`,
  );
}

/**
 * Layout diagnostic.
 *
 * On-device layout bugs caused by safe-area insets and iOS viewport units
 * cannot be reproduced in a desktop browser — every unit is correct there
 * and every inset reports zero. Rather than guess from screenshots, this
 * prints the numbers the layout actually depends on so they can be read
 * off the device directly.
 */
function renderLayoutDiagnostic() {
  const r = viewportReport();
  const rows = [
    ['window.innerHeight', `${r.innerHeight}px`],
    ['visualViewport', r.visualViewport === null ? 'unsupported' : `${r.visualViewport}px`],
    // The containing block is what `position: fixed; inset: 0` resolves
    // against — the real paintable area. Where it disagrees with innerHeight
    // is exactly where the black band comes from, so it has to be visible.
    ['containing block', `${r.icbHeight}px`],
    ['documentElement', `${r.clientHeight}px`],
    ['--app-height', r.appHeightVar],
    // How much the root overhangs the viewport to colour the dead band.
    // Expected to be 0 in a browser tab and non-zero only on a short
    // standalone view.
    ['--bottom-gap', r.bottomGapVar],
    ['#app height', `${r.appHeight}px`],
    ['dock bottom edge', `${r.dockBottom}px`],
    ['screen height', `${r.screenHeight}px`],
    ['avail height', r.availHeight === null ? 'unknown' : `${r.availHeight}px`],
    // Decides whether the dead band is above or below the view.
    ['view top on screen', r.screenY === null ? 'unknown' : `${r.screenY}px`],
    ['safe top / bottom', `${r.insets.top} / ${r.insets.bottom}`],
    ['standalone', r.standalone ? 'yes' : 'no (browser)'],
  ];

  return `
    <details style="margin-top:var(--space-6);border-top:1px solid var(--line-subtle);
                    padding-top:var(--space-4)">
      <summary style="font-size:var(--text-2xs);font-weight:700;
                      letter-spacing:var(--tracking-widest);text-transform:uppercase;
                      color:var(--text-faint);cursor:pointer;list-style:none">
        ${t('layout_diagnostic')}
      </summary>
      <div style="margin-top:var(--space-3);font-family:var(--font-mono);
                  font-size:var(--text-xs);color:var(--text-tertiary)">
        ${rows
          .map(
            ([k, v]) => `
            <div style="display:flex;gap:var(--space-3);padding:3px 0">
              <span style="flex:1;min-width:0">${k}</span>
              <span style="color:var(--text-secondary)">${esc(v)}</span>
            </div>`,
          )
          .join('')}
      </div>
    </details>`;
}

// ---------------------------------------------------------- session edit

/**
 * Edit a logged session.
 *
 * Reads from `state.sessionEdit`, a working copy — nothing here touches the
 * stored session until Save. The numeric fields deliberately do not
 * re-render on input (see the handlers in main.js), so typing never
 * disturbs focus; only structural edits redraw.
 */
function sessionEditSheet() {
  const draft = state.sessionEdit;
  if (!draft) return '';

  const fieldLabel = (text) => `
    <div class="metric-label" style="margin:var(--space-3) 0 var(--space-2)">${text}</div>`;

  const exercises = draft.exercises
    .map(
      (ex, exIndex) => `
      <div style="margin-top:var(--space-4)">
        <div class="row gap-2" style="align-items:center">
          <span style="flex:1;min-width:0;font-size:var(--text-sm);font-weight:700;
                       overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
            ${esc(ex.name)}
          </span>
          <button class="icon-btn icon-btn--danger" data-action="session-edit:remove-exercise"
                  data-ex="${exIndex}" aria-label="${t('remove_exercise')}">
            ${icon('trash', { size: 17 })}
          </button>
        </div>

        ${ex.sets
          .map(
            (set, setIndex) => `
          <div class="set-row">
            <div class="set-index">${setIndex + 1}</div>
            <div class="set-field">
              <input class="set-input" type="text" inputmode="numeric" pattern="[0-9]*"
                     value="${esc(set.r ?? '')}" placeholder="—"
                     aria-label="${t('reps')} ${setIndex + 1}"
                     data-input="session-edit:reps" data-ex="${exIndex}" data-set="${setIndex}">
              <span class="set-unit">${t('reps_short')}</span>
            </div>
            <div class="set-field">
              <input class="set-input" type="text" inputmode="decimal"
                     value="${esc(set.w ?? '')}" placeholder="—"
                     aria-label="${t('weight')} ${setIndex + 1}"
                     data-input="session-edit:weight" data-ex="${exIndex}" data-set="${setIndex}">
              <span class="set-unit">${state.settings.units}</span>
            </div>
            <span></span>
            <button class="set-remove" data-action="session-edit:remove-set"
                    data-ex="${exIndex}" data-set="${setIndex}"
                    aria-label="${t('remove_set')} ${setIndex + 1}">
              ${icon('close', { size: 16 })}
            </button>
          </div>`,
          )
          .join('')}
      </div>`,
    )
    .join('');

  return shell(
    t('edit_session'),
    `
    ${fieldLabel(t('date'))}
    <input class="text-input" type="date" value="${esc(draft.date)}"
           data-input="session-edit:date" aria-label="${t('date')}">

    ${fieldLabel(t('session_focus'))}
    <input class="text-input" value="${esc(draft.focus)}"
           data-input="session-edit:focus" aria-label="${t('session_focus')}">

    ${exercises || `<p class="empty-body" style="margin:var(--space-6) auto">${t('no_exercises_yet')}</p>`}

    <div class="row gap-2" style="margin-top:var(--space-6)">
      <button class="btn btn--secondary" style="flex:none" data-action="sheet:close">
        ${t('cancel')}
      </button>
      <!-- Save takes the remaining width: "Save changes" wrapped to two
           lines when the two buttons split it evenly. -->
      <button class="btn btn--primary" style="flex:1;white-space:nowrap"
              data-action="session-edit:save">
        ${t('save_changes')}
      </button>
    </div>`,
    { modifier: 'sheet--tall' },
  );
}

// ---------------------------------------------------------- dispatcher

export function renderSheet() {
  if (!state.sheet) return '';
  switch (state.sheet.type) {
    case 'session-edit': return sessionEditSheet();
    case 'plan-builder': return planBuilder();
    case 'template-picker': return templatePicker();
    case 'library': return exerciseLibrary();
    case 'exercise-detail': return exerciseDetail();
    case 'settings': return settingsSheet();
    default: return '';
  }
}
