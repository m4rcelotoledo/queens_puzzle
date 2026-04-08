import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import PlayerSetupModal from './PlayerSetupModal';

describe('PlayerSetupModal', () => {
  it('renders title, helper text and three required name fields', () => {
    const onSetupComplete = vi.fn();
    render(<PlayerSetupModal onSetupComplete={onSetupComplete} />);

    expect(screen.getByRole('heading', { name: /configure os jogadores/i })).toBeInTheDocument();
    expect(
      screen.getByText(/digite o nome dos 3 participantes/i)
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nome do Jogador 1')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nome do Jogador 2')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nome do Jogador 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /salvar jogadores/i })).toBeInTheDocument();
  });

  it('calls onSetupComplete with trimmed names when all fields are filled', async () => {
    const user = userEvent.setup();
    const onSetupComplete = vi.fn();
    render(<PlayerSetupModal onSetupComplete={onSetupComplete} />);

    await user.type(screen.getByPlaceholderText('Nome do Jogador 1'), '  Ana  ');
    await user.type(screen.getByPlaceholderText('Nome do Jogador 2'), 'Bruno');
    await user.type(screen.getByPlaceholderText('Nome do Jogador 3'), ' Carlos ');

    await user.click(screen.getByRole('button', { name: /salvar jogadores/i }));

    expect(onSetupComplete).toHaveBeenCalledTimes(1);
    expect(onSetupComplete).toHaveBeenCalledWith(['Ana', 'Bruno', 'Carlos']);
  });

  it('does not call onSetupComplete when any field is empty', async () => {
    const user = userEvent.setup();
    const onSetupComplete = vi.fn();
    render(<PlayerSetupModal onSetupComplete={onSetupComplete} />);

    await user.type(screen.getByPlaceholderText('Nome do Jogador 1'), 'Só um');
    await user.click(screen.getByRole('button', { name: /salvar jogadores/i }));

    expect(onSetupComplete).not.toHaveBeenCalled();
  });

  it('shows validation error when a name has fewer than 2 characters', async () => {
    const user = userEvent.setup();
    const onSetupComplete = vi.fn();
    render(<PlayerSetupModal onSetupComplete={onSetupComplete} />);

    const p1 = screen.getByPlaceholderText('Nome do Jogador 1');
    await user.clear(p1);
    await user.type(p1, 'A');
    await user.type(screen.getByPlaceholderText('Nome do Jogador 2'), 'Bruno');
    await user.type(screen.getByPlaceholderText('Nome do Jogador 3'), 'Carlos');
    await user.click(screen.getByRole('button', { name: /salvar jogadores/i }));

    expect(onSetupComplete).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByText('O nome deve ter pelo menos 2 caracteres')).toBeInTheDocument();
    });
  });

  it('shows validation error when a name exceeds 20 characters', async () => {
    const user = userEvent.setup();
    const onSetupComplete = vi.fn();
    render(<PlayerSetupModal onSetupComplete={onSetupComplete} />);

    const longName = 'a'.repeat(21);
    await user.type(screen.getByPlaceholderText('Nome do Jogador 1'), longName);
    await user.type(screen.getByPlaceholderText('Nome do Jogador 2'), 'Bruno');
    await user.type(screen.getByPlaceholderText('Nome do Jogador 3'), 'Carlos');
    await user.click(screen.getByRole('button', { name: /salvar jogadores/i }));

    expect(onSetupComplete).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByText('Máximo 20 caracteres')).toBeInTheDocument();
    });
  });

  it('does not submit when all names are empty', async () => {
    const user = userEvent.setup();
    const onSetupComplete = vi.fn();
    render(<PlayerSetupModal onSetupComplete={onSetupComplete} />);

    await user.click(screen.getByRole('button', { name: /salvar jogadores/i }));

    expect(onSetupComplete).not.toHaveBeenCalled();
    const messages = screen.getAllByText('O nome deve ter pelo menos 2 caracteres');
    expect(messages.length).toBeGreaterThanOrEqual(1);
  });
});
