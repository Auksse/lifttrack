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
    <button class="card card--interactive" data-action="workout:resume"
            style="display:flex;align-items:center;gap:var(--space-3);width:100%;text-align:left;
                   border-color:var(--line-gold);background:var(--gold-wash);margin-bottom:var(--space-4)">
      <span style="color:var(--gold)">${icon('bolt', { size: 22 })}</span>
      <span style="flex:1;min-width:0">
        <span class="metric-label" style="display:block">${t('workout_in_progress')}</span>
        <strong style="color:var(--gold);font-size:var(--text-base)">
          ${esc(tFocus(w.focus))} · ${done}/${total} ${t('sets')}
        </strong>
      </span>
      <span style="color:var(--gold)">${icon('chevronRight', { size: 20 })}</span>
    </button>`;
}

/** "Next up" — what to train today, and the button that starts it. */
function renderNextUp() {
  if (state.workout) return '';
  const suggestion = suggestNextFocus(state.sessions);
  const color = focusColor(suggestion.focus);

  return `
    <section style="margin-bottom:var(--space-6)">
      <h2 class="section-label">${t('next_up')}</h2>
      <div class="card" style="border-color:color-mix(in srgb, ${color} 30%, transparent);
           background:linear-gradient(150deg, color-mix(in srgb, ${color} 10%, var(--surface-raised)), var(--surface-raised))">
        <div class="row gap-3" style="margin-bottom:var(--space-4)">
          <div style="flex:1;min-width:0">
            <div style="font-family:var(--font-display);font-size:var(--text-3xl);line-height:1;
                        letter-spacing:var(--tracking-wide);text-transform:uppercase;color:${color}">
              ${esc(tFocus(suggestion.focus))}
            </div>
            <div class="metric-label" style="margin-top:var(--space-2)">${esc(suggestion.reason)}</div>
          </div>
        </div>
        <button class="btn btn--primary btn--block" data-action="workout:start" data-focus="${esc(suggestion.focus)}">
          ${icon('bolt', { size: 18 })} ${t('start_workout')}
        </button>
      </div>
    </section>`;
}

function renderSessionCard(session) {
  const color = focusColor(session.focus);
  const expanded = state.expandedSessionId === session.id;
  const volume = Math.round(sessionVolume(session));
  const hasPR = session.exercises.some((ex) => isPersonalRecord(state.sessions, session, ex.name));

  return `
    <article class="card card--flush" style="margin-bottom:var(--space-2)">
      <button data-action="session:toggle" data-id="${session.id}"
              style="display:flex;align-items:center;gap:var(--space-3);width:100%;
                     padding:var(--space-4);text-align:left;border-left:3px solid ${color}">
        <span style="flex:1;min-width:0">
          <span style="display:flex;align-items:center;gap:var(--space-2)">
            <strong style="font-family:var(--font-display);font-size:var(--text-lg);
                           letter-spacing:var(--tracking-wide);text-transform:uppercase;color:${color}">
              ${esc(tFocus(session.focus))}
            </strong>
            ${hasPR ? `<span class="pr-badge">${icon('trophy', { size: 11, stroke: 2.2 })} ${t('new_pr')}</span>` : ''}
          </span>
          <span class="metric-label" style="display:block;margin-top:2px">
            ${session.exercises.length} ${t('exercises_lbl')}
          </span>
        </span>
        <span style="text-align:right">
          <span class="metric-label" style="display:block">${formatDate(session.date)}</span>
          <strong style="font-family:var(--font-mono);font-size:var(--text-base);color:var(--text-secondary)">
            ${(volume / 1000).toFixed(1)}k
          </strong>
        </span>
        <span style="color:var(--text-faint);transition:transform var(--duration-fast) var(--ease-out);
                     ${expanded ? 'transform:rotate(180deg)' : ''}">
          ${icon('chevronDown', { size: 18 })}
        </span>
      </button>

      ${expanded ? renderSessionDetail(session) : ''}
    </article>`;
}

function renderSessionDetail(session) {
  return `
    <div style="padding:0 var(--space-4) var(--space-4);border-top:1px solid var(--line-subtle)">
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
    ${last
      ? `<span class="focus-chip" style="--chip-color:${daysSince(last.date) > 4 ? 'var(--warning)' : 'var(--text-tertiary)'}">
           ${daysSince(last.date)}${t('rest')}
         </span>`
      : ''}
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

      <section style="margin-bottom:var(--space-5)">
        <h2 class="section-label">${t('overview_title')}</h2>
        <div class="metric-row">
          ${metric(t('sessions'), sessions.length, '', 'metric--gold')}
          ${metric(t('volume'), (totalVolume(sessions) / 1000).toFixed(1), 't', 'metric--info')}
          ${metric(t('week_short'), sessionsThisWeek(sessions))}
          ${metric(t('streak'), currentStreak(sessions), t('streak_unit'), 'metric--positive')}
        </div>
      </section>

      <section>
        <h2 class="section-label">${t('recent_workouts')}</h2>
        ${monthKeys
          .map(
            (key) => `
              <div class="row gap-3" style="margin:var(--space-4) 0 var(--space-2)">
                <span class="metric-label">${formatMonth(key)}</span>
                <span style="flex:1;height:1px;background:var(--line-subtle)"></span>
                <span class="metric-label">${months.get(key).length}</span>
              </div>
              ${[...months.get(key)].reverse().map(renderSessionCard).join('')}`,
          )
          .join('')}
      </section>`,
  };
}
