# Deployment

## Web alpha (GitHub Pages)

The app deploys to **https://auksse.github.io/lifttrack/** — the same URL the
existing home-screen icon points at. Pushing to `main` updates the app already
installed on the phone. No re-install, no re-adding to the home screen.

### One-time setup — you must do this once

GitHub cannot switch this from a commit, so it needs one manual change:

> **GitHub → repo Settings → Pages → Build and deployment → Source**
> Change **"Deploy from a branch"** → **"GitHub Actions"**

Until that's switched, [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)
will build successfully but the deploy step will fail.

### After that

```
git push origin main    →  Actions builds  →  Pages publishes  →  phone updates
```

Takes roughly 60–90 seconds end to end.

---

## How the update reaches an already-installed home-screen app

This is the part that's easy to get wrong, so it's worth stating explicitly.

The previously deployed version registered a **hand-written service worker**
that cached under the name `lifttrack-v5`. A service worker will happily serve
its cached copy of the old app forever. Three things make the handover work:

1. **`skipWaiting` + `clientsClaim`** ([`vite.config.js`](../vite.config.js)) —
   the new worker activates immediately instead of waiting for every tab to
   close. An iOS home-screen app is rarely truly closed, so without this the
   old version could persist for days.

2. **Legacy cache eviction** ([`src/legacy-cleanup.js`](../src/legacy-cleanup.js)) —
   Workbox's `cleanupOutdatedCaches` only prunes caches *it* created. The old
   hand-rolled `lifttrack-*` caches are deleted explicitly, and any service
   worker that isn't the current `sw.js` is unregistered.

3. **Stable manifest `id`** — set to `/lifttrack/` and it must never change.
   Without a stable id, a browser can decide an updated manifest describes a
   *different* app, which orphans the existing icon.

### What to expect on the phone

- **First launch after a deploy:** you may briefly see the old app, then it
  reloads itself into the new one. That reload is
  `reloadOnWorkerActivation()` doing its job — it fires once, never loops.
- **If it seems stuck on the old version:** swipe up to fully close the app
  (not just background it) and reopen. iOS keeps standalone web apps alive
  aggressively.
- **The icon artwork will not change.** iOS bakes the icon in at install time.
  The icons here are unchanged, so this doesn't matter — but it does mean a
  future icon redesign requires removing and re-adding to the home screen.
- **Your training data is safe.** It lives in IndexedDB keyed by profile, which
  the service worker never touches. The v1→v2 database upgrade adds an index
  and backfills existing rows.

---

## iOS App Store (TestFlight) — not yet possible

Blocked on two things that require you, not the codebase:

1. **An Apple Developer account** ($99/year)
2. **A machine that can build iOS** — Xcode is macOS-only

[`capacitor.config.json`](../capacitor.config.json) is written and ready. Once
you have both, the sequence is:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios
npm install @capacitor/haptics @capacitor/status-bar @capacitor/keyboard
npm run build
npx cap add ios
npx cap sync ios
npx cap open ios        # requires macOS + Xcode
```

Then in Xcode: set the team, bump the build number, Product → Archive,
and distribute to TestFlight.

### If you have the account but no Mac

A cloud macOS builder works — Codemagic and Expo EAS both build Capacitor iOS
projects. You still supply the Apple credentials and signing certificates; the
service rents you the Mac. Budget a paid CI tier.

### One code change needed at that point

[`src/ui/feedback.js`](../src/ui/feedback.js) currently uses the web
`navigator.vibrate` API, which **iOS Safari does not implement** — haptics are
silently inert on iPhone today. Inside a Capacitor shell, swap the `haptic()`
implementation for `@capacitor/haptics`. The function is already isolated for
exactly this reason; nothing else has to change.

---

## Local development

```bash
npm install
npm run dev              # http://localhost:5173, hot reload
npm run build            # production build into dist/
npx vite preview --port 8899
```

The service worker is disabled in dev (`devOptions.enabled: false`) so you
never fight a stale cache while working. To test offline behaviour, use
`npm run build` + `vite preview`.
