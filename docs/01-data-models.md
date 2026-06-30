# Data Models — All Entities

Complete reference of every entity in the system with fields, types, and relationships.

---

## Core Product Domain

### Product (`/product`)
The central entity. Everything else connects to it.

```
IProduct {
  id: number
  name: string
  description?: string
  article?: string                    // internal article code
  sapCode: string                     // SAP identifier (required)
  sapText?: string                    // SAP description
  gtin?: string                       // Global Trade Item Number (barcode)
  additionalGtins?: string            // extra GTINs, comma-separated

  productType: 'RAW_MATERIAL' | 'FINISHED_PRODUCT'
  productStatus: 'ACTIVE' | 'PASSIVE' | 'TEMPORARILY_PASSIVE'

  productGroupId: number              // → ProductGroup
  typeOfNomenclatureId: number        // → TypeOfNomenclature
  categoryId: number | null           // → ProductCategory
  segmentId: number | null            // → Segment
  accountingProductId: number | null  // → AccountingProduct

  baseUnitId: number | null           // → Unit (main unit of measure)
  alternateUnitId: number | null      // → Unit (alternate unit)
  accountingUnitId: number | null     // → Unit (accounting unit)
  quantity?: number

  productColorId: number | null       // → ProductColor

  accountAmountPercent?: number       // % for accounting amount calc
  isViewOnlySmap?: boolean            // visible in SMAP read-only
  isFree?: boolean                    // free product flag
  isCalcAccAmountByPercent?: boolean  // use percent for accounting
  isAutoGenerateKM?: boolean          // auto-generate KM code

  externalSystemIds?: number[]        // which external systems it belongs to
  comment: string | null
  updatedAt: string
}
```

**Nested on product detail page:**
- `ProductCharacteristic[]` — assigned characteristic values
- `ProductTableCharacteristic[]` — assigned dynamic table rows
- `ProductRate[]` — price list by client type, currency, date
- `ProductUnit[]` — unit conversions
- `ProductAttribute[]` — additional key-value attributes

---

### ProductGroup (`/info/product-groups`)
Hierarchical product grouping (tree).

```
IProductGroup {
  id: number
  name: string
  parentId?: number | null   // self-referential tree
  children?: IProductGroup[]
}
```

### ProductCategory (`/info/product-category`)
Flat category list.
```
IProductCategory { id, name, description? }
```

### TypeOfNomenclature (`/info/type-of-nomenclature`)
Classification type for product. Each nomenclature type has its own set of allowed characteristics.
```
ITypeOfNomenclature { id, name, description? }
```

### AccountingProduct (`/info/accounting-products`)
Accounting system product reference.
```
IAccountingProduct { id, name, code? }
```

### Series (`/info/series`)
Product series/line.
```
ISeries { id, name, description? }
```

### ProductColor
```
IProductColor { id, name, hexCode? }
```

---

## Pricing Domain

### ProductRate (`/product-rate`)
A single price entry for a product.

```
IProductRate {
  id: number
  productId: number
  rate: number           // price value
  cost: number           // cost value
  date: string           // effective date
  unitId: number         // → Unit
  clientTypeId: number   // → ClientType (which client segment this price applies to)
  currencyId: number     // → Currency (main currency)
  altCurrencyId: number  // → Currency (alternative currency)
  type: 'SALES' | 'PURCHASE'
  createdAt?: string
}
```

**Import supported**: bulk Excel import for rates.

---

## Characteristics Domain

### Characteristic (`/characteristics`)
A single characteristic definition.

```
ICharacteristic {
  id: number
  name: string
  key: string                    // unique machine-readable key
  description: string
  type: 'TEXT' | 'SELECT' | 'RADIO' | 'CHECKBOX'
  values: ICharacteristicValue[] // for SELECT/RADIO/CHECKBOX types
  characteristicsGroupId?: number
  characteristicsGroup?: { id, name }
}

ICharacteristicValue {
  id: number
  value: string
  order?: number
}
```

