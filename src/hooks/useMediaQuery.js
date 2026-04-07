import { useSyncExternalStore } from 'react';

function subscribe(query, onStoreChange) {
  if (typeof window === 'undefined') return () => {};
  const mq = window.matchMedia(query);
  mq.addEventListener('change', onStoreChange);
  return () => mq.removeEventListener('change', onStoreChange);
}

function getSnapshot(query) {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(query).matches;
}

/**
 * Subscribes to a CSS media query.
 * Uses useSyncExternalStore: server snapshot is always false; client reads matchMedia and listens for changes.
 */
export function useMediaQuery(query) {
  return useSyncExternalStore(
    (onStoreChange) => subscribe(query, onStoreChange),
    () => getSnapshot(query),
    () => false
  );
}
