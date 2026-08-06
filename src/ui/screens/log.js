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
  suggestNextFocus, groupByMonth, isPersonalRecord, daysSince, weekStart,
} from '../../domain/stats.js';
import { MUSCLE_GROUPS, readinessByGroup } from '../../domain/muscles.js';

/**
 * Volume in tonnes, with the precision the magnitude can carry.
 * "151.2" is too wide for a quarter-width metric cell; "151" is not.
 */
function formatTonnage(kg) {
  const t = kg / 1000;
  if (t >= 100) return String(Math.round(t));
  if (t >= 10) return t.toFixed(1);
  return t.toFixed(1);
}

function metric(label, value, unit = '', variant = '') {
  return `
    <div class="metric ${variant}">
      <div class="metric-label">${label}</div>
      <div class="metric-value">${value}${unit ? `<span class="metric-unit">${unit}</span>` : ''}</div>
    </div>`;
}

/**
 * Backup prompt.
 *
 * There is no server copy of any of this. iOS deletes a home-screen web
 * app's storage when the icon is removed, and can evict it under storage
 * pressure — so the app has to actively push a copy off the device rather
 * than leaving export buried in Settings.
 */
function renderBackupBanner() {
  if (!state.backupDue) return '';
  return `
    <div class="ledger-row" style="--spine-color:var(--warning);border-top:1px solid
         color-mix(in srgb, var(--warning) 35%, transparent);
         border-bottom-color:color-mix(in srgb, var(--warning) 35%, transparent);
         background:color-mix(in srgb, var(--warning) 8%, transparent)">
      <span class="ledger-spine"></span>
      <span class="ledger-main">
        <span class="eyebrow" style="display:block;color:var(--warning)">${t('backup_due')}</span>
        <span class="ledger-sub" style="white-space:normal">${t('backup_due_body')}</span>
      </span>
      <button class="btn btn--sm btn--secondary" data-action="data:export">${t('back_up')}</button>
      <button class="icon-btn" data-action="backup:dismiss" aria-label="${t('close')}"
              style="width:34px;height:34px">
        ${icon('close', { size: 16 })}
      </button>
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

/**
 * The current training week, Monday first.
 *
 * A filled cell is a day you trained, tinted with that session's focus
 * colour, so the week's shape reads at a glance rather than as a count.
 */
function renderWeekStrip() {
  const labels = ['d_mo', 'd_tu', 'd_we', 'd_th', 'd_fr', 'd_sa', 'd_su'];
  const start = weekStart(new Date());
  const todayISO = new Date().toISOString().slice(0, 10);

  const byDate = new Map();
  state.sessions.forEach((s) => byDate.set(s.date, s));

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { iso, day: d.getDate(), session: byDate.get(iso), isToday: iso === todayISO };
  });

  return `
    <div class="week-strip">
      ${days
        .map(
          (d, i) => `
        <div class="week-day">
          <span class="week-day-label">${t(labels[i])}</span>
          <span class="week-day-cell ${d.session ? 'is-trained' : ''} ${d.isToday && !d.session ? 'is-today' : ''}"
                ${d.session ? `style="--day-color:${focusColor(d.session.focus)}"` : ''}>
            ${d.session ? icon('check', { size: 14, stroke: 3 }) : d.day}
          </span>
        </div>`,
        )
        .join('')}
    </div>`;
}

/** Compact area chart of recent session volume. */
function renderVolumeSpark() {
  const recent = state.sessions.slice(-14);
  if (recent.length < 3) return '';

  const values = recent.map(sessionVolume);
  const peak = Math.max(...values, 1);
  const W = 100;
  const H = 30;

  const points = values.map((v, i) => [
    (i / (values.length - 1)) * W,
    H - 2 - (v / peak) * (H - 4),
  ]);
  const line = points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
  const area = `${line} L${W},${H} L0,${H} Z`;
  const [lastX, lastY] = points.at(-1);

  return `
    <svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="spark-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--gold)" stop-opacity="0.32"/>
          <stop offset="100%" stop-color="var(--gold)" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path d="${area}" fill="url(#spark-fade)"/>
      <path d="${line}" fill="none" stroke="var(--gold)" stroke-width="1.4"
            stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
      <circle cx="${lastX.toFixed(2)}" cy="${lastY.toFixed(2)}" r="2" fill="var(--gold)"
              vector-effect="non-scaling-stroke"/>
    </svg>`;
}

/**
 * Muscle readiness as six vertical gauges — the recovery model made
 * visible from the first screen rather than buried a tab away.
 */
function renderReadinessRail() {
  if (state.sessions.length < 2) return '';
  const readiness = readinessByGroup(state.sessions);
  const groups = MUSCLE_GROUPS.map((g) => ({ ...g, readiness: readiness[g.id] ?? 1 }));

  return `
    <button class="readiness-rail" data-action="nav:tab" data-tab="muscles"
            style="width:100%;text-align:inherit">
      ${groups
        .map((g) => {
          const pct = Math.round(g.readiness * 100);
          const color =
            g.readiness >= 0.7 ? 'var(--plate-green)'
            : g.readiness >= 0.45 ? 'var(--plate-yellow)'
            : 'var(--plate-red)';
          return `
          <span class="readiness-col" style="--gauge-color:${color}">
            <span class="readiness-pct">${pct}</span>
            <span class="readiness-gauge">
              <span class="readiness-fill" style="height:${pct}%"></span>
            </span>
            <span class="readiness-name">${esc(g.short || g.label)}</span>
          </span>`;
        })
        .join('')}
    </button>`;
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
      ${renderBackupBanner()}
      ${renderActiveWorkout()}
      ${renderNextUp()}

      <div class="metric-strip">
        ${metric(t('sessions'), sessions.length, '', 'metric--gold')}
        ${metric(t('volume'), formatTonnage(totalVolume(sessions)), 't', 'metric--info')}
        ${metric(t('week_short'), sessionsThisWeek(sessions))}
        ${metric(t('streak'), currentStreak(sessions), t('streak_unit'), 'metric--positive')}
      </div>

      <h2 class="section-label">${t('this_week')}</h2>
      ${renderWeekStrip()}

      ${sessions.length >= 3
        ? `<h2 class="section-label">
             ${t('vol_per_session')}
             <span class="count">${formatTonnage(sessionVolume(sessions.at(-1)))}t</span>
           </h2>
           ${renderVolumeSpark()}`
        : ''}

      ${sessions.length >= 2
        ? `<h2 class="section-label">${t('recovery_status')}</h2>
           ${renderReadinessRail()}`
        : ''}

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
