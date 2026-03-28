import React from 'react';
import { m } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// This component displays a statistic card with title, value, and unit.
const StatCard = ({ title, value, unit }) => (
  <m.div
    className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center"
    whileHover={{ scale: 1.05 }}
  >
    <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
      {value} <span className="text-lg font-normal">{unit}</span>
    </p>
  </m.div>
);

// The PlayerStatsPage component displays detailed statistics for a player.
const PlayerStatsPage = ({ stats, onBack }) => {
  if (!stats) return null;

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.name} - Estatísticas</h2>
        <button onClick={onBack} className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-500">
          &larr; Voltar
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Vitórias (🥇)" value={stats.wins} unit="dias" />
        <StatCard title="Pódios" value={stats.podiums} unit="dias" />
        <StatCard title="Melhor Tempo" value={stats.bestTime} unit="seg" />
        <StatCard title="Tempo Médio" value={stats.avgTime} unit="seg" />
      </div>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Evolução do Tempo</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart
            data={stats.timeHistory}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
            <XAxis dataKey="date" stroke="#A0AEC0" />
            <YAxis stroke="#A0AEC0" />
            <Tooltip
              contentStyle={{ backgroundColor: '#2D3748', border: 'none', borderRadius: '0.5rem' }}
              labelStyle={{ color: '#E2E8F0' }}
            />
            <Legend />
            <Line type="monotone" dataKey="time" name="Tempo (seg)" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </m.div>
  );
};

export default PlayerStatsPage;
