import type { DealerFormValues, IDealer } from './types';

const EMPTY_VALUES: DealerFormValues = {
  name: '',
  description: '',
  dealerCode: '',
  active: 'INACTIVE',
  counterAgentId: null,
  regionId: null,
  regionalBaseId: null,
  clientTypeId: null,
};

export function toDealerFormValues(dealer?: IDealer): DealerFormValues {
  if (!dealer) return EMPTY_VALUES;
  return {
    name: dealer.name,
    description: dealer.description,
    dealerCode: dealer.dealerCode,
    active: dealer.active,
    counterAgentId: dealer.counterAgentId,
    regionId: dealer.regionId ?? null,
    regionalBaseId: dealer.regionalBaseId,
    clientTypeId: dealer.clientTypeId,
  };
}
