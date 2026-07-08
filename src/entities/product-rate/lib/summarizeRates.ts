import type { IClientType } from '@entities/client-type/model/types';
import type { IProductRate } from '../model/types';

export interface ClientTypeRateSummary {
  clientType: IClientType;
  /** Most recent SALES row — there's no `isActive`/current flag in the data model, so "current" is defined as the latest `date`. */
  currentSales: IProductRate | null;
  /** Most recent PURCHASE row, same convention. */
  currentPurchase: IProductRate | null;
  /** Every row for this client type, newest first — feeds the history drill-down. */
  history: IProductRate[];
}

function toTime(rate: IProductRate): number {
  const value = new Date(rate.date).getTime();
  return Number.isNaN(value) ? 0 : value;
}

/** Builds one row per client type — including client types with no price yet — so the whole picture is visible without picking one first. */
export function summarizeRatesByClientType(
  clientTypes: IClientType[],
  rates: IProductRate[],
): ClientTypeRateSummary[] {
  const byClientType = new Map<number, IProductRate[]>();
  rates.forEach((rate) => {
    const list = byClientType.get(rate.clientTypeId) ?? [];
    list.push(rate);
    byClientType.set(rate.clientTypeId, list);
  });

  return clientTypes.map((clientType) => {
    const history = [...(byClientType.get(clientType.id) ?? [])].sort(
      (a, b) => toTime(b) - toTime(a),
    );
    return {
      clientType,
      currentSales: history.find((rate) => rate.type === 'SALES') ?? null,
      currentPurchase: history.find((rate) => rate.type === 'PURCHASE') ?? null,
      history,
    };
  });
}
