/**
 * Haptics and audio cues.
 *
 * Two hard constraints shaped this file:
 *
 * 1. iOS Safari does not implement `navigator.vibrate` at all. Haptics only
 *    work on Android on the web, and on iOS once the app is wrapped in
 *    Capacitor (which exposes a native haptics plugin). So every call is
 *    guarded and degrades to silence rather than throwing.
 *
 * 2. Browsers refuse to play audio until the user has interacted with the
 *    page. We lazily create the AudioContext on the first real gesture and
 *    resume it if the browser suspended it.
 */

const PATTERNS = {
  tap: 8,
  select: 12,
  success: [14, 40, 22],
  warning: [22, 60, 22],
  error: [40, 70, 40],
  complete: [10, 30, 10, 30, 40],
};

let hapticsEnabled = true;
let soundEnabled = true;
let audioCtx = null;

export function setHapticsEnabled(on) { hapticsEnabled = !!on; }
export function setSoundEnabled(on) { soundEnabled = !!on; }
export function isHapticsSupported() {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
}

/**
 * Fire a haptic pattern. Silently no-ops where unsupported (notably iOS Safari).
 * @param {keyof PATTERNS} kind
 */
export function haptic(kind = 'tap') {
  if (!hapticsEnabled || !isHapticsSupported()) return;
  const pattern = PATTERNS[kind] ?? PATTERNS.tap;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* some browsers throw when the page is backgrounded — ignore */
  }
}

function ctx() {
  if (!soundEnabled) return null;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  if (!audioCtx) audioCtx = new Ctor();
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  return audioCtx;
}

/**
 * Synthesise a short tone. Synthesis rather than audio files keeps the
 * bundle small and means nothing extra has to be cached for offline use.
 */
function tone(freq, duration = 0.12, { type = 'sine', gain = 0.14, delay = 0 } = {}) {
  const ac = ctx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  const t0 = ac.currentTime + delay;

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);

  // Short attack, exponential release — reads as a "tick" not a "beep".
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  osc.connect(amp).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

export const sound = {
  /** A set was ticked off. */
  setComplete() {
    if (!soundEnabled) return;
    tone(880, 0.09, { gain: 0.10 });
  },
  /** Rest timer reached zero — deliberately the most attention-grabbing cue. */
  restOver() {
    if (!soundEnabled) return;
    tone(660, 0.16, { type: 'triangle', gain: 0.18 });
    tone(990, 0.22, { type: 'triangle', gain: 0.18, delay: 0.18 });
  },
  /** New personal record. */
  personalRecord() {
    if (!soundEnabled) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      tone(f, 0.18, { type: 'triangle', gain: 0.15, delay: i * 0.085 }),
    );
  },
  /** Workout saved. */
  saved() {
    if (!soundEnabled) return;
    tone(587.33, 0.11, { gain: 0.12 });
    tone(880, 0.16, { gain: 0.12, delay: 0.1 });
  },
};

/** Combined cue — the common case is wanting both at once. */
export function cue(kind) {
  switch (kind) {
    case 'setComplete': haptic('success'); sound.setComplete(); break;
    case 'restOver':    haptic('complete'); sound.restOver(); break;
    case 'pr':          haptic('complete'); sound.personalRecord(); break;
    case 'saved':       haptic('success'); sound.saved(); break;
    case 'error':       haptic('error'); break;
    default:            haptic('tap');
  }
}

/**
 * Unlock audio on the first user gesture. Safari in particular will not
 * allow an AudioContext to start outside of one.
 */
export function primeAudio() {
  const unlock = () => {
    ctx();
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
  };
  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });
}
