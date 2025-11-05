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

  return [...dayScore.results].sort((a, b) => {
    // 1. Players with time > 0 are in front of those with time = 0
    if (a.totalTime > 0 && b.totalTime === 0) return -1;
    if (a.totalTime === 0 && b.totalTime > 0) return 1;

    // 2. Between players with time > 0, order by time (first)
    if (a.totalTime > 0 && b.totalTime > 0) {
      return a.totalTime - b.totalTime;
    }

    // 3. Between players with time = 0, order alphabetically
    if (a.totalTime === 0 && b.totalTime === 0) {
      return a.name.localeCompare(b.name);
    }

    // 4. Fallback: order alphabetically for any other case
    return a.name.localeCompare(b.name);
  });
};

/**
 * Calculate weekly podium
 * @param {Array} players - List of players
 * @param {Object} scores - All scores
 * @param {Date} selectedDate - Selected date
 * @returns {Array} Array of ordered players
 */
export const calculateWeeklyPodium = (players, scores, selectedDate) => {
  const MILLISECONDS_PER_MINUTE = 60000;
  const DAYS_IN_WEEK = 7;
  const SUNDAY_DAY_OF_WEEK = 0;
  const MONDAY_DAY_OF_WEEK = 1;

  // Constants for Monday calculation
  const DAYS_TO_SUNDAY = -6;  // Days to subtract when current day is Sunday
  const DAYS_TO_MONDAY = 1;   // Days to subtract for other days of the week

  if (!players) return null;

  // Use the original date without UTC conversion
  const startOfWeek = new Date(selectedDate);
  const dayOfWeek = startOfWeek.getDay();

  // Calculate the start of the week (Monday)
  // If it's Sunday (dayOfWeek = 0), we need to go back 6 days to get to Monday
  // For other days, we go back (dayOfWeek - 1) days to get to Monday
  const daysToSubtract = dayOfWeek === SUNDAY_DAY_OF_WEEK ? 6 : dayOfWeek - 1;
  startOfWeek.setDate(startOfWeek.getDate() - daysToSubtract);

  const weeklyWins = players.reduce((acc, name) => ({ ...acc, [name]: 0 }), {});
  const weeklyTimes = players.reduce((acc, name) => ({ ...acc, [name]: 0 }), {});
  const weeklyGames = players.reduce((acc, name) => ({ ...acc, [name]: 0 }), {});
  const weeklyActivePlayers = new Set(); // Track players who have played at least once

  for (let i = 0; i < DAYS_IN_WEEK; i++) {
    const currentDate = new Date(startOfWeek);
    currentDate.setDate(startOfWeek.getDate() + i);
    const currentDateString = currentDate.toISOString().split('T')[0];
    const dayScore = scores[currentDateString];

    if (dayScore && dayScore.results && dayScore.results.some(r => r.totalTime > 0)) {
      const sortedDay = [...dayScore.results].sort((a, b) => {
        // 1. Players with time > 0 are in front of those with time = 0
        if (a.totalTime > 0 && b.totalTime === 0) return -1;
        if (a.totalTime === 0 && b.totalTime > 0) return 1;

        // 2. Between players with time > 0, order by time (first)
        if (a.totalTime > 0 && b.totalTime > 0) {
          return a.totalTime - b.totalTime;
        }

        // 3. Between players with time = 0, order alphabetically
        if (a.totalTime === 0 && b.totalTime === 0) {
          return a.name.localeCompare(b.name);
        }

        // 4. Fallback: order alphabetically for any other case
        return a.name.localeCompare(b.name);
      });
      const winner = sortedDay[0];

      if (winner && winner.totalTime > 0) {
        const weight = dayScore.dayOfWeek === SUNDAY_DAY_OF_WEEK ? 3 : 1;
        weeklyWins[winner.name] += weight;
      }

      // Sum the time of all players with valid times (totalTime > 0)
      dayScore.results.forEach(result => {
        if (result.totalTime > 0) {
          weeklyTimes[result.name] += result.totalTime;
          weeklyGames[result.name] += 1; // Count games played
        }
        // Mark all players as active, even with 0 time
        weeklyActivePlayers.add(result.name);
      });
    }
  }

  // Include all players who have played at least once in the week
  const activePlayers = players.filter(player => weeklyActivePlayers.has(player));

  return Object.entries(weeklyWins)
    .filter(([name]) => activePlayers.includes(name)) // Only include active players
    .map(([name, wins]) => ({
      name,
      wins,
      totalTime: weeklyTimes[name],
      gamesPlayed: weeklyGames[name]
    }))
    .sort((a, b) => {
      // 1. Order by score (highest first)
      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }

      // 2. If score is equal, order by number of games played (highest first)
      if (a.gamesPlayed !== b.gamesPlayed) {
        return b.gamesPlayed - a.gamesPlayed;
      }

      // 3. If games played is equal, order by total time of all days (first)
      if (a.totalTime !== b.totalTime) {
        return a.totalTime - b.totalTime;
      }

      // 4. If time is equal, order alphabetically
      return a.name.localeCompare(b.name);
    });
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

  const SUNDAY_DAY_OF_WEEK = 0;
  const SUNDAY_WEIGHT = 3;
  const WEEKDAY_WEIGHT = 1;

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const monthlyWins = players.reduce((acc, name) => ({ ...acc, [name]: 0 }), {});
  const monthlyTimes = players.reduce((acc, name) => ({ ...acc, [name]: 0 }), {});
  const monthlyGames = players.reduce((acc, name) => ({ ...acc, [name]: 0 }), {});

  Object.values(scores).forEach(score => {
    const scoreDate = new Date(score.date + 'T12:00:00Z');
    if (scoreDate.getFullYear() === year && scoreDate.getMonth() === month) {
      if (score.results && !score.results.every(r => r.totalTime === 0)) {
        const sortedDay = [...score.results].sort((a, b) => {
          // 1. Players with time > 0 are in front of those with time = 0
          if (a.totalTime > 0 && b.totalTime === 0) return -1;
          if (a.totalTime === 0 && b.totalTime > 0) return 1;

          // 2. Between players with time > 0, order by time (first)
          if (a.totalTime > 0 && b.totalTime > 0) {
            return a.totalTime - b.totalTime;
          }

          // 3. Between players with time = 0, order alphabetically
          if (a.totalTime === 0 && b.totalTime === 0) {
            return a.name.localeCompare(b.name);
          }

          // 4. Fallback: order alphabetically for any other case
          return a.name.localeCompare(b.name);
        });
        const winner = sortedDay[0];
        if (winner && winner.totalTime > 0) {
          const weight = score.dayOfWeek === SUNDAY_DAY_OF_WEEK ? SUNDAY_WEIGHT : WEEKDAY_WEIGHT;
          monthlyWins[winner.name] += weight;
        }

        // Sum the time of players with totalTime > 0 (not just wins)
        score.results.forEach(result => {
          if (result.totalTime > 0) {
            monthlyTimes[result.name] += result.totalTime;
            monthlyGames[result.name] += 1; // Count games played
          }
        });
      }
    }
  });

  return Object.entries(monthlyWins)
    .map(([name, wins]) => ({
      name,
      wins,
      totalTime: monthlyTimes[name],
      gamesPlayed: monthlyGames[name]
    }))
    .sort((a, b) => {
      // 1. Order by score (highest first)
      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }

      // 2. If score is equal, order by number of games played (highest first)
      if (a.gamesPlayed !== b.gamesPlayed) {
        return b.gamesPlayed - a.gamesPlayed;
      }

      // 3. If games played is equal, order by total time of all days (first)
      if (a.totalTime !== b.totalTime) {
        return a.totalTime - b.totalTime;
      }

      // 4. If time is equal, order alphabetically
      return a.name.localeCompare(b.name);
    });
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

  // Constants for week calculation
  const SUNDAY_DAY_OF_WEEK = 0;
  const DAYS_TO_SUNDAY = -6;  // Days to subtract when current day is Sunday
  const DAYS_TO_MONDAY = 1;   // Days to subtract for other days of the week
  const DAYS_IN_WEEK = 7;

  const monday = new Date(selectedDate);
  const day = monday.getDay();
  const diff = monday.getDate() - day + (day === SUNDAY_DAY_OF_WEEK ? DAYS_TO_SUNDAY : DAYS_TO_MONDAY);
  monday.setDate(diff);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + (DAYS_IN_WEEK - 1));
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