### CharacteristicsGroup (`/characteristics-group`)
Groups characteristics together and links to TypeOfNomenclature.
```
ICharacteristicsGroup {
  id: number
  name: string
  description?: string
  typeOfNomenclatureId?: number
  typeOfNomenclature?: { id, name }
}
```

### ProductCharacteristic
Assignment of a characteristic to a specific product with its value.
```
IProductCharacteristic {
  id: number
  characteristicId: number  → Characteristic
  productId: number         → Product
  value: string[]           // array for multi-value types
}
```

---

## Dynamic Table Characteristics (Second System)

### DynamicCharacteristicsTable
A custom spreadsheet-like table that can be attached to products.

```
IDynamicCharacteristicsTable {
  tableId: number
  tableName: string         // machine name
  name?: string             // display name
  description?: string
  characteristicGroupId: number  → CharacteristicsGroup
  characteristicGroup?: { id, name, typeOfNomenclatureId, typeOfNomenclature }
  columns: IDynamicCharacteristicsTableColumn[]
  rows: IDynamicCharacteristicsTableRow[]
}

IDynamicCharacteristicsTableColumn {
  id: number
  tableId?: number
  name: string
  key: string
  dataType: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE'
  position: number
  required: boolean
}

IDynamicCharacteristicsTableRow {
  id: number
  position: number
  values: Record<string, string>  // columnKey → value
}
```

---

## Partner / Dealer Domain

### Dealer (`/partners/dillers`)
Main partner entity.

```
IDealer {
  id: number
  name: string
  description: string
  dealerCode: string
  active: 'ACTIVE' | 'INACTIVE'
  counterAgentId: string | null  // ERP counter-agent ID
  regionId?: number | null       → Region
  regionalBaseId: number | null  → RegionalBase
  clientTypeId: number | null    → ClientType
  contractor: IContractor
  clientType: IClientType
  region: IRegion
}
```

**Nested on dealer detail page:**
- `DealerAccount[]` — bank accounts
- `DealerBranch[]` — branch offices
- `DealerDiscount[]` — assigned discounts

### DealerAccount
Bank account for a dealer.
```
IDealerAccount {
  id: number
  dealerId: number
  accountNumber: string
  bankName?: string
  ...
}
```

### DealerBranch
Physical branch of a dealer.
```
IDealerBranch {
  id: number
  dealerId: number
  name: string
  address?: string
  regionId?: number
  ...
}
```

### DealerDiscount
A discount assigned to a dealer for a specific segment, with date range.
```
IDealerDiscount {
  id: number
  dealerId: number    → Dealer
  segmentId: number   → Segment
  percent: number     // discount percentage
  startDate: string
  endDate: string
}
```

### DealerAccountGroup
Logical grouping of dealer accounts for pricing/credit purposes.
```
IDealerAccountGroup {
  id: number
  name: string
  isMain?: boolean
  children?: IDealerAccountGroup[]
}
```

### AccountGroupDebtLimit
Credit/debt limit per account group.
```
IAccountGroupDebtLimit {
  id: number
  accountGroupId: number
  limitAmount: number
  currency?: string
}
```

---

## Reference Data Domain

### Region
```
IRegion { id, name, code? }
```

### RegionalBase
A physical warehouse/base location.
```
IRegionalBase { id, name, regionId, address? }
```

### ClientType
Type of client/customer.
```
IClientType { id, name, description? }
```

### Segment
Market/customer segment.
```
ISegment { id, name, description? }
```

### Contractor
Legal entity / counterparty.
```
IContractor { id, name, inn?, address? }
```

### Unit (Unit of Measure)
```
IUnit { id, name, shortName? }
```

**Unit Conversions** — conversion factors between units.
```
IUnitConversion {
  id: number
  fromUnitId: number
  toUnitId: number
  factor: number
}
```

### Currency
```
ICurrency { id, name, code, symbol? }
```

### CurrencyRate
Exchange rate for a currency on a specific date.
```
ICurrencyRate {
  id: number
  currencyId: number
  rate: number
  date: string
}
```

---

## External Systems Domain

### ExternalSystem (`/info/external-systems`)
A connected external platform (ERP, CRM, warehouse, etc.).

