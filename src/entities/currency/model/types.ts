export interface ICurrency {
  id: number;
  name: string;
  symbol: string;
  currencyDate: string;
}

export type CurrencyFormValues = Omit<ICurrency, 'id'>;
