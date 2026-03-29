import { renderHook, waitFor, act } from '@testing-library/react';
import { toast } from 'sonner';
import { useGameData } from '../../../src/hooks/useGameData';

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}));

const mockOnSnapshot = jest.fn();

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(() => ({ path: 'artifacts/queens-puzzle/config/players' })),
  collection: jest.fn(() => ({ path: 'scores' })),
  query: jest.fn((q) => q),
  onSnapshot: (...args) => mockOnSnapshot(...args),
}));

describe('useGameData', () => {
  const setAppStatus = jest.fn();
  const db = {};

  beforeEach(() => {
    jest.clearAllMocks();
    let snapshotCall = 0;
    mockOnSnapshot.mockImplementation((refOrQuery, onNext, onError) => {
      snapshotCall += 1;
      if (snapshotCall === 1) {
        return jest.fn();
      }
      return jest.fn();
    });
  });

  test('does not subscribe when appStatus is not LOADING_DATA', () => {
    mockOnSnapshot.mockClear();
    renderHook(() => useGameData(db, 'LOGIN', setAppStatus, true));
    expect(mockOnSnapshot).not.toHaveBeenCalled();
  });

  test('sets READY when players document exists', async () => {
    const unsubPlayers = jest.fn();
    const unsubScores = jest.fn();
    let playersOnNext;

    mockOnSnapshot.mockImplementation((refOrQuery, onNext, onError) => {
      if (!playersOnNext) {
        playersOnNext = onNext;
        return unsubPlayers;
      }
      return unsubScores;
    });

    const { result } = renderHook(() => useGameData(db, 'LOADING_DATA', setAppStatus, true));

    await waitFor(() => {
      expect(playersOnNext).toBeDefined();
    });

    await act(async () => {
      playersOnNext({
        exists: () => true,
        data: () => ({ names: ['A', 'B', 'C'] }),
      });
    });

    await waitFor(() => {
      expect(result.current.players).toEqual(['A', 'B', 'C']);
      expect(setAppStatus).toHaveBeenCalledWith('READY');
    });
  });

  test('sets WAITING_FOR_SETUP when doc is missing and user is not allowed', async () => {
    let playersOnNext;
    mockOnSnapshot.mockImplementation((refOrQuery, onNext) => {
      if (!playersOnNext) {
        playersOnNext = onNext;
        return jest.fn();
      }
      return jest.fn();
    });

    renderHook(() => useGameData(db, 'LOADING_DATA', setAppStatus, false));

    await waitFor(() => {
      expect(playersOnNext).toBeDefined();
    });

    await act(async () => {
      playersOnNext({
        exists: () => false,
        data: () => ({}),
      });
    });

    await waitFor(() => {
      expect(setAppStatus).toHaveBeenCalledWith('WAITING_FOR_SETUP');
    });
    expect(setAppStatus).not.toHaveBeenCalledWith('SETUP_PLAYERS');
  });

  test('sets SETUP_PLAYERS when doc is missing and user is allowed', async () => {
    let playersOnNext;
    mockOnSnapshot.mockImplementation((refOrQuery, onNext) => {
      if (!playersOnNext) {
        playersOnNext = onNext;
        return jest.fn();
      }
      return jest.fn();
    });

    renderHook(() => useGameData(db, 'LOADING_DATA', setAppStatus, true));

    await waitFor(() => {
      expect(playersOnNext).toBeDefined();
    });

    await act(async () => {
      playersOnNext({
        exists: () => false,
        data: () => ({}),
      });
    });

    await waitFor(() => {
      expect(setAppStatus).toHaveBeenCalledWith('SETUP_PLAYERS');
    });
  });

  test('on players snapshot error shows toast and returns to LOGIN', async () => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    let playersOnError;
    mockOnSnapshot.mockImplementation((refOrQuery, onNext, onError) => {
      if (onError && !playersOnError) {
        playersOnError = onError;
        return jest.fn();
      }
      return jest.fn();
    });

    renderHook(() => useGameData(db, 'LOADING_DATA', setAppStatus, true));

    await waitFor(() => {
      expect(playersOnError).toBeDefined();
    });

    await act(async () => {
      playersOnError(new Error('permission'));
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao carregar dados dos jogadores.');
      expect(setAppStatus).toHaveBeenCalledWith('LOGIN');
    });
    errSpy.mockRestore();
  });

  test('merges scores from collection snapshot', async () => {
    let call = 0;
    let scoresOnNext;
    mockOnSnapshot.mockImplementation((refOrQuery, onNext) => {
      call += 1;
      if (call === 1) {
        return jest.fn();
      }
      scoresOnNext = onNext;
      return jest.fn();
    });

    const { result } = renderHook(() => useGameData(db, 'LOADING_DATA', setAppStatus, true));

    await waitFor(() => {
      expect(scoresOnNext).toBeDefined();
    });

    const mockSnapshot = {
      forEach: (cb) => {
        cb({
          id: '2024-01-01',
          data: () => ({ date: '2024-01-01', results: [] }),
        });
      },
    };
    await act(async () => {
      scoresOnNext(mockSnapshot);
    });

    await waitFor(() => {
      expect(result.current.scores['2024-01-01']).toEqual({
        date: '2024-01-01',
        results: [],
      });
    });
  });

  test('on scores snapshot error shows toast without forcing LOGIN', async () => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    let call = 0;
    let scoresOnError;
    mockOnSnapshot.mockImplementation((refOrQuery, onNext, onError) => {
      call += 1;
      if (call === 1) {
        return jest.fn();
      }
      scoresOnError = onError;
      return jest.fn();
    });

    renderHook(() => useGameData(db, 'LOADING_DATA', setAppStatus, true));

    await waitFor(() => {
      expect(scoresOnError).toBeDefined();
    });

    await act(async () => {
      scoresOnError(new Error('network'));
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao carregar os placares do servidor.');
    });
    expect(setAppStatus).not.toHaveBeenCalledWith('LOGIN');
    errSpy.mockRestore();
  });
});
