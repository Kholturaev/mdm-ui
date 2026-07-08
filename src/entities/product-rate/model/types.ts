export type ProductRateType = 'SALES' | 'PURCHASE';

export interface IProductRateNamedEntity {
  id: number;
  name: string;
  symbol?: string;
}

export interface IProductRate {
  id: number;
  productId: number;
  clientTypeId: number;
  clientType?: IProductRateNamedEntity | null;
  unitId: number;
  unit?: IProductRateNamedEntity | null;
  currencyId: number;
  currency?: IProductRateNamedEntity | null;
  /** Secondary currency shown alongside the primary one (e.g. local + hard currency), optional. */
  altCurrencyId?: number | null;
  altCurrency?: IProductRateNamedEntity | null;
  type: ProductRateType;
  /** Sales (sell-side) price — populated when `type` is `SALES`. */
  rate: number;
  /** Purchase (cost/buy-side) price — populated when `type` is `PURCHASE`. */
  cost: number;
  date: string;
  createdAt?: string;
}

export type ProductRateFormValues = Omit<
  IProductRate,
  'id' | 'clientType' | 'unit' | 'currency' | 'altCurrency'
>;

/** One-shot create — the backend creates whichever of SALES/PURCHASE rows are supplied. `rate` sets both to the same value ("Bir xil narx"); `salesRate`/`purchaseRate` set just one side. */
export interface ProductRatePairPayload {
  productId: number;
  clientTypeId: number;
  unitId: number;
  currencyId: number;
  altCurrencyId?: number | null;
  date: string;
  rate?: number;
  salesRate?: number;
  purchaseRate?: number;
}
