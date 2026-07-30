"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Media-query hook backed by useSyncExternalStore.
 * Returns false during SSR/hydration (server snapshot), then the real
 * matchMedia value immediately after hydration — no re-subscribe loops,
 * no deferred setTimeout state.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onStoreChange);
      return () => media.removeEventListener("change", onStoreChange);
    },
    [query]
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
