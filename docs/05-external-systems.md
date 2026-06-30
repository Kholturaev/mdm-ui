# External Systems & Integration

External systems are other platforms that need to receive MDM data — ERPs, CRMs, warehouse systems, e-commerce platforms, etc.

---

## The Problem MDM Solves for External Systems

Without MDM, each system has its own product catalog. When a product is added or updated, it must be manually updated in every system. This creates inconsistency.

MDM is the **single source of truth**. Integration configs define how MDM data maps to each external system's expected format.

---

## External System Entity

```
IExternalSystem {
  id: number
  name: string              // "SAP ERP", "1C Accounting", "WMS Warehouse"
  description?: string
  url: string               // API endpoint base URL
  notificationUrl?: string  // callback URL (external system calls MDM here)
  authType: AuthType        // how to authenticate
  authCredentials?: string  // for BASIC_AUTH
  apiKey?: string           // auto-generated, for API_KEY auth
}

AuthType: 'NONE' | 'API_KEY' | 'BASIC_AUTH' | 'BEARER'
```

### Auth Types

| Auth Type | How it works |
|---|---|
| `NONE` | No authentication required |
| `API_KEY` | MDM generates a key, sends it in header with each request |
| `BASIC_AUTH` | Username:password encoded in Authorization header |
| `BEARER` | Bearer token in Authorization header |

---

## Integration Config

Each external system can have **multiple integration configs**. A config defines:
- What data sections to export (products, rates, dealers, groups)
- The format (JSON or XML)
- The field-by-field mapping
- Whether it's the default config for this system

```
IIntegrationConfig {
  id: number
  name: string
  code: string                // machine-readable unique code
  externalSystemId: number    → ExternalSystem
  format: 'JSON' | 'XML'
  rootName: string            // root element/key in the output
  isDefault: boolean          // which config is used by default
  isActive: boolean           // can be deactivated
  sections: IConfigSection[]
}
```

---

## Config Sections

A config is divided into **sections** by data type:

```
SectionType: 'PRODUCT' | 'PRODUCT_GROUP' | 'PRODUCT_RATE' | 'DEALER'
```

```
IConfigSection {
  sectionType: SectionType
  position: number              // ordering
  nomenclatures?: IConfigNomenclature[]   // only for PRODUCT section
  mappings: IIntegrationMapping[]
}
```

### Product Section Has Nomenclature Sub-Configs

Products in MDM are classified by `TypeOfNomenclature`. Different nomenclature types may need different field mappings to the external system. That's why:

```
ConfigSection (PRODUCT)
  └── ConfigNomenclature (per TypeOfNomenclature)
        ├── typeOfNomenclatureId
        ├── position
        ├── selectedItems   // which char groups/tables to include
        └── mappings        // field mappings specific to this nomenclature
```

---

## Integration Mappings

Each mapping defines one field transfer:

```
IIntegrationMapping {
  id?: number | string
  mappingType: 'SCALAR' | 'OBJECT' | 'ARRAY'
  sourcePath: string       // path in MDM data model, e.g., "product.sapCode"
  targetPath: string       // field name in external system, e.g., "itemNumber"
  sourceDataType: string   // data type hint
  required: boolean        // must this field be present in output?
  defaultValue: string     // if source is empty, use this value
  position: number         // display order
  children: IIntegrationMapping[]  // for OBJECT and ARRAY types
}
```

### Mapping Types

| Type | Description | Example |
|---|---|---|
| `SCALAR` | Simple field-to-field | `sapCode → itemNumber` |
| `OBJECT` | Nested object | `{ unit: { name: baseUnit.name } }` |
| `ARRAY` | List of items | `characteristics → attributes[]` |

---

## Source Schema Tree (Visual Mapping Tool)

The integration config builder uses a **source schema tree** — a visual tree of all available MDM fields that can be mapped.

Available source trees (by section type):
- `GET /integration-configs/source-tree/product` → all product fields
- `GET /integration-configs/source-tree/product-groups` → product group fields
- `GET /integration-configs/source-tree/product-rates` → price fields
- `GET /integration-configs/source-tree/dealers` → dealer fields
- `GET /integration-configs/source-tree/nomenclatures` → nomenclature type fields
- `GET /integration-configs/source-tree/nomenclatures/:id` → specific nomenclature

```
ISourceSchemaNode {
  key: string           // unique node identifier
  label: string         // display name
  type: string          // data type
  sourcePath?: string   // full path to use in mapping
  selectable: boolean   // can this be mapped?
  isLeaf?: boolean      // no children
  fieldKey?: string
  itemId?: number
  children: ISourceSchemaNode[]
}
```

