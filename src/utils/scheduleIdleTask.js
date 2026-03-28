/**
 * Runs a task after the browser is idle (or soon after on the next macrotask).
 * Used to defer non-critical work (e.g. Firebase Analytics) off the critical path.
 */
export function scheduleIdleTask(fn) {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(() => fn(), { timeout: 4000 });
  } else {
    setTimeout(fn, 1);
  }
}
