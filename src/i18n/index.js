/**
 * Translation.
 *
 * English is the source of truth: a missing French key falls back to the
 * English string rather than rendering a raw key at the user. In dev the
 * gap is logged so it gets fixed rather than silently shipped.
 */

import en from './en.js';
import fr from './fr.js';

const DICTIONARIES = { en, fr };
export const SUPPORTED_LANGUAGES = Object.keys(DICTIONARIES);

let current = 'en';

export function setLanguage(lang) {
  current = DICTIONARIES[lang] ? lang : 'en';
  localStorage.setItem('lifttrack_lang', current);
  document.documentElement.lang = current;
  return current;
}

export function getLanguage() {
  return current;
}

export function initLanguage() {
  const saved = localStorage.getItem('lifttrack_lang');
  if (saved && DICTIONARIES[saved]) return setLanguage(saved);
  // Fall back to the device language when we support it.
  const device = (navigator.language || 'en').slice(0, 2);
  return setLanguage(DICTIONARIES[device] ? device : 'en');
}

/**
 * Translate a key.
 * @param {string} key
 * @param {Record<string,string|number>} [vars] `{n:3}` replaces `{n}`
 */
export function t(key, vars) {
  const dict = DICTIONARIES[current] || en;
  let value = dict[key];

  if (value === undefined) {
    value = en[key];
    if (value !== undefined && import.meta.env?.DEV && current !== 'en') {
      console.warn(`[i18n] missing "${current}" translation for "${key}"`);
    }
  }
  if (value === undefined) {
    if (import.meta.env?.DEV) console.warn(`[i18n] unknown key "${key}"`);
    return key;
  }

  if (!vars) return value;
  return value.replace(/\{(\w+)\}/g, (m, name) => (name in vars ? String(vars[name]) : m));
}

/** Translate a session focus, falling back to the raw name for custom ones. */
export function tFocus(focus) {
  const dict = DICTIONARIES[current] || en;
  return dict[`f_${focus}`] || focus;
}

/** Localised short date, e.g. "6 Aug". */
export function formatDate(dateStr) {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString(
    current === 'fr' ? 'fr-FR' : 'en-GB',
    { day: 'numeric', month: 'short' },
  );
}

/** Localised month heading, e.g. "August 2026". */
export function formatMonth(yearMonth) {
  return new Date(`${yearMonth}-01T12:00:00`).toLocaleDateString(
    current === 'fr' ? 'fr-FR' : 'en-GB',
    { month: 'long', year: 'numeric' },
  );
}
