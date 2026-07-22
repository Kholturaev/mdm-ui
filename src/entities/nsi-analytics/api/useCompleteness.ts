import { useCallback } from 'react';
import type { CompletenessGroupDimension } from '../model/types';
import {
  generateCompletenessSummary,
  generateCompletenessTrend,
  generateFieldCompleteness,
  generateGroupCompleteness,
  generateIncompleteProductsPage,
  generateSourceSystemCompleteness,
} from './mockData';
import { useMockQuery } from '@shared/lib/useMockQuery';

/** GET /analytics/completeness equivalent — overall score + top incomplete preview. */
export function useCompletenessSummary() {
  const fetcher = useCallback(() => generateCompletenessSummary(), []);
  return useMockQuery('completeness-summary', fetcher);
}

/** GET /analytics/completeness/by-field equivalent. */
export function useCompletenessByField() {
  const fetcher = useCallback(() => generateFieldCompleteness(), []);
  return useMockQuery('completeness-by-field', fetcher);
}

/** POST /analytics/completeness/by-group equivalent. */
export function useCompletenessByGroup(
  dimension: CompletenessGroupDimension,
  page: number,
  size: number,
) {
  const key = `completeness-by-group:${dimension}:${page}:${size}`;
  const fetcher = useCallback(
    () => generateGroupCompleteness(dimension, page, size),
    [dimension, page, size],
  );
  return useMockQuery(key, fetcher);
}

/** GET /analytics/completeness/by-source-system equivalent. */
export function useCompletenessBySourceSystem() {
  const fetcher = useCallback(() => generateSourceSystemCompleteness(), []);
  return useMockQuery('completeness-by-source-system', fetcher);
}

/** GET /analytics/completeness/trend?days= equivalent. */
export function useCompletenessTrend(days: number) {
  const key = `completeness-trend:${days}`;
  const fetcher = useCallback(() => generateCompletenessTrend(days), [days]);
  return useMockQuery(key, fetcher);
}

/** POST /analytics/completeness/list equivalent — the incomplete-products drill-down. */
export function useIncompleteProductsList(page: number, size: number) {
  const key = `incomplete-products:${page}:${size}`;
  const fetcher = useCallback(
    () => generateIncompleteProductsPage(page, size),
    [page, size],
  );
  return useMockQuery(key, fetcher);
}
