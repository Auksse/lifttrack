/**
 * Log screen — history, and the entry point into a workout.
 */

import { state } from '../../state/store.js';
import { icon } from '../icons.js';
import { esc } from '../actions.js';
import { t, tFocus, formatDate, formatMonth } from '../../i18n/index.js';
import { focusColor } from '../../domain/focus.js';
import {
  sessionVolume, totalVolume, sessionsThisWeek, currentStreak,
  suggestNextFocus, groupByMonth, isPersonalRecord, daysSince,
} from '../../domain/stats.js';

function metric(label, value, unit = '', variant = '') {
  return `
    <div class="metric ${variant}">
      <div class="metric-label">${label}</div>
      <div class="metric-value">${value}${unit ? `<span class="metric-unit">${unit}</span>` : ''}</div>
    </div>`;
}

/** The resume banner for a workout left in progress. */
function renderActiveWorkout() {
  const w = state.workout;
  if (!w) return '';
  const done = w.exercises.reduce((n, e) => n + e.sets.filter((s) => s.done).length, 0);
  const total = w.exercises.reduce((n, e) => n + e.sets.length, 0);

  return `
    <button class="ledger-row" data-action="workout:resume"
            style="--spine-color:var(--gold);border-top:1px solid var(--line-gold);
                   border-bottom-color:var(--line-gold);background:var(--gold-wash)">
      <span class="ledger-spine"></span>
      <span class="ledger-main">
        <span class="eyebrow" style="display:block">${t('workout_in_progress')}</span>
        <span class="ledger-title" style="color:var(--gold);margin-top:2px">
          ${esc(tFocus(w.focus))} · ${done}/${total} ${t('sets')}
        </span>
      </span>
      <span style="color:var(--gold)">${icon('chevronRight', { size: 20 })}</span>
    </button>`;
}

/**
 * The hero: what to train next.
 *
 * This is the page's thesis, so it gets a scale nothing else approaches
 * and the only textured surface in the app. Everything below it is
 * deliberately quiet — hairlines and figures.
 */
function renderNextUp() {
  if (state.workout) return '';
  const suggestion = suggestNextFocus(state.sessions);
  const color = focusColor(suggestion.focus);
  const last = state.sessions.at(-1);

  return `
    <section class="hero bleed" style="--hero-color:${color}">
      <p class="eyebrow">${t('next_up')}</p>
      <h2 class="hero-title">${esc(tFocus(suggestion.focus))}</h2>
      <div class="hero-meta">
        <span>${esc(suggestion.reason)}</span>
        ${last ? `<span style="color:var(--text-faint)">·</span>
                  <span style="color:var(--text-tertiary)">${daysSince(last.date)}${t('rest')}</span>` : ''}
      </div>
      <button class="btn btn--primary btn--block" data-action="workout:start"
              data-focus="${esc(suggestion.focus)}" style="margin-top:var(--space-4)">
        ${icon('bolt', { size: 17 })} ${t('start_workout')}
      </button>
    </section>`;
}

function renderSessionCard(session) {
  const color = focusColor(session.focus);
  const expanded = state.expandedSessionId === session.id;
  const volume = Math.round(sessionVolume(session));
  const hasPR = session.exercises.some((ex) => isPersonalRecord(state.sessions, session, ex.name));

  return `
    <article>
      <button class="ledger-row ledger-row--tall" data-action="session:toggle" data-id="${session.id}"
              style="--spine-color:${color}">
        <span class="ledger-spine"></span>
        <span class="ledger-main">
          <span style="display:flex;align-items:center;gap:var(--space-2)">
            <span class="figure figure--sm" style="color:${color}">
              ${esc(tFocus(session.focus))}
            </span>
            ${hasPR ? `<span class="pr-badge">${icon('trophy', { size: 10, stroke: 2.4 })} ${t('new_pr')}</span>` : ''}
          </span>
          <span class="ledger-sub">${session.exercises.length} ${t('exercises_lbl')}</span>
        </span>
        <span class="ledger-trail">
          <span class="eyebrow" style="display:block">${formatDate(session.date)}</span>
          <span class="figure figure--sm" style="color:var(--text-secondary);margin-top:3px;display:block">
            ${(volume / 1000).toFixed(1)}<span class="figure-unit">k</span>
          </span>
        </span>
        <span style="color:var(--text-faint);flex:none;
                     transition:transform var(--duration-fast) var(--ease-out);
                     ${expanded ? 'transform:rotate(180deg)' : ''}">
          ${icon('chevronDown', { size: 18 })}
        </span>
      </button>

      ${expanded ? renderSessionDetail(session) : ''}
    </article>`;
}

