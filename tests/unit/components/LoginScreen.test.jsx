import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginScreen from '../../../src/components/LoginScreen';

describe('LoginScreen', () => {
  const mockOnLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza corretamente', () => {
    render(<LoginScreen onLogin={mockOnLogin} />);

    expect(screen.getByText('🏆 Placar do Puzzle das Rainhas 👑')).toBeInTheDocument();
    expect(screen.getByText('Faça login para continuar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar com google/i })).toBeInTheDocument();
  });

  it('chama onLogin quando o botão é clicado', () => {
    render(<LoginScreen onLogin={mockOnLogin} />);

    const loginButton = screen.getByRole('button', { name: /entrar com google/i });
    fireEvent.click(loginButton);

    expect(mockOnLogin).toHaveBeenCalledTimes(1);
  });

  it('exibe erro quando fornecido', () => {
    const errorMessage = 'Erro de autenticação';
    render(<LoginScreen onLogin={mockOnLogin} error={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toHaveClass('text-red-500', 'mt-4');
  });

  it('não exibe erro quando não fornecido', () => {
    render(<LoginScreen onLogin={mockOnLogin} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('tem acessibilidade correta', () => {
    render(<LoginScreen onLogin={mockOnLogin} />);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Faça login para continuar')).toBeInTheDocument();
  });

  it('aplica classes CSS corretas', () => {
    render(<LoginScreen onLogin={mockOnLogin} />);

    const title = screen.getByText('🏆 Placar do Puzzle das Rainhas 👑');
    expect(title).toHaveClass('text-4xl', 'sm:text-5xl', 'font-extrabold', 'text-gray-800');
  });

  it('renderiza ícone do Google', () => {
    render(<LoginScreen onLogin={mockOnLogin} />);

    const googleIcon = screen.getByRole('button').querySelector('img');
    expect(googleIcon).toBeInTheDocument();
    expect(googleIcon).toHaveAttribute('alt', 'Google icon');
  });

  it('tem botão com estilo correto', () => {
    render(<LoginScreen onLogin={mockOnLogin} />);

    const loginButton = screen.getByRole('button');
    expect(loginButton).toHaveClass('bg-white', 'px-6', 'py-3', 'rounded-lg', 'shadow-lg');
  });

  it('manipula erro vazio graciosamente', () => {
    render(<LoginScreen onLogin={mockOnLogin} error="" />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('manipula erro null graciosamente', () => {
    render(<LoginScreen onLogin={mockOnLogin} error={null} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renderiza erro longo corretamente', () => {
    const longError = 'Este é um erro muito longo que pode ocupar várias linhas e deve ser exibido corretamente na tela de login sem quebrar o layout da interface do usuário.';

    render(<LoginScreen onLogin={mockOnLogin} error={longError} />);

    expect(screen.getByText(longError)).toBeInTheDocument();
  });

  it('tem layout responsivo', () => {
    render(<LoginScreen onLogin={mockOnLogin} />);

    const container = screen.getByText('🏆 Placar do Puzzle das Rainhas 👑').closest('.min-h-screen');
    expect(container).toHaveClass('p-4');
  });

  it('tem título com emoji', () => {
    render(<LoginScreen onLogin={mockOnLogin} />);

    const title = screen.getByText('🏆 Placar do Puzzle das Rainhas 👑');
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass('text-4xl', 'sm:text-5xl', 'font-extrabold');
  });

  it('tem subtítulo descritivo', () => {
    render(<LoginScreen onLogin={mockOnLogin} />);

    const subtitle = screen.getByText('Faça login para continuar');
    expect(subtitle).toBeInTheDocument();
    expect(subtitle).toHaveClass('text-gray-600', 'mt-2');
  });
});
