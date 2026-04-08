import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Firebase mocks
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getApps: vi.fn(() => []),
  getApp: vi.fn(() => ({})),
}));

vi.mock('firebase/analytics', () => ({
  getAnalytics: vi.fn(() => ({})),
  logEvent: vi.fn(),
  isSupported: vi.fn(() => Promise.resolve(true)),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn(() => vi.fn()),
  // Must be constructable: `new GoogleAuthProvider()` in useAuth
  GoogleAuthProvider: vi.fn(function GoogleAuthProvider() {
    return {};
  }),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  getIdTokenResult: vi.fn(() => Promise.resolve({ claims: { isAllowed: true } })),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn(() => ({})),
  setDoc: vi.fn(() => Promise.resolve()),
  onSnapshot: vi.fn(() => vi.fn()),
  collection: vi.fn(() => ({})),
  query: vi.fn(() => ({})),
}));

// Use jsdom's Storage so tests can spy on Storage.prototype (see useTheme.test.js).

// matchMedia mock — width-aware for (min-width: 768px) / (max-width: 767px); prefers-color-scheme stays false
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => {
    return {
      get matches() {
        const width = typeof window.innerWidth === 'number' ? window.innerWidth : 1024;
        if (query.includes('(min-width: 768px)')) return width >= 768;
        if (query.includes('(max-width: 767px)')) return width <= 767;
        if (query.includes('prefers-color-scheme')) return false;
        return false;
      },
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  }),
});

// JSDOM may omit ResizeObserver; tests and AppHeader rely on a minimal implementation
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    constructor(callback) {
      this.callback = callback;
    }

    observe(element) {
      queueMicrotask(() => {
        const w =
          element?.offsetWidth ||
          element?.getBoundingClientRect?.()?.width ||
          0;
        const fallback =
          typeof window !== 'undefined' && window.innerWidth > 0 ? window.innerWidth : 480;
        const width = w > 0 ? w : fallback;
        this.callback([{ contentRect: { width, height: 40 } }], this);
      });
    }

    unobserve() {}

    disconnect() {}
  };
}

// Environment variables mock
process.env.VITE_FIREBASE_API_KEY = 'test-api-key';
process.env.VITE_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
process.env.VITE_FIREBASE_PROJECT_ID = 'test-project';
process.env.VITE_FIREBASE_STORAGE_BUCKET = 'test.appspot.com';
process.env.VITE_FIREBASE_MESSAGING_SENDER_ID = '123456789';
process.env.VITE_FIREBASE_APP_ID = '1:123456789:web:test';
process.env.VITE_FIREBASE_MEASUREMENT_ID = 'G-TEST';
// import.meta.env mock (matches Vite client; version used by AppFooter)
globalThis.import = {
  meta: {
    env: {
      VITE_FIREBASE_API_KEY: 'test-api-key',
      VITE_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID: 'test-project',
      VITE_FIREBASE_STORAGE_BUCKET: 'test.appspot.com',
      VITE_FIREBASE_MESSAGING_SENDER_ID: '123456789',
      VITE_FIREBASE_APP_ID: '1:123456789:web:test',
      VITE_FIREBASE_MEASUREMENT_ID: 'G-TEST',
      VITE_APP_VERSION: '0.0.0-test',
    },
  },
};
