import React from 'react';

// This component receives all the logic and data needed from App.jsx as props
const TimeInputForm = ({ players, isSunday, times, handleTimeChange, handleSaveScore, setTimes }) => {
  return (
    <form onSubmit={handleSaveScore}>
      {players.map(name => (
        <div key={name} className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600">
          <h3 className="font-bold text-indigo-700 dark:text-indigo-400">{name}</h3>
          <div className="mt-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Tempo (segundos)</label>
            <input
              type="number"
              min="0"
              placeholder="Ex: 125"
              value={times[name]?.time ?? ''}
              onChange={(e) => handleTimeChange(name, 'time', e.target.value)}
              className="w-full p-2 border border-gray-200 dark:border-gray-500 rounded-md mt-1 bg-white dark:bg-gray-600"
            />
          </div>
          {isSunday && (
            <div className="mt-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">Tempo Bônus (segundos)</label>
              <input
                type="number"
                min="0"
                placeholder="Ex: 240"
                value={times[name]?.bonusTime ?? ''}
                onChange={(e) => handleTimeChange(name, 'bonusTime', e.target.value)}
                className="w-full p-2 border border-gray-200 dark:border-gray-500 rounded-md mt-1 bg-white dark:bg-gray-600"
              />
            </div>
          )}
        </div>
      ))}
      <div className="flex space-x-2 mt-4">
        <button type="submit" className="grow bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105">
          Salvar
        </button>
        <button type="button" onClick={() => setTimes({})} className="shrink-0 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">
          Limpar
        </button>
      </div>
    </form>
  );
};

export default TimeInputForm;
