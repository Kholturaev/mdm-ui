import type { IContractor } from '@entities/contractor/model/types';
import type { IClientType } from '@entities/client-type/model/types';
import type { IRegion } from '@entities/region/model/types';

export interface IDealer {
  id: number;
  name: string;
  description: string;
  dealerCode: string;
  active: 'ACTIVE' | 'INACTIVE';
  counterAgentId: string | null;
  regionId?: number | null;
  regionalBaseId: number | null;
  clientTypeId: number | null;
  contractor?: IContractor;
  clientType?: IClientType;
  region?: IRegion;
}

export type DealerFormValues = Omit<
  IDealer,
  'id' | 'contractor' | 'clientType' | 'region'
>;
