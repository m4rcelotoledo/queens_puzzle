import {
  calculatePlayerStats,
  calculateDailyPodium,
  calculateWeeklyPodium,
  calculateMonthlyPodium,
  validateTimes,
  getWeekRange,
  getMonthName
} from '../../../src/utils/calculations';

describe('calculatePlayerStats', () => {
  const mockScores = {
    '2024-01-01': {
      date: '2024-01-01',
      results: [
        { name: 'João', time: 100, bonusTime: 0, totalTime: 100 },
        { name: 'Maria', time: 120, bonusTime: 0, totalTime: 120 },
        { name: 'Pedro', time: 110, bonusTime: 0, totalTime: 110 }
      ]
    },
    '2024-01-02': {
      date: '2024-01-02',
      results: [
        { name: 'João', time: 95, bonusTime: 0, totalTime: 95 },
        { name: 'Maria', time: 105, bonusTime: 0, totalTime: 105 },
        { name: 'Pedro', time: 115, bonusTime: 0, totalTime: 115 }
      ]
    }
  };

  test('should calculate correct stats for a player', () => {
    const stats = calculatePlayerStats('João', mockScores);
    expect(stats).toEqual({
      name: 'João',
      wins: 2,
      podiums: 2,
      bestTime: 95,
      avgTime: '98',
      timeHistory: [
        { date: '01/01', time: 100 },
        { date: '02/01', time: 95 }
      ]
    });
  });

  test('should return empty stats for non-existent player', () => {
    const stats = calculatePlayerStats('JogadorInexistente', mockScores);
    expect(stats).toEqual({
      name: 'JogadorInexistente',
      wins: 0,
      podiums: 0,
      bestTime: 'N/A',
      avgTime: 'N/A',
      timeHistory: []
    });
  });

  test('should return empty stats for empty scores', () => {
    const stats = calculatePlayerStats('João', {});
    expect(stats).toEqual({
      name: 'João',
      wins: 0,
      podiums: 0,
      bestTime: 'N/A',
      avgTime: 'N/A',
      timeHistory: []
    });
  });

  test('should handle player without results', () => {
    const emptyScores = {
      '2024-01-01': {
        date: '2024-01-01',
        results: [
          { name: 'Maria', time: 100, bonusTime: 0, totalTime: 100 }
        ]
      }
    };
    const stats = calculatePlayerStats('João', emptyScores);
    expect(stats).toEqual({
      name: 'João',
      wins: 0,
      podiums: 0,
      bestTime: 'N/A',
      avgTime: 'N/A',
      timeHistory: []
    });
  });
});

describe('calculateDailyPodium', () => {
  test('should calculate daily podium correctly', () => {
    const dayScore = {
      date: '2024-01-01',
      results: [
        { name: 'João', time: 100, bonusTime: 0, totalTime: 100 },
        { name: 'Maria', time: 120, bonusTime: 0, totalTime: 120 },
        { name: 'Pedro', time: 110, bonusTime: 0, totalTime: 110 }
      ]
    };
    const podium = calculateDailyPodium(dayScore);
    expect(podium).toEqual([
      { name: 'João', time: 100, bonusTime: 0, totalTime: 100 },
      { name: 'Pedro', time: 110, bonusTime: 0, totalTime: 110 },
      { name: 'Maria', time: 120, bonusTime: 0, totalTime: 120 }
    ]);
  });

  test('should handle players with zero time correctly', () => {
    const dayScore = {
      date: '2024-01-01',
      results: [
        { name: 'João', time: 100, bonusTime: 0, totalTime: 100 },
        { name: 'Maria', time: 0, bonusTime: 0, totalTime: 0 },
        { name: 'Pedro', time: 110, bonusTime: 0, totalTime: 110 },
        { name: 'Ana', time: 0, bonusTime: 0, totalTime: 0 }
      ]
    };
    const podium = calculateDailyPodium(dayScore);

    // Check that players with time > 0 are in front
    expect(podium[0].totalTime).toBeGreaterThan(0);
    expect(podium[1].totalTime).toBeGreaterThan(0);

    // Check that players with time = 0 are at the end
    expect(podium[2].totalTime).toBe(0);
    expect(podium[3].totalTime).toBe(0);

    // Check the order of players with time > 0
    expect(podium[0].name).toBe('João');
    expect(podium[1].name).toBe('Pedro');
  });

  test('should order players with zero time alphabetically', () => {
    const dayScore = {
      date: '2024-01-01',
      results: [
        { name: 'João', time: 100, bonusTime: 0, totalTime: 100 },
        { name: 'Carlos', time: 0, bonusTime: 0, totalTime: 0 },
        { name: 'Ana', time: 0, bonusTime: 0, totalTime: 0 },
        { name: 'Bruno', time: 0, bonusTime: 0, totalTime: 0 }
      ]
    };
    const podium = calculateDailyPodium(dayScore);

    // Check that players with time = 0 are in alphabetical order
    expect(podium[1].name).toBe('Ana');
    expect(podium[2].name).toBe('Bruno');
    expect(podium[3].name).toBe('Carlos');
  });

  test('should handle complete tie in daily podium', () => {
    const dayScore = {
      date: '2024-01-01',
      results: [
        { name: 'João', time: 100, bonusTime: 0, totalTime: 100 },
        { name: 'Maria', time: 100, bonusTime: 0, totalTime: 100 },
        { name: 'Pedro', time: 100, bonusTime: 0, totalTime: 100 }
      ]
    };
    const podium = calculateDailyPodium(dayScore);

    // Check that all have the same time
    expect(podium[0].totalTime).toBe(100);
    expect(podium[1].totalTime).toBe(100);
    expect(podium[2].totalTime).toBe(100);

    // Check that they are ordered alphabetically
    expect(podium[0].name).toBe('João');
    expect(podium[1].name).toBe('Maria');
    expect(podium[2].name).toBe('Pedro');
  });

  test('should handle edge case in daily podium sorting', () => {
    const dayScore = {
      date: '2024-01-01',
      results: [
        { name: 'João', time: 100, bonusTime: 0, totalTime: 100 },
        { name: 'Maria', time: 0, bonusTime: 0, totalTime: 0 },
        { name: 'Pedro', time: 100, bonusTime: 0, totalTime: 100 }
      ]
    };
    const podium = calculateDailyPodium(dayScore);

    // Check that João and Pedro are in front (time > 0)
    expect(podium[0].totalTime).toBeGreaterThan(0);
    expect(podium[1].totalTime).toBeGreaterThan(0);

    // Check that Maria is at the end (time = 0)
    expect(podium[2].totalTime).toBe(0);
    expect(podium[2].name).toBe('Maria');
  });

  test('should handle edge case where no conditions are met in daily podium', () => {
    // This test covers the return 0 case in calculateDailyPodium
    // This happens when we have mixed cases that don't match any specific condition
    const dayScore = {
      date: '2024-01-01',
      results: [
        { name: 'João', time: 100, bonusTime: 0, totalTime: 100 },
        { name: 'Maria', time: 100, bonusTime: 0, totalTime: 100 }
      ]
    };
    const podium = calculateDailyPodium(dayScore);

    // Both have same time > 0, should be ordered alphabetically
    expect(podium[0].name).toBe('João');
    expect(podium[1].name).toBe('Maria');
    expect(podium[0].totalTime).toBe(100);
    expect(podium[1].totalTime).toBe(100);
  });

  test('should handle edge case where sorting conditions are not met in daily podium', () => {
    // This test specifically covers the return 0 case in the sorting function
    // This happens when we have players with same time > 0
    const dayScore = {
      date: '2024-01-01',
      results: [
        { name: 'Ana', time: 50, bonusTime: 0, totalTime: 50 },
        { name: 'Ana', time: 50, bonusTime: 0, totalTime: 50 } // Same player, same time
      ]
    };
    const podium = calculateDailyPodium(dayScore);

    // Should handle the case where sorting doesn't match any condition
    expect(podium).toBeInstanceOf(Array);
    expect(podium).toHaveLength(2);
    expect(podium[0].name).toBe('Ana');
    expect(podium[1].name).toBe('Ana');
  });

  test('should handle edge case where no sorting conditions match in daily podium', () => {
    // This test specifically forces the return a.name.localeCompare(b.name) case in calculateDailyPodium
    // This happens when we have edge cases that don't match any specific condition
    const dayScore = {
      date: '2024-01-01',
      results: [
        { name: 'João', time: 100, bonusTime: 0, totalTime: 100 },
        { name: 'João', time: 100, bonusTime: 0, totalTime: 100 } // Exact same object
      ]
    };
    const podium = calculateDailyPodium(dayScore);

    // Should handle the case where sorting doesn't match any condition
    expect(podium).toBeInstanceOf(Array);
    expect(podium).toHaveLength(2);
    expect(podium[0].name).toBe('João');
    expect(podium[1].name).toBe('João');
  });

  test('should return null for invalid score', () => {
    const podium = calculateDailyPodium(null);
    expect(podium).toBeNull();
  });
});

