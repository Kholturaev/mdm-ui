# Dealers & Partners

The partner domain covers all external commercial entities — dealers, contractors, and client types — along with their financial structure (accounts, discounts, credit limits).

---

## Entity Hierarchy

```
Dealer
  ├── Region → RegionalBase (where the dealer is located)
  ├── ClientType (what type of client they are)
  ├── Contractor (legal entity they operate as)
  ├── DealerAccount[] (bank accounts)
  ├── DealerBranch[] (branch offices)
  └── DealerDiscount[] (discount rules per segment)

DealerAccountGroup (separate tree, not directly under Dealer)
  └── AccountGroupDebtLimit[] (credit limits per group)
```

---

## Dealer

```
IDealer {
  id: number
  name: string
  description: string
  dealerCode: string          // unique code for this dealer
  active: 'ACTIVE' | 'INACTIVE'
  counterAgentId: string | null  // ID in external accounting system (1C, SAP)

  regionId?: number | null    → Region
  regionalBaseId: number | null → RegionalBase (which warehouse serves them)
  clientTypeId: number | null → ClientType
  contractor: IContractor     // legal entity info
  clientType: IClientType
  region: IRegion
}
```

**Key points:**
- A dealer can be `ACTIVE` or `INACTIVE` — affects whether they appear in dropdowns
- `counterAgentId` links the dealer to the external accounting system
- `dealerCode` is the internal MDM identifier (not the SAP/1C code)
- The `contractor` field holds legal entity data (company name, TIN, address)

---

## Dealer Account (Bank Account)

```
IDealerAccount {
  id: number
  dealerId: number
  // Additional bank account fields (account number, bank name, etc.)
}
```

Each dealer can have multiple bank accounts. Used for invoicing and payment tracking.

---

## Dealer Branch

A dealer can have multiple physical locations:

```
IDealerBranch {
  id: number
  dealerId: number
  name: string
  address?: string
  regionId?: number
  // other contact fields
}
```

**Current gap:** Branch locations are not shown on a map — no geolocation support.

---

## Dealer Discount

Dealer discounts are defined by a combination of:
- Which dealer gets the discount
- For which market segment
- What percent discount
- For which date range

```
IDealerDiscount {
  id: number
  dealerId: number    → Dealer
  segmentId: number   → Segment
  percent: number     // 0-100
  startDate: string   // ISO date
  endDate: string     // ISO date
  dealer?: IDealer
  segment?: ISegment
}
```

### Discount Logic

When calculating a product's price for a dealer:
1. Look up the dealer's segment-based discount
2. Find active discounts for that dealer + product's segment
3. A discount is "active" if `today >= startDate && today <= endDate`
4. Apply the percent discount to the base price

### Current Problems

1. **No overlap detection** — two discounts for same dealer+segment with overlapping dates are allowed
2. **No "active discounts" view** — can't see all currently effective discounts at a glance
3. **No history** — expired discounts are hard to find
4. **No audit trail** — who created/changed the discount?
5. **No bulk assignment** — must create discounts one by one

### Required Discount Dashboard

```
Active Discounts (as of today: 2026-06-30)

┌──────────────────┬───────────────┬──────────┬────────────┬────────────┐
│ Dealer           │ Segment       │ Discount │ Valid From │ Valid Until│
├──────────────────┼───────────────┼──────────┼────────────┼────────────┤
│ TechnoMart       │ Premium       │ 15%      │ 2026-01-01 │ 2026-12-31 │
│ AlphaStore       │ Standard      │ 8%       │ 2026-06-01 │ 2026-09-01 │
│ BetaShop         │ Premium       │ 12%      │ 2026-03-15 │ 2026-06-15 │ ← EXPIRED
└──────────────────┴───────────────┴──────────┴────────────┴────────────┘

Filters: [Dealer ▼] [Segment ▼] [Show Expired ○] [Date Range ▼]
```

---

## Account Groups (DealerAccountGroup)

Account groups organize dealers into financial groupings for credit limit management.