```
IExternalSystem {
  id: number
  name: string
  description?: string
  url: string
  notificationUrl?: string
  authType: 'NONE' | 'API_KEY' | 'BASIC_AUTH' | 'BEARER'
  authCredentials?: string
  apiKey?: string
}
```

### IntegrationConfig
Configuration of how data is sent to an external system.
```
IIntegrationConfig {
  id: number
  name: string
  code: string
  externalSystemId: number
  format: 'JSON' | 'XML'
  rootName: string
  isDefault: boolean
  isActive: boolean
  sections: IConfigSection[]
}

IConfigSection {
  sectionType: 'PRODUCT' | 'PRODUCT_GROUP' | 'PRODUCT_RATE' | 'DEALER'
  position: number
  nomenclatures?: IConfigNomenclature[]
  mappings: IIntegrationMapping[]
}

IConfigNomenclature {
  typeOfNomenclatureId: number
  position: number
  selectedItems: ISelectedItem[]    // which char groups/tables to include
  mappings: IIntegrationMapping[]
}

IIntegrationMapping {
  mappingType: 'SCALAR' | 'OBJECT' | 'ARRAY'
  sourcePath: string    // path in MDM data model
  targetPath: string    // field name in external system
  sourceDataType: string
  required: boolean
  defaultValue: string
  position: number
  children: IIntegrationMapping[]  // for nested mappings
}
```

---

## User Management Domain

### User
```
IUser {
  id: string
  username: string
  firstName: string
  lastName: string
  email: string
  phone: string
  telegramNickName: string
}
```

### Role
```
IRole {
  id: string
  name: string          // 'ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'OWNER', ...
  description?: string
}
```

### PermissionGroup
```
IPermissionGroup {
  nameEndpoint: string        // e.g., 'product', 'dealer'
  permissions: PermissionItem[]
}

IPermissionItem {
  name: string    // human-readable label
  value: string   // permission code, e.g., 'PRODUCT_READ'
  id?: number
}
```

---

## Audit & Activity Domain

### AuditEntry (DB-level changes)
Raw audit log — every field change in the database.
```
IAuditEntry {
  id: number
  tableName: string           // which DB table
  recordId: number            // which record ID
  actionType: 'INSERT' | 'UPDATE' | 'DELETE'
  fieldName: string           // which field changed
  oldValue: string | null
  newValue: string | null
  performedById: string       // user ID
  performedBy?: { firstName, lastName, username }
  actionTime: string
}
```

### UserSession (Activity sessions)
A user login session with activity.
```
IUserSession {
  id: string
  userId: string
  username: string
  email: string
  ipAddress: string
  deviceType: 'DESKTOP' | 'MOBILE' | 'TABLET' | 'UNKNOWN'
  browser: string
  os: string
  startedAt: string
  lastActivityAt: string | null
}
```

### ActivityLog (Per-action events)
A specific user action within a session.
```
IActivityLog {
  id: string
  sessionId: string
  username: string
  action: 'PAGE_VIEW' | 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'IMPORT' | 'SEARCH'
  actionLabel: string | null
  entityType: string | null   // 'PRODUCT', 'DEALER', etc.
  entityTypeLabel: string | null
  entityId: string | null
  pageUrl: string | null
  description: string | null
  createdAt: string
  changes?: IFieldChange[]    // field-level changes
}

IFieldChange {
  tableName: string
  recordId: number
  actionType: 'INSERT' | 'UPDATE' | 'DELETE'
  fieldName: string | null
  oldValue: string | null
  newValue: string | null
}
```

---

## Permission Codes Reference

Complete list of all permission codes in the system:

