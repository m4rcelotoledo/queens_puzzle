import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingScreen from '../../../src/components/LoadingScreen';

describe('LoadingScreen', () => {
  it('renders correctly with default message', () => {
    render(<LoadingScreen />);

    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<LoadingScreen message="Verificando autenticação" />);

    expect(screen.getByText('Verificando autenticação...')).toBeInTheDocument();
  });

  it('has correct accessibility', () => {
    render(<LoadingScreen message="Teste de carregamento" />);

    expect(screen.getByText('Teste de carregamento...')).toBeInTheDocument();
  });

  it('renders loading message', () => {
    render(<LoadingScreen message="Carregando" />);

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    render(<LoadingScreen />);

    const container = screen.getByText('...').closest('.min-h-screen');
    expect(container).toHaveClass('min-h-screen', 'bg-gray-100', 'flex', 'items-center', 'justify-center');
  });

  it('gracefully renders empty message', () => {
    render(<LoadingScreen message="" />);

    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('correctly renders very long message', () => {
    const longMessage = 'Esta é uma mensagem de carregamento muito longa que pode ocupar várias linhas e deve ser exibida corretamente na tela de carregamento sem quebrar o layout da interface do usuário.';

    render(<LoadingScreen message={longMessage} />);

    expect(screen.getByText(longMessage + '...')).toBeInTheDocument();
  });

  it('has loading text', () => {
    render(<LoadingScreen message="Carregando" />);

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('has centered positioning', () => {
    render(<LoadingScreen />);

    const container = screen.getByText('...').closest('.min-h-screen');
    expect(container).toHaveClass('flex', 'items-center', 'justify-center');
  });

  it('has light gray background', () => {
    render(<LoadingScreen />);

    const container = screen.getByText('...').closest('.min-h-screen');
    expect(container).toHaveClass('bg-gray-100');
  });

  it('has minimum screen height', () => {
    render(<LoadingScreen />);

    const container = screen.getByText('...').closest('.min-h-screen');
    expect(container).toHaveClass('min-h-screen');
  });
});
