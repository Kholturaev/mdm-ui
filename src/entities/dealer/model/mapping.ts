import type { Dealer, DealerFormValues, DealerPayload } from './types';

const EMPTY_VALUES: DealerFormValues = {
  name: '',
  description: '',
  dealerCode: '',
  discountRate: null,
  registeredAt: null,
  contactPhone: '',
  regionId: null,
  active: true,
};

export function toDealerFormValues(dealer?: Dealer): DealerFormValues {
  if (!dealer) return EMPTY_VALUES;
  return {
    name: dealer.name,
    description: dealer.description,
    dealerCode: dealer.dealerCode,
    discountRate: dealer.discountRate,
    registeredAt: dealer.registeredAt ? new Date(dealer.registeredAt) : null,
    contactPhone: dealer.contactPhone,
    regionId: dealer.regionId,
    active: dealer.active,
  };
}

export function toDealerPayload(values: DealerFormValues): DealerPayload {
  return {
    ...values,
    registeredAt: values.registeredAt
      ? values.registeredAt.toISOString()
      : null,
  };
}
