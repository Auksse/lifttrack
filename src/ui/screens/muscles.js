/**
 * Muscles screen — recovery, weekly volume, and the exercise library.
 *
 * The recovery view is the headline: it turns the log into a live picture of
 * what is fresh and what is still cooked, which is the question you actually
 * have standing in the gym doorway.
 */

import { state } from '../../state/store.js';
import { icon } from '../icons.js';
import { esc } from '../actions.js';
import { t } from '../../i18n/index.js';
import {
  MUSCLE_GROUPS, recommendTraining, volumeByGroup, volumeStatus,
  volumeTarget, describeRecovery, findExercise,
} from '../../domain/muscles.js';
import { EXERCISES } from '../../data/exercise-db.js';

const SUBTABS = ['recovery', 'volume', 'library'];

/**
 * Readiness colour ramp, stepped through the plate palette rather than a
 * continuous HSL sweep. Discrete steps map to the states the copy already
 * names — cooked, fatigued, recovering, ready, fresh — so the colour and
 * the word never disagree.
 */
function readinessColor(readiness) {
  if (readiness >= 0.9) return 'var(--plate-green)';
  if (readiness >= 0.7) return 'var(--plate-green)';
  if (readiness >= 0.45) return 'var(--plate-yellow)';
  if (readiness >= 0.2) return 'var(--plate-red)';
  return 'var(--plate-red)';
}

// ------------------------------------------------------------ recovery view

function renderRecoveryRow(group) {
  const pct = Math.round(group.readiness * 100);
  const color = readinessColor(group.readiness);
  const label = describeRecovery(group.readiness);

  return `
    <button class="ledger-row" data-action="muscle:open" data-group="${group.id}"
            style="--spine-color:${group.color};align-items:stretch">
      <span class="ledger-spine"></span>
      <span class="ledger-main" style="display:flex;flex-direction:column;justify-content:center;gap:var(--space-2)">
        <span style="display:flex;align-items:baseline;gap:var(--space-2)">
          <span class="ledger-title" style="flex:1">${esc(group.label)}</span>
          <span class="eyebrow" style="color:${color}">${t(`recovery_${label}`)}</span>
        </span>

        <span class="load-bar" style="display:block">
          <span class="load-bar-fill" style="width:${pct}%;--bar-color:${color}"></span>
        </span>

        <span class="ledger-sub">
          ${group.sets} ${t('of')} ${group.target.min}–${group.target.max} ${t('sets_week')}
        </span>
      </span>
      <span class="figure figure--md" style="color:${color};flex:none;align-self:center">
        ${pct}<span class="figure-unit">%</span>
      </span>
    </button>`;
}

function renderRecovery() {
  const groups = recommendTraining(state.sessions);
  const best = groups[0];

  return `
    ${state.sessions.length
      ? `<section class="hero bleed" style="--hero-color:${best.color}">
           <p class="eyebrow">${t('train_next')}</p>
           <h2 class="hero-title">${esc(best.label)}</h2>
           <div class="hero-meta">
             <span style="color:${readinessColor(best.readiness)}">
               ${Math.round(best.readiness * 100)}% ${t('recovered')}
             </span>
             <span style="color:var(--text-faint)">·</span>
             <span>${best.status === 'low' || best.status === 'none'
               ? t('volume_behind')
               : t('volume_on_track')}</span>
           </div>
         </section>`
      : ''}

    <h2 class="section-label">${t('recovery_status')}</h2>
    ${groups.map(renderRecoveryRow).join('')}

    <p style="margin-top:var(--space-6);font-size:var(--text-xs);color:var(--text-faint);line-height:1.65">
      ${t('recovery_explainer')}
    </p>`;
}

// ------------------------------------------------------------ volume view

const STATUS_COLOR = {
  none: 'var(--text-faint)',
  low: 'var(--warning)',
  optimal: 'var(--positive)',
  high: 'var(--negative)',
};

function renderVolumeRow(group, sets) {
  const target = volumeTarget(group.id);
  const status = volumeStatus(group.id, sets);
  const color = STATUS_COLOR[status];

  // Scale the bar so the optimal band always occupies the same visual space.
  const scaleMax = target.max * 1.4;
  const pct = Math.min(100, (sets / scaleMax) * 100);
  const bandStart = (target.min / scaleMax) * 100;
  const bandEnd = (target.max / scaleMax) * 100;

  return `
    <div class="ledger-row" style="--spine-color:${group.color};align-items:stretch">
      <span class="ledger-spine"></span>
      <span class="ledger-main" style="display:flex;flex-direction:column;justify-content:center;gap:var(--space-2)">
        <span style="display:flex;align-items:baseline;gap:var(--space-2)">
          <span class="ledger-title" style="flex:1">${esc(group.label)}</span>
          <span class="eyebrow" style="color:${color}">${t(`volume_${status}`)}</span>
        </span>

        <span class="load-bar" style="display:block">
          <!-- the productive band, marked out on the bar itself -->
          <span class="load-bar-band"
                style="left:${bandStart}%;width:${bandEnd - bandStart}%"></span>
          <span class="load-bar-fill" style="width:${pct}%;--bar-color:${color}"></span>
        </span>

        <span class="ledger-sub">
          ${t('target')} ${target.min}–${target.max} ${t('sets_week')}
        </span>
      </span>
      <span class="figure figure--md" style="color:${color};flex:none;align-self:center">
        ${Math.round(sets * 10) / 10}
      </span>
    </div>`;
}