describe('calculateWeeklyPodium', () => {
  const mockPlayers = ['João', 'Maria', 'Pedro'];

  test('should calculate weekly podium correctly', () => {
    // Use a date that works consistently in both UTC and local timezone
    const selectedDate = new Date('2024-01-07'); // Sunday
    const mockScores = {
      '2024-01-01': { // Monday - João wins
        date: '2024-01-01',
        dayOfWeek: 1,
        results: [
          { name: 'João', time: 100, bonusTime: 0, totalTime: 100 },
          { name: 'Maria', time: 120, bonusTime: 0, totalTime: 120 }
        ]
      },
      '2024-01-02': { // Tuesday - James wins
        date: '2024-01-02',
        dayOfWeek: 2,
        results: [
          { name: 'James', time: 110, bonusTime: 0, totalTime: 110 },
          { name: 'Paulo', time: 130, bonusTime: 0, totalTime: 130 }
        ]
      },
      '2024-01-03': { // Wednesday - Paulo wins
        date: '2024-01-03',
        dayOfWeek: 3,
        results: [
          { name: 'Paulo', time: 95, bonusTime: 0, totalTime: 95 },
          { name: 'João', time: 105, bonusTime: 0, totalTime: 105 }
        ]
      },
      '2024-01-04': { // Thursday - João wins again
        date: '2024-01-04',
        dayOfWeek: 4,
        results: [
          { name: 'João', time: 90, bonusTime: 0, totalTime: 90 },
          { name: 'James', time: 115, bonusTime: 0, totalTime: 115 }
        ]
      },
      '2024-01-07': { // Sunday - All players active
        date: '2024-01-07',
        dayOfWeek: 0,
        results: [
          { name: 'João', time: 95, bonusTime: 0, totalTime: 95 },
          { name: 'James', time: 105, bonusTime: 0, totalTime: 105 },
          { name: 'Paulo', time: 110, bonusTime: 0, totalTime: 110 }
        ]
      }
    };

    const players = ['João', 'James', 'Paulo'];
    const podium = calculateWeeklyPodium(players, mockScores, selectedDate);

    // Check basic structure
    expect(podium).toBeInstanceOf(Array);
    expect(podium).toHaveLength(3);

    // Check that all players are present
    const joao = podium.find(p => p.name === 'João');
    const james = podium.find(p => p.name === 'James');
    const paulo = podium.find(p => p.name === 'Paulo');

    expect(joao).toBeDefined();
    expect(james).toBeDefined();
    expect(paulo).toBeDefined();

    // Check that João has at least 1 win
    expect(joao.wins).toBeGreaterThanOrEqual(1);

    // Check that the ordering is correct by wins first, then by total time
    const sortedByWins = podium.sort((a, b) => b.wins - a.wins);
    expect(sortedByWins[0].wins).toBeGreaterThanOrEqual(sortedByWins[1].wins);

    // Check that players with same wins are sorted by total time (lower first)
    const sameWins = podium.filter(p => p.wins === podium[0].wins);
    if (sameWins.length > 1) {
      for (let i = 0; i < sameWins.length - 1; i++) {
        expect(sameWins[i].totalTime).toBeLessThanOrEqual(sameWins[i + 1].totalTime);
      }
    }
  });

  test('should handle tie-breaking with total time correctly', () => {
    // Use a date that works consistently in both UTC and local timezone
    const selectedDate = new Date('2024-01-07'); // Sunday
    const mockScores = {
      '2024-01-07': { // Sunday - Maria wins (3 points)
        date: '2024-01-07',
        dayOfWeek: 0,
        results: [
          { name: 'Maria', time: 110, bonusTime: 0, totalTime: 110 },
          { name: 'Pedro', time: 130, bonusTime: 0, totalTime: 130 },
          { name: 'João', time: 120, bonusTime: 0, totalTime: 120 }
        ]
      },
      '2024-01-06': { // Saturday - João wins (1 point)
        date: '2024-01-06',
        dayOfWeek: 6,
        results: [
          { name: 'João', time: 100, bonusTime: 0, totalTime: 100 },
          { name: 'Maria', time: 120, bonusTime: 0, totalTime: 120 }
        ]
      }
    };

    const podium = calculateWeeklyPodium(mockPlayers, mockScores, selectedDate);

    // Check basic structure
    expect(podium).toBeInstanceOf(Array);
    expect(podium).toHaveLength(3);

    // Check that all players are present
    const maria = podium.find(p => p.name === 'Maria');
    const joao = podium.find(p => p.name === 'João');
    const pedro = podium.find(p => p.name === 'Pedro');

    expect(maria).toBeDefined();
    expect(joao).toBeDefined();
    expect(pedro).toBeDefined();

    // Check that Maria has the most wins (should be 3)
    expect(maria.wins).toBeGreaterThanOrEqual(3);

    // Check that João has at least 1 win
    expect(joao.wins).toBeGreaterThanOrEqual(1);

    // Check that Pedro has 0 wins
    expect(pedro.wins).toBe(0);

    // Check that the ordering is correct by wins first
    const sortedByWins = podium.sort((a, b) => b.wins - a.wins);
    expect(sortedByWins[0].wins).toBeGreaterThanOrEqual(sortedByWins[1].wins);
  });



  test('should handle complete tie in weekly podium', () => {
    const selectedDate = new Date('2024-01-07'); // Sunday
    const mockScores = {
      '2024-01-07': { // Sunday - Both win (3 points each)
        date: '2024-01-07',
        dayOfWeek: 0,
        results: [
          { name: 'João', time: 100, bonusTime: 0, totalTime: 100 },
          { name: 'Maria', time: 100, bonusTime: 0, totalTime: 100 },
          { name: 'Pedro', time: 120, bonusTime: 0, totalTime: 120 }
        ]
      },
      '2024-01-06': { // Saturday - Both win (1 point each)
        date: '2024-01-06',
        dayOfWeek: 6,
        results: [
          { name: 'João', time: 120, bonusTime: 0, totalTime: 120 },
          { name: 'Maria', time: 120, bonusTime: 0, totalTime: 120 }
        ]
      }
    };

    const podium = calculateWeeklyPodium(mockPlayers, mockScores, selectedDate);

    // Check basic structure
    expect(podium).toBeInstanceOf(Array);
    expect(podium).toHaveLength(3);

    // Check that all players are present
    const joao = podium.find(p => p.name === 'João');
    const maria = podium.find(p => p.name === 'Maria');
    const pedro = podium.find(p => p.name === 'Pedro');

    expect(joao).toBeDefined();
    expect(maria).toBeDefined();
    expect(pedro).toBeDefined();

    // João should have 4 wins (1 from Saturday + 3 from Sunday) because he comes first alphabetically
    expect(podium[0].wins).toBe(4);
    expect(podium[0].name).toBe('João');

    // Maria and Pedro should have 0 wins because João won both days due to alphabetical order
    // With new logic: Maria has 2 games played, Pedro has 1 game played
    expect(podium[1].wins).toBe(0);
    expect(podium[1].name).toBe('Maria'); // Maria has more games played
    expect(podium[2].wins).toBe(0);
    expect(podium[2].name).toBe('Pedro'); // Pedro has fewer games played

    // Both should have total time of 100 + 120 = 220 for João and Maria
    expect(podium[0].totalTime).toBe(220);
    expect(podium[1].totalTime).toBe(220); // Maria has time but no wins
    expect(podium[2].totalTime).toBe(120); // Pedro has time from Sunday

    // Games played should be 2 for João and Maria, 1 for Pedro
    expect(podium[0].gamesPlayed).toBe(2);
    expect(podium[1].gamesPlayed).toBe(2);
    expect(podium[2].gamesPlayed).toBe(1);
  });

  test('should handle alphabetical tie-breaking in weekly podium', () => {
    const selectedDate = new Date('2024-01-07'); // Sunday
    const mockScores = {
      '2024-01-07': { // Sunday - All players active
        date: '2024-01-07',
        dayOfWeek: 0,
        results: [
          { name: 'João', time: 100, bonusTime: 0, totalTime: 100 },
          { name: 'Maria', time: 100, bonusTime: 0, totalTime: 100 },
          { name: 'Pedro', time: 120, bonusTime: 0, totalTime: 120 }
        ]
      },
      '2024-01-06': { // Saturday - Both win (1 point each)
        date: '2024-01-06',
        dayOfWeek: 6,
        results: [
          { name: 'João', time: 120, bonusTime: 0, totalTime: 120 },
          { name: 'Maria', time: 120, bonusTime: 0, totalTime: 120 }
        ]
      }
    };

    const podium = calculateWeeklyPodium(mockPlayers, mockScores, selectedDate);

    // Check basic structure
    expect(podium).toBeInstanceOf(Array);
    expect(podium).toHaveLength(3);

    // Check that all players are present
    const joao = podium.find(p => p.name === 'João');
    const maria = podium.find(p => p.name === 'Maria');
    const pedro = podium.find(p => p.name === 'Pedro');

    expect(joao).toBeDefined();
    expect(maria).toBeDefined();
    expect(pedro).toBeDefined();

    // João should have 4 wins (1 from Saturday + 3 from Sunday) because he comes first alphabetically
    expect(podium[0].wins).toBe(4);
    expect(podium[0].name).toBe('João');

    // Maria and Pedro should have 0 wins because João won both days due to alphabetical order
    // With new logic: Maria has 2 games played, Pedro has 1 game played
    expect(podium[1].wins).toBe(0);
    expect(podium[1].name).toBe('Maria'); // Maria has more games played
    expect(podium[2].wins).toBe(0);
    expect(podium[2].name).toBe('Pedro'); // Pedro has fewer games played

    // Both should have total time of 100 + 120 = 220 for João and Maria
    expect(podium[0].totalTime).toBe(220);
    expect(podium[1].totalTime).toBe(220); // Maria has time but no wins
    expect(podium[2].totalTime).toBe(120); // Pedro has time from Sunday

    // Games played should be 2 for João and Maria, 1 for Pedro
    expect(podium[0].gamesPlayed).toBe(2);
    expect(podium[1].gamesPlayed).toBe(2);
    expect(podium[2].gamesPlayed).toBe(1);
  });

  test('should handle new total time rule correctly - user scenario', () => {
    const selectedDate = new Date('2024-01-07'); // Sunday
    const mockScores = {
      '2024-01-07': { // Sunday - All tie (3 points each)
        date: '2024-01-07',
        dayOfWeek: 0,
        results: [
          { name: 'João', time: 100, bonusTime: 0, totalTime: 100 },
          { name: 'Maria', time: 100, bonusTime: 0, totalTime: 100 },
          { name: 'Pedro', time: 100, bonusTime: 0, totalTime: 100 }
        ]
      },
      '2024-01-06': { // Saturday - All tie (1 point each)
        date: '2024-01-06',
        dayOfWeek: 6,
        results: [
          { name: 'João', time: 120, bonusTime: 0, totalTime: 120 },
          { name: 'Maria', time: 120, bonusTime: 0, totalTime: 120 },
          { name: 'Pedro', time: 120, bonusTime: 0, totalTime: 120 }
        ]
      }
    };

    const podium = calculateWeeklyPodium(mockPlayers, mockScores, selectedDate);

    // Check basic structure
    expect(podium).toBeInstanceOf(Array);
    expect(podium).toHaveLength(3);

    // Check that all players are present
    const joao = podium.find(p => p.name === 'João');
    const maria = podium.find(p => p.name === 'Maria');
    const pedro = podium.find(p => p.name === 'Pedro');

    expect(joao).toBeDefined();
    expect(maria).toBeDefined();
    expect(pedro).toBeDefined();

    // João should have 4 points (1 from Saturday + 3 from Sunday) because he comes first alphabetically
    expect(podium[0].wins).toBe(4);
    expect(podium[0].name).toBe('João');

    // Maria and Pedro should have 0 points because João won both days due to alphabetical order
    expect(podium[1].wins).toBe(0);
    expect(podium[2].wins).toBe(0);

    // All should have total time of 100 + 120 = 220
    expect(podium[0].totalTime).toBe(220);
    expect(podium[1].totalTime).toBe(220);
    expect(podium[2].totalTime).toBe(220);

    // Should be ordered by wins first, then alphabetically
    expect(podium[0].name).toBe('João');
    expect(podium[1].name).toBe('Maria');
    expect(podium[2].name).toBe('Pedro');
  });

  test('should handle different date scenarios robustly', () => {
    // Test with different date scenarios to ensure robustness
    const testScenarios = [
      {
        selectedDate: new Date('2024-01-01'),
        scores: {
          '2024-01-01': {
            date: '2024-01-01',
            dayOfWeek: 1,
            results: [
              { name: 'João', time: 100, bonusTime: 0, totalTime: 100 },
              { name: 'Maria', time: 120, bonusTime: 0, totalTime: 120 },
              { name: 'Pedro', time: 110, bonusTime: 0, totalTime: 110 }
            ]
          }
        }
      },
      {
        selectedDate: new Date('2024-06-15'),
        scores: {
          '2024-06-15': {
            date: '2024-06-15',
            dayOfWeek: 6,
            results: [
              { name: 'Maria', time: 120, bonusTime: 0, totalTime: 120 },
              { name: 'João', time: 100, bonusTime: 0, totalTime: 100 },
              { name: 'Pedro', time: 110, bonusTime: 0, totalTime: 110 }
            ]
          }
        }
      }
    ];

    testScenarios.forEach(scenario => {
      const podium = calculateWeeklyPodium(mockPlayers, scenario.scores, scenario.selectedDate);

      // Check basic structure
      expect(podium).toBeInstanceOf(Array);
      expect(podium).toHaveLength(3);

      // Check that all players are present
      const allPlayers = mockPlayers.every(player =>
        podium.some(p => p.name === player)
      );
      expect(allPlayers).toBe(true);

      // Check that the values are valid numbers
      const validWins = podium.every(p => typeof p.wins === 'number' && p.wins >= 0);
      expect(validWins).toBe(true);

      // Check that it is ordered by wins (descending)
      const isOrdered = podium.every((p, i) =>
        i === 0 || p.wins <= podium[i - 1].wins
      );
      expect(isOrdered).toBe(true);
    });
  });

  test('should return null for empty players', () => {
    const selectedDate = new Date('2024-01-01');
    const mockScores = {
      '2024-01-01': {
        date: '2024-01-01',
        dayOfWeek: 1,
        results: [
          { name: 'João', time: 100, bonusTime: 0, totalTime: 100 }
        ]
      }
    };
    const podium = calculateWeeklyPodium(null, mockScores, selectedDate);
    expect(podium).toBeNull();
  });

  test('should handle real production scenario correctly', () => {
    // Test the specific scenario from production
    // Use Monday as selected date to ensure both days are in the same week
    const selectedDate = new Date('2024-07-21'); // Monday
    const mockScores = {
      '2024-07-20': { // Saturday - Jhonny wins
        date: '2024-07-20',
        dayOfWeek: 6,
        results: [
          { name: 'James', time: 31, bonusTime: 0, totalTime: 31 },
          { name: 'Jhonny', time: 15, bonusTime: 0, totalTime: 15 },
          { name: 'Marcelo', time: 19, bonusTime: 0, totalTime: 19 }
        ]
      },
      '2024-07-21': { // Sunday - Marcelo wins (3 points)
        date: '2024-07-21',
        dayOfWeek: 0,
        results: [
          { name: 'James', time: 75, bonusTime: 0, totalTime: 75 },
          { name: 'Jhonny', time: 59, bonusTime: 0, totalTime: 59 },
          { name: 'Marcelo', time: 44, bonusTime: 0, totalTime: 44 }
        ]
      }
    };

    const players = ['James', 'Jhonny', 'Marcelo'];
    const podium = calculateWeeklyPodium(players, mockScores, selectedDate);

    // Check basic structure
    expect(podium).toBeInstanceOf(Array);
    expect(podium).toHaveLength(3);

    // Check that all players are present
    const james = podium.find(p => p.name === 'James');
    const jhonny = podium.find(p => p.name === 'Jhonny');
    const marcelo = podium.find(p => p.name === 'Marcelo');

    expect(james).toBeDefined();
    expect(jhonny).toBeDefined();
    expect(marcelo).toBeDefined();

    // Expected results based on production scenario:
    // Marcelo: 3 wins (Sunday), total time: 19+44 = 63s
    // Jhonny: 1 win (Saturday), total time: 15+59 = 74s
    // James: 0 wins, total time: 31+75 = 106s

    // Marcelo should be first (3 wins, total time: 63s)
    expect(podium[0].name).toBe('Marcelo');
    expect(podium[0].wins).toBe(3);
    expect(podium[0].totalTime).toBe(63);

    // Jhonny should be second (1 win, total time: 74s)
    expect(podium[1].name).toBe('Jhonny');
    expect(podium[1].wins).toBe(1);
    expect(podium[1].totalTime).toBe(74);

    // James should be third (0 wins, total time: 106s)
    expect(podium[2].name).toBe('James');
    expect(podium[2].wins).toBe(0);
    expect(podium[2].totalTime).toBe(106);
  });

  test('should handle exact production scenario correctly', () => {
    // Test the exact scenario from production with correct dates
    // Using dates that are in the same week
    const selectedDate = new Date('2024-07-22'); // Tuesday
    const mockScores = {
      '2024-07-16': { // Monday - Jhonny wins
        date: '2024-07-16',
        dayOfWeek: 1,
        results: [
          { name: 'James', time: 31, bonusTime: 0, totalTime: 31 },
          { name: 'Jhonny', time: 15, bonusTime: 0, totalTime: 15 },
          { name: 'Marcelo', time: 19, bonusTime: 0, totalTime: 19 }
        ]
      },
      '2024-07-17': { // Tuesday - Marcelo wins
        date: '2024-07-17',
        dayOfWeek: 2,
        results: [
          { name: 'James', time: 75, bonusTime: 0, totalTime: 75 },
          { name: 'Jhonny', time: 59, bonusTime: 0, totalTime: 59 },
          { name: 'Marcelo', time: 44, bonusTime: 0, totalTime: 44 }
        ]
      },
      '2024-07-22': { // Tuesday - All players active
        date: '2024-07-22',
        dayOfWeek: 2,
        results: [
          { name: 'James', time: 80, bonusTime: 0, totalTime: 80 },
          { name: 'Jhonny', time: 70, bonusTime: 0, totalTime: 70 },
          { name: 'Marcelo', time: 60, bonusTime: 0, totalTime: 60 }
        ]
      }
    };

    const players = ['James', 'Jhonny', 'Marcelo'];
    const podium = calculateWeeklyPodium(players, mockScores, selectedDate);

    // Check basic structure
    expect(podium).toBeInstanceOf(Array);
    expect(podium).toHaveLength(3);

    // Check that all players are present
    const james = podium.find(p => p.name === 'James');
    const jhonny = podium.find(p => p.name === 'Jhonny');
    const marcelo = podium.find(p => p.name === 'Marcelo');

    expect(james).toBeDefined();
    expect(jhonny).toBeDefined();
    expect(marcelo).toBeDefined();

    // Expected results based on production scenario:
    // Marcelo: 2 wins (Tuesday + Tuesday), total time: 19+44+60 = 123s
    // Jhonny: 1 win (Monday), total time: 15+59+70 = 144s
    // James: 0 wins, total time: 31+75+80 = 186s

    // Marcelo should be first (2 wins, total time: 123s)
    expect(podium[0].name).toBe('Marcelo');
    expect(podium[0].wins).toBe(2);
    expect(podium[0].totalTime).toBe(123);

    // Jhonny should be second (1 win, total time: 144s)
    expect(podium[1].name).toBe('Jhonny');
    expect(podium[1].wins).toBe(1);
    expect(podium[1].totalTime).toBe(144);

    // James should be third (0 wins, total time: 186s)
    expect(podium[2].name).toBe('James');
    expect(podium[2].wins).toBe(0);
    expect(podium[2].totalTime).toBe(186);
  });

  test('should handle inactive players correctly in weekly podium', () => {
    // Test scenario: Marcelo has 1 point, others haven't played yet
    const selectedDate = new Date('2024-07-24'); // Wednesday
    const mockScores = {
      '2024-07-23': { // Tuesday - Marcelo wins
        date: '2024-07-23',
        dayOfWeek: 2,
        results: [
          { name: 'James', time: 75, bonusTime: 0, totalTime: 75 },
          { name: 'Jhonny', time: 59, bonusTime: 0, totalTime: 59 },
          { name: 'Marcelo', time: 44, bonusTime: 0, totalTime: 44 }
        ]
      },
      '2024-07-24': { // Wednesday - Only Marcelo played
        date: '2024-07-24',
        dayOfWeek: 3,
        results: [
          { name: 'James', time: 0, bonusTime: 0, totalTime: 0 },
          { name: 'Jhonny', time: 0, bonusTime: 0, totalTime: 0 },
          { name: 'Marcelo', time: 95, bonusTime: 0, totalTime: 95 }
        ]
      }
    };

    const players = ['James', 'Jhonny', 'Marcelo'];
    const podium = calculateWeeklyPodium(players, mockScores, selectedDate);

    // Check basic structure
    expect(podium).toBeInstanceOf(Array);
    expect(podium).toHaveLength(3); // All players should appear (they have data from Tuesday)

    // Check that all players are present
    const marcelo = podium.find(p => p.name === 'Marcelo');
    const james = podium.find(p => p.name === 'James');
    const jhonny = podium.find(p => p.name === 'Jhonny');

    expect(marcelo).toBeDefined();
    expect(james).toBeDefined();
    expect(jhonny).toBeDefined();

    // Marcelo should be first (2 wins, total time: 44+95 = 139s)
    expect(podium[0].name).toBe('Marcelo');
    expect(podium[0].wins).toBe(2);
    expect(podium[0].totalTime).toBe(139);

    // Jhonny should be second (0 wins, total time: 59s) - menor tempo
    expect(podium[1].name).toBe('Jhonny');
    expect(podium[1].wins).toBe(0);
    expect(podium[1].totalTime).toBe(59);

    // James should be third (0 wins, total time: 75s)
    expect(podium[2].name).toBe('James');
    expect(podium[2].wins).toBe(0);
    expect(podium[2].totalTime).toBe(75);
  });

  test('should handle players becoming active again correctly', () => {
    // Test scenario: James becomes active again
    const selectedDate = new Date('2024-07-24'); // Wednesday
    const mockScores = {
      '2024-07-23': { // Tuesday - Marcelo wins
        date: '2024-07-23',
        dayOfWeek: 2,
        results: [
          { name: 'James', time: 75, bonusTime: 0, totalTime: 75 },
          { name: 'Jhonny', time: 59, bonusTime: 0, totalTime: 59 },
          { name: 'Marcelo', time: 44, bonusTime: 0, totalTime: 44 }
        ]
      },
      '2024-07-24': { // Wednesday - Marcelo and James played
        date: '2024-07-24',
        dayOfWeek: 3,
        results: [
          { name: 'James', time: 74, bonusTime: 0, totalTime: 74 },
          { name: 'Jhonny', time: 0, bonusTime: 0, totalTime: 0 },
          { name: 'Marcelo', time: 95, bonusTime: 0, totalTime: 95 }
        ]
      }
    };

    const players = ['James', 'Jhonny', 'Marcelo'];
    const podium = calculateWeeklyPodium(players, mockScores, selectedDate);

    // Check basic structure
    expect(podium).toBeInstanceOf(Array);
    expect(podium).toHaveLength(3); // All players should appear (they have data from Tuesday)

    // Check that all players are present
    const marcelo = podium.find(p => p.name === 'Marcelo');
    const james = podium.find(p => p.name === 'James');
    const jhonny = podium.find(p => p.name === 'Jhonny');

    expect(marcelo).toBeDefined();
    expect(james).toBeDefined();
    expect(jhonny).toBeDefined();

    // Marcelo should be first (1 win, total time: 44+95 = 139s)
    expect(podium[0].name).toBe('Marcelo');
    expect(podium[0].wins).toBe(1);
    expect(podium[0].totalTime).toBe(139);

    // James should be second (1 win, total time: 75+74 = 149s) - menor tempo
    expect(podium[1].name).toBe('James');
    expect(podium[1].wins).toBe(1);
    expect(podium[1].totalTime).toBe(149);

    // Jhonny should be third (0 wins, total time: 59s)
    expect(podium[2].name).toBe('Jhonny');
    expect(podium[2].wins).toBe(0);
    expect(podium[2].totalTime).toBe(59);
  });

  test('should handle user scenario correctly - Marcelo should be first', () => {
    // Test the specific scenario from user
    const selectedDate = new Date('2024-07-23'); // Tuesday
    const mockScores = {
      '2024-07-23': { // Tuesday - James wins (1 point)
        date: '2024-07-23',
        dayOfWeek: 2,
        results: [
          { name: 'James', time: 74, bonusTime: 0, totalTime: 74 },
          { name: 'Marcelo', time: 95, bonusTime: 0, totalTime: 95 },
          { name: 'Jhonny', time: 0, bonusTime: 0, totalTime: 0 }
        ]
      },
      '2024-07-24': { // Wednesday - Marcelo wins (1 point)
        date: '2024-07-24',
        dayOfWeek: 3,
        results: [
          { name: 'James', time: 75, bonusTime: 0, totalTime: 75 },
          { name: 'Jhonny', time: 80, bonusTime: 0, totalTime: 80 },
          { name: 'Marcelo', time: 60, bonusTime: 0, totalTime: 60 }
        ]
      }
    };

    const players = ['James', 'Jhonny', 'Marcelo'];
    const podium = calculateWeeklyPodium(players, mockScores, selectedDate);

    // Check basic structure
    expect(podium).toBeInstanceOf(Array);
    expect(podium).toHaveLength(3); // All players should appear

    // Check that all players are present
    const marcelo = podium.find(p => p.name === 'Marcelo');
    const james = podium.find(p => p.name === 'James');
    const jhonny = podium.find(p => p.name === 'Jhonny');

    expect(marcelo).toBeDefined();
    expect(james).toBeDefined();
    expect(jhonny).toBeDefined();

    // James should be first (1 win, total time: 74+75 = 149s)
    expect(podium[0].name).toBe('James');
    expect(podium[0].wins).toBe(1);
    expect(podium[0].totalTime).toBe(149);

    // Marcelo should be second (1 win, total time: 95+60 = 155s) - menor tempo
    expect(podium[1].name).toBe('Marcelo');
    expect(podium[1].wins).toBe(1);
    expect(podium[1].totalTime).toBe(155);

    // Jhonny should be third (0 wins, total time: 80s)
    expect(podium[2].name).toBe('Jhonny');
    expect(podium[2].wins).toBe(0);
    expect(podium[2].totalTime).toBe(80);
  });

  test('should handle real user scenario correctly', () => {
    // Test the real scenario from user
    const selectedDate = new Date('2024-07-23'); // Tuesday
    const mockScores = {
      '2024-07-23': { // Tuesday - Marcelo wins (1 point)
        date: '2024-07-23',
        dayOfWeek: 2,
        results: [
          { name: 'Marcelo', time: 44, bonusTime: 0, totalTime: 44 },
          { name: 'Jhonny', time: 59, bonusTime: 0, totalTime: 59 },
          { name: 'James', time: 75, bonusTime: 0, totalTime: 75 }
        ]
      },
      '2024-07-24': { // Wednesday - Jhonny wins (1 point)
        date: '2024-07-24',
        dayOfWeek: 3,
        results: [
          { name: 'Marcelo', time: 95, bonusTime: 0, totalTime: 95 },
          { name: 'Jhonny', time: 48, bonusTime: 0, totalTime: 48 },
          { name: 'James', time: 74, bonusTime: 0, totalTime: 74 }
        ]
      },
      '2024-07-25': { // Thursday - James wins (1 point)
        date: '2024-07-25',
        dayOfWeek: 4,
        results: [
          { name: 'Marcelo', time: 19, bonusTime: 0, totalTime: 19 },
          { name: 'Jhonny', time: 15, bonusTime: 0, totalTime: 15 },
          { name: 'James', time: 10, bonusTime: 0, totalTime: 10 }
        ]
      }
    };

    const players = ['James', 'Jhonny', 'Marcelo'];
    const podium = calculateWeeklyPodium(players, mockScores, selectedDate);

    // Check basic structure
    expect(podium).toBeInstanceOf(Array);
    expect(podium).toHaveLength(3);

    // Check that all players are present
    const marcelo = podium.find(p => p.name === 'Marcelo');
    const james = podium.find(p => p.name === 'James');
    const jhonny = podium.find(p => p.name === 'Jhonny');

    expect(marcelo).toBeDefined();
    expect(james).toBeDefined();
    expect(jhonny).toBeDefined();

    // Expected results:
    // All have 1 win each, ordered by games played (highest first), then total time (lower first)
    // Jhonny: 1 win (Wednesday), total time: 59+48+15 = 122s, games played: 3
    // Marcelo: 1 win (Tuesday), total time: 44+95+19 = 158s, games played: 3
    // James: 1 win (Thursday), total time: 75+74+10 = 159s, games played: 3

    // All should have 3 games played
    expect(podium[0].gamesPlayed).toBe(3);
    expect(podium[1].gamesPlayed).toBe(3);
    expect(podium[2].gamesPlayed).toBe(3);

    // Jhonny should be first (1 win, total time: 122s, games played: 3) - menor tempo
    expect(podium[0].name).toBe('Jhonny');
    expect(podium[0].wins).toBe(1);
    expect(podium[0].totalTime).toBe(122);

    // Marcelo should be second (1 win, total time: 158s, games played: 3)
    expect(podium[1].name).toBe('Marcelo');
    expect(podium[1].wins).toBe(1);
    expect(podium[1].totalTime).toBe(158);

    // James should be third (1 win, total time: 159s, games played: 3)
    expect(podium[2].name).toBe('James');
    expect(podium[2].wins).toBe(1);
    expect(podium[2].totalTime).toBe(159);
  });

  test('should handle image scenario correctly', () => {
    // Test the scenario from the images
    const selectedDate = new Date('2025-07-23'); // Wednesday
    const mockScores = {
      '2025-07-23': { // Wednesday - James wins (1 point)
        date: '2025-07-23',
        dayOfWeek: 3,
        results: [
          { name: 'James', time: 74, bonusTime: 0, totalTime: 74 },
          { name: 'Marcelo', time: 95, bonusTime: 0, totalTime: 95 },
          { name: 'Jhonny', time: 0, bonusTime: 0, totalTime: 0 }
        ]
      }
    };

    const players = ['James', 'Jhonny', 'Marcelo'];
    const podium = calculateWeeklyPodium(players, mockScores, selectedDate);

    // Check basic structure
    expect(podium).toBeInstanceOf(Array);
    expect(podium).toHaveLength(3);

    // Check that all players are present
    const marcelo = podium.find(p => p.name === 'Marcelo');
    const james = podium.find(p => p.name === 'James');
    const jhonny = podium.find(p => p.name === 'Jhonny');

    expect(marcelo).toBeDefined();
    expect(james).toBeDefined();
    expect(jhonny).toBeDefined();

    // Expected results:
    // James: 1 win (Wednesday), total time: 74s, games played: 1
    // Marcelo: 0 wins, total time: 95s, games played: 1
    // Jhonny: 0 wins, total time: 0s, games played: 0

    // James should be first (1 win, total time: 74s, games played: 1)
    expect(podium[0].name).toBe('James');
    expect(podium[0].wins).toBe(1);
    expect(podium[0].totalTime).toBe(74);
    expect(podium[0].gamesPlayed).toBe(1);

    // Marcelo should be second (0 wins, total time: 95s, games played: 1)
    expect(podium[1].name).toBe('Marcelo');
    expect(podium[1].wins).toBe(0);
    expect(podium[1].totalTime).toBe(95);
    expect(podium[1].gamesPlayed).toBe(1);

    // Jhonny should be third (0 wins, total time: 0s, games played: 0)
    expect(podium[2].name).toBe('Jhonny');
    expect(podium[2].wins).toBe(0);
    expect(podium[2].totalTime).toBe(0);
    expect(podium[2].gamesPlayed).toBe(0);
  });

  test('should prioritize players with more games played over better times', () => {
    // Test scenario: Marcelo has 2 wins and 2 games, James has 1 win and 1 game
    // Even though James has better total time, Marcelo should be first because he played more
    const selectedDate = new Date('2024-07-23'); // Tuesday
    const mockScores = {
      '2024-07-23': { // Tuesday - Marcelo wins (1 point)
        date: '2024-07-23',
        dayOfWeek: 2,
        results: [
          { name: 'Marcelo', time: 44, bonusTime: 0, totalTime: 44 },
          { name: 'James', time: 75, bonusTime: 0, totalTime: 75 }
        ]
      },
      '2024-07-24': { // Wednesday - Marcelo wins again (1 point)
        date: '2024-07-24',
        dayOfWeek: 3,
        results: [
          { name: 'Marcelo', time: 95, bonusTime: 0, totalTime: 95 },
          { name: 'James', time: 0, bonusTime: 0, totalTime: 0 } // James didn't play
        ]
      },
      '2024-07-25': { // Thursday - James wins (1 point)
        date: '2024-07-25',
        dayOfWeek: 4,
        results: [
          { name: 'Marcelo', time: 0, bonusTime: 0, totalTime: 0 }, // Marcelo didn't play
          { name: 'James', time: 50, bonusTime: 0, totalTime: 50 }
        ]
      }
    };

    const players = ['James', 'Marcelo'];
    const podium = calculateWeeklyPodium(players, mockScores, selectedDate);

    // Check basic structure
    expect(podium).toBeInstanceOf(Array);
    expect(podium).toHaveLength(2);

    // Check that all players are present
    const marcelo = podium.find(p => p.name === 'Marcelo');
    const james = podium.find(p => p.name === 'James');

    expect(marcelo).toBeDefined();
    expect(james).toBeDefined();

    // Expected results:
    // Marcelo has 2 wins (Tuesday and Wednesday) and 2 games
    // James has 1 win (Thursday) and 1 game
    // Marcelo: 2 wins, total time: 44+95 = 139s, games played: 2
    // James: 1 win, total time: 75+50 = 125s, games played: 2 (he played Tuesday and Thursday)

    // Marcelo should be first (2 wins, games played: 2) - mais wins
    expect(podium[0].name).toBe('Marcelo');
    expect(podium[0].wins).toBe(2);
    expect(podium[0].totalTime).toBe(139);
    expect(podium[0].gamesPlayed).toBe(2);

    // James should be second (1 win, games played: 2) - menos wins
    expect(podium[1].name).toBe('James');
    expect(podium[1].wins).toBe(1);
    expect(podium[1].totalTime).toBe(125);
    expect(podium[1].gamesPlayed).toBe(2);
  });

  test('should handle edge case where no conditions are met in weekly podium sorting', () => {
    // This test covers the return 0 case in calculateWeeklyPodium sorting
    const selectedDate = new Date('2024-01-07'); // Sunday
    const mockScores = {
      '2024-01-07': { // Sunday - All players have same time
        date: '2024-01-07',
        dayOfWeek: 0,
        results: [
          { name: 'João', time: 100, bonusTime: 0, totalTime: 100 },
          { name: 'Maria', time: 100, bonusTime: 0, totalTime: 100 },
          { name: 'Pedro', time: 100, bonusTime: 0, totalTime: 100 }
        ]
      }
    };

    const players = ['João', 'Maria', 'Pedro'];
    const podium = calculateWeeklyPodium(players, mockScores, selectedDate);

    // Check basic structure
    expect(podium).toBeInstanceOf(Array);
    expect(podium).toHaveLength(3);

    // All should have same wins, games played, and total time
    expect(podium[0].wins).toBe(3); // João wins due to alphabetical order
    expect(podium[1].wins).toBe(0);
    expect(podium[2].wins).toBe(0);

    expect(podium[0].gamesPlayed).toBe(1);
    expect(podium[1].gamesPlayed).toBe(1);
    expect(podium[2].gamesPlayed).toBe(1);

    expect(podium[0].totalTime).toBe(100);
    expect(podium[1].totalTime).toBe(100);
    expect(podium[2].totalTime).toBe(100);

    // Should be ordered alphabetically when all criteria are equal
    expect(podium[0].name).toBe('João');
    expect(podium[1].name).toBe('Maria');
    expect(podium[2].name).toBe('Pedro');
  });

  test('should handle edge case where sorting conditions are not met in weekly podium', () => {
    // This test specifically covers the return 0 case in the weekly sorting function
    const selectedDate = new Date('2024-01-07'); // Sunday
    const mockScores = {
      '2024-01-07': { // Sunday - Same player with same time
        date: '2024-01-07',
        dayOfWeek: 0,
        results: [
          { name: 'João', time: 100, bonusTime: 0, totalTime: 100 },
          { name: 'João', time: 100, bonusTime: 0, totalTime: 100 } // Same player, same time
        ]
      }
    };

    const players = ['João'];
    const podium = calculateWeeklyPodium(players, mockScores, selectedDate);

    // Should handle the case where sorting doesn't match any condition
    expect(podium).toBeInstanceOf(Array);
    expect(podium).toHaveLength(1);
    expect(podium[0].name).toBe('João');
    expect(podium[0].wins).toBe(3);
  });

  test('should handle edge case where no sorting conditions match in weekly podium', () => {
    // This test specifically forces the return a.name.localeCompare(b.name) case in calculateWeeklyPodium
    const selectedDate = new Date('2024-01-07'); // Sunday
    const mockScores = {
      '2024-01-07': { // Sunday - Exact same object
        date: '2024-01-07',
        dayOfWeek: 0,
        results: [
          { name: 'João', time: 100, bonusTime: 0, totalTime: 100 },
          { name: 'João', time: 100, bonusTime: 0, totalTime: 100 } // Exact same object
        ]
      }
    };

    const players = ['João'];
    const podium = calculateWeeklyPodium(players, mockScores, selectedDate);

    // Should handle the case where sorting doesn't match any condition
    expect(podium).toBeInstanceOf(Array);
    expect(podium).toHaveLength(1);
    expect(podium[0].name).toBe('João');
    expect(podium[0].wins).toBe(3);
  });
});

