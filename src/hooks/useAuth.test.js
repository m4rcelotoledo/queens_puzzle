import { renderHook, waitFor, act } from '@testing-library/react';
import * as firebaseApp from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

vi.mock('../utils/scheduleIdleTask', () => ({
  scheduleIdleTask: (fn) => fn(),
}));

vi.mock('firebase/analytics', () => ({
  getAnalytics: vi.fn(),
  isSupported: vi.fn(() => Promise.resolve(false)),
}));

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    firebaseApp.getApps.mockReturnValue([]);
    firebaseAuth.onAuthStateChanged.mockImplementation((_auth, callback) => {
      queueMicrotask(() => callback(null));
      return vi.fn();
    });
    firebaseAuth.getIdTokenResult.mockResolvedValue({ claims: { isAllowed: false } });
  });

  test('transitions to LOGIN when there is no user', async () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.appStatus).toBe('LOADING_AUTH');

    await waitFor(() => {
      expect(result.current.appStatus).toBe('LOGIN');
    });
    expect(result.current.user).toBeNull();
    expect(result.current.isAllowed).toBe(false);
  });

  test('sets user and LOADING_DATA when signed in', async () => {
    const mockUser = { uid: 'u1', getIdToken: vi.fn() };
    firebaseAuth.getIdTokenResult.mockResolvedValue({ claims: { isAllowed: true } });
    firebaseAuth.onAuthStateChanged.mockImplementation((_auth, callback) => {
      queueMicrotask(() => callback(mockUser));
      return vi.fn();
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.user).toBe(mockUser);
      expect(result.current.isAllowed).toBe(true);
      expect(result.current.appStatus).toBe('LOADING_DATA');
    });
  });

  test('uses getApp when Firebase app already exists (Strict Mode / HMR safe)', () => {
    firebaseApp.getApps.mockReturnValue([{ name: '[DEFAULT]' }]);
    firebaseApp.getApp.mockReturnValue({ name: 'reused' });
    firebaseAuth.onAuthStateChanged.mockImplementation(() => vi.fn());

    renderHook(() => useAuth());

    expect(firebaseApp.initializeApp).not.toHaveBeenCalled();
    expect(firebaseApp.getApp).toHaveBeenCalled();
  });

  test('on token refresh failure shows toast and returns to LOGIN', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockUser = { uid: 'u1' };
    firebaseAuth.getIdTokenResult.mockRejectedValueOnce(new Error('network'));
    firebaseAuth.onAuthStateChanged.mockImplementation((_auth, callback) => {
      queueMicrotask(() => callback(mockUser));
      return vi.fn();
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro de sincronização. Por favor refaça o login.');
      expect(result.current.appStatus).toBe('LOGIN');
      expect(result.current.user).toBeNull();
    });
    errSpy.mockRestore();
  });

  test('handleLogin sets auth error on unauthorized-domain', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    firebaseAuth.onAuthStateChanged.mockImplementation(() => vi.fn());
    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.auth).toBeTruthy();
    });

    firebaseAuth.signInWithPopup.mockRejectedValueOnce({
      code: 'auth/unauthorized-domain',
      message: 'unauthorized',
    });

    await act(async () => {
      await result.current.handleLogin();
    });

    expect(result.current.authError).toMatch(/not authorized/i);
    errSpy.mockRestore();
  });

  test('handleLogin sets generic auth error on other failures', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    firebaseAuth.onAuthStateChanged.mockImplementation(() => vi.fn());
    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.auth).toBeTruthy();
    });

    firebaseAuth.signInWithPopup.mockRejectedValueOnce(new Error('network'));

    await act(async () => {
      await result.current.handleLogin();
    });

    expect(result.current.authError).toMatch(/try again/i);
    errSpy.mockRestore();
  });

  test('handleLogout calls signOut when auth exists', async () => {
    firebaseAuth.onAuthStateChanged.mockImplementation(() => vi.fn());
    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.auth).toBeTruthy();
    });

    firebaseAuth.signOut.mockResolvedValue(undefined);
    await act(async () => {
      await result.current.handleLogout();
    });

    expect(firebaseAuth.signOut).toHaveBeenCalled();
  });
});
