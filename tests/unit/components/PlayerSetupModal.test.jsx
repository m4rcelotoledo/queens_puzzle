import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import PlayerSetupModal from '../../../src/components/PlayerSetupModal';

describe('PlayerSetupModal', () => {
  it('renders title and three required name fields', () => {
    const onSetupComplete = jest.fn();
    render(<PlayerSetupModal onSetupComplete={onSetupComplete} />);

    expect(screen.getByRole('heading', { name: /configure os jogadores/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nome do Jogador 1')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nome do Jogador 2')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nome do Jogador 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /salvar jogadores/i })).toBeInTheDocument();
  });

  it('calls onSetupComplete with trimmed names when all fields are filled', async () => {
    const user = userEvent.setup();
    const onSetupComplete = jest.fn();
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
    const onSetupComplete = jest.fn();
    render(<PlayerSetupModal onSetupComplete={onSetupComplete} />);

    await user.type(screen.getByPlaceholderText('Nome do Jogador 1'), 'Só um');
    await user.click(screen.getByRole('button', { name: /salvar jogadores/i }));

    expect(onSetupComplete).not.toHaveBeenCalled();
  });
});
