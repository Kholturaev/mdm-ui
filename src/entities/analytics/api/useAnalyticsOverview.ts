import { useCallback, useEffect, useState } from 'react';
import type { AnalyticsOverview, AnalyticsPeriod } from '../model/types';
import { generateAnalyticsOverview } from './analyticsMockData';

interface UseAnalyticsOverviewResult {
  data: AnalyticsOverview | undefined;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
}

const MOCK_DELAY_MS = 400;

/** Stands in for a future `useGetAnalyticsOverviewQuery(period)` RTK Query hook — same `data`/`isLoading`/`isFetching`/`refetch` shape, so swapping the mock generator for a real endpoint later won't touch any consumer. */
export function useAnalyticsOverview(
  period: AnalyticsPeriod,
): UseAnalyticsOverviewResult {
  const [data, setData] = useState<AnalyticsOverview>();
  const [loadedPeriod, setLoadedPeriod] = useState<AnalyticsPeriod | null>(
    null,
  );
  const [reloadToken, setReloadToken] = useState(0);
  const [loadedReloadToken, setLoadedReloadToken] = useState(-1);

  // Derived from state comparisons during render rather than set at the top
  // of the effect below, so a period/refetch change is reflected immediately
  // without a synchronous setState-in-effect render cascade.
  const isFetching =
    loadedPeriod !== period || loadedReloadToken !== reloadToken;

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      if (cancelled) return;
      setData(generateAnalyticsOverview(period));
      setLoadedPeriod(period);
      setLoadedReloadToken(reloadToken);
    }, MOCK_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [period, reloadToken]);

  const refetch = useCallback(() => setReloadToken((token) => token + 1), []);

  return { data, isLoading: isFetching && !data, isFetching, refetch };
}