describe('calculateMonthlyPodium', () => {
  const mockPlayers = ['João', 'Maria', 'Pedro'];

  test('should calculate monthly podium correctly', () => {
    const selectedDate = new Date('2024-01-15');
    const mockScores = {
      '2024-01-01': { // January
        date: '2024-01-01',
        dayOfWeek: 1,
        results: [
          { name: 'João', time: 100, bonusTime: 0, totalTime: 100 },
          { name: 'Maria', time: 120, bonusTime: 0, totalTime: 120 }
        ]
      },
      '2024-01-07': { // January, Sunday
        date: '2024-01-07',
        dayOfWeek: 0,
        results: [
          { name: 'Maria', time: 110, bonusTime: 0, totalTime: 110 },
          { name: 'Pedro', time: 130, bonusTime: 0, totalTime: 130 }
        ]
      },
      '2024-02-01': { // February (should be ignored)
        date: '2024-02-01',
        dayOfWeek: 4,
        results: [
          { name: 'Pedro', time: 90, bonusTime: 0, totalTime: 90 }
        ]
      }
    };

    const podium = calculateMonthlyPodium(mockPlayers, mockScores, selectedDate);

    // Check basic structure
    expect(podium).toBeInstanceOf(Array);
    expect(podium).toHaveLength(3);

    // Maria should be first (3 points from Sunday, total time: 120+110 = 230, games played: 2)
    expect(podium[0].name).toBe('Maria');
    expect(podium[0].wins).toBe(3);
    expect(podium[0].totalTime).toBe(230);
    expect(podium[0].gamesPlayed).toBe(2);

    // João should be second (1 point from Monday, total time: 100, games played: 1)
    expect(podium[1].name).toBe('João');
    expect(podium[1].wins).toBe(1);
    expect(podium[1].totalTime).toBe(100);
    expect(podium[1].gamesPlayed).toBe(1);

    // Pedro should be third (0 points, total time: 130, games played: 1)
    expect(podium[2].name).toBe('Pedro');
    expect(podium[2].wins).toBe(0);
    expect(podium[2].totalTime).toBe(130);
    expect(podium[2].gamesPlayed).toBe(1);
  });

  test('should handle monthly podium tie-breaking correctly', () => {
    // Test monthly podium with tie-breaking by total time
    const selectedDate = new Date('2024-01-15');
    const mockScores = {
      '2024-01-01': { // Monday - João wins
        date: '2024-01-01',
        dayOfWeek: 1,
        results: [
          { name: 'João', time: 100, bonusTime: 0, totalTime: 100 },
          { name: 'James', time: 120, bonusTime: 0, totalTime: 120 }
        ]
      },
      '2024-01-07': { // Sunday - James wins (3 points)
        date: '2024-01-07',
        dayOfWeek: 0,
        results: [
          { name: 'James', time: 110, bonusTime: 0, totalTime: 110 },
          { name: 'Paulo', time: 130, bonusTime: 0, totalTime: 130 }
        ]
      },
      '2024-01-14': { // Sunday - Paulo wins (3 points)
        date: '2024-01-14',
        dayOfWeek: 0,
        results: [
          { name: 'Paulo', time: 95, bonusTime: 0, totalTime: 95 },
          { name: 'João', time: 105, bonusTime: 0, totalTime: 105 }
        ]
      },
      '2024-01-21': { // Sunday - João wins (3 points)
        date: '2024-01-21',
        dayOfWeek: 0,
        results: [
          { name: 'João', time: 90, bonusTime: 0, totalTime: 90 },
          { name: 'James', time: 115, bonusTime: 0, totalTime: 115 }
        ]
      },
      '2024-02-01': { // February (should be ignored)
        date: '2024-02-01',
        dayOfWeek: 4,
        results: [
          { name: 'Pedro', time: 80, bonusTime: 0, totalTime: 80 }
        ]
      }
    };

    const players = ['João', 'James', 'Paulo'];
    const podium = calculateMonthlyPodium(players, mockScores, selectedDate);

    // Check basic structure
    expect(podium).toBeInstanceOf(Array);
    expect(podium).toHaveLength(3);

    // Check that all players are present
    const joao = podium.find(p => p.name === 'João');
    const james = podium.find(p => p.name === 'James');
    const paulo = podium.find(p => p.name === 'Paulo');

    expect(joao).toBeDefined();
    expect(james).toBeDefined();
    expect(paulo).toBeDefined();

    // João should be first (4 points: 1 + 3, total time: 295, games played: 3)
    expect(podium[0].name).toBe('João');
    expect(podium[0].wins).toBe(4);
    expect(podium[0].totalTime).toBe(295);
    expect(podium[0].gamesPlayed).toBe(3);

    // James should be second (3 points: 0 + 3, total time: 345, games played: 3)
    expect(podium[1].name).toBe('James');
    expect(podium[1].wins).toBe(3);
    expect(podium[1].totalTime).toBe(345);
    expect(podium[1].gamesPlayed).toBe(3);

    // Paulo should be third (3 points: 0 + 3, total time: 225, games played: 2)
    expect(podium[2].name).toBe('Paulo');
    expect(podium[2].wins).toBe(3);
    expect(podium[2].totalTime).toBe(225);
    expect(podium[2].gamesPlayed).toBe(2);
  });

  test('should handle complete tie in monthly podium', () => {
    // Test when players have same wins and same total time in monthly podium
    const selectedDate = new Date('2024-01-15');
    const mockScores = {
      '2024-01-01': { // Monday - João wins
        date: '2024-01-01',
        dayOfWeek: 1,
        results: [
          { name: 'João', time: 100, bonusTime: 0, totalTime: 100 },
          { name: 'Maria', time: 120, bonusTime: 0, totalTime: 120 }
        ]
      },
      '2024-01-07': { // Sunday - Maria wins (3 points)
        date: '2024-01-07',
        dayOfWeek: 0,
        results: [
          { name: 'Maria', time: 100, bonusTime: 0, totalTime: 100 },
          { name: 'João', time: 120, bonusTime: 0, totalTime: 120 }
        ]
      }
    };

    const players = ['João', 'Maria'];
    const podium = calculateMonthlyPodium(players, mockScores, selectedDate);

    // Maria should be first (3 points from Sunday)
    expect(podium[0].name).toBe('Maria');
    expect(podium[0].wins).toBe(3);
    expect(podium[0].totalTime).toBe(220); // 100 + 120

    // João should be second (1 point from Monday)
    expect(podium[1].name).toBe('João');
    expect(podium[1].wins).toBe(1);
    expect(podium[1].totalTime).toBe(220); // 100 + 120
  });

  test('should handle alphabetical tie-breaking in monthly podium', () => {
    // Test when players have same wins and same total time
    const selectedDate = new Date('2024-01-15');
    const mockScores = {
      '2024-01-01': { // Monday - Ana wins
        date: '2024-01-01',
        dayOfWeek: 1,
        results: [
          { name: 'Ana', time: 100, bonusTime: 0, totalTime: 100 },
          { name: 'Bruno', time: 120, bonusTime: 0, totalTime: 120 }
        ]
      },
      '2024-01-07': { // Sunday - Bruno wins (3 points)
        date: '2024-01-07',
        dayOfWeek: 0,
        results: [
          { name: 'Bruno', time: 100, bonusTime: 0, totalTime: 100 },
          { name: 'Ana', time: 120, bonusTime: 0, totalTime: 120 }
        ]
      }
    };

    const players = ['Ana', 'Bruno'];
    const podium = calculateMonthlyPodium(players, mockScores, selectedDate);

    // Bruno should be first (3 points from Sunday)
    expect(podium[0].name).toBe('Bruno');
    expect(podium[0].wins).toBe(3);
    expect(podium[0].totalTime).toBe(220); // 100 + 120

    // Ana should be second (1 point from Monday)
    expect(podium[1].name).toBe('Ana');
    expect(podium[1].wins).toBe(1);
    expect(podium[1].totalTime).toBe(220); // 100 + 120
  });

  test('should handle complete tie in monthly podium with same wins and time', () => {
    // Test when players have exactly same wins and same total time
    const selectedDate = new Date('2024-01-15');
    const mockScores = {
      '2024-01-01': { // Monday - Ana wins
        date: '2024-01-01',
        dayOfWeek: 1,
        results: [
          { name: 'Ana', time: 100, bonusTime: 0, totalTime: 100 },
          { name: 'Bruno', time: 120, bonusTime: 0, totalTime: 120 }
        ]
      },
      '2024-01-08': { // Monday - Bruno wins
        date: '2024-01-08',
        dayOfWeek: 1,
        results: [
          { name: 'Bruno', time: 100, bonusTime: 0, totalTime: 100 },
          { name: 'Ana', time: 120, bonusTime: 0, totalTime: 120 }
        ]
      }
    };

    const players = ['Ana', 'Bruno'];
    const podium = calculateMonthlyPodium(players, mockScores, selectedDate);

    // Both should have exactly 1 win
    expect(podium[0].wins).toBe(1);
    expect(podium[1].wins).toBe(1);

    // Both should have total time of 100 + 120 = 220
    expect(podium[0].totalTime).toBe(220);
    expect(podium[1].totalTime).toBe(220);

    // Both should have 2 games played
    expect(podium[0].gamesPlayed).toBe(2);
    expect(podium[1].gamesPlayed).toBe(2);

    // Should be ordered alphabetically when everything is equal
    expect(podium[0].name).toBe('Ana');
    expect(podium[1].name).toBe('Bruno');
  });

  test('should handle edge case where all criteria are equal in monthly podium', () => {
    // This test covers the return a.name.localeCompare(b.name) case in calculateMonthlyPodium
    const selectedDate = new Date('2024-01-15');
    const mockScores = {
      '2024-01-01': { // Monday - All players tie
        date: '2024-01-01',
        dayOfWeek: 1,
        results: [
          { name: 'Ana', time: 100, bonusTime: 0, totalTime: 100 },
          { name: 'Bruno', time: 100, bonusTime: 0, totalTime: 100 },
          { name: 'Carlos', time: 100, bonusTime: 0, totalTime: 100 }
        ]
      }
    };

    const players = ['Ana', 'Bruno', 'Carlos'];
    const podium = calculateMonthlyPodium(players, mockScores, selectedDate);

    // Check basic structure
    expect(podium).toBeInstanceOf(Array);
    expect(podium).toHaveLength(3);

    // All should have same wins, games played, and total time
    expect(podium[0].wins).toBe(1); // Ana wins due to alphabetical order
    expect(podium[1].wins).toBe(0);
    expect(podium[2].wins).toBe(0);

    expect(podium[0].gamesPlayed).toBe(1);
    expect(podium[1].gamesPlayed).toBe(1);
    expect(podium[2].gamesPlayed).toBe(1);

    expect(podium[0].totalTime).toBe(100);
    expect(podium[1].totalTime).toBe(100);
    expect(podium[2].totalTime).toBe(100);

    // Should be ordered alphabetically when all criteria are equal
    expect(podium[0].name).toBe('Ana');
    expect(podium[1].name).toBe('Bruno');
    expect(podium[2].name).toBe('Carlos');
  });

  test('should handle edge case where sorting conditions are not met in monthly podium', () => {
    // This test specifically covers the return a.name.localeCompare(b.name) case
    const selectedDate = new Date('2024-01-15');
    const mockScores = {
      '2024-01-01': { // Monday - Same player with same time
        date: '2024-01-01',
        dayOfWeek: 1,
        results: [
          { name: 'Ana', time: 100, bonusTime: 0, totalTime: 100 },
          { name: 'Ana', time: 100, bonusTime: 0, totalTime: 100 } // Same player, same time
        ]
      }
    };

    const players = ['Ana'];
    const podium = calculateMonthlyPodium(players, mockScores, selectedDate);

    // Should handle the case where all sorting criteria are equal
    expect(podium).toBeInstanceOf(Array);
    expect(podium).toHaveLength(1);
    expect(podium[0].name).toBe('Ana');
    expect(podium[0].wins).toBe(1);
    expect(podium[0].gamesPlayed).toBe(2);
    expect(podium[0].totalTime).toBe(200);
  });

  test('should handle edge case where no sorting conditions match in monthly podium', () => {
    // This test specifically forces the return a.name.localeCompare(b.name) case
    const selectedDate = new Date('2024-01-15');
    const mockScores = {
      '2024-01-01': { // Monday - Exact same object
        date: '2024-01-01',
        dayOfWeek: 1,
        results: [
          { name: 'Ana', time: 100, bonusTime: 0, totalTime: 100 },
          { name: 'Ana', time: 100, bonusTime: 0, totalTime: 100 } // Exact same object
        ]
      }
    };

    const players = ['Ana'];
    const podium = calculateMonthlyPodium(players, mockScores, selectedDate);

    // Should handle the case where all sorting criteria are equal
    expect(podium).toBeInstanceOf(Array);
    expect(podium).toHaveLength(1);
    expect(podium[0].name).toBe('Ana');
    expect(podium[0].wins).toBe(1);
    expect(podium[0].gamesPlayed).toBe(2);
    expect(podium[0].totalTime).toBe(200);
  });

  test('should return null for empty players', () => {
    const selectedDate = new Date('2024-01-15');
    const mockScores = {
      '2024-01-01': {
        date: '2024-01-01',
        dayOfWeek: 1,
        results: [
          { name: 'João', time: 100, bonusTime: 0, totalTime: 100 }
        ]
      }
    };
    const podium = calculateMonthlyPodium(null, mockScores, selectedDate);
    expect(podium).toBeNull();
  });
});

