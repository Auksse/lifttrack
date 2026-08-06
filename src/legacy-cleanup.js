/**
 * One-time handover from the pre-Vite app.
 *
 * The previously deployed version registered a hand-written service worker
 * that cached under the name `lifttrack-v5`, and stored its data under
 * localStorage keys the new app still reads. Two things have to happen when
 * an already-installed home-screen app loads this build for the first time:
 *
 *  1. The old Cache Storage entries must go. Workbox's `cleanupOutdatedCaches`
 *     only prunes caches *it* created, so a hand-rolled cache would sit there
 *     indefinitely — and because the old worker served `index.html` from it,
 *     the stale app could keep booting.
 *
 *  2. Any service worker registration whose script is not the new `sw.js`
 *     must be unregistered, otherwise two workers compete for the same scope.
 *
 * Both are safe to run on every load; both are no-ops once done.
 */

const LEGACY_CACHE_PREFIX = 'lifttrack-';

export async function cleanUpLegacyServiceWorker() {
  if (!('caches' in window)) return;

  try {
    const names = await caches.keys();
    const stale = names.filter((name) => name.startsWith(LEGACY_CACHE_PREFIX));
    if (stale.length) {
      await Promise.all(stale.map((name) => caches.delete(name)));
      console.info(`[migration] removed ${stale.length} legacy cache(s):`, stale.join(', '));
    }
  } catch (err) {
    // Never let cache cleanup stop the app from starting.
    console.warn('[migration] cache cleanup failed', err);
  }

  if (!('serviceWorker' in navigator)) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations.map(async (registration) => {
        const scriptURL =
          registration.active?.scriptURL ||
          registration.installing?.scriptURL ||
          registration.waiting?.scriptURL ||
          '';

        // The new worker is emitted by vite-plugin-pwa as `sw.js`, and it is
        // the only one we keep. Anything else is from the previous build.
        const isCurrent = /\/sw\.js(\?|$)/.test(scriptURL);
        if (!isCurrent && scriptURL) {
          await registration.unregister();
          console.info('[migration] unregistered legacy worker:', scriptURL);
        }
      }),
    );
  } catch (err) {
    console.warn('[migration] worker cleanup failed', err);
  }
}

/**
 * Reload once when a new service worker takes control, so the running page
 * is actually the version that was just installed. Guarded so it can only
 * ever fire once per page load — without the guard, `controllerchange` can
 * loop the app.
 */
export function reloadOnWorkerActivation() {
  if (!('serviceWorker' in navigator)) return;

  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  });
}
