/**
 * Plan screen — training calendar and template management.
 */

import { state } from '../../state/store.js';
import { icon } from '../icons.js';
import { esc } from '../actions.js';
import { t, formatMonth } from '../../i18n/index.js';
import { focusColor, TEMPLATE_COLORS } from '../../domain/focus.js';
import { sessionVolume } from '../../domain/stats.js';

const DAY_KEYS = ['d_mo', 'd_tu', 'd_we', 'd_th', 'd_fr', 'd_sa', 'd_su'];

function isoDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Month grid. Days that contain a session are dotted with that session's
 * focus colour, so a month's training pattern is readable at a glance.
 */
function renderCalendar() {
  const today = new Date();
  const year = state.planYear ?? today.getFullYear();
  const month = state.planMonth ?? today.getMonth();

  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = (first.getDay() + 6) % 7; // Monday-first

  const byDate = new Map();
  state.sessions.forEach((s) => {
    if (!byDate.has(s.date)) byDate.set(s.date, []);
    byDate.get(s.date).push(s);
  });

  const cells = [];
  for (let i = 0; i < leading; i += 1) cells.push('<div></div>');

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = isoDate(new Date(year, month, day));
    const sessions = byDate.get(date) || [];
    const isToday = date === isoDate(today);

    cells.push(`
      <button data-action="plan:day" data-date="${date}"
              style="aspect-ratio:1;display:flex;flex-direction:column;align-items:center;
                     justify-content:center;gap:3px;border-radius:var(--radius-md);
                     background:${isToday ? 'var(--gold-wash)' : 'transparent'};
                     border:1px solid ${isToday ? 'var(--line-gold)' : 'transparent'}">
        <span style="font-family:var(--font-mono);font-size:var(--text-sm);
                     color:${sessions.length ? 'var(--text-primary)' : 'var(--text-faint)'};
                     font-weight:${sessions.length ? 600 : 400}">${day}</span>
        <span style="display:flex;gap:2px;height:5px">
          ${sessions
            .slice(0, 3)
            .map(
              (s) => `<span style="width:5px;height:5px;border-radius:50%;
                                   background:${focusColor(s.focus, state.templates)}"></span>`,
            )
            .join('')}
        </span>
      </button>`);
  }

  return `
    <div class="card" style="margin-bottom:var(--space-6)">
      <div class="row gap-2" style="margin-bottom:var(--space-4)">
        <button class="icon-btn" data-action="plan:prev" aria-label="Previous month">
          ${icon('chevronLeft', { size: 20 })}
        </button>
        <span style="flex:1;text-align:center;font-family:var(--font-display);
                     font-size:var(--text-lg);letter-spacing:var(--tracking-wide);
                     text-transform:uppercase">
          ${formatMonth(`${year}-${String(month + 1).padStart(2, '0')}`)}
        </span>
        <button class="icon-btn" data-action="plan:next" aria-label="Next month">
          ${icon('chevronRight', { size: 20 })}
        </button>
      </div>

      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:var(--space-2)">
        ${DAY_KEYS.map(
          (k) => `<div class="metric-label" style="text-align:center">${t(k)}</div>`,
        ).join('')}
      </div>

      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px">
        ${cells.join('')}
      </div>
    </div>`;
}

function renderDaySessions() {
  const date = state.planSelectedDate;
  if (!date) return '';

  const sessions = state.sessions.filter((s) => s.date === date);
  if (!sessions.length) {
    return `
      <div class="card" style="margin-bottom:var(--space-6);text-align:center">
        <p class="empty-body" style="margin:0 auto">${t('no_sessions_on_day')}</p>
      </div>`;
  }

  return `
    <h2 class="section-label">${date}</h2>
    ${sessions
      .map((s) => {
        const color = focusColor(s.focus, state.templates);
        return `
        <div class="card" style="margin-bottom:var(--space-2);border-left:3px solid ${color}">
          <div class="row gap-2">
            <strong style="flex:1;color:${color};font-family:var(--font-display);
                           font-size:var(--text-lg);letter-spacing:var(--tracking-wide);
                           text-transform:uppercase">${esc(s.focus)}</strong>
            <span class="metric-label">${s.exercises.length} ${t('ex_lbl')}</span>
            <span style="font-family:var(--font-mono);font-size:var(--text-sm)">
              ${(sessionVolume(s) / 1000).toFixed(1)}k
            </span>
          </div>
        </div>`;
      })
      .join('')}`;
}

function renderTemplates() {
  const templates = state.templates || [];

  return `
    <button class="btn btn--secondary btn--block" data-action="plan:open"
            style="margin-bottom:var(--space-5)">
      ${icon('bolt', { size: 17 })} ${t('build_session')}
    </button>

    <h2 class="section-label">${t('templates')}</h2>
    ${templates
      .map((tpl) => {
        const color = tpl.color || focusColor(tpl.focus || tpl.name);
        const expanded = state.expandedTemplateId === tpl.id;
        return `
        <article class="card card--flush" style="margin-bottom:var(--space-2)">
          <button data-action="template:toggle" data-id="${tpl.id}"
                  style="display:flex;align-items:center;gap:var(--space-3);width:100%;
                         padding:var(--space-4);text-align:left;border-left:3px solid ${color}">
            <span style="flex:1;min-width:0">
              <span style="display:block;font-family:var(--font-display);font-size:var(--text-lg);
                           letter-spacing:var(--tracking-wide);text-transform:uppercase;color:${color}">
                ${esc(tpl.name)}
              </span>
              <span class="metric-label" style="display:block;margin-top:2px">
                ${tpl.exercises.length} ${t('ex_lbl')}
              </span>
            </span>
            <span style="color:var(--text-faint);${expanded ? 'transform:rotate(180deg)' : ''}">
              ${icon('chevronDown', { size: 18 })}
            </span>
          </button>

          ${expanded
            ? `<div style="padding:0 var(--space-4) var(--space-4);border-top:1px solid var(--line-subtle)">
                 <div style="padding-top:var(--space-3)">
                   ${tpl.exercises
                     .map(
                       (name, i) => `
                       <div class="row gap-2" style="padding:var(--space-2) 0;
                            border-bottom:1px solid var(--line-subtle)">
                         <span class="metric-label" style="min-width:18px">${i + 1}</span>
                         <span style="flex:1;font-size:var(--text-sm)">${esc(name)}</span>
                         <button class="icon-btn" data-action="template:remove-ex"
                                 data-id="${tpl.id}" data-index="${i}"
                                 style="width:32px;height:32px" aria-label="${t('delete')}">
                           ${icon('close', { size: 16 })}
                         </button>
                       </div>`,
                     )
                     .join('')}
                 </div>
                 <!-- Colour is part of editing a template, not a separate
                      screen: it is how the template is recognised in the
                      log, the calendar and the week strip. -->
                 <div class="metric-label" style="margin-top:var(--space-4)">${t('colour')}</div>
                 <div class="swatch-row">
                   ${TEMPLATE_COLORS.map(
                     (value) => `
                     <button class="swatch ${tpl.color === value ? 'is-active' : ''}"
                             data-action="template:color" data-id="${tpl.id}" data-color="${value}"
                             style="--swatch:${value}"
                             aria-label="${t('colour')}" aria-pressed="${tpl.color === value}"></button>`,
                   ).join('')}
                   <button class="swatch swatch--auto ${!tpl.color ? 'is-active' : ''}"
                           data-action="template:color" data-id="${tpl.id}" data-color=""
                           title="${t('colour_auto')}" aria-label="${t('colour_auto')}"
                           aria-pressed="${!tpl.color}">
                     ${icon('swap', { size: 14 })}
                   </button>
                 </div>

                 <div class="row gap-2" style="margin-top:var(--space-3);flex-wrap:wrap">
                   <button class="btn btn--sm btn--primary" data-action="template:use" data-id="${tpl.id}">
                     ${icon('bolt', { size: 15 })} ${t('start_workout')}
                   </button>
                   <button class="btn btn--sm btn--secondary" data-action="template:add-ex" data-id="${tpl.id}">
                     ${icon('plus', { size: 15 })} ${t('add_exercise')}
                   </button>
                   <button class="btn btn--sm btn--secondary" data-action="template:rename" data-id="${tpl.id}">
                     ${icon('edit', { size: 15 })} ${t('rename')}
                   </button>
                   <button class="btn btn--sm btn--danger" data-action="template:delete" data-id="${tpl.id}">
                     ${icon('trash', { size: 15 })}
                   </button>
                 </div>
               </div>`
            : ''}
        </article>`;
      })
      .join('')}

    <button class="btn btn--secondary btn--block" data-action="template:create"
            style="margin-top:var(--space-3)">
      ${icon('plus', { size: 18 })} ${t('create_template')}
    </button>`;
}

export function renderPlanScreen() {
  return {
    header: `
      <h1 class="screen-title">${t('plan_title')}</h1>
      <div class="header-spacer"></div>
      <button class="icon-btn" data-action="settings:open" aria-label="${t('settings')}">
        ${icon('settings', { size: 21 })}
      </button>`,

    body: `
      ${renderCalendar()}
      ${renderDaySessions()}
      ${renderTemplates()}`,
  };
}
