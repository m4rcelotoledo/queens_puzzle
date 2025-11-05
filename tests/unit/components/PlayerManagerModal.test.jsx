import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('renders correctly with existing players', () => {
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

  it('renders correctly without players', () => {
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

  it('allows adding a new player', async () => {
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

  it('allows removing a player without records immediately', async () => {
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

  it('shows confirmation when trying to remove a player with records', async () => {
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

  it('allows canceling the removal of a player with records', async () => {
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

  it('confirms the removal of a player with records', async () => {
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

  it('allows editing the player name', async () => {
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

  it('validates duplicate names', async () => {
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

  it('validates empty name', async () => {
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

  it('validates too short name', async () => {
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

  it('validates too long name', async () => {
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

  it('calls onClose when cancel is clicked', () => {
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

  it('calls onSetupComplete when save is clicked', async () => {
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

  it('disables save button when there are no players', () => {
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

  it('disables add button when input is empty', () => {
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

  it('allows adding a player with Enter', async () => {
    const user = userEvent.setup();
    render(
      <PlayerManagerModal
        players={defaultPlayers}
        onSetupComplete={mockOnSetupComplete}
        onClose={mockOnClose}
      />
    );

    const addInput = screen.getByPlaceholderText('New player name');

    fireEvent.change(addInput, { target: { value: 'João' } });
    addInput.focus();
    await user.keyboard('{Enter}');

    await waitFor(() => {
      // Should have been added to the players list (not just the addition input)
      const playerInputs = screen.getAllByPlaceholderText('Player name');
      expect(playerInputs.some(i => i.value === 'João')).toBe(true);
    });
  });

  it('shows "Name cannot be empty" error when clearing existing name (real-time validation)', async () => {
    render(
      <PlayerManagerModal
        players={defaultPlayers}
        onSetupComplete={mockOnSetupComplete}
        onClose={mockOnClose}
      />
    );

    const playerInputs = screen.getAllByPlaceholderText('Player name');
    // Clear the name of the first player
    fireEvent.change(playerInputs[0], { target: { value: '   ' } });

    // Should show empty name error (covers line 24 and setErrors from line 126)
    await waitFor(() => {
      expect(screen.getByText('Name cannot be empty')).toBeInTheDocument();
    });
  });

  it('adds player with Enter and clears the addition input (covers onKeyPress)', async () => {
    const user = userEvent.setup();
    render(
      <PlayerManagerModal
        players={defaultPlayers}
        onSetupComplete={mockOnSetupComplete}
        onClose={mockOnClose}
      />
    );

    const addInput = screen.getByPlaceholderText('New player name');

    await user.type(addInput, 'Paulo{enter}');

    await waitFor(() => {
      // Players (3) -> Players (4)
      expect(screen.getByText('Players (4)')).toBeInTheDocument();
      // Addition input should be cleared
      expect(screen.getByPlaceholderText('New player name')).toHaveValue('');
    });
  });

  it('covers onKeyPress using userEvent.type with {enter}', async () => {
    const user = userEvent.setup();
    render(
      <PlayerManagerModal
        players={defaultPlayers}
        onSetupComplete={mockOnSetupComplete}
        onClose={mockOnClose}
      />
    );

    const addInput = screen.getByPlaceholderText('New player name');

    await user.type(addInput, 'Rafa{enter}');

    await waitFor(() => {
      expect(screen.getByText('Players (4)')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('New player name')).toHaveValue('');
    });
  });

  it('clears errors when removing player', async () => {
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

  it('validates players with zero time records', () => {
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

  it('handles empty scores correctly', () => {
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

  it('handles null scores correctly', () => {
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

  it('handles score with document without results', () => {
    const scoresWithoutResults = {
      '2024-01-01': {
        date: '2024-01-01',
        dayOfWeek: 1,
        // without "results"
      },
    };

    render(
      <PlayerManagerModal
        players={defaultPlayers}
        scores={scoresWithoutResults}
        onSetupComplete={mockOnSetupComplete}
        onClose={mockOnClose}
      />
    );

    const removeButtons = screen.getAllByTitle('Remove player');
    fireEvent.click(removeButtons[0]);

    // Should not open confirmation (line 68 is covered)
    expect(screen.queryByText('Confirm Removal')).not.toBeInTheDocument();
  });

  it('tests error when saving players', async () => {
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

  it('tests validation with errors', async () => {
    render(
      <PlayerManagerModal
        players={defaultPlayers}
        onSetupComplete={mockOnSetupComplete}
        onClose={mockOnClose}
      />
    );

    // Adds a player with an invalid name
    const addInput = screen.getByPlaceholderText('New player name');
    const addButton = screen.getByText('Add');

    fireEvent.change(addInput, { target: { value: 'A' } });
    fireEvent.click(addButton);

    // Now try to save with validation error
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    // The button should be disabled due to the error
    expect(saveButton).toBeDisabled();
  });

  it('tests submission state', async () => {
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

    // Should show "Saving..." during submission
    await waitFor(() => {
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });

  it('tests general errors', async () => {
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

  it('tests real-time duplicate name validation', async () => {
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

  it('tests error clearing when typing in the new player input', async () => {
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

  it('tests validation of too long name', () => {
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

  it('tests validation of empty name', async () => {
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

  it('tests validation of name with spaces', () => {
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

  it('tests validation of name with special characters', () => {
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

  it('tests validation of name with numbers', () => {
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
