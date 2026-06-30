# Analytics & Dashboard

The current dashboard is a placeholder ("Welcome" text). This document defines what the analytics system should look like.

---

## Dashboard Philosophy

An MDM dashboard should answer these questions at a glance:

1. **Data Health** — Is my product catalog complete and up to date?
2. **Coverage** — Are my products in all the external systems they should be in?
3. **Activity** — What's happening right now? Who's working?
4. **Alerts** — What needs my attention today?
5. **Trends** — Is data quality improving or getting worse?

---

## Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  AKFA MDM Dashboard                     Last updated: 5 min ago [↻] │
├────────────┬────────────┬────────────┬────────────┬─────────────────┤
│ Products   │ Active     │ Ext. Cover │ Needs Fix  │ Users Online     │
│   1,247    │   1,104    │   82.4%    │    143     │      3          │
│ total      │ (88.5%)    │            │  products  │                 │
├────────────┴────────────┴────────────┴────────────┴─────────────────┤
│                                                                       │
│  [PRODUCT STATUS]          [EXTERNAL SYSTEM COVERAGE]                 │
│  ─────────────             ──────────────────────────                 │
│  Active      1,104  ████░  SAP ERP    245/300  82%  ████░            │
│  Passive       132  ██░░░  1C Acc.    198/300  66%  ████░            │
│  Temp Pass.     11  █░░░░  WMS         89/300  30%  ██░░░            │
│                            E-Com      156/300  52%  ███░░            │
│                                                                       │
├───────────────────────────────┬───────────────────────────────────────┤
│  RECENT ACTIVITY              │  DATA QUALITY ALERTS                  │
│  ────────────────             │  ────────────────────────             │
│  asliddin.k updated product   │  ⚠  143 products missing GTIN        │
│   Samsung A54  (2 min ago)    │  ⚠  67 products have no price        │
│  john.doe created dealer      │  ⚠  3 external systems unreachable   │
│   TechnoMart (1 hour ago)     │  ✕  Last SAP sync failed (3d ago)    │
│  ivan.petrov imported 120     │  ℹ  48 discounts expiring this month  │
│   products (yesterday)        │                                       │
├───────────────────────────────┴───────────────────────────────────────┤
│  PRODUCT GROWTH (last 30 days)                                        │
│  ──────────────────────────────────────────────────────               │
│      [line chart showing product count over time]                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## KPI Cards (Top Row)

### 1. Total Products
```
Products
1,247 total
▲ +23 this week
```

### 2. Active Products
```
Active
1,104 (88.5%)
▼ -5 since last week
```

### 3. External System Coverage
```
Avg. Coverage
82.4%
Across 4 systems
```

### 4. Needs Attention
```
Needs Fix
143 products
Click to see list
```

### 5. Users Online
```
Online Now
3 users
View sessions →
```

---

## Product Status Distribution (Chart)

**Chart type:** Donut or bar chart

```
┌──────────────────────────────────┐
│  Product Status Distribution     │
│                                  │
│     ████ Active        88.5%    │
│     ██   Passive       10.6%    │
│     █    Temp. Passive  0.9%    │
│                                  │
│  Total: 1,247 products           │
└──────────────────────────────────┘
```

---

## External System Coverage Widget

**Chart type:** Horizontal progress bars per system

```
External System Coverage
                                    Synced / Total
SAP ERP       ████████████░░░░░░   245 / 300  (82%)
1C Accounting ████████░░░░░░░░░░   198 / 300  (66%)
WMS           ████░░░░░░░░░░░░░░    89 / 300  (30%)
E-Commerce    ██████░░░░░░░░░░░░   156 / 300  (52%)

[View Coverage Matrix →]
```

Clicking each system opens the product coverage matrix filtered to that system.

---

## Product Coverage Matrix (Full Page)

**Route:** `/integrations` or `/dashboard/coverage`

```
Product Coverage Matrix

Filters: [Product Group: All ▼] [Status: Active ▼] [Show: Missing ▼]

                    SAP ERP    1C Acc.    WMS       E-Com     CRM
─────────────────────────────────────────────────────────────────────
Samsung Galaxy A54    ✓          ✓          ✓         ✗         ✓
Samsung Galaxy A34    ✓          ✗          ✗         ✗         ✗
iPhone 15 Pro         ✓          ✓          ✓         ✓         ✓
Xiaomi 13T            ✓          ✓          ✗         ✓         ✓
OnePlus 12            ✗          ✗          ✗         ✗         ✗
─────────────────────────────────────────────────────────────────────
Coverage:            4/5 80%   3/5 60%   2/5 40%  3/5 60%  4/5 80%

Legend: ✓ Synced  ✗ Missing  ⏳ Pending  ✕ Failed
```