The UI renders this as a collapsible tree. Users drag source fields onto target fields to create mappings.

---

## Export Flow

### Exporting a Section (All Products)
```
POST /integration-configs/export/{configId}/section/{sectionType}
Body: { productIds: number[], ... }
Response: IExportResult[]
```

### Exporting One Entity
```
POST /integration-configs/export/{configId}/section/{sectionType}/{entityId}
Response: IExportResult
```

```
IExportResult {
  entityId: number
  configId: number
  sectionType: string
  success: boolean
  message: string      // error message if success=false
  payload: string      // the actual JSON/XML payload that was sent
}
```

---

## Callback / Acknowledgement Flow

When the external system receives data and creates a record, it calls MDM back:

```
POST /integration-configs/callback/external-mapping/system/{externalSystemId}
Body: {
  productId: number
  externalProductId: string   // the ID assigned by the external system
}
```

MDM stores this mapping:
```
GET /integration-configs/mappings/product/{productId}
→ Returns all external system IDs for this product
```

This is how MDM knows a product "exists" in an external system.

---

## Live Preview

When building an integration config, there's a **live preview** feature:

```
POST /integration-configs/preview
Body: {
  vidNomenclatureId: number   // TypeOfNomenclature ID
  sampleProductId: number     // which product to use as example
  format: string              // JSON or XML
  rootName: string
  mappings: IIntegrationMapping[]
}
Response: the actual output (JSON or XML string)
```

This lets the user see what the output would look like before saving the config.

---

## External System in Product Context

On the product detail page's "External Systems" tab (to be built):

```
┌─────────────────────────────────────────────────┐
│ External Systems for: Samsung Galaxy A54         │
├─────────────┬────────────┬──────────┬───────────┤
│ System      │ Status     │ Ext. ID  │ Last Sync │
├─────────────┼────────────┼──────────┼───────────┤
│ SAP ERP     │ ● Synced   │ SAP-4821 │ 2h ago    │
│ 1C Accounting│ ● Synced  │ 1C-00291 │ 1d ago    │
│ WMS         │ ○ Not sent │ —        │ Never     │
│ E-Commerce  │ ✗ Failed   │ —        │ 3d ago    │
└─────────────┴────────────┴──────────┴───────────┘
        [Export to WMS]    [Retry E-Commerce]
```

---

## Product Coverage Matrix (Dashboard View)

A key analytics view showing all products × all external systems:

```
Filters: [Product Group ▼] [Status ▼] [External System ▼]

          SAP ERP   1C    WMS    E-Com   CRM
Total:    245/300  198/300  89/300  156/300  212/300

[PRODUCT TABLE WITH INLINE BADGES]
```

### Coverage calculation:
- `total_products` = all active products
- `covered` = products that have a synced external mapping for that system
- `coverage_percent` = covered / total_products × 100

---

## Current Gaps in External System UI

1. **External System list page** — no coverage stats per system (how many products are in it?)
2. **Product table** — no system presence indicators
3. **No sync status tracking** — PENDING/SYNCED/FAILED/STALE not stored
4. **No re-sync trigger** from product detail
5. **No export history** — when was each product last sent to each system?
6. **No error log** — failed exports with error messages
7. **Config builder UX** — mapping tree is complex, needs better visual design

---

## Integration Config Builder — Improved Flow

Current flow is complex. Improved step-by-step:

**Step 1: Select External System + Format**
```
System: [SAP ERP ▼]   Format: [JSON ●] [XML ○]
Root element name: [items]
Default config: [✓]   Active: [✓]
```

**Step 2: Select Sections to Include**
```
☑ Products (by nomenclature type)
☑ Product Groups
☐ Product Rates
☐ Dealers
```

**Step 3: For each section — map fields**
```
MDM Fields (tree)          │   External System Fields
─────────────────────────────────────────────────────
▶ Product                  │   itemNumber ← [sapCode]
  ├── name          ───────┼→  itemName
  ├── sapCode        ──────┼→  itemNumber
  ├── gtin                 │   barcode   ← [gtin]
  └── ▶ Characteristics    │   attributes[]
        ├── color   ───────┼→  attributes[color]
        └── size    ───────┼→  attributes[size]
```

**Step 4: Preview with sample product**
```
Preview for: [Samsung Galaxy A54 ▼]

{
  "items": [{
    "itemNumber": "SAP-4821",
    "itemName": "Samsung Galaxy A54",
    "barcode": "4895180772116",
    "attributes": [
      { "key": "color", "value": "Black" },
      { "key": "size", "value": "6.4 inch" }
    ]
  }]
}
```

**Step 5: Save and activate**
