import { scheduleIdleTask } from './scheduleIdleTask';

describe('scheduleIdleTask', () => {
  const originalRIC = global.window.requestIdleCallback;
  const originalST = global.setTimeout;
  const ricExisted = 'requestIdleCallback' in global.window;

  afterEach(() => {
    if (ricExisted) {
      global.window.requestIdleCallback = originalRIC;
    } else {
      delete global.window.requestIdleCallback;
    }
    global.setTimeout = originalST;
    vi.useRealTimers();
  });

  it('uses requestIdleCallback when available', () => {
    const fn = vi.fn();
    global.window.requestIdleCallback = (cb) => {
      cb({ didTimeout: false, timeRemaining: () => 5 });
    };
    scheduleIdleTask(fn);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('falls back to setTimeout when requestIdleCallback is missing', () => {
    vi.useFakeTimers();
    delete global.window.requestIdleCallback;
    const fn = vi.fn();
    scheduleIdleTask(fn);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(2);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
