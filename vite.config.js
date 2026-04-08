import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'))

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Vitest runs with mode "test" (not process.env.VITEST alone) — stable vs dev/build.
  const isVitest = mode === 'test'

  /** Fixed version in tests for stable assertions (e.g. AppFooter). */
  const viteAppVersion = isVitest ? '0.0.0-test' : pkg.version

  const stubCssInTests = isVitest
    ? [
        {
          name: 'vitest-stub-css',
          enforce: 'pre',
          load(id) {
            const pathOnly = id.split('?')[0]
            if (pathOnly.endsWith('.css')) {
              return 'export default {}'
            }
          },
        },
      ]
    : []

  return {
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(viteAppVersion),
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    build: {
      // Fewer legacy polyfills in the bundle; targets evergreen browsers
      target: 'es2020',
      rollupOptions: {
        output: {
          // Split heavy vendors so no single chunk exceeds the default warning threshold;
          // total download size is similar, but caching and parallel loading improve.
          manualChunks(id) {
            if (!id.includes('node_modules')) return
            if (id.includes('firebase')) return 'vendor-firebase'
            if (id.includes('framer-motion')) return 'vendor-framer-motion'
            if (
              id.includes('/react/') ||
              id.includes('react-dom') ||
              id.includes('node_modules/scheduler')
            ) {
              return 'vendor-react'
            }
          },
        },
      },
    },
    plugins: [
      react(),
      ...stubCssInTests,
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          cleanupOutdatedCaches: true,
          navigateFallback: '/index.html',
          // Firebase / Google APIs must stay fresh — never cache auth or Firestore traffic
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-stylesheets',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
            {
              urlPattern: /^https:\/\/(www\.googleapis\.com|securetoken\.googleapis\.com|identitytoolkit\.googleapis\.com|firestore\.googleapis\.com)\/.*/i,
              handler: 'NetworkOnly',
            },
            {
              urlPattern: /^https:\/\/[-a-zA-Z0-9.]*\.firebaseio\.com\/.*/i,
              handler: 'NetworkOnly',
            },
            {
              urlPattern: /^https:\/\/[-a-zA-Z0-9.]*\.google\.com\/.*/i,
              handler: 'NetworkOnly',
            },
          ],
        },
        manifest: {
          name: 'Placar - Puzzle das Rainhas',
          short_name: 'Queens Placar',
          description: 'Ranking e tempos do puzzle Queens',
          theme_color: '#4f46e5',
          background_color: '#f3f4f6',
          display: 'standalone',
          orientation: 'portrait-primary',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: 'pwa-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
      }),
    ],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/setupVitest.js'],
      include: ['src/**/*.{test,spec}.{js,jsx}'],
      css: false,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        reportsDirectory: './coverage',
        all: true,
        include: [
          'src/components/**/*.{js,jsx}',
          'src/utils/**/*.{js,jsx}',
          'src/main.jsx',
        ],
        exclude: [
          'node_modules/',
          '**/*.test.{js,jsx}',
          '**/*.spec.{js,jsx}',
          'src/setupVitest.js',
          'src/index.css',
          '**/*.config.{js,jsx}',
          'src/components/LoadingScreen.jsx',
          'src/components/LoginScreen.jsx',
        ],
        thresholds: {
          lines: 95,
          statements: 95,
          functions: 95,
        },
      },
      reporters: [
        'default',
        ['junit', { outputFile: './coverage/junit.xml' }],
      ],
      pool: 'forks',
    },
  }
})
