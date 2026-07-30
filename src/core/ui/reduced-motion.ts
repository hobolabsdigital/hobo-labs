/**
 * Shared prefers-reduced-motion helpers for canvas render loops.
 *
 * Canvas/WebGL components use these to render a single static frame
 * (instead of running a perpetual rAF loop) when the user has requested
 * reduced motion, and to react to live changes of the preference.
 */

const QUERY = '(prefers-reduced-motion: reduce)';

/** Returns true if the user currently prefers reduced motion. SSR-safe. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia(QUERY).matches;
}

/**
 * Subscribes to changes of the reduced-motion preference.
 * Returns an unsubscribe function. SSR-safe (no-op on the server).
 */
export function onReducedMotionChange(
  callback: (reduced: boolean) => void
): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {};
  }
  const mql = window.matchMedia(QUERY);
  const handler = (e: MediaQueryListEvent) => callback(e.matches);
  mql.addEventListener('change', handler);
  return () => mql.removeEventListener('change', handler);
}
