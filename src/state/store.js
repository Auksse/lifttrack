/**
 * Application state.
 *
 * A single mutable state object plus a scheduled re-render. The previous
 * architecture called `render()` synchronously from ~90 different inline
 * handlers, so a single interaction could rebuild the entire DOM several
 * times in a row. Here every mutation marks the app dirty and one render
 * runs per animation frame.
 */

const listeners = new Set();
let frame = null;

export const state = {
  // --- session / navigation ---
  ready: false,
  loading: false,
  tab: 'log',              // log | plan | muscles | stats
  user: null,
  users: [],

  // --- data ---
  sessions: [],
  templates: [],

  // --- active workout ---
  /** @type {null | {date:string, focus:string, exercises:Array, startedAt:number, templateFrom:?string}} */
  workout: null,
  restEndsAt: null,
  restDuration: 0,

  // --- transient UI ---
  /**
   * Index of an exercise card the next render should scroll into view.
   * Set when a superset auto-advances; cleared by the render that uses it.
   */
  scrollToEx: null,
  expandedSessionId: null,
  /** Recovery group whose per-muscle breakdown is open, by group id. */
  expandedMuscleGroup: null,
  sheet: null,             // null | {type, props}
  /**
   * Working copy of the session being edited. Edits are applied here and
   * only written through the repository on save, so backing out of the
   * sheet cannot half-modify a logged session.
   */
  sessionEdit: null,
  lang: 'en',
  settings: {
    haptics: true,
    sound: true,
    units: 'kg',
  },
};

/** Subscribe to state changes. Returns an unsubscribe function. */
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Mark the app dirty. Multiple calls in the same frame coalesce into a
 * single render.
 */
export function invalidate() {
  if (frame !== null) return;
  frame = requestAnimationFrame(() => {
    frame = null;
    listeners.forEach((fn) => fn(state));
  });
}

/** Shallow-merge a patch into state and schedule a render. */
export function setState(patch) {
  Object.assign(state, patch);
  invalidate();
}

/** Mutate state imperatively, then schedule a render. */
export function update(fn) {
  fn(state);
  invalidate();
}

/** Force a synchronous render — only for cases where a frame of delay
 *  would be visible, such as focusing an input straight after render. */
export function flush() {
  if (frame !== null) {
    cancelAnimationFrame(frame);
    frame = null;
  }
  listeners.forEach((fn) => fn(state));
}