```
PERFORM_AUDIT

USER_READ / USER_CREATE / USER_UPDATE / USER_DELETE
UNIT_READ / UNIT_CREATE / UNIT_UPDATE / UNIT_DELETE
CHARACTERISTICS_GET / CHARACTERISTICS_CREATE / CHARACTERISTICS_UPDATE / CHARACTERISTICS_DELETE
CHARACTERISTICS_GROUP_READ / _CREATE / _UPDATE / _DELETE
CHARACTERISTIC_TABLE_READ / _CREATE
CHARACTERISTIC_ROW_CREATE
CHARACTERISTIC_COLUMN_CREATE

PRODUCT_READ / PRODUCT_CREATE / PRODUCT_UPDATE / PRODUCT_DELETE
PRODUCT_GROUP_READ / _CREATE / _UPDATE / _DELETE
PRODUCT_CATEGORY_READ / _CREATE / _UPDATE / _DELETE
PRODUCT_ATTRIBUTE_READ / _CREATE / _UPDATE / _DELETE
PRODUCT_CHARACTERISTICS_GET / _CREATE / _UPDATE / _DELETE
PRODUCT_RATE_READ / _CREATE / _UPDATE / _DELETE
ACCOUNTING_PRODUCT_READ / _CREATE / _UPDATE / _DELETE

DEALER_READ / DEALER_CREATE / DEALER_UPDATE / DEALER_DELETE
DEALER_ACCOUNT_READ / _CREATE / _UPDATE / _DELETE
DEALER_BRANCH_READ / _CREATE / _UPDATE / _DELETE
DEALER_DISCOUNT_READ / _CREATE / _UPDATE / _DELETE
ACCOUNT_GROUP_READ / _CREATE / _UPDATE / _DELETE
ACCOUNT_GROUP_DEBT_LIMITS_READ / _CREATE / _UPDATE / _DELETE

SEGMENT_READ / _CREATE / _UPDATE / _DELETE
CLIENT_TYPE_READ / _CREATE / _UPDATE / _DELETE
CLIENT_READ / _CREATE / _UPDATE / _DELETE
CONTRACTOR_READ / _CREATE / _UPDATE / _DELETE
REGIONAL_BASE_READ / _CREATE / _UPDATE / _DELETE
REGION_READ / _CREATE / _UPDATE / _DELETE

CURRENCY_READ / _CREATE / _UPDATE / _DELETE
CURRENCY_RATE_READ / _CREATE
SERIES_READ / _CREATE / _UPDATE / _DELETE
TYPE_OF_NOMENCLATURE_READ / _CREATE / _UPDATE / _DELETE

EXTERNAL_SYSTEM_READ / _CREATE / _UPDATE / _DELETE
INTEGRATION_CONFIG_READ / _CREATE / _UPDATE / _DELETE

CONVERSION_GET_BY_FROM_ID_AND_TO_ID / GET_BY_MAIN_UNIT_ID / ADD / UPDATE / DELETE

SETTING_GET / _CREATE / _UPDATE / _DELETE
EMPLOYEE_READ / _CREATE / _UPDATE / _DELETE
```

---

## Entity Relationship Summary

```
Product
  ├── ProductGroup (tree)
  ├── TypeOfNomenclature
  │     └── CharacteristicsGroup[]
  │           ├── Characteristic[]
  │           │     └── CharacteristicValue[]
  │           └── DynamicTable[]
  │                 ├── Column[]
  │                 └── Row[]
  ├── ProductCategory
  ├── Segment
  ├── AccountingProduct
  ├── Unit (base / alternate / accounting)
  ├── ProductColor
  ├── ProductCharacteristic[] (assigned values)
  ├── ProductTableCharacteristic[] (assigned table rows)
  ├── ProductRate[] (prices by client type + currency + date)
  └── ExternalSystem[] (which systems this product is in)

Dealer
  ├── Region → RegionalBase
  ├── ClientType
  ├── Contractor
  ├── DealerAccount[]
  ├── DealerBranch[]
  └── DealerDiscount[] (by Segment, date range, percent)

DealerAccountGroup (tree)
  └── AccountGroupDebtLimit[]

ExternalSystem
  └── IntegrationConfig[]
        └── ConfigSection[] (PRODUCT | PRODUCT_GROUP | PRODUCT_RATE | DEALER)
              └── ConfigNomenclature[] → TypeOfNomenclature
                    └── IntegrationMapping[] (sourcePath → targetPath)

User
  ├── Role[]
  ├── Permission[]
  └── UserSession[]
        └── ActivityLog[]
              └── FieldChange[]

AuditEntry (table-level, separate from activity)
```
