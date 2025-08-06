import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlayerManagerModal from '../../../src/components/PlayerManagerModal';

// Mock do framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => children,
}));

describe('PlayerManagerModal', () => {
  const mockOnSetupComplete = jest.fn();
  const mockOnClose = jest.fn();
  const defaultPlayers = ['Marcelo', 'James', 'Maria'];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza corretamente com jogadores existentes', () => {
    render(
      <PlayerManagerModal
        players={defaultPlayers}
        onSetupComplete={mockOnSetupComplete}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Manage Players')).toBeInTheDocument();
    expect(screen.getByText('Players (3)')).toBeInTheDocument();
    expect(screen.getByText('Add Player')).toBeInTheDocument();

    // Check if the existing players are being displayed
    expect(screen.getByDisplayValue('Marcelo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('James')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Maria')).toBeInTheDocument();
  });

  it('renderiza corretamente sem jogadores', () => {
    render(
      <PlayerManagerModal
        players={[]}
        onSetupComplete={mockOnSetupComplete}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Players (0)')).toBeInTheDocument();
    expect(screen.getByText('No players added')).toBeInTheDocument();
  });

  it('permite adicionar novo jogador', async () => {
    render(
      <PlayerManagerModal
        players={defaultPlayers}
        onSetupComplete={mockOnSetupComplete}
        onClose={mockOnClose}
      />
    );

    const addInput = screen.getByPlaceholderText('New player name');
    const addButton = screen.getByText('Add');

    fireEvent.change(addInput, { target: { value: 'João' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue('João')).toBeInTheDocument();
    });
  });

  it('permite remover jogador sem registros imediatamente', async () => {
    render(
      <PlayerManagerModal
        players={defaultPlayers}
        scores={{}}
        onSetupComplete={mockOnSetupComplete}
        onClose={mockOnClose}
      />
    );

    const removeButtons = screen.getAllByTitle('Remove player');
    fireEvent.click(removeButtons[0]); // Remove the first player

    await waitFor(() => {
      expect(screen.queryByDisplayValue('Marcelo')).not.toBeInTheDocument();
    });
  });

  it('mostra confirmação ao tentar remover jogador com registros', async () => {
    const scoresWithRecords = {
      '2024-01-01': {
        results: [
          { name: 'Marcelo', totalTime: 120 },
          { name: 'James', totalTime: 150 },
          { name: 'Maria', totalTime: 180 }
        ]
      }
    };

    render(
      <PlayerManagerModal
        players={defaultPlayers}
        scores={scoresWithRecords}
        onSetupComplete={mockOnSetupComplete}
        onClose={mockOnClose}
      />
    );

    const removeButtons = screen.getAllByTitle('Remove player');
    fireEvent.click(removeButtons[0]); // Try to remove Marcelo

    await waitFor(() => {
      expect(screen.getByText('Confirm Removal')).toBeInTheDocument();
      expect(screen.getByText(/Marcelo/)).toBeInTheDocument();
      expect(screen.getByText(/has game records/)).toBeInTheDocument();
    });
  });

  it('permite cancelar a remoção de jogador com registros', async () => {
    const scoresWithRecords = {
      '2024-01-01': {
        results: [
          { name: 'Marcelo', totalTime: 120 },
          { name: 'James', totalTime: 150 },
          { name: 'Maria', totalTime: 180 }
        ]
      }
    };

    render(
      <PlayerManagerModal
        players={defaultPlayers}
        scores={scoresWithRecords}
        onSetupComplete={mockOnSetupComplete}
        onClose={mockOnClose}
      />
    );

    const removeButtons = screen.getAllByTitle('Remove player');
    fireEvent.click(removeButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Confirm Removal')).toBeInTheDocument();
    });

    const cancelButtons = screen.getAllByText('Cancel');
    const cancelButton = cancelButtons[1]; // Get the second Cancel button (from confirmation modal)
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Confirm Removal')).not.toBeInTheDocument();
      expect(screen.getByDisplayValue('Marcelo')).toBeInTheDocument();
    });
  });

  it('confirma a remoção de jogador com registros', async () => {
    const scoresWithRecords = {
      '2024-01-01': {
        results: [
          { name: 'Marcelo', totalTime: 120 },
          { name: 'James', totalTime: 150 },
          { name: 'Maria', totalTime: 180 }
        ]
      }
    };

    render(
      <PlayerManagerModal
        players={defaultPlayers}
        scores={scoresWithRecords}
        onSetupComplete={mockOnSetupComplete}
        onClose={mockOnClose}
      />
    );

    const removeButtons = screen.getAllByTitle('Remove player');
    fireEvent.click(removeButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Confirm Removal')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Remove');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.queryByText('Confirm Removal')).not.toBeInTheDocument();
      expect(screen.queryByDisplayValue('Marcelo')).not.toBeInTheDocument();
    });
  });

  it('permite editar nome do jogador', async () => {
    render(
      <PlayerManagerModal
        players={defaultPlayers}
        onSetupComplete={mockOnSetupComplete}
        onClose={mockOnClose}
      />
    );

    const playerInput = screen.getByDisplayValue('Marcelo');
    fireEvent.change(playerInput, { target: { value: 'Marcelo Silva' } });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Marcelo Silva')).toBeInTheDocument();
    });
  });

  it('valida nomes duplicados', async () => {
    render(
      <PlayerManagerModal
        players={defaultPlayers}
        onSetupComplete={mockOnSetupComplete}
        onClose={mockOnClose}
      />
    );

    const addInput = screen.getByPlaceholderText('New player name');
    const addButton = screen.getByText('Add');

    fireEvent.change(addInput, { target: { value: 'Marcelo' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Name already exists')).toBeInTheDocument();
    });
  });

  it('valida nome vazio', async () => {
    render(
      <PlayerManagerModal
        players={defaultPlayers}
        onSetupComplete={mockOnSetupComplete}
        onClose={mockOnClose}
      />
    );

    const addInput = screen.getByPlaceholderText('New player name');
    const addButton = screen.getByText('Add');

    // Test if the button is disabled when the input is empty
    expect(addButton).toBeDisabled();

    // Add a valid value to enable the button
    fireEvent.change(addInput, { target: { value: 'João' } });
    expect(addButton).not.toBeDisabled();
  });

  it('valida nome muito curto', async () => {
    render(
      <PlayerManagerModal
        players={defaultPlayers}
        onSetupComplete={mockOnSetupComplete}
        onClose={mockOnClose}
      />
    );

    const addInput = screen.getByPlaceholderText('New player name');
    const addButton = screen.getByText('Add');

    fireEvent.change(addInput, { target: { value: 'A' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Name must have at least 2 characters')).toBeInTheDocument();
    });
  });

  it('valida nome muito longo', async () => {
    render(
      <PlayerManagerModal
        players={defaultPlayers}
        onSetupComplete={mockOnSetupComplete}
        onClose={mockOnClose}
      />
    );

    const addInput = screen.getByPlaceholderText('New player name');
    const addButton = screen.getByText('Add');

    fireEvent.change(addInput, { target: { value: 'NomeMuitoLongoQueExcedeOLimiteDeVinteCaracteres' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Name must have at most 20 characters')).toBeInTheDocument();
    });
  });

  it('chama onClose quando cancelar é clicado', () => {
    render(
      <PlayerManagerModal
        players={defaultPlayers}
        onSetupComplete={mockOnSetupComplete}
        onClose={mockOnClose}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('chama onSetupComplete quando salvar é clicado', async () => {
    render(
      <PlayerManagerModal
        players={defaultPlayers}
        onSetupComplete={mockOnSetupComplete}
        onClose={mockOnClose}
      />
    );

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSetupComplete).toHaveBeenCalledWith(['Marcelo', 'James', 'Maria']);
    });
  });

  it('desabilita botão salvar quando não há jogadores', () => {
    render(
      <PlayerManagerModal
        players={[]}
        onSetupComplete={mockOnSetupComplete}
        onClose={mockOnClose}
      />
    );

    const saveButton = screen.getByText('Save Changes');
    expect(saveButton).toBeDisabled();
  });

  it('desabilita botão adicionar quando input está vazio', () => {
    render(
      <PlayerManagerModal
        players={defaultPlayers}
        onSetupComplete={mockOnSetupComplete}
        onClose={mockOnClose}
      />
    );

    const addButton = screen.getByText('Add');
    expect(addButton).toBeDisabled();
  });

  it('permite adicionar jogador com Enter', async () => {
    render(
      <PlayerManagerModal
        players={defaultPlayers}
        onSetupComplete={mockOnSetupComplete}
        onClose={mockOnClose}
      />
    );

    const addInput = screen.getByPlaceholderText('New player name');

    fireEvent.change(addInput, { target: { value: 'João' } });
    fireEvent.keyPress(addInput, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(screen.getByDisplayValue('João')).toBeInTheDocument();
    });
  });

  it('desabilita botão salvar quando não há jogadores', () => {
    render(
      <PlayerManagerModal
        players={[]}
        onSetupComplete={mockOnSetupComplete}
        onClose={mockOnClose}
      />
    );

    const saveButton = screen.getByText('Save Changes');
    expect(saveButton).toBeDisabled();
  });

  it('limpa erros ao remover jogador', async () => {
    render(
      <PlayerManagerModal
        players={defaultPlayers}
        onSetupComplete={mockOnSetupComplete}
        onClose={mockOnClose}
      />
    );

    // Add a player with error
    const addInput = screen.getByPlaceholderText('New player name');
    const addButton = screen.getByText('Add');

    fireEvent.change(addInput, { target: { value: 'João' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue('João')).toBeInTheDocument();
    });

    // Remove the player
    const removeButtons = screen.getAllByTitle('Remove player');
    fireEvent.click(removeButtons[removeButtons.length - 1]); // Remove João

    await waitFor(() => {
      expect(screen.queryByDisplayValue('João')).not.toBeInTheDocument();
    });
  });

  it('valida jogadores com registros de tempo zero', () => {
    const scoresWithZeroTime = {
      '2024-01-01': {
        results: [
          { name: 'Marcelo', totalTime: 0 },
          { name: 'James', totalTime: 150 },
          { name: 'Maria', totalTime: 0 }
        ]
      }
    };

    render(
      <PlayerManagerModal
        players={defaultPlayers}
        scores={scoresWithZeroTime}
        onSetupComplete={mockOnSetupComplete}
        onClose={mockOnClose}
      />
    );

    // Marcelo and Maria should be removable without confirmation (totalTime: 0)
    const removeButtons = screen.getAllByTitle('Remove player');
    fireEvent.click(removeButtons[0]); // Remove Marcelo

    // Should not show confirmation modal
    expect(screen.queryByText('Confirm Removal')).not.toBeInTheDocument();
  });

  it('manipula scores vazio corretamente', () => {
    render(
      <PlayerManagerModal
        players={defaultPlayers}
        scores={{}}
        onSetupComplete={mockOnSetupComplete}
        onClose={mockOnClose}
      />
    );

    // Should be able to remove players without confirmation when scores is empty
    const removeButtons = screen.getAllByTitle('Remove player');
    fireEvent.click(removeButtons[0]);

    // Should not show confirmation modal
    expect(screen.queryByText('Confirm Removal')).not.toBeInTheDocument();
  });

  it('manipula scores null corretamente', () => {
    render(
      <PlayerManagerModal
        players={defaultPlayers}
        scores={null}
        onSetupComplete={mockOnSetupComplete}
        onClose={mockOnClose}
      />
    );

    // Should be able to remove players without confirmation when scores is null
    const removeButtons = screen.getAllByTitle('Remove player');
    fireEvent.click(removeButtons[0]);

    // Should not show confirmation modal
    expect(screen.queryByText('Confirm Removal')).not.toBeInTheDocument();
  });

  it('testa erro ao salvar jogadores', async () => {
    // Mock console.error to prevent it from appearing in test output
    const originalConsoleError = console.error;
    console.error = jest.fn();

    const mockOnSetupCompleteWithError = jest.fn().mockRejectedValue(new Error('Test error'));

    render(
      <PlayerManagerModal
        players={defaultPlayers}
        onSetupComplete={mockOnSetupCompleteWithError}
        onClose={mockOnClose}
      />
    );

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSetupCompleteWithError).toHaveBeenCalled();
    });

    // Verify that console.error was called
    expect(console.error).toHaveBeenCalledWith('Error saving players:', expect.any(Error));

    // Restore console.error
    console.error = originalConsoleError;
  });

  it('testa validação com erros', async () => {
    render(
      <PlayerManagerModal
        players={defaultPlayers}
        onSetupComplete={mockOnSetupComplete}
        onClose={mockOnClose}
      />
    );

    // Adiciona um jogador com nome inválido
    const addInput = screen.getByPlaceholderText('New player name');
    const addButton = screen.getByText('Add');

    fireEvent.change(addInput, { target: { value: 'A' } });
    fireEvent.click(addButton);

    // Agora tenta salvar com erro de validação
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    // O botão deve estar desabilitado devido ao erro
    expect(saveButton).toBeDisabled();
  });

  it('testa estado de submissão', async () => {
    const mockOnSetupCompleteAsync = jest.fn().mockImplementation(() =>
      new Promise(resolve => setTimeout(resolve, 100))
    );

    render(
      <PlayerManagerModal
        players={defaultPlayers}
        onSetupComplete={mockOnSetupCompleteAsync}
        onClose={mockOnClose}
      />
    );

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    // Deve mostrar "Saving..." durante a submissão
    await waitFor(() => {
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });

  it('testa erros gerais', async () => {
    render(
      <PlayerManagerModal
        players={[]}
        onSetupComplete={mockOnSetupComplete}
        onClose={mockOnClose}
      />
    );

    // Get the form and submit it directly
    const form = screen.getByDisplayValue('').closest('form');
    fireEvent.submit(form);

    // Should show general error when no players
    await waitFor(() => {
      const errorElement = screen.getByText('Add at least one player');
      expect(errorElement).toBeInTheDocument();
    });
  });

  it('testa validação de nomes duplicados em tempo real', async () => {
    render(
      <PlayerManagerModal
        players={['Maria', 'Maria']}
        onSetupComplete={mockOnSetupComplete}
        onClose={mockOnClose}
      />
    );

    // Edit the first player to have the same name as the second
    const playerInputs = screen.getAllByPlaceholderText('Player name');
    fireEvent.change(playerInputs[0], { target: { value: 'Maria' } });

    // Submit the form to trigger validation
    const form = screen.getByDisplayValue('').closest('form');
    fireEvent.submit(form);

    // Should show duplicate error
    await waitFor(() => {
      expect(screen.getAllByText('Name already exists')).toHaveLength(2);
    });
  });

  it('testa limpeza de erro ao digitar no input de novo jogador', async () => {
    render(
      <PlayerManagerModal
        players={['João']}
        onSetupComplete={mockOnSetupComplete}
        onClose={mockOnClose}
      />
    );

    // Add an invalid name
    const addInput = screen.getByPlaceholderText('New player name');
    const addButton = screen.getByText('Add');

    fireEvent.change(addInput, { target: { value: 'A' } });
    fireEvent.click(addButton);

    // Should show error
    await waitFor(() => {
      expect(screen.getByText('Name must have at least 2 characters')).toBeInTheDocument();
    });

    // Now type a valid name
    fireEvent.change(addInput, { target: { value: 'Pedro' } });

    // The error should be cleared
    await waitFor(() => {
      expect(screen.queryByText('Name must have at least 2 characters')).not.toBeInTheDocument();
    });
  });

  it('testa validação de nome muito longo', () => {
    render(
      <PlayerManagerModal
        players={['João']}
        onSetupComplete={mockOnSetupComplete}
        onClose={mockOnClose}
      />
    );

    // Add a player with a very long name
    const addInput = screen.getByPlaceholderText('New player name');
    const addButton = screen.getByText('Add');

    fireEvent.change(addInput, { target: { value: 'NomeMuitoLongoQueExcedeOLimiteDeVinteCaracteres' } });
    fireEvent.click(addButton);

    // Should show error
    expect(screen.getByText('Name must have at most 20 characters')).toBeInTheDocument();
  });

  it('testa validação de nome vazio', async () => {
    render(
      <PlayerManagerModal
        players={['João']}
        onSetupComplete={mockOnSetupComplete}
        onClose={mockOnClose}
      />
    );

    // Try to add a player with an empty name
    const addInput = screen.getByPlaceholderText('New player name');
    const addButton = screen.getByText('Add');

    // The button should be disabled when input is empty
    expect(addButton).toBeDisabled();

    // Type a valid name first to enable the button
    fireEvent.change(addInput, { target: { value: 'Pedro' } });
    expect(addButton).not.toBeDisabled();

    // Now try with empty name - button should be disabled again
    fireEvent.change(addInput, { target: { value: '   ' } });
    expect(addButton).toBeDisabled();

    // The validation should prevent adding empty names
    expect(screen.queryByText('Name cannot be empty')).not.toBeInTheDocument();
  });

  it('testa validação de nome com espaços em branco', () => {
    render(
      <PlayerManagerModal
        players={['João']}
        onSetupComplete={mockOnSetupComplete}
        onClose={mockOnClose}
      />
    );

    // Add a player with a name that has spaces
    const addInput = screen.getByPlaceholderText('New player name');
    const addButton = screen.getByText('Add');

    fireEvent.change(addInput, { target: { value: '  Pedro  ' } });
    fireEvent.click(addButton);

    // Should add the player with spaces removed
    expect(screen.getByDisplayValue('Pedro')).toBeInTheDocument();
  });

  it('testa validação de nome com caracteres especiais', () => {
    render(
      <PlayerManagerModal
        players={['João']}
        onSetupComplete={mockOnSetupComplete}
        onClose={mockOnClose}
      />
    );

    // Add a player with a name that has special characters
    const addInput = screen.getByPlaceholderText('New player name');
    const addButton = screen.getByText('Add');

    fireEvent.change(addInput, { target: { value: 'João-Maria' } });
    fireEvent.click(addButton);

    // Should add the player successfully
    expect(screen.getByDisplayValue('João-Maria')).toBeInTheDocument();
  });

  it('testa validação de nome com números', () => {
    render(
      <PlayerManagerModal
        players={['João']}
        onSetupComplete={mockOnSetupComplete}
        onClose={mockOnClose}
      />
    );

    // Add a player with a name that has numbers
    const addInput = screen.getByPlaceholderText('New player name');
    const addButton = screen.getByText('Add');

    fireEvent.change(addInput, { target: { value: 'João123' } });
    fireEvent.click(addButton);

    // Should add the player successfully
    expect(screen.getByDisplayValue('João123')).toBeInTheDocument();
  });
});
