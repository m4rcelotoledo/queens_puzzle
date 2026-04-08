import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingScreen from './LoadingScreen';

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

    const inner = screen.getByText('...');
    const outer = inner.closest('.min-h-screen');
    expect(outer).toHaveClass('min-h-screen', 'bg-gray-100', 'dark:bg-gray-900', 'flex', 'flex-col');

    const centerContainer = inner.parentElement;
    expect(centerContainer).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
    expect(inner).toHaveClass('animate-pulse');
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

  it('applies flex centering classes to the spinner and message container', () => {
    render(<LoadingScreen />);

    const statusRegion = screen.getByRole('status');
    expect(statusRegion).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
    expect(statusRegion).toHaveAttribute('aria-live', 'polite');
    expect(statusRegion).toHaveAttribute('aria-busy', 'true');
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

  it('renders optional footer', () => {
    render(<LoadingScreen message="Carregando" footer={<footer data-testid="footer-slot">Footer</footer>} />);

    expect(screen.getByTestId('footer-slot')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('hides branding header when showBranding is false', () => {
    render(<LoadingScreen message="Carregando" showBranding={false} />);

    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('marks spinner SVG as decorative for assistive tech', () => {
    render(<LoadingScreen message="X" />);

    const svg = document.querySelector('.animate-spin');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
  });
});
