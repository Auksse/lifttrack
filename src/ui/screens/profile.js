/**
 * Profile gate — the first screen a new user sees.
 */

import { state } from '../../state/store.js';
import { icon } from '../icons.js';
import { esc } from '../actions.js';
import { t } from '../../i18n/index.js';

const AVATAR_COLORS = [
  'var(--gold)', 'var(--focus-pull)', 'var(--focus-legs)',
  'var(--focus-upper)', 'var(--focus-push)',
];

function avatarColor(id) {
  const sum = [...id].reduce((total, ch) => total + ch.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function initials(name) {
  return name.trim().split(/\s+/).map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export function renderProfileGate() {
  const { users } = state;

  return `
    <div style="flex:1;overflow-y:auto;display:flex;flex-direction:column;
                padding:calc(var(--safe-top) + var(--space-16)) var(--space-5)
                        calc(var(--safe-bottom) + var(--space-10))">

      <div style="text-align:center;margin-bottom:var(--space-12)">
        <div style="font-family:var(--font-display);font-size:var(--text-4xl);line-height:1;
                    letter-spacing:var(--tracking-wider);color:var(--text-primary)">
          LIFT<span style="color:var(--gold)">TRACK</span>
        </div>
        <div style="margin-top:var(--space-3);font-size:var(--text-xs);font-weight:700;
                    letter-spacing:var(--tracking-widest);text-transform:uppercase;
                    color:var(--text-tertiary)">
          Track · Progress · Repeat
        </div>
      </div>

      <div style="width:100%;max-width:380px;margin:0 auto;display:flex;flex-direction:column;gap:var(--space-2)">
        ${users.length
          ? `<h2 class="section-label">${t('whos_training')}</h2>
             ${users.map(renderUserButton).join('')}
             <div style="height:1px;background:var(--line-subtle);margin:var(--space-4) 0"></div>`
          : ''}

        <h2 class="section-label">${users.length ? t('new_profile') : t('create_profile')}</h2>

        <input class="text-input"
               id="profile-name"
               placeholder="${t('your_name')}"
               autocomplete="given-name"
               data-input="profile:name"
               data-enter="profile:create"
               aria-label="${t('your_name')}">

        <button class="btn btn--primary btn--block" data-action="profile:create"
                style="margin-top:var(--space-2)">
          ${t('get_started')} ${icon('arrowRight', { size: 18 })}
        </button>
      </div>
    </div>`;
}

function renderUserButton(user) {
  const color = avatarColor(user.id);
  return `
    <button class="card card--interactive" data-action="profile:select" data-id="${user.id}"
            style="display:flex;align-items:center;gap:var(--space-4);width:100%;text-align:left">
      <span style="width:44px;height:44px;border-radius:var(--radius-pill);flex:none;
                   display:grid;place-items:center;
                   background:color-mix(in srgb, ${color} 18%, transparent);
                   border:1.5px solid color-mix(in srgb, ${color} 55%, transparent);
                   font-family:var(--font-display);font-size:var(--text-md);
                   letter-spacing:0.04em;color:${color}">
        ${esc(initials(user.name))}
      </span>
      <span style="flex:1;min-width:0">
        <span style="display:block;font-size:var(--text-md);font-weight:700;
                     overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
          ${esc(user.name)}
        </span>
        <span class="metric-label" style="display:block;margin-top:1px">${t('continue_')}</span>
      </span>
      <span style="color:var(--text-faint)">${icon('chevronRight', { size: 20 })}</span>
    </button>`;
}
