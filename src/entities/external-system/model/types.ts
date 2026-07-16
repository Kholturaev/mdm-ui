export type AuthType = 'NONE' | 'API_KEY' | 'BASIC_AUTH' | 'BEARER';

export interface IExternalSystem {
  id: number;
  name: string;
  description?: string;
  url: string;
  notificationUrl?: string;
  authType: AuthType;
  /** Masked (e.g. `****ab12`) on GET once a value is set — see `isMaskedCredential` in `./mapping`. */
  authCredentials?: string;
  /** Only ever returned once, at creation — never re-sent by the edit form. */
  apiKey?: string;
  inboundCallbackUrl?: string;
  inboundCallbackAuthType?: AuthType;
  inboundCallbackAuthCredentials?: string;
}

export type ExternalSystemFormValues = Omit<IExternalSystem, 'id' | 'apiKey'>;

export interface IIntegrationMapping {
  /** Locally-generated (e.g. `map-<nodeKey>`) for mappings built fresh in the config builder — stripped before saving. */
  id?: number | string;
  mappingType: 'SCALAR' | 'OBJECT' | 'ARRAY';
  sourcePath: string;
  targetPath: string;
  sourceDataType: string;
  required: boolean;
  defaultValue: string;
  position: number;
  children: IIntegrationMapping[];
}

/** One node of a source field tree returned by `/integration-configs/source-tree/*` — the field picker the config builder's checkbox-tree renders. */
export interface ISourceSchemaNode {
  key: string;
  label: string;
  type: string;
  sourcePath?: string | null;
  selectable: boolean;
  isLeaf?: boolean;
  icon?: string;
  /** Stable key of the underlying characteristic/dynamic-table column — preferred as the default `targetPath` since, unlike `label`, it survives renames. */
  fieldKey?: string;
  /** DB id of the underlying characteristic-group/characteristic/dynamic-table — feeds `IIntegrationConfigSelectedItem.itemId`. */
  itemId?: number;
  children: ISourceSchemaNode[];
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

export type IntegrationConfigMutationPayload = Omit<
  IIntegrationConfig,
  'id' | 'externalSystemName'
>;

/** A sample product-creation payload for one nomenclature type, as the target external system would receive it — used by the "Namuna JSON yuklab olish" download action. */
export interface IProductCreationExample {
  typeOfNomenclatureId: number;
  typeOfNomenclatureName: string;
  examplePayload: unknown;
}
