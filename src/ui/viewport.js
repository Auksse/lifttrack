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

/**
 * Height of the initial containing block — what `position: fixed; inset: 0`
 * resolves against, and therefore the real paintable area.
 *
 * On iOS with `viewport-fit=cover` this can exceed `window.innerHeight`:
 * the view genuinely spans the full screen while innerHeight still reports
 * the value from before the safe areas were surrendered. Sizing to
 * innerHeight in that state *creates* the dead band it was meant to remove.
 */
function measureContainingBlock() {
  if (!document.body) return 0;
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;inset:0;visibility:hidden;pointer-events:none;';
  document.body.appendChild(probe);
  const h = Math.round(probe.getBoundingClientRect().height);
  probe.remove();
  return h;
}

function measure() {
  // visualViewport excludes on-screen keyboards and browser chrome.
  const vv = window.visualViewport;
  const reported = Math.round(vv?.height ?? window.innerHeight);
  const icb = measureContainingBlock();

  // Take the larger. A keyboard shrinks visualViewport legitimately, but it
  // shrinks the containing block too, so this cannot wrongly ignore one.
  const height = Math.max(reported, icb);

  if (height > 0) {
    document.documentElement.style.setProperty('--app-height', `${height}px`);
  }

  applyEffectiveBottomInset(height);
  return height;
}

/**
 * Decide whether the bottom safe-area inset is real.
 *
 * `env(safe-area-inset-bottom)` reports 34px on a home-indicator iPhone
 * whether or not the web view actually reaches the bottom of the screen.
 * When iOS launches a home-screen app without honouring `viewport-fit=cover`
 * — which it does when the icon was added before the meta tag existed, since
 * the launch configuration is captured at install time — the view is short
 * by the status-bar height and the home indicator sits *outside* it.
 *
 * Padding for an indicator that is not in your viewport just wastes space:
 * on an 852pt screen with a 793pt view that was 59pt of unreachable screen
 * plus 34pt of pointless padding stacked on top of it.
 *
 * So: only honour the inset when the view genuinely spans the screen.
 */
function applyEffectiveBottomInset(height) {
  const screenHeight = window.screen?.height ?? 0;
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  // A 24px tolerance absorbs rounding and minor chrome without masking the
  // ~59px shortfall this is here to detect.
  const isShort = standalone && screenHeight > 0 && height < screenHeight - 24;

  document.documentElement.style.setProperty(
    '--safe-bottom-eff',
    isShort ? '0px' : 'env(safe-area-inset-bottom, 0px)',
  );
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

  /**
   * The initial containing block — what `position: fixed; inset: 0` actually
   * resolves against. This is the measurement that settles whether the web
   * view really is short, or whether `window.innerHeight` is under-reporting
   * a full-height view. They disagree on iOS more often than you would like.
   */
  const icbProbe = document.createElement('div');
  icbProbe.style.cssText =
    'position:fixed;inset:0;visibility:hidden;pointer-events:none;';
  document.body.appendChild(icbProbe);
  const icbHeight = Math.round(icbProbe.getBoundingClientRect().height);
  icbProbe.remove();

  return {
    innerHeight: window.innerHeight,
    visualViewport: window.visualViewport ? Math.round(window.visualViewport.height) : null,
    icbHeight,
    clientHeight: document.documentElement.clientHeight,
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
