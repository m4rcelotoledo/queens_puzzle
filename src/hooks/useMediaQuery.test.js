import { renderHook, act } from '@testing-library/react';
import { useMediaQuery } from './useMediaQuery';

describe('useMediaQuery', () => {
  test('returns true for min-width 768px when window is wide', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(true);
  });

  test('returns false for min-width 768px when window is narrow', () => {
    const prev = window.innerWidth;
    window.innerWidth = 480;
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);
    window.innerWidth = prev;
  });

  test('updates when the media query listener fires', () => {
    let changeHandler;
    const original = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      get matches() {
        return query === '(min-width: 768px)' ? window.innerWidth >= 768 : false;
      },
      media: query,
      addEventListener: vi.fn((_, cb) => {
        changeHandler = cb;
      }),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    window.innerWidth = 1024;
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(true);

    window.innerWidth = 400;
    act(() => {
      changeHandler();
    });
    expect(result.current).toBe(false);

    window.matchMedia = original;
    window.innerWidth = 1024;
  });
});