function renderSessionDetail(session) {
  return `
    <div style="padding:0 0 var(--space-4) var(--space-5);
                border-bottom:1px solid var(--line-subtle);background:var(--surface-sunken)">
      <div style="padding-top:var(--space-3)">
        ${session.exercises
          .map((ex) => {
            const pr = isPersonalRecord(state.sessions, session, ex.name);
            return `
              <div class="row gap-2" style="padding:var(--space-2) 0;border-bottom:1px solid var(--line-subtle)">
                <span style="flex:1;min-width:0;font-size:var(--text-sm);font-weight:600;
                             overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                  ${esc(ex.name)}
                  ${pr ? `<span style="color:var(--gold);margin-left:4px">${icon('trophy', { size: 12, stroke: 2.2 })}</span>` : ''}
                </span>
                <span style="font-family:var(--font-mono);font-size:var(--text-xs);color:var(--text-tertiary)">
                  ${ex.sets.map((s) => `${s.r}×${s.w}`).join('  ')}
                </span>
              </div>`;
          })
          .join('')}
      </div>

      <div class="row gap-2" style="margin-top:var(--space-3);flex-wrap:wrap">
        <button class="btn btn--sm btn--secondary" data-action="session:repeat" data-id="${session.id}">
          ${icon('copy', { size: 15 })} ${t('use_as_template')}
        </button>
        <button class="btn btn--sm btn--secondary" data-action="session:edit" data-id="${session.id}">
          ${icon('edit', { size: 15 })} ${t('edit')}
        </button>
        <button class="btn btn--sm btn--danger" data-action="session:delete" data-id="${session.id}">
          ${icon('trash', { size: 15 })} ${t('delete')}
        </button>
      </div>
    </div>`;
}

export function renderLogScreen() {
  const { sessions } = state;
  const last = sessions.at(-1);

  const header = `
    <h1 class="screen-title">LIFT<em>TRACK</em></h1>
    <div class="header-spacer"></div>
    <button class="icon-btn" data-action="settings:open" aria-label="${t('settings')}">
      ${icon('settings', { size: 21 })}
    </button>`;

  if (!sessions.length && !state.workout) {
    return {
      header,
      body: `
        <div class="empty">
          <div class="empty-icon">${icon('muscles', { size: 32 })}</div>
          <h2 class="empty-title">${t('onboard_title')}</h2>
          <p class="empty-body">${t('onboard_sub')}</p>
          <button class="btn btn--primary" data-action="workout:start" data-focus="Push">
            ${icon('bolt', { size: 18 })} ${t('onboard_cta')}
          </button>
        </div>`,
    };
  }

  const months = groupByMonth(sessions);
  const monthKeys = [...months.keys()].sort().reverse();

  return {
    header,
    body: `
      ${renderActiveWorkout()}
      ${renderNextUp()}

      <div class="metric-strip">
        ${metric(t('sessions'), sessions.length, '', 'metric--gold')}
        ${metric(t('volume'), (totalVolume(sessions) / 1000).toFixed(1), 't', 'metric--info')}
        ${metric(t('week_short'), sessionsThisWeek(sessions))}
        ${metric(t('streak'), currentStreak(sessions), t('streak_unit'), 'metric--positive')}
      </div>

      <section>
        ${monthKeys
          .map(
            (key) => `
              <h2 class="section-label">
                ${formatMonth(key)}
                <span class="count">${months.get(key).length}</span>
              </h2>
              ${[...months.get(key)].reverse().map(renderSessionCard).join('')}`,
          )
          .join('')}
      </section>`,
  };
}