**Bulk action:** Select products that are missing from a system → "Export to SAP ERP" button

---

## Data Quality Dashboard

**Route:** `/health/data-quality`

```
Data Quality Score: 74/100  ████████████░░░░░░░░

Issues by Category:

CRITICAL (fix now)
  ✕ 23 products with duplicate SAP codes
  ✕ 5 products with invalid GTIN format

WARNINGS (fix soon)
  ⚠ 143 products without GTIN
  ⚠ 67 products with no prices for any client type
  ⚠ 45 products with no characteristics assigned
  ⚠ 12 dealers missing bank account

INFORMATIONAL
  ℹ 289 products have no description
  ℹ 178 products not linked to any external system
  ℹ 48 dealer discounts expiring in next 30 days

[Download Quality Report]
```

**Data Quality Score calculation:**

| Check | Weight | Points |
|---|---|---|
| Products with SAP code | 20% | 20 |
| Products with GTIN (for finished products) | 15% | 0-15 |
| Products with at least 1 characteristic | 15% | 0-15 |
| Products with at least 1 price | 20% | 0-20 |
| Products in at least 1 external system | 20% | 0-20 |
| Products with description | 10% | 0-10 |

---

## Recent Activity Feed

Real-time feed of what's happening in the system:

```
Recent Activity                                    [View All →]

  asliddin.k  Updated Samsung Galaxy A54        2 min ago
  john.doe    Created dealer TechnoMart LLC      1h ago
  ivan.petrov Imported 120 products              yesterday
  asliddin.k  Assigned role ADMIN to test.user  2 days ago
  john.doe    Deleted product "Old Model X"      3 days ago
```

Each item links to the entity or session detail.

---

## Trend Charts

### Products Added Per Month (last 12 months)
Bar chart showing product creation rate.

### Data Quality Score Over Time
Line chart showing quality score trend (is it improving?).

### External System Sync Activity
Bar chart showing how many exports happened per day, with success/fail split.

### User Activity Heatmap (optional, advanced)
A calendar heatmap showing which days have the most activity.

---

## Alerts System

Alerts are triggered conditions that require attention:

| Alert Type | Condition | Severity |
|---|---|---|
| External system unreachable | Ping to system URL fails | CRITICAL |
| SAP sync not run in X days | Last sync > N days ago | HIGH |
| Products with invalid SAP codes | Duplicate or malformed | HIGH |
| Prices expiring | Rates with endDate approaching | MEDIUM |
| Discounts expiring | DealerDiscounts ending in 30 days | MEDIUM |
| Import failed | Import job ended with errors | HIGH |
| Low external coverage | Coverage < 50% for any system | MEDIUM |
| No recent activity | No logins in 48h (unusual) | LOW |

Alerts shown in:
1. Dashboard widget (top N alerts)
2. Notification bell in header
3. Email (configurable)

---

## Platform Health Page

**Route:** `/health`

```
Platform Health                          Last checked: 1 min ago

EXTERNAL SYSTEM STATUS
  ● SAP ERP           Online    Last sync: 2h ago   245 products
  ● 1C Accounting     Online    Last sync: 6h ago   198 products
  ⚠ WMS              Slow       Last sync: 1d ago    89 products
  ✕ E-Commerce        Error      Last sync: 3d ago   (sync failed)

DATABASE HEALTH
  ● Database          Connected
  ● Audit log         Running   12,450 entries
  ● Activity log      Running   3,891 sessions

IMPORT/EXPORT HISTORY
  Recent Jobs:
  ✓ Import Products (120 records)    today 14:30   by ivan.petrov
  ✓ Export SAP PRODUCT              today 09:15   by asliddin.k
  ✕ Export E-Com PRODUCT            3d ago        FAILED: timeout

DATA STORAGE
  Products:          1,247 records
  Characteristics:   8,941 assigned values
  Prices:            4,231 rate records
  Audit entries:    12,450 records
```

---

## Analytics Pages Summary

| Page | Route | Description |
|---|---|---|
| Main Dashboard | `/dashboard` | KPIs, alerts, activity feed, charts |
| Coverage Matrix | `/integrations` | Product × External System matrix |
| Data Quality | `/health/data-quality` | Quality score and issue list |
| Platform Health | `/health` | System status, sync health |
| Activity Feed | `/audit/sessions` | User sessions and actions |
| Import History | `/health/import-history` | All import jobs |
