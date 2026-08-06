/**
 * Event delegation.
 *
 * The old app wired every interaction with an inline `onclick="doThing()"`,
 * which forced all ~90 handlers to be globals on `window`. That is
 * incompatible with ES modules, and it meant any string interpolated into
 * markup could execute as code.
 *
 * Instead, markup declares intent:
 *
 *     <button data-action="set:toggle" data-ex="2" data-set="1">
 *
 * and handlers register here. One listener on the document handles clicks
 * for the whole app, so re-rendering never has to re-bind anything.
 */

import { haptic } from './feedback.js';

const clickHandlers = new Map();
const inputHandlers = new Map();
const changeHandlers = new Map();

/** Register a click/tap handler. `fn(dataset, event, element)`. */
export function onAction(name, fn) {
  clickHandlers.set(name, fn);
}

/** Register an `input` handler (fires on every keystroke). */
export function onInput(name, fn) {
  inputHandlers.set(name, fn);
}

/** Register a `change` handler (fires on commit/blur). */
export function onChange(name, fn) {
  changeHandlers.set(name, fn);
}

export function registerActions(map) {
  Object.entries(map).forEach(([name, fn]) => onAction(name, fn));
}

/**
 * Elements that should not produce the default light tap haptic —
 * either because they fire their own richer cue, or because a haptic on
 * every keystroke would be maddening.
 */
const SILENT = new Set(['set:toggle', 'set:input', 'workout:save']);

export function installDelegation(root = document) {
  root.addEventListener(
    'click',
    (event) => {
      const el = event.target.closest('[data-action]');
      if (!el) return;
      const name = el.dataset.action;
      const fn = clickHandlers.get(name);
      if (!fn) {
        if (import.meta.env?.DEV) console.warn(`[actions] no handler for "${name}"`);
        return;
      }
      event.preventDefault();
      if (!SILENT.has(name)) haptic('tap');
      fn(el.dataset, event, el);
    },
    // Capture phase would fire before inputs commit their value; stay on bubble.
    false,
  );

  root.addEventListener('input', (event) => {
    const el = event.target.closest('[data-input]');
    if (!el) return;
    const fn = inputHandlers.get(el.dataset.input);
    if (fn) fn(el.value, el.dataset, el);
  });

  root.addEventListener('change', (event) => {
    const el = event.target.closest('[data-change]');
    if (!el) return;
    const fn = changeHandlers.get(el.dataset.change);
    if (fn) fn(el.value, el.dataset, el);
  });

  // Enter in a text field commits and moves on rather than submitting nothing.
  root.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    const el = event.target.closest('[data-enter]');
    if (!el) return;
    const fn = clickHandlers.get(el.dataset.enter);
    if (fn) {
      event.preventDefault();
      fn(el.dataset, event, el);
    }
  });
}

/**
 * Escape text for safe interpolation into markup.
 * Exercise names are user-supplied and end up inside attributes.
 */
export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
