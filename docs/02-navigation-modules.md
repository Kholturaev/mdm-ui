# Navigation & Module Architecture

## Current Route Structure (Problems Highlighted)

```
/ (root)
├── /dashboard                    ← Analytics (EMPTY — just "Welcome" text)
│
├── /partners/...                 ← "Partners" section — CONFUSING GROUPING
│   ├── /info/regions             ← Geographic data mixed into Partners?
│   ├── /partners/regional-base   ← Warehouse locations under Partners?
│   ├── /partners/client-type     ← OK here
│   ├── /partners/segment         ← OK here
│   ├── /partners/contractor      ← OK here
│   ├── /partners/dillers         ← OK here
│   │   └── /partners/dillers/:id
│   ├── /partners/account-group   ← OK here
│   └── /partners/discounts       ← OK here
│
├── /info/...                     ← "Reference Books" — too broad, everything dumped here
│   ├── /info/unit
│   ├── /info/product-groups
│   ├── /info/type-of-nomenclature
│   │   └── /info/type-of-nomenclature/:id
│   ├── /info/products
│   │   └── /info/products/:id
│   ├── /info/accounting-products
│   ├── /info/product-category
│   ├── /info/series
│   ├── /info/currencies
│   └── /info/external-systems    ← External systems buried under Reference Books?
│       └── /info/external-systems/:id
│
├── /additional-characteristics   ← Cryptic name, users don't know what this is
│   └── /additional-characteristics/dynamic-table
│       └── /additional-characteristics/dynamic-table/:id
│
├── /monitoring/sessions          ← Good concept, bad implementation
│   └── /monitoring/sessions/:sessionId
│
├── /import                       ← Import isolated, not contextual
│
├── /role-permissions             ← Hidden (isVisibleOnSideBar: false)
├── /users                        ← Hidden (isVisibleOnSideBar: false)
├── /settings                     ← Hidden (isVisibleOnSideBar: false)
└── /profile                      ← Hidden (isVisibleOnSideBar: false)
```

**Key Problems:**
1. Regions/RegionalBase are geographic — but placed under "Partners"
2. External Systems is an integration concept — buried under "Reference Books"
3. "Additional Characteristics" is unclear naming
4. Users and Role Permissions are hidden — users can't discover them
5. Dashboard is a dead end
6. No section for platform health / data quality
7. Monitoring only shows sessions, not data issues

---

## Proposed New Module Structure

### Mental Model: What Does an MDM User Think About?

```
1. "What are my products?" → Products & Catalog
2. "Who are my partners?" → Dealers & Partners
3. "How do products sync to other systems?" → Integrations
4. "What do my products cost?" → Pricing (part of Products)
5. "What defines a product?" → Characteristics (part of Products)
6. "Who uses this system?" → Users & Access
7. "What changed? Who did it?" → Audit & Activity
8. "Is everything working?" → Platform Health
9. "What are the basic settings?" → Reference Data
```

---

### New Navigation Structure

```
DASHBOARD
  /dashboard                    → Analytics home (KPIs, charts, alerts)

PRODUCTS                        [new grouping — the core MDM entity]
  /products                     → Product list with coverage matrix
  /products/:id                 → Product detail (tabs: info, chars, prices, units, history)
  /products/groups              → Product group tree
  /products/categories          → Product categories
  /products/types               → Types of nomenclature
  /products/series              → Product series
  /products/colors              → Product colors

CHARACTERISTICS                 [new grouping — makes the 2 systems visible]
  /characteristics              → Standard characteristics list
  /characteristics/groups       → Characteristic groups (linked to nomenclature types)
  /characteristics/tables       → Dynamic tables (2nd system)
  /characteristics/tables/:id   → Dynamic table detail

PRICING                         [new grouping — pricing clarity]
  /pricing/rates                → All product rates (filterable by date, currency, type)
  /pricing/currencies           → Currency list
  /pricing/currency-rates       → Exchange rate history
  /pricing/accounting-products  → Accounting product mappings

INTEGRATIONS                    [new grouping — external systems are important]
  /integrations                 → External systems list + coverage matrix
  /integrations/:id             → External system detail + configs
  /integrations/import          → Import history and new import

PARTNERS                        [dealers & clients — kept together, renamed]
  /partners/dealers             → Dealer list
  /partners/dealers/:id         → Dealer detail (accounts, branches, discounts)
  /partners/account-groups      → Account group tree
  /partners/discounts           → All active discounts
  /partners/client-types        → Client type definitions
  /partners/segments            → Market segments
  /partners/contractors         → Contractor (legal entity) list

GEOGRAPHY                       [separate section — clear purpose]
  /geography/regions            → Region list
  /geography/regional-bases     → Physical warehouse/base locations

REFERENCE                       [slim — only true lookups remain]
  /reference/units              → Units of measure + conversions

USERS & ACCESS                  [visible — critical section]
  /users                        → User list with status, last login, role badge
  /users/:id                    → User detail (roles, permissions, sessions)
  /access/roles                 → Role list + default permissions
  /access/permissions           → Permission reference

AUDIT & ACTIVITY                [renamed, expanded]
  /audit/sessions               → User sessions (who, when, from where)
  /audit/sessions/:id           → Session detail (all actions in session)
  /audit/changes                → Field-level change log (by entity/user/date)
  /audit/errors                 → Failed operations log

PLATFORM HEALTH                 [new section]
  /health                       → System status overview
  /health/sync-status           → External system sync status
  /health/data-quality          → Data quality issues (missing fields, orphans)
  /health/import-history        → Import job history

SETTINGS                        [visible]
  /settings                     → App settings (theme, language, notifications)
  /profile                      → User profile
```

