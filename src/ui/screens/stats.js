/**
 * Stats screen — trends, records, and per-exercise progression.
 *
 * Charts are drawn as inline SVG rather than through Chart.js. For the
 * shapes here (a volume bar series and a single-metric line) SVG is fewer
 * bytes than the library, needs no canvas lifecycle management across
 * re-renders, and inherits the theme's CSS custom properties directly.
 */

import { state } from '../../state/store.js';
import { icon } from '../icons.js';
import { esc } from '../actions.js';
import { t, formatDate } from '../../i18n/index.js';
import { focusColor } from '../../domain/focus.js';
import {
  sessionVolume, totalVolume, frequentExercises, exerciseHistory,
  countPersonalRecords, currentStreak, isPersonalRecord,
} from '../../domain/stats.js';

// ------------------------------------------------------------ chart helpers

/** Bar chart of per-session volume. */
function volumeChart(sessions) {
  if (sessions.length < 2) return '';

  const recent = sessions.slice(-16);
  const values = recent.map(sessionVolume);
  const peak = Math.max(...values, 1);

  const W = 100;      // viewBox units; scales to container width
  const H = 42;
  const gap = 1.4;
  const barW = (W - gap * (recent.length - 1)) / recent.length;

  return `
    <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"
         style="width:100%;height:120px;display:block" role="img"
         aria-label="${t('vol_per_session')}">
      ${recent
        .map((session, i) => {
          const h = Math.max(1.5, (values[i] / peak) * (H - 2));
          const x = i * (barW + gap);
          return `<rect x="${x.toFixed(2)}" y="${(H - h).toFixed(2)}"
                        width="${barW.toFixed(2)}" height="${h.toFixed(2)}"
                        rx="${Math.min(1.2, barW / 2).toFixed(2)}"
                        fill="${focusColor(session.focus)}" opacity="0.9"/>`;
        })
        .join('')}
    </svg>`;
}

/** Line chart for a single exercise metric over time. */
function lineChart(points, color = 'var(--gold)') {
  if (points.length < 2) return '';

  const W = 100;
  const H = 40;
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * W;
    // 3-unit padding top and bottom so the stroke never clips.
    const y = H - 3 - ((p.value - min) / span) * (H - 6);
    return [x, y];
  });

  const path = coords.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
  const area = `${path} L${W},${H} L0,${H} Z`;

  return `
    <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"
         style="width:100%;height:110px;display:block">
      <defs>
        <linearGradient id="lc-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.28"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path d="${area}" fill="url(#lc-fade)"/>
      <path d="${path}" fill="none" stroke="${color}" stroke-width="1.2"
            stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
      ${coords
        .map(([x, y], i) =>
          i === coords.length - 1
            ? `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="1.8" fill="${color}"/>`
            : '',
        )
        .join('')}
    </svg>`;
}

// ------------------------------------------------------------ sections

function renderSplit(sessions) {
  const counts = new Map();
  sessions.forEach((s) => counts.set(s.focus, (counts.get(s.focus) || 0) + 1));
  const ordered = [...counts.entries()].sort((a, b) => b[1] - a[1]);

  return ordered
    .map(([focus, count]) => {
      const pct = Math.round((count / sessions.length) * 100);
      const color = focusColor(focus);
      return `
        <div style="margin-bottom:var(--space-3)">
          <div class="row gap-2" style="margin-bottom:var(--space-1)">
            <span style="flex:1;font-size:var(--text-sm);font-weight:700;color:${color}">
              ${esc(focus)}
            </span>
            <span style="font-family:var(--font-mono);font-size:var(--text-sm);color:var(--text-secondary)">
              ${count}
            </span>
            <span class="metric-label">${pct}%</span>
          </div>
          <div style="height:5px;border-radius:var(--radius-pill);background:var(--surface-sunken);overflow:hidden">
            <div style="height:100%;width:${pct}%;background:${color};border-radius:var(--radius-pill)"></div>
          </div>
        </div>`;
    })
    .join('');
}

function renderExercisePicker(names, selected) {
  return `
    <div class="chip-rail">
      ${names
        .slice(0, 20)
        .map(
          (name) => `
          <button class="chip" data-action="stats:exercise" data-name="${esc(name)}"
                  style="--chip-color:${name === selected ? 'var(--gold)' : 'var(--text-tertiary)'};flex:none">
            ${esc(name)}
          </button>`,
        )
        .join('')}
    </div>`;
}

