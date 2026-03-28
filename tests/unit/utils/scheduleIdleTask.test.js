import { scheduleIdleTask } from '../../../src/utils/scheduleIdleTask';

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
    jest.useRealTimers();
  });

  it('uses requestIdleCallback when available', (done) => {
    const fn = jest.fn(() => done());
    global.window.requestIdleCallback = (cb) => {
      cb({ didTimeout: false, timeRemaining: () => 5 });
    };
    scheduleIdleTask(fn);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('falls back to setTimeout when requestIdleCallback is missing', (done) => {
    jest.useFakeTimers();
    delete global.window.requestIdleCallback;
    const fn = jest.fn(() => done());
    scheduleIdleTask(fn);
    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(2);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
