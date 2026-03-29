import React from 'react';

/**
 * Shared app title and tagline (pt-BR) used in the main shell and loading states.
 */
export default function AppBranding() {
  return (
    <div className="text-left">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 dark:text-gray-100">
        🏆 Placar do Puzzle 👑
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mt-1">Acompanhe os mestres do tabuleiro!</p>
    </div>
  );
}
