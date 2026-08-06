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
import { MUSCLE_GROUPS, findExercise } from '../../domain/muscles.js';
import { EXERCISES } from '../../data/exercise-db.js';

function shell(title, body, { action = '' } = {}) {
  return `
    <div class="sheet-backdrop" data-action="sheet:close"></div>
    <section class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}">
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
        const color = focusColor(tpl.focus || tpl.name);
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

// ---------------------------------------------------------- exercise library

function exerciseLibrary() {
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

    ${results.length
      ? results
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
          .join('')
      : `<p class="empty-body" style="margin:var(--space-8) auto">${t('no_results')}</p>`}

    <button class="btn btn--ghost btn--block" data-action="library:manual" style="margin-top:var(--space-3)">
      ${t('manual_ex')}
    </button>`,
  );
}

// ---------------------------------------------------------- exercise detail

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
    </p>`,
  );
}

// ---------------------------------------------------------- dispatcher

export function renderSheet() {
  if (!state.sheet) return '';
  switch (state.sheet.type) {
    case 'template-picker': return templatePicker();
    case 'library': return exerciseLibrary();
    case 'exercise-detail': return exerciseDetail();
    case 'settings': return settingsSheet();
    default: return '';
  }
}
