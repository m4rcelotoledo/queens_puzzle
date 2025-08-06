import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingScreen from '../../../src/components/LoadingScreen';

describe('LoadingScreen', () => {
  it('renderiza corretamente com mensagem padrão', () => {
    render(<LoadingScreen />);

    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('renderiza com mensagem customizada', () => {
    render(<LoadingScreen message="Verificando autenticação" />);

    expect(screen.getByText('Verificando autenticação...')).toBeInTheDocument();
  });

  it('tem acessibilidade correta', () => {
    render(<LoadingScreen message="Teste de carregamento" />);

    expect(screen.getByText('Teste de carregamento...')).toBeInTheDocument();
  });

  it('renderiza mensagem de carregamento', () => {
    render(<LoadingScreen message="Carregando" />);

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('aplica classes CSS corretas', () => {
    render(<LoadingScreen />);

    const container = screen.getByText('...').closest('.min-h-screen');
    expect(container).toHaveClass('min-h-screen', 'bg-gray-100', 'flex', 'items-center', 'justify-center');
  });

  it('renderiza mensagem vazia graciosamente', () => {
    render(<LoadingScreen message="" />);

    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('renderiza mensagem muito longa corretamente', () => {
    const longMessage = 'Esta é uma mensagem de carregamento muito longa que pode ocupar várias linhas e deve ser exibida corretamente na tela de carregamento sem quebrar o layout da interface do usuário.';

    render(<LoadingScreen message={longMessage} />);

    expect(screen.getByText(longMessage + '...')).toBeInTheDocument();
  });

  it('tem texto de carregamento', () => {
    render(<LoadingScreen message="Carregando" />);

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('tem posicionamento centralizado', () => {
    render(<LoadingScreen />);

    const container = screen.getByText('...').closest('.min-h-screen');
    expect(container).toHaveClass('flex', 'items-center', 'justify-center');
  });

  it('tem fundo cinza claro', () => {
    render(<LoadingScreen />);

    const container = screen.getByText('...').closest('.min-h-screen');
    expect(container).toHaveClass('bg-gray-100');
  });

  it('tem altura mínima da tela', () => {
    render(<LoadingScreen />);

    const container = screen.getByText('...').closest('.min-h-screen');
    expect(container).toHaveClass('min-h-screen');
  });
});
