import { playClickSound, playSuccessSound, playFanfareSound, __resetSharedCtx } from './sfx';

describe('sfx', () => {
  let mockOscillator;
  let mockGain;
  let mockCtx;

  beforeEach(() => {
    __resetSharedCtx();
    mockOscillator = {
      connect: vi.fn(),
      type: '',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        value: 0,
      },
      start: vi.fn(),
      stop: vi.fn(),
    };
    mockGain = {
      connect: vi.fn(),
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
    };
    mockCtx = {
      createOscillator: vi.fn(() => mockOscillator),
      createGain: vi.fn(() => mockGain),
      destination: {},
      currentTime: 0,
    };
    global.window.AudioContext = vi.fn(function AudioContext() {
      return mockCtx;
    });
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
    global.window.AudioContext = vi.fn(function AudioContext() {
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

  test('resumes AudioContext if it is in suspended state', () => {
    mockCtx.state = 'suspended';
    mockCtx.resume = vi.fn();
    playClickSound();
    expect(mockCtx.resume).toHaveBeenCalled();
  });

  test('catches errors when AudioContext throws during play', () => {
    mockCtx.createOscillator = vi.fn(() => {
      throw new Error('Oscillator failed');
    });
    expect(() => playClickSound()).not.toThrow();
  });
});
