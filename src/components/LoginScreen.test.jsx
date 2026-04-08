import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginScreen from './LoginScreen';

describe('LoginScreen', () => {
  const mockOnLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<LoginScreen onLogin={mockOnLogin} />);

    expect(screen.getByText('🏆 Placar do Puzzle das Rainhas 👑')).toBeInTheDocument();
    expect(screen.getByText('Faça login para continuar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar com google/i })).toBeInTheDocument();
  });

  it('calls onLogin when the button is clicked', () => {
    render(<LoginScreen onLogin={mockOnLogin} />);

    const loginButton = screen.getByRole('button', { name: /entrar com google/i });
    fireEvent.click(loginButton);

    expect(mockOnLogin).toHaveBeenCalledTimes(1);
  });

  it('displays error when provided', () => {
    const errorMessage = 'Erro de autenticação';
    render(<LoginScreen onLogin={mockOnLogin} error={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toHaveClass('text-red-500', 'mt-4');
  });

  it('does not display error when not provided', () => {
    render(<LoginScreen onLogin={mockOnLogin} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('has correct accessibility', () => {
    render(<LoginScreen onLogin={mockOnLogin} />);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Faça login para continuar')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    render(<LoginScreen onLogin={mockOnLogin} />);

    const title = screen.getByText('🏆 Placar do Puzzle das Rainhas 👑');
    expect(title).toHaveClass('text-4xl', 'sm:text-5xl', 'font-extrabold', 'text-gray-800');
  });

  it('renders Google icon', () => {
    render(<LoginScreen onLogin={mockOnLogin} />);

    const googleIcon = screen.getByRole('button').querySelector('svg');
    expect(googleIcon).toBeInTheDocument();
  });

  it('has button with correct style', () => {
    render(<LoginScreen onLogin={mockOnLogin} />);

    const loginButton = screen.getByRole('button');
    expect(loginButton).toHaveClass('bg-white', 'px-6', 'py-3', 'rounded-lg', 'shadow-lg');
  });

  it('handles empty error gracefully', () => {
    render(<LoginScreen onLogin={mockOnLogin} error="" />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('handles null error gracefully', () => {
    render(<LoginScreen onLogin={mockOnLogin} error={null} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('correctly renders long error', () => {
    const longError = 'Este é um erro muito longo que pode ocupar várias linhas e deve ser exibido corretamente na tela de login sem quebrar o layout da interface do usuário.';

    render(<LoginScreen onLogin={mockOnLogin} error={longError} />);

    expect(screen.getByText(longError)).toBeInTheDocument();
  });

  it('has responsive layout', () => {
    render(<LoginScreen onLogin={mockOnLogin} />);

    const container = screen.getByText('🏆 Placar do Puzzle das Rainhas 👑').closest('.min-h-screen');
    expect(container).toHaveClass('p-4');
  });

  it('has title with emoji', () => {
    render(<LoginScreen onLogin={mockOnLogin} />);

    const title = screen.getByText('🏆 Placar do Puzzle das Rainhas 👑');
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass('text-4xl', 'sm:text-5xl', 'font-extrabold');
  });

  it('has descriptive subtitle', () => {
    render(<LoginScreen onLogin={mockOnLogin} />);

    const subtitle = screen.getByText('Faça login para continuar');
    expect(subtitle).toBeInTheDocument();
    expect(subtitle).toHaveClass('text-gray-600', 'mt-2');
  });
});
