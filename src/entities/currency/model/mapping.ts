import type { ICurrency, CurrencyFormValues } from './types';

/** `FormDatePicker` works with `Date`, not the ISO date string the API expects — kept separate from `CurrencyFormValues`. */
export type CurrencyFormInputValues = {
  name: string;
  symbol: string;
  currencyDate: Date | null;
};

const EMPTY_VALUES: CurrencyFormInputValues = {
  name: '',
  symbol: '',
  currencyDate: new Date(),
};

export function toCurrencyFormValues(
  entity?: ICurrency,
): CurrencyFormInputValues {
  if (!entity) return EMPTY_VALUES;
  return {
    name: entity.name,
    symbol: entity.symbol,
    currencyDate: entity.currencyDate ? new Date(entity.currencyDate) : null,
  };
}

export function toCurrencyPayload(
  values: CurrencyFormInputValues,
): CurrencyFormValues {
  return {
    name: values.name,
    symbol: values.symbol,
    currencyDate: values.currencyDate
      ? values.currencyDate.toISOString().slice(0, 10)
      : '',
  };
}
