import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  /**
   * Relative base so the built app runs from any path — the site root,
   * a GitHub Pages project subpath, or the `capacitor://` origin inside
   * the iOS shell. The previous build hardcoded `/lifttrack/`, which is
   * why the service worker 404'd everywhere except GitHub Pages.
   */
  base: './',

  build: {
    outDir: 'dist',
    target: 'es2020',
    sourcemap: true,
    rollupOptions: {
      output: {
        /**
         * The exercise database and Chart.js are both large and change
         * rarely. Splitting them out means a normal app update doesn't
         * force users to re-download either.
         */
        manualChunks(id) {
          if (id.includes('/src/data/exercise-db')) return 'exercise-db';
          if (id.includes('node_modules/chart.js')) return 'charts';
          return undefined;
        },
      },
    },
  },

  server: { port: 5173, host: true },

  plugins: [
    VitePWA({
      /**
       * autoUpdate, not prompt.
       *
       * There is already a LiftTrack PWA installed on the user's home screen
       * running a hand-written service worker (`lifttrack-v5`). With `prompt`
       * the new worker would sit in "waiting" until every tab closed — and an
       * iOS home-screen app is rarely truly closed, so the old app could
       * persist for days. `autoUpdate` + skipWaiting + clientsClaim makes the
       * new worker take over on the next launch.
       */
      registerType: 'autoUpdate',
      injectRegister: 'auto',

      /**
       * Everything the app needs offline is precached, including the
       * self-hosted fonts. Nothing is fetched from a CDN at runtime —
       * the old build pulled Chart.js from jsDelivr and the three
       * typefaces from Google Fonts, so a gym basement meant an
       * unstyled, chartless app.
       */
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,png,svg,ico,webmanifest}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',

        // Activate immediately and take control of the already-open
        // home-screen app rather than waiting for it to be closed.
        skipWaiting: true,
        clientsClaim: true,
      },

      includeAssets: ['icon-180.png', 'icon-192.png', 'icon-512.png'],

      manifest: {
        /**
         * `id` pins the app's identity across manifest changes. Without it a
         * browser can decide an updated manifest describes a *different* app,
         * which would mean the existing home-screen icon stops updating and a
         * second one appears. It must never change.
         */
        id: '/lifttrack/',
        name: 'LiftTrack — Strength Training Log',
        short_name: 'LiftTrack',
        description: 'Offline-first strength training log with progressive overload tracking.',
        theme_color: '#0c0b0a',
        background_color: '#0c0b0a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        categories: ['health', 'fitness', 'lifestyle'],
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },

      devOptions: { enabled: false },
    }),
  ],
});