function renderVolume() {
  const sets = volumeByGroup(state.sessions, 7);
  const total = Object.values(sets).reduce((a, b) => a + b, 0);

  if (!state.sessions.length) {
    return `
      <div class="empty">
        <div class="empty-icon">${icon('stats', { size: 30 })}</div>
        <h2 class="empty-title">${t('no_data_yet')}</h2>
        <p class="empty-body">${t('volume_empty_body')}</p>
      </div>`;
  }

  return `
    <div class="metric-strip" style="margin-bottom:var(--space-6)">
      <div class="metric metric--gold">
        <div class="metric-label">${t('total_sets')}</div>
        <div class="metric-value">${Math.round(total)}</div>
      </div>
      <div class="metric">
        <div class="metric-label">${t('groups_optimal')}</div>
        <div class="metric-value">
          ${MUSCLE_GROUPS.filter((g) => volumeStatus(g.id, sets[g.id]) === 'optimal').length}
          <span class="metric-unit">/ ${MUSCLE_GROUPS.length}</span>
        </div>
      </div>
    </div>

    <h2 class="section-label">${t('last_7_days')}</h2>
    ${MUSCLE_GROUPS.map((g) => renderVolumeRow(g, sets[g.id])).join('')}`;
}

// ------------------------------------------------------------ library view

/**
 * The filtered list for the Muscles tab's library, separated from the
 * search field above it for the same reason as the library sheet: typing
 * patches this container instead of re-rendering the app, so the input
 * element survives and keeps focus and the keyboard.
 *
 * This tab has its own search field with the same `data-input`, and it was
 * missed when the sheet was fixed — the handler found no container to patch
 * here and fell back to a full re-render, which dropped focus on every
 * keystroke.
 */
export function muscleLibraryResults() {
  const query = (state.libraryQuery || '').toLowerCase().trim();
  const groupFilter = state.libraryGroup || null;

  let results = EXERCISES;
  if (groupFilter) {
    const group = MUSCLE_GROUPS.find((g) => g.id === groupFilter);
    const names = new Set(group.muscles.map((m) => m.toLowerCase()));
    results = results.filter((ex) =>
      (ex.muscles || []).some((m) => names.has(m.name.toLowerCase())),
    );
  }
  if (query) {
    results = results.filter(
      (ex) =>
        ex.name.toLowerCase().includes(query) ||
        (ex.aliases || []).some((a) => a.toLowerCase().includes(query)),
    );
  }

  return `
    <div class="metric-label" style="margin-bottom:var(--space-3)">
      ${results.length} ${t('exercises_lbl')}
    </div>

    ${results.length
      ? results.slice(0, 80).map(renderLibraryRow).join('')
      : `<div class="empty"><p class="empty-body">${t('no_results')}</p></div>`}

    ${results.length > 80
      ? `<p class="metric-label" style="text-align:center;margin-top:var(--space-4)">
           ${t('showing_first', { n: 80 })}
         </p>`
      : ''}`;
}

function renderLibrary() {
  const groupFilter = state.libraryGroup || null;

  return `
    <input class="text-input" placeholder="${t('search_exercises')}"
           value="${esc(state.libraryQuery || '')}"
           data-input="library:search" aria-label="${t('search_exercises')}"
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

    <div id="muscle-library-results">${muscleLibraryResults()}</div>`;
}

function equipmentLabel(equipment) {
  const key = { dumbbells: 'dbs', plateLoaded: 'plate', bodyweight: 'body' }[equipment] || equipment;
  return t(`eq_${key}`);
}

function renderLibraryRow(ex) {
  const primary = (ex.muscles || []).filter((m) => m.role === 'primary').map((m) => m.name);
  return `
    <button class="ledger-row" data-action="exercise:info" data-name="${esc(ex.name)}">
      <span class="ledger-main">
        <span class="ledger-title">${esc(ex.name)}</span>
        <span class="ledger-sub">${esc(primary.join(' · ') || ex.category)}</span>
      </span>
      <span class="eyebrow" style="flex:none">${equipmentLabel(ex.equipment)}</span>
      <span style="color:var(--text-faint);flex:none">${icon('chevronRight', { size: 17 })}</span>
    </button>`;
}

// ------------------------------------------------------------ screen

export function renderMusclesScreen() {
  const sub = SUBTABS.includes(state.muscleSubtab) ? state.muscleSubtab : 'recovery';

  return {
    header: `
      <h1 class="screen-title">${t('muscles_title')}</h1>
      <div class="header-spacer"></div>
      <button class="icon-btn" data-action="settings:open" aria-label="${t('settings')}">
        ${icon('settings', { size: 21 })}
      </button>`,

    body: `
      <div class="segmented segmented--subnav">
        ${SUBTABS.map(
          (id) => `
          <button class="segmented-option ${sub === id ? 'is-active' : ''}"
                  data-action="muscle:subtab" data-sub="${id}">
            ${t(`sub_${id}`)}
          </button>`,
        ).join('')}
      </div>

      ${sub === 'recovery' ? renderRecovery() : sub === 'volume' ? renderVolume() : renderLibrary()}`,
  };
}
