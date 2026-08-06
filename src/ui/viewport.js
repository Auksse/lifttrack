/**
 * Viewport height, measured rather than assumed.
 *
 * Three CSS units claim to be "the height of the screen" and on iOS all
 * three can be wrong at different moments:
 *
 *   100vh   the *largest* viewport — ignores browser chrome entirely, so
 *           in Safari it overflows below the fold.
 *   100dvh  tracks the visible viewport, but iOS updates it lazily around
 *           orientation changes, standalone launch and keyboard dismissal,
 *           and it has been observed reporting the pre-launch size on the
 *           first paint of a home-screen app.
 *   100%    resolves against the containing block, which for a fixed
 *           element is the initial containing block — not the visible area.
 *
 * `window.innerHeight` is the value that has actually been right in every
 * case, and `visualViewport.height` is better still when it exists. So we
 * measure and publish it as `--app-height`, keeping `100dvh` as the
 * pre-JS fallback.
 *
 * This is why the layout letterboxed on device: roughly 90pt of dead space
 * below the dock that no amount of CSS-only reasoning could reproduce in a
 * desktop browser, because desktop browsers get all three units right.
 */

let raf = null;

function measure() {
  // visualViewport excludes on-screen keyboards and browser chrome.
  const vv = window.visualViewport;
  const height = Math.round(vv?.height ?? window.innerHeight);
  if (height > 0) {
    document.documentElement.style.setProperty('--app-height', `${height}px`);
  }
  return height;
}

function scheduleMeasure() {
  if (raf !== null) return;
  raf = requestAnimationFrame(() => {
    raf = null;
    measure();
  });
}

export function initViewport() {
  measure();

  window.addEventListener('resize', scheduleMeasure);
  window.addEventListener('orientationchange', () => {
    // iOS reports stale dimensions during the rotation animation; re-measure
    // after it settles as well as immediately.
    scheduleMeasure();
    setTimeout(measure, 350);
  });

  window.visualViewport?.addEventListener('resize', scheduleMeasure);

  // A standalone home-screen app can paint before iOS has finalised its
  // window size. Re-measure once the page is fully loaded.
  window.addEventListener('pageshow', scheduleMeasure);
  if (document.readyState !== 'complete') {
    window.addEventListener('load', scheduleMeasure, { once: true });
  }
}

/**
 * Everything the layout depends on, for the Settings diagnostic. Reading
 * the safe-area insets requires a probe element — `env()` is not visible
 * to getComputedStyle on the root.
 */
export function viewportReport() {
  const probe = document.createElement('div');
  probe.style.cssText = `
    position: fixed; visibility: hidden; pointer-events: none;
    top: env(safe-area-inset-top, 0px);
    right: env(safe-area-inset-right, 0px);
    bottom: env(safe-area-inset-bottom, 0px);
    left: env(safe-area-inset-left, 0px);
  `;
  document.body.appendChild(probe);
  const cs = getComputedStyle(probe);
  const insets = {
    top: cs.top,
    right: cs.right,
    bottom: cs.bottom,
    left: cs.left,
  };
  probe.remove();

  const appEl = document.getElementById('app');
  const dockEl = document.querySelector('.dock');

  return {
    innerHeight: window.innerHeight,
    visualViewport: window.visualViewport ? Math.round(window.visualViewport.height) : null,
    screenHeight: window.screen?.height ?? null,
    appHeight: appEl ? Math.round(appEl.getBoundingClientRect().height) : null,
    dockBottom: dockEl ? Math.round(dockEl.getBoundingClientRect().bottom) : null,
    appHeightVar: getComputedStyle(document.documentElement)
      .getPropertyValue('--app-height').trim() || '(unset)',
    insets,
    standalone: window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true,
    dpr: window.devicePixelRatio,
  };
}