function renderExerciseTrend(name) {
  const history = exerciseHistory(state.sessions, name);
  if (history.length < 2) {
    return `<p class="empty-body" style="margin:var(--space-6) auto">${t('not_enough_data')}</p>`;
  }

  const metric = state.statsMetric || 'best1RM';
  const points = history.map((h) => ({ value: h[metric] || 0 }));
  const first = points[0].value;
  const last = points.at(-1).value;
  const delta = first ? Math.round(((last - first) / first) * 100) : 0;
  const positive = delta >= 0;

  const METRICS = [
    ['best1RM', t('est_1rm')],
    ['topWeight', t('max_weight')],
    ['volume', t('session_volume')],
  ];

  return `
    <div class="segmented" style="width:100%;display:flex;margin-bottom:var(--space-4)">
      ${METRICS.map(
        ([key, label]) => `
        <button class="segmented-option ${metric === key ? 'is-active' : ''}"
                data-action="stats:metric" data-metric="${key}" style="flex:1;font-size:var(--text-xs)">
          ${label}
        </button>`,
      ).join('')}
    </div>

    <div class="card">
      <div class="row gap-3" style="margin-bottom:var(--space-3)">
        <div>
          <div class="metric-label">${t('current')}</div>
          <div class="metric-value" style="font-size:var(--text-2xl)">
            ${last}<span class="metric-unit">${metric === 'volume' ? '' : state.settings.units}</span>
          </div>
        </div>
        <div style="flex:1"></div>
        <div style="text-align:right">
          <div class="metric-label">${t('since_start')}</div>
          <div style="font-family:var(--font-mono);font-size:var(--text-lg);font-weight:600;
                      color:${positive ? 'var(--positive)' : 'var(--negative)'}">
            ${positive ? '+' : ''}${delta}%
          </div>
        </div>
      </div>

      ${lineChart(points, positive ? 'var(--positive)' : 'var(--negative)')}

      <div class="row" style="margin-top:var(--space-2)">
        <span class="metric-label">${formatDate(history[0].date)}</span>
        <span style="flex:1"></span>
        <span class="metric-label">${formatDate(history.at(-1).date)}</span>
      </div>
    </div>`;
}

function renderRecords(sessions) {
  // Best ever load per exercise, heaviest first.
  const best = new Map();
  sessions.forEach((session) => {
    session.exercises.forEach((ex) => {
      const top = Math.max(...ex.sets.map((s) => Number(s.w) || 0));
      const reps = ex.sets.find((s) => Number(s.w) === top)?.r ?? 0;
      if (!(top > 0)) return;
      const existing = best.get(ex.name);
      if (!existing || top > existing.weight) {
        best.set(ex.name, { weight: top, reps, date: session.date });
      }
    });
  });

  const rows = [...best.entries()].sort((a, b) => b[1].weight - a[1].weight).slice(0, 12);
  if (!rows.length) return '';

  return `
    <h2 class="section-label" style="margin-top:var(--space-6)">${t('personal_records')}</h2>
    ${rows
      .map(
        ([name, record]) => `
        <div class="row gap-3" style="padding:var(--space-3) 0;border-bottom:1px solid var(--line-subtle)">
          <span style="color:var(--gold);flex:none">${icon('trophy', { size: 16 })}</span>
          <span style="flex:1;min-width:0;font-size:var(--text-sm);font-weight:600;
                       overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
            ${esc(name)}
          </span>
          <span style="font-family:var(--font-mono);font-size:var(--text-sm);color:var(--text-primary);font-weight:600">
            ${record.weight}${state.settings.units}
          </span>
          <span class="metric-label" style="min-width:52px;text-align:right">
            ${formatDate(record.date)}
          </span>
        </div>`,
      )
      .join('')}`;
}

// ------------------------------------------------------------ screen

export function renderStatsScreen() {
  const { sessions } = state;

  const header = `
    <h1 class="screen-title">${t('overview_title')}</h1>
    <div class="header-spacer"></div>
    <button class="icon-btn" data-action="settings:open" aria-label="${t('settings')}">
      ${icon('settings', { size: 21 })}
    </button>`;

  if (sessions.length < 2) {
    return {
      header,
      body: `
        <div class="empty">
          <div class="empty-icon">${icon('stats', { size: 30 })}</div>
          <h2 class="empty-title">${t('no_data_yet')}</h2>
          <p class="empty-body">${t('not_enough_data')}</p>
        </div>`,
    };
  }

  const names = frequentExercises(sessions, 2);
  const selected = names.includes(state.statsExercise) ? state.statsExercise : names[0];

  return {
    header,
    body: `
      <div class="metric-strip" style="margin-bottom:var(--space-6)">
        <div class="metric metric--gold">
          <div class="metric-label">${t('sessions')}</div>
          <div class="metric-value">${sessions.length}</div>
        </div>
        <div class="metric metric--info">
          <div class="metric-label">${t('volume')}</div>
          <div class="metric-value">${(totalVolume(sessions) / 1000).toFixed(1)}<span class="metric-unit">t</span></div>
        </div>
        <div class="metric">
          <div class="metric-label">${t('prs')}</div>
          <div class="metric-value">${countPersonalRecords(sessions)}</div>
        </div>
        <div class="metric metric--positive">
          <div class="metric-label">${t('streak')}</div>
          <div class="metric-value">${currentStreak(sessions)}<span class="metric-unit">${t('streak_unit')}</span></div>
        </div>
      </div>

      <h2 class="section-label">${t('vol_per_session')}</h2>
      <div class="card" style="margin-bottom:var(--space-6)">
        ${volumeChart(sessions)}
        <div class="row" style="margin-top:var(--space-2)">
          <span class="metric-label">${formatDate(sessions.slice(-16)[0].date)}</span>
          <span style="flex:1"></span>
          <span class="metric-label">${formatDate(sessions.at(-1).date)}</span>
        </div>
      </div>

      <h2 class="section-label">${t('session_split')}</h2>
      <div style="margin-bottom:var(--space-6)">${renderSplit(sessions)}</div>

      ${selected
        ? `<h2 class="section-label">${t('progression')}</h2>
           ${renderExercisePicker(names, selected)}
           ${renderExerciseTrend(selected)}`
        : ''}

      ${renderRecords(sessions)}`,
  };
}
