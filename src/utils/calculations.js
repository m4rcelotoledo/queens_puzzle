/**
 * Calculate player stats based on scores
 * @param {string} playerName - Player name
 * @param {Object} scores - Object with all scores
 * @returns {Object} Player stats
 */
export const calculatePlayerStats = (playerName, scores) => {
  if (!scores || !playerName) return null;

  let wins = 0;
  let podiums = 0;
  let bestTime = Infinity;
  let totalTime = 0;
  let gameCount = 0;
  const timeHistory = [];

  Object.values(scores).forEach(dayScore => {
    if (!dayScore.results) return;

    const sortedDay = [...dayScore.results].sort((a, b) => a.totalTime - b.totalTime);
    const playerResult = sortedDay.find(p => p.name === playerName);

    if (playerResult && playerResult.totalTime > 0) {
      const rank = sortedDay.indexOf(playerResult) + 1;
      if (rank === 1) wins++;
      if (rank <= 3) podiums++;

      bestTime = Math.min(bestTime, playerResult.totalTime);
      totalTime += playerResult.totalTime;
      gameCount++;
      timeHistory.push({
        date: new Date(dayScore.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        time: playerResult.totalTime
      });
    }
  });

  return {
    name: playerName,
    wins,
    podiums,
    bestTime: bestTime === Infinity ? 'N/A' : bestTime,
    avgTime: gameCount > 0 ? (totalTime / gameCount).toFixed(0) : 'N/A',
    timeHistory: timeHistory.sort((a,b) => new Date(a.date.split('/').reverse().join('-')) - new Date(b.date.split('/').reverse().join('-'))),
  };
};

/**
 * Calculate daily podium
 * @param {Object} dayScore - Day score
 * @returns {Array} Array of ordered players
 */
export const calculateDailyPodium = (dayScore) => {
  if (!dayScore || !dayScore.results || dayScore.results.every(r => r.totalTime === 0)) {
    return null;
  }
  return [...dayScore.results].sort((a, b) => a.totalTime - b.totalTime);
};

/**
 * Calculate weekly podium
 * @param {Array} players - List of players
 * @param {Object} scores - All scores
 * @param {Date} selectedDate - Selected date
 * @returns {Array} Array of ordered players
 */
export const calculateWeeklyPodium = (players, scores, selectedDate) => {
  if (!players) return null;

  const startOfWeek = new Date(selectedDate);
  const dayOfWeek = startOfWeek.getDay();
  const diffToMonday = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  startOfWeek.setDate(diffToMonday);

  const weeklyWins = players.reduce((acc, name) => ({ ...acc, [name]: 0 }), {});

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startOfWeek);
    currentDate.setDate(startOfWeek.getDate() + i);
    const currentDateString = currentDate.toISOString().split('T')[0];
    const dayScore = scores[currentDateString];

    if (dayScore && dayScore.results && !dayScore.results.every(r => r.totalTime === 0)) {
      const sortedDay = [...dayScore.results].sort((a, b) => a.totalTime - b.totalTime);
      const winner = sortedDay[0];

      if (winner && winner.totalTime > 0) {
        const weight = dayScore.dayOfWeek === 0 ? 3 : 1;
        weeklyWins[winner.name] += weight;
      }
    }
  }

  return Object.entries(weeklyWins).map(([name, wins]) => ({ name, wins })).sort((a, b) => b.wins - a.wins);
};

/**
 * Calculate monthly podium
 * @param {Array} players - List of players
 * @param {Object} scores - All scores
 * @param {Date} selectedDate - Selected date
 * @returns {Array} Array of ordered players
 */
export const calculateMonthlyPodium = (players, scores, selectedDate) => {
  if (!players) return null;

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const monthlyWins = players.reduce((acc, name) => ({ ...acc, [name]: 0 }), {});

  Object.values(scores).forEach(score => {
    const scoreDate = new Date(score.date + 'T12:00:00');
    if (scoreDate.getFullYear() === year && scoreDate.getMonth() === month) {
      if (score.results && !score.results.every(r => r.totalTime === 0)) {
        const sortedDay = [...score.results].sort((a, b) => a.totalTime - b.totalTime);
        const winner = sortedDay[0];
        if (winner && winner.totalTime > 0) {
          const weight = score.dayOfWeek === 0 ? 3 : 1;
          monthlyWins[winner.name] += weight;
        }
      }
    }
  });

  return Object.entries(monthlyWins)
    .map(([name, wins]) => ({ name, wins }))
    .sort((a, b) => b.wins - a.wins);
};

/**
 * Validate if at least one time was inserted
 * @param {Object} times - Object with times of players
 * @param {boolean} isSunday - If it is Sunday
 * @returns {boolean} If there is at least one valid time
 */
export const validateTimes = (times, isSunday) => {
  const results = Object.values(times).map(timeData => {
    const time = Number(timeData?.time || 0);
    const bonusTime = isSunday ? Number(timeData?.bonusTime || 0) : 0;
    return time + bonusTime;
  });

  return results.some(totalTime => totalTime > 0);
};

/**
 * Calculate the week range for display
 * @param {Date} selectedDate - Selected date
 * @returns {string} String formatted week range
 */
export const getWeekRange = (selectedDate) => {
  if (!selectedDate || !(selectedDate instanceof Date)) {
    return '';
  }
  const monday = new Date(selectedDate);
  const day = monday.getDay();
  const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
  monday.setDate(diff);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const format = (d) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  return `${format(monday)} - ${format(sunday)}`;
};

/**
 * Get the formatted month name
 * @param {Date} selectedDate - Selected date
 * @returns {string} Formatted month name
 */
export const getMonthName = (selectedDate) => {
  if (!selectedDate || !(selectedDate instanceof Date)) {
    return '';
  }
  return selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
};
