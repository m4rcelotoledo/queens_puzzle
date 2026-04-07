import '@testing-library/jest-dom';

// Firebase mocks
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => ({})),
}));

jest.mock('firebase/analytics', () => ({
  getAnalytics: jest.fn(() => ({})),
  logEvent: jest.fn(),
  isSupported: jest.fn(() => Promise.resolve(true)),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  onAuthStateChanged: jest.fn(() => jest.fn()),
  GoogleAuthProvider: jest.fn(() => ({})),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  getIdTokenResult: jest.fn(() => Promise.resolve({ claims: { isAllowed: true } })),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  doc: jest.fn(() => ({})),
  setDoc: jest.fn(() => Promise.resolve()),
  onSnapshot: jest.fn(() => jest.fn()),
  collection: jest.fn(() => ({})),
  query: jest.fn(() => ({})),
}));

// localStorage mock
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// matchMedia mock — width-aware for (min-width: 768px) / (max-width: 767px); prefers-color-scheme stays false
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => {
    const width = typeof window.innerWidth === 'number' ? window.innerWidth : 1024;
    return {
      get matches() {
        if (query.includes('(min-width: 768px)')) return width >= 768;
        if (query.includes('(max-width: 767px)')) return width <= 767;
        if (query.includes('prefers-color-scheme')) return false;
        return false;
      },
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    };
  }),
});

// JSDOM may omit ResizeObserver; tests and AppHeader rely on a minimal implementation
if (typeof global.ResizeObserver === 'undefined') {
  global.ResizeObserver = class ResizeObserver {
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
global.import = {
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
    }
  }
};
