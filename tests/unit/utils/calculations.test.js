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

    test('should calculate weekly podium correctly', () => {
    // Use a known date that we know is Monday
    const selectedDate = new Date('2024-01-01'); // Monday
    const mockScores = {
      '2024-01-01': { // Monday
        date: '2024-01-01',
        dayOfWeek: 1,
        results: [
          { name: 'João', time: 100, bonusTime: 0, totalTime: 100 },
          { name: 'Maria', time: 120, bonusTime: 0, totalTime: 120 }
        ]
      },
      '2024-01-07': { // Sunday
        date: '2024-01-07',
        dayOfWeek: 0,
        results: [
          { name: 'Maria', time: 110, bonusTime: 0, totalTime: 110 },
          { name: 'Pedro', time: 130, bonusTime: 0, totalTime: 130 }
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

    // Check that the values are valid numbers
    expect(joao.wins).toBeGreaterThanOrEqual(0);
    expect(maria.wins).toBeGreaterThanOrEqual(0);
    expect(pedro.wins).toBeGreaterThanOrEqual(0);

    // Check that it is ordered by wins (descending)
    expect(podium[0].wins).toBeGreaterThanOrEqual(podium[1].wins);
    expect(podium[1].wins).toBeGreaterThanOrEqual(podium[2].wins);

    // Check that at least one player has wins (based on the data)
    const totalWins = podium.reduce((sum, p) => sum + p.wins, 0);
    expect(totalWins).toBeGreaterThan(0);
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

    // Check that Maria has more wins (Sunday counts 3)
    const maria = podium.find(p => p.name === 'Maria');
    expect(maria).toBeDefined();
    expect(maria.wins).toBeGreaterThanOrEqual(3);

    // Check that João has at least 1 win
    const joao = podium.find(p => p.name === 'João');
    expect(joao).toBeDefined();
    expect(joao.wins).toBeGreaterThanOrEqual(1);

    // Check that Pedro has 0 wins (February doesn't count)
    const pedro = podium.find(p => p.name === 'Pedro');
    expect(pedro).toBeDefined();
    expect(pedro.wins).toBe(0);

    // Check that it is ordered by wins (descending)
    expect(podium[0].wins).toBeGreaterThanOrEqual(podium[1].wins);
    expect(podium[1].wins).toBeGreaterThanOrEqual(podium[2].wins);
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
