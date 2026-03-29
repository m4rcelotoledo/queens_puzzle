import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../src/App.jsx';
import { useAuth } from '../../src/hooks/useAuth';
import { useGameData } from '../../src/hooks/useGameData';

jest.mock('sonner', () => ({
  Toaster: () => null,
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  },
}));

jest.mock('canvas-confetti', () => jest.fn());

jest.mock('../../src/utils/sfx', () => ({
  playSuccessSound: jest.fn(),
}));

jest.mock('../../src/utils/scheduleIdleTask', () => ({
  scheduleIdleTask: (fn) => fn(),
}));

jest.mock('framer-motion', () => {
  const React = require('react');
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

jest.mock('../../src/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../src/hooks/useGameData', () => ({
  useGameData: jest.fn(),
}));

jest.mock('../../src/hooks/useTheme', () => {
  const setIsDarkMode = jest.fn();
  return {
    useTheme: jest.fn(() => [false, setIsDarkMode]),
  };
});

const setAppStatus = jest.fn();
const gameData = {
  players: null,
  setPlayers: jest.fn(),
  scores: {},
  setScores: jest.fn(),
};

const defaultAuth = () => ({
  db: {},
  auth: {},
  user: null,
  authError: null,
  isAllowed: false,
  appStatus: 'LOGIN',
  setAppStatus,
  handleLogin: jest.fn(),
  handleLogout: jest.fn(),
  firebaseAppRef: { current: {} },
});

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    gameData.players = null;
    gameData.scores = {};
    gameData.setPlayers = jest.fn();
    gameData.setScores = jest.fn();
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
    const handleLogout = jest.fn();
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
