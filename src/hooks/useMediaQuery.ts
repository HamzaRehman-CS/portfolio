import { useCallback, useSyncExternalStore } from 'react';
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback((callback: () => void) => {
    const media = window.matchMedia(query);
    media.addEventListener('change', callback);
    return () => media.removeEventListener('change', callback);
  }, [query]);
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
export function useIsMobile() { return useMediaQuery('(max-width: 767px)'); }
export function useIsTablet() { return useMediaQuery('(min-width: 768px) and (max-width: 1023px)'); }
export function useIsDesktop() { return useMediaQuery('(min-width: 1024px)'); }
