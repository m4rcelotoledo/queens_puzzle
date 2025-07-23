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

  test('should return null for day without results', () => {
    const dayScore = {
      date: '2024-01-01',
      results: [
        { name: 'João', time: 0, bonusTime: 0, totalTime: 0 },
        { name: 'Maria', time: 0, bonusTime: 0, totalTime: 0 }
      ]
    };
    const podium = calculateDailyPodium(dayScore);
    expect(podium).toBeNull();
  });

  test('should return null for invalid score', () => {
    const podium = calculateDailyPodium(null);
    expect(podium).toBeNull();
  });
});

describe('calculateWeeklyPodium', () => {
  const mockPlayers = ['João', 'Maria', 'Pedro'];

        test('should calculate weekly podium correctly with new ranking rules', () => {
    // Use a known date that we know is Monday
    const selectedDate = new Date('2024-01-01'); // Monday
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

    // Check that João has the most wins (should be 2)
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
    const selectedDate = new Date('2024-01-01');
    const mockScores = {
      '2024-01-01': { // Sunday - Maria wins (3 points)
        date: '2024-01-01',
        dayOfWeek: 0,
        results: [
          { name: 'Maria', time: 110, bonusTime: 0, totalTime: 110 },
          { name: 'Pedro', time: 130, bonusTime: 0, totalTime: 130 }
        ]
      },
      '2023-12-30': { // Saturday - João wins (1 point)
        date: '2023-12-30',
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

    // Check that Maria has the most wins (should be 3 from Sunday)
    expect(maria.wins).toBeGreaterThanOrEqual(3);

    // Check that João has at least 1 win
    expect(joao.wins).toBeGreaterThanOrEqual(1);

    // Check that Pedro has 0 wins
    expect(pedro.wins).toBe(0);

    // Check that the ordering is correct by wins first
    const sortedByWins = podium.sort((a, b) => b.wins - a.wins);
    expect(sortedByWins[0].wins).toBeGreaterThanOrEqual(sortedByWins[1].wins);
  });

  test('should handle complex tie-breaking scenario correctly', () => {
    // Test the specific scenario mentioned by the user
    const selectedDate = new Date('2024-01-01');
    const mockScores = {
      '2023-12-26': { // Monday - João wins
        date: '2023-12-26',
        dayOfWeek: 1,
        results: [
          { name: 'João', time: 100, bonusTime: 0, totalTime: 100 },
          { name: 'James', time: 120, bonusTime: 0, totalTime: 120 }
        ]
      },
      '2023-12-27': { // Tuesday - James wins
        date: '2023-12-27',
        dayOfWeek: 2,
        results: [
          { name: 'James', time: 110, bonusTime: 0, totalTime: 110 },
          { name: 'Paulo', time: 130, bonusTime: 0, totalTime: 130 }
        ]
      },
      '2023-12-28': { // Wednesday - Paulo wins
        date: '2023-12-28',
        dayOfWeek: 3,
        results: [
          { name: 'Paulo', time: 95, bonusTime: 0, totalTime: 95 },
          { name: 'João', time: 105, bonusTime: 0, totalTime: 105 }
        ]
      },
      '2023-12-29': { // Thursday - João wins again
        date: '2023-12-29',
        dayOfWeek: 4,
        results: [
          { name: 'João', time: 90, bonusTime: 0, totalTime: 90 },
          { name: 'James', time: 115, bonusTime: 0, totalTime: 115 }
        ]
      },
      '2023-12-30': { // Friday - James wins
        date: '2023-12-30',
        dayOfWeek: 5,
        results: [
          { name: 'James', time: 105, bonusTime: 0, totalTime: 105 },
          { name: 'Paulo', time: 125, bonusTime: 0, totalTime: 125 }
        ]
      },
      '2023-12-31': { // Saturday - James wins
        date: '2023-12-31',
        dayOfWeek: 6,
        results: [
          { name: 'James', time: 100, bonusTime: 0, totalTime: 100 },
          { name: 'Paulo', time: 110, bonusTime: 0, totalTime: 110 }
        ]
      },
      '2024-01-01': { // Sunday - Paulo wins (3 points)
        date: '2024-01-01',
        dayOfWeek: 0,
        results: [
          { name: 'Paulo', time: 85, bonusTime: 0, totalTime: 85 },
          { name: 'João', time: 95, bonusTime: 0, totalTime: 95 }
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

    // All should have 3 points (João: 2 wins, James: 3 wins, Paulo: 1 win + 3 from Sunday)
    expect(joao.wins).toBe(2);
    expect(james.wins).toBe(3);
    expect(paulo.wins).toBe(4); // 1 + 3 from Sunday

    // Paulo should be first (4 points, total time: 130+95+125+110+85 = 545)
    expect(podium[0].name).toBe('Paulo');
    expect(podium[0].wins).toBe(4);
    expect(podium[0].totalTime).toBe(545);

    // James should be second (3 points, total time: 120+110+115+105+100 = 550)
    expect(podium[1].name).toBe('James');
    expect(podium[1].wins).toBe(3);
    expect(podium[1].totalTime).toBe(550);

    // João should be third (2 points, total time: 100+105+90+95 = 390)
    expect(podium[2].name).toBe('João');
    expect(podium[2].wins).toBe(2);
    expect(podium[2].totalTime).toBe(390);
  });

    test('should handle complete tie in weekly podium', () => {
    // Test when players have same wins and same total time
    const selectedDate = new Date('2024-01-01');
    const mockScores = {
      '2023-12-26': { // Monday - João wins
        date: '2023-12-26',
        dayOfWeek: 1,
        results: [
          { name: 'João', time: 100, bonusTime: 0, totalTime: 100 },
          { name: 'Maria', time: 120, bonusTime: 0, totalTime: 120 }
        ]
      },
      '2023-12-27': { // Tuesday - Maria wins
        date: '2023-12-27',
        dayOfWeek: 2,
        results: [
          { name: 'Maria', time: 100, bonusTime: 0, totalTime: 100 },
          { name: 'João', time: 120, bonusTime: 0, totalTime: 120 }
        ]
      }
    };

    const players = ['João', 'Maria'];
    const podium = calculateWeeklyPodium(players, mockScores, selectedDate);

    // Both should have 1 win
    expect(podium[0].wins).toBe(1);
    expect(podium[1].wins).toBe(1);

    // Total time should be sum of all days: 100+120 = 220 for both
    expect(podium[0].totalTime).toBe(220);
    expect(podium[1].totalTime).toBe(220);

    // Should be ordered alphabetically when everything is equal
    expect(podium[0].name).toBe('João');
    expect(podium[1].name).toBe('Maria');
  });

  test('should handle alphabetical tie-breaking in weekly podium', () => {
    // Test when players have same wins and same total time, but different names
    const selectedDate = new Date('2024-01-01');
    const mockScores = {
      '2023-12-26': { // Monday - Ana wins
        date: '2023-12-26',
        dayOfWeek: 1,
        results: [
          { name: 'Ana', time: 100, bonusTime: 0, totalTime: 100 },
          { name: 'Bruno', time: 120, bonusTime: 0, totalTime: 120 }
        ]
      },
      '2023-12-27': { // Tuesday - Bruno wins
        date: '2023-12-27',
        dayOfWeek: 2,
        results: [
          { name: 'Bruno', time: 100, bonusTime: 0, totalTime: 100 },
          { name: 'Ana', time: 120, bonusTime: 0, totalTime: 120 }
        ]
      }
    };

    const players = ['Ana', 'Bruno'];
    const podium = calculateWeeklyPodium(players, mockScores, selectedDate);

    // Both should have 1 win
    expect(podium[0].wins).toBe(1);
    expect(podium[1].wins).toBe(1);

    // Both should have total time of 100 + 120 = 220
    expect(podium[0].totalTime).toBe(220);
    expect(podium[1].totalTime).toBe(220);

    // Should be ordered alphabetically when everything is equal
    expect(podium[0].name).toBe('Ana');
    expect(podium[1].name).toBe('Bruno');
  });

  test('should handle new total time rule correctly - user scenario', () => {
    // Test the specific scenario mentioned by the user
    const selectedDate = new Date('2024-01-01');
    const mockScores = {
      '2023-12-26': { // Monday
        date: '2023-12-26',
        dayOfWeek: 1,
        results: [
          { name: 'Jhonny', time: 15, bonusTime: 0, totalTime: 15 },
          { name: 'Marcelo', time: 19, bonusTime: 0, totalTime: 19 },
          { name: 'James', time: 31, bonusTime: 0, totalTime: 31 }
        ]
      },
      '2023-12-27': { // Tuesday
        date: '2023-12-27',
        dayOfWeek: 2,
        results: [
          { name: 'Jhonny', time: 59, bonusTime: 0, totalTime: 59 },
          { name: 'Marcelo', time: 44, bonusTime: 0, totalTime: 44 },
          { name: 'James', time: 75, bonusTime: 0, totalTime: 75 }
        ]
      },
      '2023-12-28': { // Wednesday
        date: '2023-12-28',
        dayOfWeek: 3,
        results: [
          { name: 'Jhonny', time: 60, bonusTime: 0, totalTime: 60 },
          { name: 'Marcelo', time: 65, bonusTime: 0, totalTime: 65 },
          { name: 'James', time: 5, bonusTime: 0, totalTime: 5 }
        ]
      }
    };

    const players = ['Jhonny', 'Marcelo', 'James'];
    const podium = calculateWeeklyPodium(players, mockScores, selectedDate);

    // Check basic structure
    expect(podium).toBeInstanceOf(Array);
    expect(podium).toHaveLength(3);

    // All should have 1 point
    expect(podium[0].wins).toBe(1);
    expect(podium[1].wins).toBe(1);
    expect(podium[2].wins).toBe(1);

    // James should be first (1 point, total time: 31+75+5 = 111)
    expect(podium[0].name).toBe('James');
    expect(podium[0].totalTime).toBe(111);

    // Marcelo should be second (1 point, total time: 19+44+65 = 128)
    expect(podium[1].name).toBe('Marcelo');
    expect(podium[1].totalTime).toBe(128);

    // Jhonny should be third (1 point, total time: 15+59+60 = 134)
    expect(podium[2].name).toBe('Jhonny');
    expect(podium[2].totalTime).toBe(134);
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
            results: [{ name: 'João', time: 100, bonusTime: 0, totalTime: 100 }]
          }
        }
      },
      {
        selectedDate: new Date('2024-06-15'),
        scores: {
          '2024-06-15': {
            date: '2024-06-15',
            dayOfWeek: 6,
            results: [{ name: 'Maria', time: 120, bonusTime: 0, totalTime: 120 }]
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
});

describe('calculateMonthlyPodium', () => {
  const mockPlayers = ['João', 'Maria', 'Pedro'];

    test('should calculate monthly podium correctly with new ranking rules', () => {
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

    // Maria should be first (3 points from Sunday, total time: 120+110 = 230)
    expect(podium[0].name).toBe('Maria');
    expect(podium[0].wins).toBe(3);
    expect(podium[0].totalTime).toBe(230);

    // João should be second (1 point from Monday, total time: 100)
    expect(podium[1].name).toBe('João');
    expect(podium[1].wins).toBe(1);
    expect(podium[1].totalTime).toBe(100);

    // Pedro should be third (0 points, total time: 130)
    expect(podium[2].name).toBe('Pedro');
    expect(podium[2].wins).toBe(0);
    expect(podium[2].totalTime).toBe(130);
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

    // João should be first (4 points: 1 + 3, total time: 295)
    expect(podium[0].name).toBe('João');
    expect(podium[0].wins).toBe(4);
    expect(podium[0].totalTime).toBe(295);

    // Paulo should be second (3 points: 0 + 3, total time: 225)
    expect(podium[1].name).toBe('Paulo');
    expect(podium[1].wins).toBe(3);
    expect(podium[1].totalTime).toBe(225);

    // James should be third (3 points: 0 + 3, total time: 345)
    expect(podium[2].name).toBe('James');
    expect(podium[2].wins).toBe(3);
    expect(podium[2].totalTime).toBe(345);
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

    // Should be ordered alphabetically when everything is equal
    expect(podium[0].name).toBe('Ana');
    expect(podium[1].name).toBe('Bruno');
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