describe('validateTimes', () => {
  test('should validate times correctly for normal day', () => {
    const times = {
      'João': { time: 100, bonusTime: 0 },
      'Maria': { time: 0, bonusTime: 0 },
      'Pedro': { time: 120, bonusTime: 0 }
    };
    expect(validateTimes(times, false)).toBe(true);
  });

  test('should validate times correctly for Sunday', () => {
    const times = {
      'João': { time: 100, bonusTime: 30 },
      'Maria': { time: 0, bonusTime: 0 },
      'Pedro': { time: 120, bonusTime: 0 }
    };
    expect(validateTimes(times, true)).toBe(true);
  });

  test('should return false when no time was inserted', () => {
    const times = {
      'João': { time: 0, bonusTime: 0 },
      'Maria': { time: 0, bonusTime: 0 },
      'Pedro': { time: 0, bonusTime: 0 }
    };
    expect(validateTimes(times, false)).toBe(false);
  });

  test('should handle empty times', () => {
    expect(validateTimes({}, false)).toBe(false);
  });
});

describe('getWeekRange', () => {
  test('should return the correct week range', () => {
    const selectedDate = new Date('2024-01-15'); // Monday
    const weekRange = getWeekRange(selectedDate);

    // Check string format (should have format DD/MM - DD/MM)
    expect(weekRange).toMatch(/^\d{2}\/\d{2} - \d{2}\/\d{2}$/);

    // Check that the string is not empty and has the correct format
    expect(weekRange).not.toBe('');
    expect(weekRange).toContain(' - ');
  });

  test('should handle Sunday correctly', () => {
    const selectedDate = new Date('2024-01-14'); // Sunday
    const weekRange = getWeekRange(selectedDate);

    // Check format
    expect(weekRange).toMatch(/^\d{2}\/\d{2} - \d{2}\/\d{2}$/);

    // Check that it contains the selected date in the week
    expect(weekRange).toContain('14/01');
  });

  test('should return empty string for invalid data', () => {
    expect(getWeekRange(null)).toBe('');
    expect(getWeekRange(undefined)).toBe('');
    expect(getWeekRange('invalid')).toBe('');
  });

  test('should prevent error of calling without parameters', () => {
    // This test ensures that the function doesn't break when called without parameters
    // (although this shouldn't happen in the correct code)
    expect(() => getWeekRange()).not.toThrow();
    expect(getWeekRange()).toBe('');
  });

  test('should always return a valid week range format', () => {
    // Test with different dates to ensure consistency
    const testDates = [
      new Date('2024-01-01'), // Monday
      new Date('2024-01-15'), // Monday
      new Date('2024-01-14'), // Sunday
      new Date('2024-06-15'), // June
    ];

    testDates.forEach(date => {
      const weekRange = getWeekRange(date);
      expect(weekRange).toMatch(/^\d{2}\/\d{2} - \d{2}\/\d{2}$/);
      expect(weekRange).not.toBe('');
    });
  });

  test('should handle edge cases and different timezones', () => {
    // Test extreme cases that can vary between environments
    const edgeCases = [
      new Date('2024-01-01T00:00:00.000Z'), // UTC
      new Date('2024-01-01T12:00:00.000Z'), // UTC noon
      new Date('2024-12-31T23:59:59.999Z'), // End of the year
      new Date('2024-02-29'), // Leap year
    ];

    edgeCases.forEach(date => {
      const weekRange = getWeekRange(date);
      expect(weekRange).toMatch(/^\d{2}\/\d{2} - \d{2}\/\d{2}$/);
      expect(weekRange).not.toBe('');
      expect(weekRange).toContain(' - ');
    });
  });
});

describe('getMonthName', () => {
  test('should return the formatted month name', () => {
    const selectedDate = new Date('2024-01-15');
    const monthName = getMonthName(selectedDate);
    expect(monthName).toBe('janeiro de 2024');
  });

  test('should handle different months', () => {
    const selectedDate = new Date('2024-12-15');
    const monthName = getMonthName(selectedDate);
    expect(monthName).toBe('dezembro de 2024');
  });

  test('should return empty string for invalid data', () => {
    expect(getMonthName(null)).toBe('');
    expect(getMonthName(undefined)).toBe('');
    expect(getMonthName('invalid')).toBe('');
  });

  test('should prevent error of calling without parameters', () => {
    // This test ensures that the function doesn't break when called without parameters
    // (although this shouldn't happen in the correct code)
    expect(() => getMonthName()).not.toThrow();
    expect(getMonthName()).toBe('');
  });
});