```
IDealerAccountGroup {
  id: number
  name: string
  isMain?: boolean          // is this the main/root group?
  children?: IDealerAccountGroup[]   // tree structure
}
```

The group tree allows hierarchical organization like:
```
All Dealers
├── Premium Partners
│   ├── Region North
│   └── Region South
├── Standard Partners
└── New Partners
```

### AccountGroupDebtLimit

Each account group has a credit limit:

```
IAccountGroupDebtLimit {
  id: number
  accountGroupId: number
  limitAmount: number
  currency?: string   // currency of the limit
}
```

**Purpose:** Controls how much total credit/debt a group of dealers can accumulate.

**Current gap:** The limit value is shown in the "Debt Limit" column but:
- There's no actual enforcement visible in the UI
- No comparison to current actual debt
- No alert when approaching the limit

---

## Client Type

Defines categories of clients for pricing differentiation:

```
IClientType {
  id: number
  name: string
  description?: string
}
```

**Used in:**
- Dealer classification (`Dealer.clientTypeId`)
- Product pricing (`ProductRate.clientTypeId`) — different rates per client type
- Discount assignment

Example client types:
- "Premium Dealer"
- "Standard Retailer"
- "Wholesale"
- "Direct Customer"

---

## Segment

Market segment classification:

```
ISegment {
  id: number
  name: string
  description?: string
}
```

**Used in:**
- Product classification (`Product.segmentId`)
- Dealer discount (`DealerDiscount.segmentId`)
- Dealer account group assignment

Example segments:
- "Premium"
- "Standard"
- "Budget"
- "B2B"
- "B2C"

---

## Contractor

The legal entity behind a dealer:

```
IContractor {
  id: number
  name: string       // company name
  inn?: string       // tax identification number
  address?: string
  // other legal fields
}
```

One contractor can be linked to multiple dealers (e.g., a holding company with multiple dealer branches).

---

## Regional Structure

```
Region (administrative region/province)
  └── RegionalBase (physical warehouse/distribution center in that region)
```

```
IRegion { id, name, code? }

IRegionalBase {
  id: number
  name: string
  regionId: number   → Region
  address?: string
}
```

**Used in:**
- Dealer location (`Dealer.regionId`, `Dealer.regionalBaseId`)
- Dealer branch location
- Pricing (regional prices)

---

## Dealer Detail Page — Tab Structure (Improved)

```
[Overview] [Bank Accounts (N)] [Branches (N)] [Discounts (N)] [Limits] [History]
```

### Overview Tab
```
┌─────────────────────────────────────────┐
│ TechnoMart LLC                    ACTIVE │
│ Code: TM-0021  │  Region: Tashkent      │
│ Client Type: Premium │ Base: WH-North   │
├─────────────────────────────────────────┤
│ Legal Entity: TechnoMart LLC            │
│ TIN: 302 048 123                        │
│ Counteragent ID: 1C-00291               │
└─────────────────────────────────────────┘
```

### Discounts Tab
Show active + upcoming + recently expired discounts for this dealer:
```
Segment    │ Discount │ From       │ Until      │ Status
───────────┼──────────┼────────────┼────────────┼────────
Premium    │ 15%      │ 2026-01-01 │ 2026-12-31 │ ● Active
Standard   │ 5%       │ 2026-06-01 │ 2026-09-01 │ ○ Upcoming
Budget     │ 8%       │ 2025-01-01 │ 2025-12-31 │ ✕ Expired
```

---

## Current Missing Features for Dealers

| Feature | Priority | Description |
|---|---|---|
| Dealer map view | P2 | Show branches on a geographic map |
| Discount overlap detection | P0 | Warn when two discounts cover same period |
| Active discount summary | P0 | One view of all currently active discounts |
| Dealer activity audit | P1 | Who created/edited this dealer record |
| Bulk status change | P2 | Activate/deactivate multiple dealers |
| Export dealer report | P2 | Full dealer data with all branches/accounts |
| Dealer search by counteragent ID | P1 | Find dealer by their SAP/1C ID |
| Debt limit vs actual debt | P1 | Show current utilization of debt limit |
