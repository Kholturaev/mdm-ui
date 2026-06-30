# Reference Data

Reference data (also called "lookup data" or "master data") are the foundational lists that other entities reference. They change rarely but must be well-maintained.

---

## All Reference Entities

| Entity | Route | Used By |
|---|---|---|
| Unit (of Measure) | `/reference/units` | Product (3 unit fields), Product Rate |
| Region | `/geography/regions` | Dealer, Regional Base, Dealer Branch |
| Regional Base | `/geography/regional-bases` | Dealer |
| Client Type | `/partners/client-types` | Dealer, Product Rate |
| Segment | `/partners/segments` | Product, Dealer Discount |
| Contractor | `/partners/contractors` | Dealer |
| Currency | `/pricing/currencies` | Product Rate, Currency Rate |
| Currency Rate | `/pricing/currency-rates` | (exchange rates by date) |
| Accounting Product | `/pricing/accounting-products` | Product |
| Product Group | `/products/groups` | Product |
| Product Category | `/products/categories` | Product |
| Type of Nomenclature | `/products/types` | Product, Char. Group, Dynamic Table |
| Series | `/products/series` | Product (optional) |
| Product Color | `/products/colors` | Product (optional) |

---

## Unit of Measure

```
IUnit { id, name, shortName? }
```

Examples: piece, box, kg, litre, metre, set, pallet

**Conversions** define how units relate to each other:
```
IUnitConversion {
  id: number
  fromUnitId: number → Unit
  toUnitId: number   → Unit
  factor: number     // 1 box = 12 pieces → factor = 12
}
```

Permissions for conversions are separate:
- `CONVERSION_ADD`
- `CONVERSION_UPDATE`
- `CONVERSION_DELETE`
- `CONVERSION_GET_BY_FROM_ID_AND_TO_ID`
- `CONVERSION_GET_BY_MAIN_UNIT_ID`

**Improvement needed:** Show a conversion table on the unit detail page:
```
Unit: Box
Converts to:
  1 Box = 12 Pieces
  1 Box = 0.5 Pallet
```

---

## Currency

```
ICurrency {
  id: number
  name: string   // "US Dollar"
  code: string   // "USD"
  symbol?: string // "$"
}
```

Examples: UZS (Uzbek Som), USD (US Dollar), EUR, RUB

**Currency Rate** stores historical exchange rates:
```
ICurrencyRate {
  id: number
  currencyId: number → Currency
  rate: number        // relative to base currency (UZS)
  date: string        // effective date
}
```

The current rate for a currency = the most recent `CurrencyRate` record for that currency.

**Improvement:** Show rate history chart on currency detail page.

---

## Region & Regional Base

**Region** is an administrative geographic unit (province/oblast):
```
IRegion { id, name, code? }
```

**Regional Base** is a physical warehouse/distribution center within a region:
```
IRegionalBase {
  id: number
  name: string
  regionId: number → Region
  address?: string
}
```

**Relationship:**
```
Region: Tashkent City
  └── Regional Base: Warehouse North (Yunusabad district)
  └── Regional Base: Warehouse South (Mirabad district)

Region: Samarkand
  └── Regional Base: Samarkand Warehouse
```

**Dealers link to both:**
- `dealer.regionId` → which region they're in
- `dealer.regionalBaseId` → which specific warehouse serves them

---

## Client Type

Defines the category of a business customer:
```
IClientType { id, name, description? }
```

Examples:
- "Premium Dealer" — top-tier partners with highest discounts
- "Standard Retailer" — mid-level retailers
- "Wholesale" — bulk buyers
- "Direct Customer" — end consumers

**Used in product pricing:** `ProductRate.clientTypeId` — different rates for different client types.

---

## Segment

Market segment for classification:
```
ISegment { id, name, description? }
```

Examples:
- "Premium" — high-end products/clients
- "Standard" — mid-range
- "Budget" — economy tier
- "B2B" — business customers
- "B2C" — retail consumers

