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

/** Readiness colour ramp: red when cooked → green when fresh. */
function readinessColor(readiness) {
  const hue = Math.round(readiness * 130); // 0 = red, 130 = green
  return `hsl(${hue} 62% 58%)`;
}

// ------------------------------------------------------------ recovery view

function renderRecoveryRow(group) {
  const pct = Math.round(group.readiness * 100);
  const color = readinessColor(group.readiness);
  const label = describeRecovery(group.readiness);

  return `
    <button class="card card--interactive" data-action="muscle:open" data-group="${group.id}"
            style="display:block;width:100%;text-align:left;margin-bottom:var(--space-2)">
      <div class="row gap-3" style="margin-bottom:var(--space-3)">
        <span style="width:8px;height:8px;border-radius:50%;background:${group.color};flex:none"></span>
        <span style="flex:1;min-width:0;font-size:var(--text-base);font-weight:700">
          ${esc(group.label)}
        </span>
        <span style="font-family:var(--font-mono);font-size:var(--text-sm);color:${color};font-weight:600">
          ${pct}%
        </span>
      </div>

      <div style="height:6px;border-radius:var(--radius-pill);background:var(--surface-sunken);overflow:hidden">
        <div style="height:100%;width:${pct}%;border-radius:var(--radius-pill);
                    background:linear-gradient(90deg,
                      color-mix(in srgb, ${color} 55%, transparent), ${color});
                    transition:width var(--duration-slow) var(--ease-out)"></div>
      </div>

      <div class="row gap-2" style="margin-top:var(--space-2)">
        <span class="metric-label" style="color:${color}">${t(`recovery_${label}`)}</span>
        <span style="flex:1"></span>
        <span class="metric-label">
          ${group.sets} / ${group.target.min}–${group.target.max} ${t('sets_week')}
        </span>
      </div>
    </button>`;
}

function renderRecovery() {
  const groups = recommendTraining(state.sessions);
  const best = groups[0];

  return `
    ${state.sessions.length
      ? `<section class="card" style="margin-bottom:var(--space-5);
                border-color:color-mix(in srgb, ${best.color} 40%, transparent);
                background:linear-gradient(150deg, color-mix(in srgb, ${best.color} 12%, var(--surface-raised)), var(--surface-raised))">
           <h2 class="section-label">${t('train_next')}</h2>
           <div class="row gap-3">
             <div style="flex:1;min-width:0">
               <div style="font-family:var(--font-display);font-size:var(--text-2xl);line-height:1;
                           letter-spacing:var(--tracking-wide);text-transform:uppercase;color:${best.color}">
                 ${esc(best.label)}
               </div>
               <div class="metric-label" style="margin-top:var(--space-2)">
                 ${Math.round(best.readiness * 100)}% ${t('recovered')} ·
                 ${best.status === 'low' || best.status === 'none'
                   ? t('volume_behind')
                   : t('volume_on_track')}
               </div>
             </div>
             <span style="color:${best.color}">${icon('bolt', { size: 26 })}</span>
           </div>
         </section>`
      : ''}

    <h2 class="section-label">${t('recovery_status')}</h2>
    ${groups.map(renderRecoveryRow).join('')}

    <p style="margin-top:var(--space-5);font-size:var(--text-xs);color:var(--text-faint);line-height:1.6">
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
    <div style="margin-bottom:var(--space-4)">
      <div class="row gap-2" style="margin-bottom:var(--space-2)">
        <span style="flex:1;min-width:0;font-size:var(--text-sm);font-weight:700">${esc(group.label)}</span>
        <span style="font-family:var(--font-mono);font-size:var(--text-sm);color:${color};font-weight:600">
          ${Math.round(sets * 10) / 10}
        </span>
        <span class="metric-label">${t('sets_week')}</span>
      </div>

      <div style="position:relative;height:10px;border-radius:var(--radius-pill);
                  background:var(--surface-sunken);overflow:hidden">
        <!-- optimal band -->
        <div style="position:absolute;top:0;bottom:0;left:${bandStart}%;width:${bandEnd - bandStart}%;
                    background:rgba(95,208,122,.14)"></div>
        <div style="position:absolute;top:0;bottom:0;left:0;width:${pct}%;
                    border-radius:var(--radius-pill);background:${color};
                    transition:width var(--duration-slow) var(--ease-out)"></div>
      </div>

      <div class="metric-label" style="margin-top:var(--space-1);color:${color}">
        ${t(`volume_${status}`)}
      </div>
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
    <div class="metric-row" style="margin-bottom:var(--space-6)">
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

function renderLibrary() {
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
    <input class="text-input" placeholder="${t('search_exercises')}"
           value="${esc(state.libraryQuery || '')}"
           data-input="library:search" aria-label="${t('search_exercises')}"
           style="margin-bottom:var(--space-3)">

    <div style="display:flex;gap:var(--space-2);overflow-x:auto;padding-bottom:var(--space-3);
                margin:0 calc(var(--space-5) * -1);padding-left:var(--space-5);padding-right:var(--space-5);
                scrollbar-width:none">
      <button class="focus-chip" data-action="library:filter" data-group=""
              style="--chip-color:${!groupFilter ? 'var(--gold)' : 'var(--text-tertiary)'};flex:none">
        ${t('all')}
      </button>
      ${MUSCLE_GROUPS.map(
        (g) => `
        <button class="focus-chip" data-action="library:filter" data-group="${g.id}"
                style="--chip-color:${groupFilter === g.id ? g.color : 'var(--text-tertiary)'};flex:none">
          ${esc(g.label)}
        </button>`,
      ).join('')}
    </div>

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

function renderLibraryRow(ex) {
  const primary = (ex.muscles || []).filter((m) => m.role === 'primary').map((m) => m.name);
  return `
    <button class="card card--interactive" data-action="exercise:info" data-name="${esc(ex.name)}"
            style="display:flex;align-items:center;gap:var(--space-3);width:100%;text-align:left;
                   margin-bottom:var(--space-2)">
      <span style="flex:1;min-width:0">
        <span style="display:block;font-size:var(--text-base);font-weight:700;
                     overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
          ${esc(ex.name)}
        </span>
        <span class="metric-label" style="display:block;margin-top:2px">
          ${esc(primary.join(' · ') || ex.category)} · ${t(`eq_${ex.equipment === 'dumbbells' ? 'dbs' : ex.equipment === 'plateLoaded' ? 'plate' : ex.equipment === 'bodyweight' ? 'body' : ex.equipment}`)}
        </span>
      </span>
      <span style="color:var(--text-faint)">${icon('chevronRight', { size: 18 })}</span>
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
      <div class="segmented" style="margin-bottom:var(--space-5);width:100%;display:flex">
        ${SUBTABS.map(
          (id) => `
          <button class="segmented-option ${sub === id ? 'is-active' : ''}"
                  data-action="muscle:subtab" data-sub="${id}" style="flex:1">
            ${t(`sub_${id}`)}
          </button>`,
        ).join('')}
      </div>

      ${sub === 'recovery' ? renderRecovery() : sub === 'volume' ? renderVolume() : renderLibrary()}`,
  };
}
