import React from 'react';

/**
 * Shared app title and tagline (pt-BR) used in the main shell and loading states.
 * @param {object} props
 * @param {boolean} [props.compactTitle] — Smaller, single-line-friendly title (main header on small viewports).
 * @param {boolean} [props.centered] — Center title and tagline (stacked mobile header).
 */
export default function AppBranding({ compactTitle = false, centered = false }) {
  return (
    <div className={centered ? 'text-center' : 'text-left'}>
      <h1
        className={
          compactTitle
            ? 'text-2xl sm:text-3xl font-extrabold text-gray-800 dark:text-gray-100 whitespace-nowrap'
            : 'text-4xl sm:text-5xl font-extrabold text-gray-800 dark:text-gray-100'
        }
      >
        🏆 Placar do Puzzle 👑
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mt-1">Acompanhe os mestres do tabuleiro!</p>
    </div>
  );
}