**Dual use:**
1. `Product.segmentId` — which segment this product targets
2. `DealerDiscount.segmentId` — this discount applies to products in this segment

---

## Contractor

Legal entity (company) behind a dealer:
```
IContractor {
  id: number
  name: string     // "TechnoMart LLC"
  inn?: string     // tax ID (ИНН)
  address?: string
}
```

A single contractor can be the legal entity for multiple dealers (e.g., a holding with multiple dealer IDs).

---

## Accounting Product

Maps MDM products to the accounting system's product classification:
```
IAccountingProduct {
  id: number
  name: string
  code?: string  // accounting system code
}
```

`Product.accountingProductId` links a product to this classification for accounting exports.

---

## Type of Nomenclature (TypeOfNomenclature)

The most important classification in the characteristics system. It defines **what kind of product** something is, and therefore **which characteristic groups and dynamic tables** apply to it.

```
ITypeOfNomenclature { id, name, description? }
```

Examples:
- "Electronics" → linked to groups: [Display, Battery, Connectivity]
- "Clothing" → linked to groups: [Size, Material, Color]
- "Food" → linked to groups: [Nutrition, Allergens, Storage]

**Detail page shows:**
- Which characteristic groups belong to this nomenclature type
- Which dynamic tables belong to this nomenclature type
- How many products are classified under this type

**Integration connection:**
- `IntegrationConfig.sections[].nomenclatures[]` groups mappings per nomenclature type
- Different types can have completely different field mappings to external systems

---

## Product Group (Tree Structure)

Product groups form a hierarchical tree:
```
IProductGroup {
  id: number
  name: string
  parentId?: number | null
  children?: IProductGroup[]
}
```

Example tree:
```
Electronics
├── Mobile Phones
│   ├── Android
│   └── iOS
├── Tablets
│   ├── Android Tablets
│   └── iPads
└── Accessories
    ├── Cases
    └── Chargers
```

**UI requirement:** A tree picker component for product forms and filters.

**Integration connection:** The `PRODUCT_GROUP` section type in integration configs exports the group tree to external systems.

---

## Series

A product series or product line:
```
ISeries { id, name, description? }
```

Example: "Galaxy S Series", "Galaxy A Series", "Note Series"

Optional field on products — not all products belong to a series.

---

## Product Category

Flat (non-hierarchical) category list:
```
IProductCategory { id, name, description? }
```

Examples: "Smartphones", "Tablets", "Smart TVs", "Home Appliances"

Distinct from ProductGroup — group is internal hierarchy, category is market-facing.

---

## Reference Data Management Principles

### 1. Never delete, use soft status
Reference data items should not be hard-deleted because they may be referenced by historical records. Instead:
- Add `isActive` flag to all reference entities
- Active items appear in dropdowns
- Inactive items still show for existing references

### 2. Show usage count
Every reference entity page should show "Used by N products" or "Used by N dealers" so admins know before changing/deleting.

### 3. Import support
All reference data should support Excel import:
- Units, currencies, regions, etc.
- Useful for initial data migration

### 4. Audit trail
All reference data changes should be in the audit trail (who changed the currency name? who added a new region?).

---

## Reference Data — Proposed Unified Management

Instead of separate pages under different sections, a unified "Reference Data" hub:

```
REFERENCE DATA
├── Measurements
│   ├── Units of Measure
│   └── Unit Conversions
├── Geography
│   ├── Regions
│   └── Regional Bases
├── Financial
│   ├── Currencies
│   └── Currency Rates
├── Classification
│   ├── Client Types
│   ├── Segments
│   └── Contractors
└── Product Classification
    ├── Product Groups (tree)
    ├── Product Categories
    ├── Types of Nomenclature
    ├── Series
    └── Accounting Products
```

Each entity page follows the same pattern:
- Table with search/filter
- Create/Edit via drawer (not full page navigation)
- Usage count column
- Audit trail access
- Export to Excel
