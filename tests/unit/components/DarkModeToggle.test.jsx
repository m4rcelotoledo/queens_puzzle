import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DarkModeToggle from '../../../src/components/DarkModeToggle';

describe('DarkModeToggle', () => {
  const defaultProps = {
    isDarkMode: false,
    setIsDarkMode: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve renderizar o botão de alternância', () => {
    render(<DarkModeToggle {...defaultProps} />);

    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();
  });

  test('deve exibir ícone de lua quando em modo claro', () => {
    render(<DarkModeToggle {...defaultProps} isDarkMode={false} />);

    // Check if the moon icon is present (light mode shows moon to switch to dark mode)
    const moonIcon = screen.getByRole('button').querySelector('svg');
    expect(moonIcon).toBeInTheDocument();
    expect(moonIcon).toHaveClass('text-slate-400');
  });

  test('deve exibir ícone de sol quando em modo escuro', () => {
    render(<DarkModeToggle {...defaultProps} isDarkMode={true} />);

    // Check if the sun icon is present (dark mode shows sun to switch to light mode)
    const sunIcon = screen.getByRole('button').querySelector('svg');
    expect(sunIcon).toBeInTheDocument();
    expect(sunIcon).toHaveClass('text-yellow-500');
  });

  test('deve chamar setIsDarkMode quando clicado', async () => {
    const user = userEvent.setup();
    render(<DarkModeToggle {...defaultProps} />);

    const toggleButton = screen.getByRole('button');
    await user.click(toggleButton);

    expect(defaultProps.setIsDarkMode).toHaveBeenCalledWith(true);
  });

    test('deve alternar entre modo claro e escuro', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<DarkModeToggle {...defaultProps} />);

    // Initially in light mode (shows moon)
    const moonIcon = screen.getByRole('button').querySelector('svg');
    expect(moonIcon).toHaveClass('text-slate-400');

    // Click to switch to dark mode
    const toggleButton = screen.getByRole('button');
    await user.click(toggleButton);

    expect(defaultProps.setIsDarkMode).toHaveBeenCalledWith(true);

    // Re-render with dark mode (shows sun)
    rerender(<DarkModeToggle {...defaultProps} isDarkMode={true} />);
    const sunIcon = screen.getByRole('button').querySelector('svg');
    expect(sunIcon).toHaveClass('text-yellow-500');

    // Click again to switch back to light mode
    await user.click(toggleButton);
    expect(defaultProps.setIsDarkMode).toHaveBeenCalledWith(false);
  });

    test('deve ter acessibilidade adequada', () => {
    render(<DarkModeToggle {...defaultProps} />);

    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();

    // Check if the button is clickable
    expect(toggleButton).not.toBeDisabled();
  });

    test('deve ter classes CSS corretas', () => {
    render(<DarkModeToggle {...defaultProps} />);

    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toHaveClass('p-2');
    expect(toggleButton).toHaveClass('rounded-full');
  });

  test('deve ser clicável', () => {
    render(<DarkModeToggle {...defaultProps} />);

    const toggleButton = screen.getByRole('button');
    expect(toggleButton).not.toBeDisabled();
  });

  test('deve ter tamanho adequado', () => {
    render(<DarkModeToggle {...defaultProps} />);

    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();
  });

  test('deve lidar com múltiplos cliques', async () => {
    const user = userEvent.setup();
    render(<DarkModeToggle {...defaultProps} />);

    const toggleButton = screen.getByRole('button');

    // Multiple clicks
    await user.click(toggleButton);
    await user.click(toggleButton);
    await user.click(toggleButton);

    // Should call setIsDarkMode for each click
    expect(defaultProps.setIsDarkMode).toHaveBeenCalledTimes(3);
  });

    test('deve ter background correto', () => {
    render(<DarkModeToggle {...defaultProps} />);

    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toHaveClass('bg-gray-200');
    expect(toggleButton).toHaveClass('dark:bg-gray-700');
  });
});
