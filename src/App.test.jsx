import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App.jsx';
import { useAuth } from './hooks/useAuth';
import { useGameData } from './hooks/useGameData';

vi.mock('sonner', () => ({
  Toaster: () => <div data-testid="global-toaster" />,
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

vi.mock('./utils/sfx', () => ({
  playSuccessSound: vi.fn(),
}));

vi.mock('./utils/scheduleIdleTask', () => ({
  scheduleIdleTask: (fn) => fn(),
}));

vi.mock('framer-motion', () => {
  // Strip motion-only props so React does not forward them to DOM nodes
  const Passthrough = ({
    children,
    initial,
    animate,
    exit,
    transition,
    whileHover,
    whileTap,
    ...rest
  }) => (
    <div {...rest}>{children}</div>
  );
  return {
    m: new Proxy(
      {},
      {
        get: () => Passthrough,
      }
    ),
    AnimatePresence: ({ children }) => <>{children}</>,
  };
});

vi.mock('./hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('./hooks/useGameData', () => ({
  useGameData: vi.fn(),
}));

vi.mock('./hooks/useTheme', () => {
  const setIsDarkMode = vi.fn();
  return {
    useTheme: vi.fn(() => [false, setIsDarkMode]),
  };
});

const setAppStatus = vi.fn();
const gameData = {
  players: null,
  setPlayers: vi.fn(),
  scores: {},
  setScores: vi.fn(),
};

const defaultAuth = () => ({
  db: {},
  auth: {},
  user: null,
  authError: null,
  isAllowed: false,
  appStatus: 'LOGIN',
  setAppStatus,
  handleLogin: vi.fn(),
  handleLogout: vi.fn(),
  firebaseAppRef: { current: {} },
});

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    gameData.players = null;
    gameData.scores = {};
    gameData.setPlayers = vi.fn();
    gameData.setScores = vi.fn();
    useAuth.mockImplementation(defaultAuth);
    useGameData.mockImplementation(() => gameData);
  });

  test('renders login when appStatus is LOGIN and there is no user', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Entrar com Google/i })).toBeInTheDocument();
  });

  test('shows loading while auth is resolving', () => {
    useAuth.mockImplementation(() => ({
      ...defaultAuth(),
      appStatus: 'LOADING_AUTH',
    }));
    render(<App />);
    expect(screen.getByText(/Verificando autenticação/i)).toBeInTheDocument();
  });

  test('shows loading while data is loading', () => {
    useAuth.mockImplementation(() => ({
      ...defaultAuth(),
      user: { photoURL: 'https://example.com/u.png', displayName: 'U' },
      appStatus: 'LOADING_DATA',
    }));
    render(<App />);
    expect(screen.getByText(/Carregando dados/i)).toBeInTheDocument();
  });

  test('mounts global Toaster so notifications work during loading states', () => {
    useAuth.mockImplementation(() => ({
      ...defaultAuth(),
      user: { photoURL: 'https://example.com/u.png', displayName: 'U' },
      appStatus: 'LOADING_DATA',
    }));
    render(<App />);
    expect(screen.getByTestId('global-toaster')).toBeInTheDocument();
  });

  test('shows waiting message when admin has not configured players (non-admin)', () => {
    useAuth.mockImplementation(() => ({
      ...defaultAuth(),
      user: { photoURL: 'https://example.com/guest.png', displayName: 'Guest' },
      isAllowed: false,
      appStatus: 'WAITING_FOR_SETUP',
    }));
    render(<App />);
    expect(
      screen.getByText(/Aguardando configuração inicial pelo administrador/i)
    ).toBeInTheDocument();
  });

  test('shows player setup for allowed users when config doc is missing', async () => {
    useAuth.mockImplementation(() => ({
      ...defaultAuth(),
      user: { photoURL: 'https://example.com/a.png', displayName: 'Admin' },
      isAllowed: true,
      appStatus: 'SETUP_PLAYERS',
    }));
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Configure os Jogadores/i })).toBeInTheDocument();
    });
  });

  test('renders main scoreboard when READY with user and players', () => {
    useAuth.mockImplementation(() => ({
      ...defaultAuth(),
      user: { photoURL: 'https://example.com/p.png', displayName: 'Alice' },
      isAllowed: true,
      appStatus: 'READY',
    }));
    gameData.players = ['João', 'Maria'];
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: /Placar do Puzzle/i })).toBeInTheDocument();
    expect(screen.getByText(/Registrar Tempos/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Salvar$/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Alice' })).toBeInTheDocument();
  });

  test('shows exploration copy when user is not allowed to edit', () => {
    useAuth.mockImplementation(() => ({
      ...defaultAuth(),
      user: { photoURL: 'https://example.com/g.png', displayName: 'Guest' },
      isAllowed: false,
      appStatus: 'READY',
    }));
    gameData.players = ['João'];
    render(<App />);
    expect(screen.getByText(/Explorar Datas/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Você está no modo de visualização/i)
    ).toBeInTheDocument();
  });

  test('calls handleLogout when Sair is clicked', () => {
    const handleLogout = vi.fn();
    useAuth.mockImplementation(() => ({
      ...defaultAuth(),
      user: { photoURL: 'https://example.com/b.png', displayName: 'Bob' },
      isAllowed: true,
      appStatus: 'READY',
      handleLogout,
    }));
    gameData.players = ['A'];
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /^Sair$/i }));
    expect(handleLogout).toHaveBeenCalled();
  });

  test('switches weekly view when Semanal is clicked', () => {
    useAuth.mockImplementation(() => ({
      ...defaultAuth(),
      user: { photoURL: 'https://example.com/b2.png', displayName: 'Bob' },
      isAllowed: true,
      appStatus: 'READY',
    }));
    gameData.players = ['A'];
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /^Semanal$/i }));
    expect(screen.getByRole('heading', { name: /Ranking da Semana/i })).toBeInTheDocument();
  });
});