---

## Sidebar Visual Structure

```
┌─────────────────────────────────────┐
│  AKFA MDM                    [logo] │
├─────────────────────────────────────┤
│                                     │
│  ● Dashboard                        │
│                                     │
│  CATALOG                            │
│  ▶ Products                         │
│  ▶ Characteristics                  │
│  ▶ Pricing                          │
│                                     │
│  OPERATIONS                         │
│  ▶ Integrations                     │
│  ▶ Partners                         │
│  ▶ Geography                        │
│  ▶ Reference                        │
│                                     │
│  ADMINISTRATION                     │
│  ▶ Users & Access                   │
│  ▶ Audit & Activity                 │
│  ▶ Platform Health                  │
│  ▶ Settings                         │
│                                     │
├─────────────────────────────────────┤
│  [avatar] Asliddin K.               │
│  [logout]                           │
└─────────────────────────────────────┘
```

---

## Route Permissions Map (New)

| Route | Required Permission |
|---|---|
| `/dashboard` | (any authenticated user) |
| `/products` | `PRODUCT_READ` |
| `/products/:id` | `PRODUCT_READ` |
| `/products/groups` | `PRODUCT_GROUP_READ` |
| `/products/categories` | `PRODUCT_CATEGORY_READ` |
| `/products/types` | `TYPE_OF_NOMENCLATURE_READ` |
| `/products/series` | `SERIES_READ` |
| `/characteristics` | `CHARACTERISTICS_GET` |
| `/characteristics/groups` | `CHARACTERISTICS_GROUP_READ` |
| `/characteristics/tables` | `CHARACTERISTIC_TABLE_READ` |
| `/pricing/rates` | `PRODUCT_RATE_READ` |
| `/pricing/currencies` | `CURRENCY_READ` |
| `/integrations` | `EXTERNAL_SYSTEM_READ` |
| `/integrations/:id` | `EXTERNAL_SYSTEM_READ` + `INTEGRATION_CONFIG_READ` |
| `/integrations/import` | *(any)* |
| `/partners/dealers` | `DEALER_READ` |
| `/partners/discounts` | `DEALER_DISCOUNT_READ` |
| `/partners/account-groups` | `ACCOUNT_GROUP_READ` |
| `/partners/contractors` | `CONTRACTOR_READ` |
| `/geography/regions` | `REGION_READ` |
| `/geography/regional-bases` | `REGIONAL_BASE_READ` |
| `/reference/units` | `UNIT_READ` |
| `/users` | `USER_READ` |
| `/access/roles` | `ADMIN` or `SUPER_ADMIN` role |
| `/audit/sessions` | `PERFORM_AUDIT` |
| `/audit/changes` | `PERFORM_AUDIT` |
| `/health` | `ADMIN` or `SUPER_ADMIN` role |

---

## Breadcrumb Strategy

Every page should show the full path clearly:

```
Products / Samsung Galaxy A54 / Pricing
Products / Samsung Galaxy A54 / Characteristics / Dealer System
Integrations / SAP ERP / Config: Product Catalog
Partners / Dealers / TechnoMart LLC / Branches
Audit / Sessions / Session #4821 / 14 actions
```

Rules:
- Breadcrumb items are always clickable links
- Current page is not a link (last item)
- On mobile: collapse middle items with `...`
- Each entity detail page shows entity name, not just ID
