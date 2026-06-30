# Product Management — Full Logic

Products are the core entity of MDM. Every other module exists to enrich, classify, or distribute product data.

---

## Product Lifecycle

```
CREATE → ACTIVE ─────────────────→ PASSIVE
                └→ TEMPORARILY_PASSIVE ─→ ACTIVE (restored)
```

States:
- `ACTIVE` — product is live, visible to all systems
- `PASSIVE` — soft-deleted, hidden from exports/integrations
- `TEMPORARILY_PASSIVE` — paused, can be reactivated

**Types:**
- `RAW_MATERIAL` — input material
- `FINISHED_PRODUCT` — sellable product

---

## Product Identity Fields

| Field | Required | Description |
|---|---|---|
| `name` | Yes | Display name (multi-language) |
| `sapCode` | Yes | SAP system code — primary identifier |
| `article` | No | Internal article/SKU |
| `sapText` | No | SAP description text |
| `gtin` | No | Global Trade Item Number (barcode standard) |
| `additionalGtins` | No | Extra GTINs, comma-separated |
| `description` | No | Long description |
| `comment` | No | Internal note |

---

## Product Classification Tree

Every product has a position in this classification tree:

```
TypeOfNomenclature (what kind of product?)
  └── ProductGroup (which product line/family?)
        └── Product
              ├── ProductCategory (market category)
              ├── Series (product series/line)
              └── AccountingProduct (accounting reference)
```

### Classification Fields

| Field | Required | Links To |
|---|---|---|
| `typeOfNomenclatureId` | Yes | TypeOfNomenclature |
| `productGroupId` | Yes | ProductGroup (tree) |
| `categoryId` | No | ProductCategory |
| `segmentId` | No | Segment (market segment) |
| `accountingProductId` | No | AccountingProduct |

---

## Units of Measure

A product can have up to 3 unit assignments:

| Field | Description |
|---|---|
| `baseUnitId` | Primary selling/storage unit (e.g., "piece") |
| `alternateUnitId` | Secondary unit for reporting |
| `accountingUnitId` | Unit used in accounting system |

**Unit Conversions** are defined separately per unit pair (fromUnit → toUnit → factor). A product with `baseUnit = piece` and `alternateUnit = box` would have a conversion record `1 box = 12 pieces`.

---

## Accounting Flags

| Flag | Description |
|---|---|
| `accountAmountPercent` | % to compute accounting amount |
| `isCalcAccAmountByPercent` | Use percent method (vs absolute) |
| `isFree` | Zero-price product |
| `isViewOnlySmap` | Visible in SMAP system as read-only |
| `isAutoGenerateKM` | Auto-generate KM (kilometer/marking) code |

---

## External System Membership

The field `externalSystemIds: number[]` stores which external systems this product is registered in.

**Current problem**: This is just an array of IDs. The product table does NOT show:
- Which systems the product IS in
- Which systems it is MISSING from
- Whether the mapping is verified or pending

**Required improvement**: A visual coverage matrix per product:

```
Product          | SAP ERP | CRM | WH System | E-com
─────────────────┼─────────┼─────┼───────────┼──────
Samsung A54      |   ✓     |  ✓  |     ✓     |  ✗
Samsung A34      |   ✓     |  ✗  |     ✗     |  ✗
iPhone 15        |   ✓     |  ✓  |     ✓     |  ✓
```

---

## Product Detail Page — Tab Structure

### Current tabs (existing):
1. **General** — basic fields form
2. **Characteristics** — assigned characteristics with values
3. **All Characteristics** — grouped view by nomenclature type
4. **Table Characteristics** — dynamic table assignments
5. **Rates** (Prices) — price list by client type/currency/date
6. **Units** — unit conversions for this product
7. **Attributes** — additional key-value pairs

### Issues with current implementation:
- No "External Systems" tab showing coverage
- No "History / Audit" tab showing what changed and who changed it
- No "Import/Export" tab for this specific product's sync status
- Tabs have no counts (e.g., "Characteristics (12)")
- Rates tab doesn't show charts or trends

### Improved tab structure:

```
[General Info] [Characteristics (N)] [Dynamic Tables (N)] [Prices (N)] [Units] [External Systems] [History]
```

---

## Product Form — Create Flow

### Step 1: Basic creation (minimal required fields)
```
name *
productType *    (RAW_MATERIAL | FINISHED_PRODUCT)
sapCode *
productGroupId * (dropdown/tree picker)
```
→ Product is created and user redirected to detail page

