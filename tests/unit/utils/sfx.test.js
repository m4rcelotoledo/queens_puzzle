import { playClickSound, playSuccessSound, playFanfareSound, __resetSharedCtx } from '../../../src/utils/sfx';

describe('sfx', () => {
  let mockOscillator;
  let mockGain;
  let mockCtx;

  beforeEach(() => {
    __resetSharedCtx();
    mockOscillator = {
      connect: jest.fn(),
      type: '',
      frequency: {
        setValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn(),
        value: 0,
      },
      start: jest.fn(),
      stop: jest.fn(),
    };
    mockGain = {
      connect: jest.fn(),
      gain: {
        setValueAtTime: jest.fn(),
        linearRampToValueAtTime: jest.fn(),
      },
    };
    mockCtx = {
      createOscillator: jest.fn(() => mockOscillator),
      createGain: jest.fn(() => mockGain),
      destination: {},
      currentTime: 0,
    };
    global.window.AudioContext = jest.fn(() => mockCtx);
    global.window.webkitAudioContext = global.window.AudioContext;
  });

  test('playClickSound creates oscillator and envelope', () => {
    playClickSound();
    expect(mockCtx.createOscillator).toHaveBeenCalled();
    expect(mockCtx.createGain).toHaveBeenCalled();
    expect(mockOscillator.start).toHaveBeenCalled();
    expect(mockOscillator.stop).toHaveBeenCalled();
  });

  test('playSuccessSound creates a rising tone', () => {
    playSuccessSound();
    expect(mockCtx.createOscillator).toHaveBeenCalled();
    expect(mockOscillator.frequency.exponentialRampToValueAtTime).toHaveBeenCalled();
    expect(mockOscillator.start).toHaveBeenCalled();
    expect(mockOscillator.stop).toHaveBeenCalled();
  });

  test('playFanfareSound schedules multiple notes', () => {
    playFanfareSound();
    expect(mockCtx.createOscillator.mock.calls.length).toBeGreaterThanOrEqual(3);
    expect(mockOscillator.start.mock.calls.length).toBeGreaterThanOrEqual(3);
  });

  test('swallows errors when AudioContext fails', () => {
    global.window.AudioContext = jest.fn(() => {
      throw new Error('not supported');
    });
    global.window.webkitAudioContext = global.window.AudioContext;
    expect(() => playSuccessSound()).not.toThrow();
  });

  test('reuses a single AudioContext across plays (singleton)', () => {
    playClickSound();
    playSuccessSound();
    expect(global.window.AudioContext).toHaveBeenCalledTimes(1);
  });
});
