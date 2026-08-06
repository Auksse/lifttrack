# LiftTrack

Offline-first strength training log. Installable to the iOS home screen;
built to be wrapped with Capacitor for TestFlight later.

**Live:** https://auksse.github.io/lifttrack/

---

## Stack

There is **no backend**. No Supabase, no Postgres, no server of any kind —
an earlier version of this README said otherwise and was wrong.

| Layer   | What it actually is                                    |
|---------|--------------------------------------------------------|
| Language| Vanilla JavaScript, ES modules                          |
| Build   | Vite 7                                                  |
| UI      | Template literals rendered into `innerHTML`. No framework. |
| Styling | Plain CSS with custom-property design tokens            |
| Data    | IndexedDB (sessions) + localStorage (profiles, settings) |
| Offline | `vite-plugin-pwa` / Workbox — everything precached      |
| Fonts   | `@fontsource`, self-hosted. Nothing loaded from a CDN.  |

Your training data never leaves the device. That's a deliberate choice for
now, but all data access goes through a repository interface
([`src/data/repository.js`](src/data/repository.js)) so cloud sync can be
added later as a second implementation rather than a rewrite.

---

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build → dist/
npx vite preview --port 8899
```

The service worker is off in dev so you never fight a stale cache. To test
offline behaviour, build and use `vite preview`.

---

## What it does

**Log** — history, per-session volume, PR detection, and the button that
starts a workout.

**Workout** — the set-entry screen. Sets pre-fill with the progression
target, tick to complete, which fires haptics and auto-starts the rest
timer. Numeric keypads, no viewport zoom, nothing floating over your sets.

**Muscles** — recovery, weekly volume, and the exercise library. Every
logged set deposits stimulus into the muscles that exercise trains,
weighted by involvement score, decaying over time with longer half-lives
for larger groups. What's left is fatigue; what's missing is readiness.
That drives a *Train Next* recommendation instead of a fixed rotation.
Volume is counted in hard sets per muscle per week against 10–20 set
landmarks.

**Stats** — volume trend, session split, per-exercise progression
(estimated 1RM, top weight, volume) and an all-time PR table.

**Plan** — training calendar and template management.

Fully bilingual (EN/FR).

---

## Docs

- [`CLAUDE.md`](CLAUDE.md) — architecture and the rules that matter
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — how a push reaches the phone,
  and what's still blocking TestFlight
- [`BOXING_PROGRAM.md`](BOXING_PROGRAM.md) — the active training program

---

## Deploying

Push to `main`. GitHub Actions builds and publishes to Pages at the same URL
the home-screen app is installed at, so the installed app updates in place —
no re-install, no re-adding to the home screen.

**One-time setup:** Settings → Pages → Source → **GitHub Actions**.
See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).
