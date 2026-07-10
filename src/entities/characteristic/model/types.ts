export type CharacteristicType = 'TEXT' | 'SELECT' | 'RADIO' | 'CHECKBOX';

export interface ICharacteristicValue {
  id: number;
  value: string;
  order?: number;
}

export interface ICharacteristic {
  id: number;
  name: string;
  key: string;
  description?: string | null;
  type: CharacteristicType;
  values: ICharacteristicValue[];
  characteristicsGroupId?: number;
}

export type CharacteristicFormValues = {
  name: string;
  key: string;
  description?: string | null;
  type: CharacteristicType;
  characteristicsGroupId: number;
};
