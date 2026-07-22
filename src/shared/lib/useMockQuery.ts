import { useCallback, useEffect, useState } from 'react';

const MOCK_DELAY_MS = 350;

interface MockQueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
}

/**
 * Simulates an RTK Query hook's `{data, isLoading, isFetching, refetch}`
 * shape over a synchronous mock generator — shared by every mock-backed
 * analytics hook so the fetch-simulation boilerplate (see
 * `useAnalyticsOverview`) lives in one place instead of being copy-pasted
 * per endpoint. Swapping a call site for a real `injectEndpoints` query
 * later doesn't touch any consumer, since the returned shape is identical.
 *
 * `key` must change whenever `fetcher`'s output would change (e.g. a
 * JSON-serialized params object) so param changes trigger a re-fetch;
 * `fetcher` must be `useCallback`-memoized over those same params so this
 * hook's own effect deps stay exhaustive-deps clean.
 */
export function useMockQuery<T>(
  key: string,
  fetcher: () => T,
): MockQueryResult<T> {
  const [data, setData] = useState<T>();
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [loadedReloadToken, setLoadedReloadToken] = useState(-1);

  // Derived from state comparisons during render, mirroring
  // useAnalyticsOverview, so a key/refetch change reflects immediately.
  const isFetching = loadedKey !== key || loadedReloadToken !== reloadToken;

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      if (cancelled) return;
      setData(fetcher());
      setLoadedKey(key);
      setLoadedReloadToken(reloadToken);
    }, MOCK_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [key, reloadToken, fetcher]);

  const refetch = useCallback(() => setReloadToken((token) => token + 1), []);

  return { data, isLoading: isFetching && !data, isFetching, refetch };
}