### Step 2: Enrich on detail page
- Add typeOfNomenclature
- Add category, segment, series
- Add units
- Add accounting info
- Add characteristics
- Add prices
- Link to external systems

### Current implementation creates all at once on a long form — bad UX.

---

## Product Table — Required Columns

The current product table is missing key information. Here is the full required column set:

| Column | Priority | Sortable | Filterable |
|---|---|---|---|
| Name | P0 | Yes | Yes (search) |
| SAP Code | P0 | Yes | Yes (search) |
| Status badge | P0 | Yes | Yes (dropdown) |
| Product Type | P1 | Yes | Yes (dropdown) |
| Product Group | P1 | Yes | Yes (tree picker) |
| Category | P2 | Yes | Yes |
| Nomenclature Type | P1 | Yes | Yes |
| Base Unit | P2 | No | No |
| External System Coverage | P0 | No | Yes (filter by system) |
| Last Updated | P1 | Yes | Yes (date range) |
| Actions | P0 | No | No |

**External System Coverage column** (new):
Each cell shows icon badges for each system:
- Green check = product exists in system
- Red X = product missing from system
- Gray dot = no integration configured

---

## Product Filters

Current filters are basic. Required filter set:

```
Search (name / SAP code / article / GTIN)
Status (ACTIVE | PASSIVE | TEMPORARILY_PASSIVE)
Product Type (RAW_MATERIAL | FINISHED_PRODUCT)
Product Group (tree picker — including children)
Nomenclature Type (multi-select)
Category (multi-select)
Segment (multi-select)
Has GTIN (yes/no)
External System presence (per-system: in / not in / any)
Missing from external system (quick filter)
Last updated (date range)
Created by (user picker)
```

---

## Product Import

### Excel Import Flow (existing):
1. Download template for the entity type
2. Fill template
3. Upload file
4. Preview first N rows
5. Map source columns → target fields
6. Validate
7. Execute
8. Download error report if any failures

### Supported import types:
- Products (basic fields)
- Product Rates (prices)
- Product Characteristics (link product to characteristics with values)
- Product-to-DynamicTable row links

### Missing:
- Bulk status change via import
- Import preview with column-level validation hints
- Import history (who imported what, when, how many records, error count)
- Rollback / undo import

---

## Product Export

Current: Export to Excel via POST with filter params.

Required additions:
- Export filtered subset (apply same filters as table)
- Choose which columns to export
- Export with related data (e.g., product + prices + characteristics)
- Export coverage report (which products are in which systems)

---

## Characteristics Assignment Logic

When assigning characteristics to a product, the system should:

1. Show characteristics grouped by `CharacteristicsGroup`
2. Only show groups that belong to the product's `TypeOfNomenclature`
3. For each characteristic:
   - TEXT type → free text input
   - SELECT → single-value dropdown from `values[]`
   - RADIO → single-value radio buttons
   - CHECKBOX → multi-value checkboxes

**Current gap**: If a product's typeOfNomenclature changes, existing characteristics may no longer belong. There's no validation or cleanup warning.

---

## Pricing (Rates) Logic

A product can have **many prices** — one per combination of:
- `clientTypeId` — which customer segment
- `currencyId` — which currency
- `altCurrencyId` — alternate currency (for dual-display)
- `date` — effective date
- `type` — `SALES` or `PURCHASE`

### Rate calculation:
- `rate` — selling price
- `cost` — purchase cost
- Both stored per currency

### Display requirements:
- Group rates by client type
- Show rate history (date-ordered)
- Show rate trend chart
- Show effective rate for "today" clearly
- Show which user set which rate (audit link)

### Current gaps:
- No chart/trend display
- No "current effective rate" summary
- No who-set-this-rate audit link
- No rate comparison across currencies

---

## Product-to-ExternalSystem Sync

When a product is exported to an external system:
1. MDM calls `exportIntegrationSectionEntity` with configId + entityId
2. External system receives the data in configured format (JSON/XML)
3. External system may call back with its own entity ID
4. MDM calls `registerExternalMapping` to store the external ID
5. This confirms the product exists in that external system

**Status tracking needed:**
- `PENDING` — export triggered, no callback yet
- `SYNCED` — callback received, external ID stored
- `FAILED` — error during export
- `STALE` — product updated in MDM but not re-exported
