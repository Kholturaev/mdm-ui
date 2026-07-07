export interface IExternalSystem {
  id: number;
  name: string;
  description?: string;
  url?: string;
}

export interface IIntegrationMapping {
  id: number;
  mappingType: 'SCALAR' | 'OBJECT' | 'ARRAY';
  sourcePath: string;
  targetPath: string;
  sourceDataType: string;
  required: boolean;
  defaultValue: string;
  position: number;
  children: IIntegrationMapping[];
}

export interface IIntegrationConfigSelectedItem {
  id: number;
  itemType: string;
  itemId: number;
  itemName: string;
  position: number;
}

/** Extra field mappings that only apply when the product's nomenclature type matches `typeOfNomenclatureId` — e.g. dynamic table columns like "Zavod nomi/manzili" for a "Phone" type. */
export interface IIntegrationConfigNomenclature {
  id: number;
  typeOfNomenclatureId: number;
  typeOfNomenclatureName: string;
  position: number;
  selectedItems: IIntegrationConfigSelectedItem[];
  mappings: IIntegrationMapping[];
}

export type IntegrationConfigSectionType =
  'PRODUCT' | 'PRODUCT_RATE' | 'PRODUCT_GROUP' | 'DEALER';

export interface IIntegrationConfigSection {
  id: number;
  sectionType: IntegrationConfigSectionType;
  position: number;
  mappings: IIntegrationMapping[];
  /** Only present on `PRODUCT` sections. */
  nomenclatures?: IIntegrationConfigNomenclature[];
}

/** A saved export config for one external system — what `GET /integration-configs/list?externalSystemId=X` returns, one per template the system has (usually just one, active + default). */
export interface IIntegrationConfig {
  id: number;
  name: string;
  code: string;
  externalSystemId: number;
  externalSystemName: string;
  format: 'JSON' | 'XML';
  rootName: string | null;
  isDefault: boolean;
  isActive: boolean;
  sections: IIntegrationConfigSection[];
}

export interface IIntegrationConfigListResponse {
  currentPage: number;
  data: IIntegrationConfig[];
  totalElements: number;
  totalPages: number;
}
