import type { ICharacteristic } from '@entities/characteristic/model/types';
import type { IDynamicCharacteristicTable } from '@entities/dynamic-characteristic/model/types';

export interface ICharacteristicsGroup {
  id: number;
  name: string;
  description?: string | null;
  typeOfNomenclatureId?: number;
}

export interface ICharacteristicsGroupWithItems extends ICharacteristicsGroup {
  characteristics: ICharacteristic[];
  dynamicTables: IDynamicCharacteristicTable[];
}
