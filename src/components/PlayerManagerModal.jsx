import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PlayerManagerModal = ({ players, onSetupComplete, onClose, scores = {} }) => {
  const [playerNames, setPlayerNames] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState(null);

  // Initialize with existing players
  useEffect(() => {
    if (players && players.length > 0) {
      setPlayerNames([...players]);
    } else {
      setPlayerNames([]);
    }
  }, [players]);

  // Name validation
  const validatePlayerName = (name, index = null) => {
    if (!name.trim()) {
      return 'Name cannot be empty';
    }

    if (name.trim().length < 2) {
      return 'Name must have at least 2 characters';
    }

    if (name.trim().length > 20) {
      return 'Name must have at most 20 characters';
    }

    // Check for duplicates (ignore own index if editing)
    const duplicateIndex = playerNames.findIndex((p, i) =>
      p.trim().toLowerCase() === name.trim().toLowerCase() && i !== index
    );

    if (duplicateIndex !== -1) {
      return 'Name already exists';
    }

    return null;
  };

  // Add new player
  const handleAddPlayer = () => {
    const error = validatePlayerName(newPlayerName);
    if (error) {
      setErrors({ ...errors, newPlayer: error });
      return;
    }

    setPlayerNames([...playerNames, newPlayerName.trim()]);
    setNewPlayerName('');

    const newErrors = { ...errors };
    delete newErrors.newPlayer;
    setErrors(newErrors);
  };

  // Check if player has any game records
  const hasPlayerRecords = (playerName) => {
    if (!scores || typeof scores !== 'object') return false;

    return Object.values(scores).some(dayScore => {
      if (!dayScore.results) return false;

      const playerResult = dayScore.results.find(result => result.name === playerName);

      return playerResult && playerResult.totalTime > 0;
    });
  };

  // Remove player
  const handleRemovePlayer = (index) => {
    const playerName = playerNames[index];

    // Check if player has records
    if (hasPlayerRecords(playerName)) {
      setPlayerToDelete({ index, name: playerName });
      setShowConfirmDelete(true);
      return;
    }

    // If no records, remove immediately
    removePlayer(index);
  };

  // Actually remove the player
  const removePlayer = (index) => {
    const newPlayers = playerNames.filter((_, i) => i !== index);
    setPlayerNames(newPlayers);

    // Clear errors related to removed player
    const newErrors = { ...errors };
    delete newErrors[`player-${index}`];
    setErrors(newErrors);
  };

  // Confirm player deletion
  const confirmDeletePlayer = () => {
    if (playerToDelete) {
      removePlayer(playerToDelete.index);
      setShowConfirmDelete(false);
      setPlayerToDelete(null);
    }
  };

  // Cancel player deletion
  const cancelDeletePlayer = () => {
    setShowConfirmDelete(false);
    setPlayerToDelete(null);
  };

  // Handle player name change
  const handlePlayerNameChange = (index, newName) => {
    const newPlayers = [...playerNames];
    newPlayers[index] = newName;
    setPlayerNames(newPlayers);

    // Real-time validation
    const error = validatePlayerName(newName, index);
    if (error) {
      setErrors({ ...errors, [`player-${index}`]: error });
    } else {
      const newErrors = { ...errors };
      delete newErrors[`player-${index}`];
      setErrors(newErrors);
    }
  };

  // General validation before saving
  const validateAllPlayers = () => {
    const newErrors = {};
    let isValid = true;

    playerNames.forEach((name, index) => {
      const error = validatePlayerName(name, index);
      if (error) {
        newErrors[`player-${index}`] = error;
        isValid = false;
      }
    });

    if (playerNames.length === 0) {
      newErrors.general = 'Add at least one player';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Save changes
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAllPlayers()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSetupComplete(playerNames.map(p => p.trim()));
    } catch (error) {
      console.error('Error saving players:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if there are errors
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Manage Players
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* List of Players */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Players ({playerNames.length})
            </h3>

            <AnimatePresence>
              {playerNames.map((player, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center space-x-2 mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <input
                      type="text"
                      value={player}
                      onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${
                        errors[`player-${index}`]
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600'
                      } text-gray-900 dark:text-gray-100`}
                      placeholder="Player name"
                    />
                    {errors[`player-${index}`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`player-${index}`]}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePlayer(index)}
                    className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    title="Remove player"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Message when no players */}
            {playerNames.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <p>No players added</p>
              </div>
            )}
          </div>

          {/* Add New Player */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Add Player
            </h3>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => {
                  setNewPlayerName(e.target.value);
                  if (errors.newPlayer) {
                    setErrors({ ...errors, newPlayer: null });
                  }
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPlayer();
                  }
                }}
                className={`flex-1 px-3 py-2 border rounded-md text-sm ${
                  errors.newPlayer
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600'
                } text-gray-900 dark:text-gray-100`}
                placeholder="New player name"
              />
              <button
                type="button"
                onClick={handleAddPlayer}
                disabled={!newPlayerName.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
              >
                Add
              </button>
            </div>
            {errors.newPlayer && (
              <p className="text-red-500 text-sm mt-1">{errors.newPlayer}</p>
            )}
          </div>

          {/* General Errors */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-red-600 dark:text-red-400 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || hasErrors || playerNames.length === 0}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md"
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                  <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Confirm Removal
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Player <strong>{playerToDelete?.name}</strong> has game records.
                  <br /><br />
                  <strong>Deletion Strategy:</strong> The player will be removed from the active list, but their historical data will be preserved in previous scores.
                  <br /><br />
                  <strong>Impact:</strong> The player will no longer appear in new scores, but the history will remain intact.
                </p>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={cancelDeletePlayer}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeletePlayer}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PlayerManagerModal;
