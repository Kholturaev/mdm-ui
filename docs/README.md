# AKFA MDM — Documentation Index

Complete knowledge base for rebuilding the Master Data Management system.

**Current system:** `../akfa-data-frontend/`
**New system:** To be built based on this documentation

---

## Read Order

| # | File | Purpose | Priority |
|---|---|---|---|
| 1 | [00-overview.md](./00-overview.md) | What the system is, what's broken, what we're building | START HERE |
| 2 | [01-data-models.md](./01-data-models.md) | Every entity — fields, types, relationships | Must read |
| 3 | [02-navigation-modules.md](./02-navigation-modules.md) | Route structure — current problems, new structure | Must read |
| 4 | [03-products.md](./03-products.md) | Product management — all logic, forms, tables, pricing | Must read |
| 5 | [04-characteristics.md](./04-characteristics.md) | Two characteristic systems explained | Must read |
| 6 | [05-external-systems.md](./05-external-systems.md) | External systems, integration configs, mapping | Must read |
| 7 | [06-dealers-partners.md](./06-dealers-partners.md) | Dealer hierarchy, discounts, accounts, branches | Must read |
| 8 | [07-users-roles-permissions.md](./07-users-roles-permissions.md) | User management, role system, permissions | Must read |
| 9 | [08-audit-activity.md](./08-audit-activity.md) | Audit trail, activity log, how to unify them | Must read |
| 10 | [09-analytics-dashboard.md](./09-analytics-dashboard.md) | Dashboard layout, KPIs, charts, alerts | Design priority |
| 11 | [10-reference-data.md](./10-reference-data.md) | All lookup/reference tables and their purposes | Reference |
| 12 | [11-design-tokens.md](./11-design-tokens.md) | Complete design token system, colors, typography, spacing | Design |
| 13 | [12-new-system-plan.md](./12-new-system-plan.md) | Full new system blueprint — folder structure, pages, components | Build guide |
| 14 | [13-ux-improvements.md](./13-ux-improvements.md) | 20 UX problems with specific solutions | Build guide |

---

## Quick Reference

### Entity Count
- **Core:** Products, ProductGroups, TypeOfNomenclature, ProductCategories, Series
- **Characteristics:** Characteristics, CharacteristicsGroups, DynamicTables (2 systems)
- **Pricing:** ProductRates, Currencies, CurrencyRates, AccountingProducts
- **Partners:** Dealers, DealerAccounts, DealerBranches, DealerDiscounts, AccountGroups
- **Reference:** Regions, RegionalBases, ClientTypes, Segments, Contractors, Units
- **Integration:** ExternalSystems, IntegrationConfigs
- **Users:** Users, Roles, Permissions
- **Audit:** AuditEntries, UserSessions, ActivityLogs

### Permission Count
52 permission categories × CRUD = ~200 individual permission codes

### Route Count
Current: ~35 routes. New: ~50 routes (better organized)

### Key Problems to Fix
1. Empty dashboard → analytics system
2. Missing external system coverage on product table
3. Two audit systems not unified
4. Confusing module structure
5. No entity-level history tab
6. User list missing status/last-login
7. No empty states
8. No bulk actions
9. Forms lack inline validation
10. No platform health monitoring

---

## Tech Stack

```
React 19 + TypeScript 5.9
RTK Query (state + API)
React Router v7
React Hook Form + Zod (validation)
Tailwind CSS v4 + CSS custom properties
Framer Motion (animations)
Recharts (new — for dashboard)
i18next (RU + UZ)
Vite 7
```

---

## API Base URLs

```
Dev:  https://dev-api-data.infomix.uz
Test: https://api-data.infomix.uz

MDM API:  /api/v1/akfa-data
Auth API: /api/v1/auth-service
```

---

## Key API Patterns

All list endpoints use POST with body:
```json
{ "page": 0, "size": 20, "filters": {}, "sortField": "name", "sortDirection": "ASC" }
```

All responses follow:
```json
{ "status": 200, "data": { "data": [], "totalElements": 0, "totalPages": 0 } }
```

Auth: Cookie-based, auto-refresh on 401.
