import { renderHook, act } from '@testing-library/react';
import { useTheme } from './useTheme';

describe('useTheme', () => {
  let storage;

  beforeEach(() => {
    storage = {};
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) =>
      Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null
    );
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      storage[key] = value;
    });
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('uses localStorage when darkMode is cached', () => {
    storage.darkMode = 'true';
    const { result } = renderHook(() => useTheme());
    expect(result.current[0]).toBe(true);
  });

  test('falls back to prefers-color-scheme when nothing is cached', () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    try {
      const { result } = renderHook(() => useTheme());
      expect(result.current[0]).toBe(true);
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

  test('falls back to matchMedia when localStorage getItem throws (e.g. privacy mode)', () => {
    const originalMatchMedia = window.matchMedia;
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('denied');
    });
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    try {
      const { result } = renderHook(() => useTheme());
      expect(result.current[0]).toBe(true);
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

  test('persists dark class and localStorage when toggling', () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current[1](true);
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(storage.darkMode).toBe('true');

    act(() => {
      result.current[1](false);
    });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(storage.darkMode).toBe('false');
  });
});
