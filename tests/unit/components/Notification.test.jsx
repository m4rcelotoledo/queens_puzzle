import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Notification from '../../../src/components/Notification';

// Mock do framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => children,
}));

describe('Notification', () => {
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza notificação de sucesso corretamente', () => {
    render(
      <Notification
        message="Operação realizada com sucesso!"
        type="success"
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText('Operação realizada com sucesso!')).toBeInTheDocument();
    expect(screen.getByText('Operação realizada com sucesso!').closest('.bg-green-500')).toBeInTheDocument();
  });

  it('renderiza notificação de erro corretamente', () => {
    render(
      <Notification
        message="Erro ao processar operação"
        type="error"
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText('Erro ao processar operação')).toBeInTheDocument();
    expect(screen.getByText('Erro ao processar operação').closest('.bg-red-500')).toBeInTheDocument();
  });

  it('renderiza notificação de aviso corretamente', () => {
    render(
      <Notification
        message="Atenção: dados incompletos"
        type="warning"
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText('Atenção: dados incompletos')).toBeInTheDocument();
    expect(screen.getByText('Atenção: dados incompletos').closest('.bg-yellow-500')).toBeInTheDocument();
  });

  it('chama onDismiss automaticamente após 4 segundos', () => {
    jest.useFakeTimers();

    render(
      <Notification
        message="Teste de notificação"
        type="success"
        onDismiss={mockOnDismiss}
      />
    );

    expect(mockOnDismiss).not.toHaveBeenCalled();

    jest.advanceTimersByTime(4000);

    expect(mockOnDismiss).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });

  it('tem acessibilidade correta', () => {
    render(
      <Notification
        message="Notificação de teste"
        type="success"
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText('Notificação de teste')).toBeInTheDocument();
  });

  it('aplica classes CSS corretas para cada tipo', () => {
    const { rerender } = render(
      <Notification
        message="Teste"
        type="success"
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText('Teste').closest('.bg-green-500')).toBeInTheDocument();

    rerender(
      <Notification
        message="Teste"
        type="error"
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText('Teste').closest('.bg-red-500')).toBeInTheDocument();

    rerender(
      <Notification
        message="Teste"
        type="warning"
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText('Teste').closest('.bg-yellow-500')).toBeInTheDocument();
  });

  it('renderiza mensagem corretamente', () => {
    render(
      <Notification
        message="Teste"
        type="success"
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText('Teste')).toBeInTheDocument();
  });

  it('manipula tipo inválido graciosamente', () => {
    render(
      <Notification
        message="Teste"
        type="invalid"
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText('Teste')).toBeInTheDocument();
    expect(screen.getByText('Teste').closest('.bg-gray-700')).toBeInTheDocument();
  });

  it('renderiza mensagem longa corretamente', () => {
    const longMessage = 'Esta é uma mensagem muito longa que pode ocupar várias linhas e deve ser exibida corretamente na notificação sem quebrar o layout da interface do usuário.';

    render(
      <Notification
        message={longMessage}
        type="success"
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  it('tem posicionamento correto na tela', () => {
    render(
      <Notification
        message="Teste"
        type="success"
        onDismiss={mockOnDismiss}
      />
    );

    const notification = screen.getByText('Teste').closest('.fixed');
    expect(notification).toHaveClass('fixed', 'top-5', 'left-1/2', '-translate-x-1/2', 'z-50');
  });
});
