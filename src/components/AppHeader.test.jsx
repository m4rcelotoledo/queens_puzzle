import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AppHeader, { MOBILE_STACKED_BREAKPOINT_PX } from './AppHeader';

const user = {
  photoURL: 'https://example.com/a.png',
  displayName: 'Alice',
};

describe('AppHeader', () => {
  const defaultProps = {
    user,
    isDarkMode: false,
    setIsDarkMode: vi.fn(),
    onLogout: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    window.innerWidth = 1024;
  });

  afterEach(() => {
    window.innerWidth = 1024;
  });

  test('renders desktop toolbar with logout icon only (accessible name Sair)', () => {
    render(<AppHeader {...defaultProps} />);

    expect(screen.getByRole('heading', { level: 1, name: /Placar do Puzzle/i })).toBeInTheDocument();
    const sair = screen.getByRole('button', { name: /^Sair$/i });
    expect(sair.querySelector('svg')).toBeInTheDocument();
    expect(sair).not.toHaveTextContent(/Sair/i);
    expect(screen.queryByRole('button', { name: /Menu da conta/i })).not.toBeInTheDocument();
  });

  test('calls onLogout when desktop Sair is clicked', () => {
    render(<AppHeader {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /^Sair$/i }));
    expect(defaultProps.onLogout).toHaveBeenCalledTimes(1);
  });

  test('on narrow viewport shows hamburger and opens account menu', async () => {
    window.innerWidth = 500;

    render(<AppHeader {...defaultProps} />);

    expect(screen.queryByRole('button', { name: /^Sair$/i })).not.toBeInTheDocument();
    const menuBtn = screen.getByRole('button', { name: /Menu da conta/i });
    fireEvent.click(menuBtn);

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('menuitem', { name: /^Sair$/i }));
    expect(defaultProps.onLogout).toHaveBeenCalledTimes(1);
  });

  test('on very narrow width uses stacked actions without hamburger', async () => {
    window.innerWidth = MOBILE_STACKED_BREAKPOINT_PX;

    render(<AppHeader {...defaultProps} />);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Menu da conta/i })).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /^Sair$/i }));
    expect(defaultProps.onLogout).toHaveBeenCalled();
  });

  test('closes account menu on Escape', async () => {
    window.innerWidth = 500;
    render(<AppHeader {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /Menu da conta/i }));
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument());
    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  test('closes account menu on outside click', async () => {
    window.innerWidth = 500;
    render(
      <div>
        <button type="button">outside</button>
        <AppHeader {...defaultProps} />
      </div>
    );
    fireEvent.click(screen.getByRole('button', { name: /Menu da conta/i }));
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument());
    fireEvent.mouseDown(screen.getByRole('button', { name: /^outside$/i }));
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });
});
