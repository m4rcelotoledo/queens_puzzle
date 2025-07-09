import React, { useState } from 'react';

const PlayerSetupModal = ({ onSetupComplete }) => {
  const [playerNames, setPlayerNames] = useState(['', '', '']);

  const handlePlayerChange = (index, name) => {
    const newPlayers = [...playerNames];
    newPlayers[index] = name;
    setPlayerNames(newPlayers);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (playerNames.every(p => p.trim() !== '')) {
      onSetupComplete(playerNames.map(p => p.trim()));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Configure os Jogadores</h2>
        <form onSubmit={handleSubmit}>
          <p className="text-gray-600 mb-4">Digite o nome dos 3 participantes. Isto só precisa de ser feito uma vez.</p>
          {playerNames.map((_, index) => (
            <div key={index} className="mb-4">
              <input
                type="text"
                value={playerNames[index]}
                onChange={(e) => handlePlayerChange(index, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder={`Nome do Jogador ${index + 1}`}
                required
              />
            </div>
          ))}
          <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700">
            Salvar Jogadores
          </button>
        </form>
      </div>
    </div>
  );
};

export default PlayerSetupModal;
