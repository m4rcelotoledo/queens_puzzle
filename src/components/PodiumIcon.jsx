// Component to render podium icon
import React from 'react';

const PodiumIcon = ({ rank }) => {
  const icons = {
    1: { emoji: '🥇', color: 'text-yellow-400' },
    2: { emoji: '🥈', color: 'text-gray-400' },
    3: { emoji: '🥉', color: 'text-yellow-600' },
  };
  if (!icons[rank]) return null;
  return <span className={`mr-2 text-2xl ${icons[rank].color}`}>{icons[rank].emoji}</span>;
};

export default PodiumIcon;
