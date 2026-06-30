# MDM System — Project Overview & Vision

## What Is This System?

**AKFA Data MDM** is a Master Data Management platform for AKFA Group. It centralizes all product, partner, pricing, and reference data that flows between internal teams and external systems (ERP, CRM, warehouse, e-commerce, etc.).

MDM is the **single source of truth** for:
- Products (with characteristics, prices, units, GTINs, SAP codes)
- Dealers/partners (hierarchy, accounts, branches, discounts)
- Reference data (regions, currencies, units, segments, categories)
- External system integrations (field-level mapping configurations)
- User access and audit trails

---

## Current System: Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| State / API | Redux Toolkit + RTK Query |
| Routing | React Router v7 |
| Forms | react-hook-form |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| i18n | i18next (RU + UZ) |
| Charts | *(none implemented yet)* |
| Build | Vite 7 |
| Lint/Format | ESLint + Prettier + Husky |
| Deployment | Docker + Nginx |

**Architecture pattern**: Feature-Sliced Design (FSD)
- `entities/` — domain models, API hooks, basic UI
- `features/` — user-facing operations (login)
- `pages/` — assembled pages from entities
- `shared/` — reusable UI, hooks, utilities, constants

---

## Current System: What Works

- CRUD for all major entities (products, dealers, characteristics, etc.)
- Role/permission guard on routes and UI elements
- Activity/session logging (who did what, when, from which device)
- Audit trail (field-level change history per table/record)
- External system integration config builder (visual mapping tree)
- Import via Excel (products, rates, characteristics)
- Export to Excel for most tables
- Multi-language (Russian + Uzbek)
- Three themes (blue, teal, dark)
- Two characteristic systems (standard groups + dynamic tables)

---

## Current System: Critical Problems

### 1. Analytics / Dashboard — Empty
The dashboard page shows only "Welcome" text. No metrics, no charts, no KPIs. Users have no visibility into system health, product coverage, or data quality.

### 2. Product Table — Missing External System Coverage
The product list table does not show which external systems a product exists in, or which ones it is **missing** from. This is one of the most important MDM insights.

### 3. Audit Split Into Two Separate Systems
- `audit/` entity — raw DB-level field changes (old/new values per table row)
- `activity-log/` entity — session-based user activity (page views, CRUD actions)

These are never shown together, making it impossible to see "who changed what field, when, in which session."

### 4. Module Grouping Is Confusing
The sidebar mixes geographic data (regions, regional bases) with partner data (dealers, client types) and reference books (units, currencies) in unintuitive groupings. Users struggle to find things.

### 5. User Management Is Too Basic
User list shows name/email/phone. No last login, no active sessions, no roles visible inline, no activity summary, no ability to force-logout a session.

### 6. No Platform Health Monitoring
No visibility into: failed API syncs, import errors, external system unreachability, data quality issues (missing required fields, orphaned records).

### 7. Characteristics Module Hard to Understand
Two different characteristic systems (standard characteristics + dynamic tables) are hidden under "Additional Characteristics" with no explanation of when to use which.

### 8. Discount System Incomplete
Dealer discounts exist by segment/date range but there's no view showing all active discounts, no overlap detection, no history.

### 9. Product Prices (Rates) Incomplete View
Rates tab exists but doesn't show rate history charts, currency comparison, or who set which price.

### 10. UX Issues
- Forms have no inline validation feedback
- Tables have no column resizing/reordering
- No keyboard shortcuts
- No bulk actions on most tables
- Breadcrumbs inconsistent
- No unsaved changes warning on most forms

---

## New System Goals

Build the **best MDM system** with:

1. **Informative analytics** — real KPIs, charts, data quality scores
2. **Complete audit** — every change traceable to a person, session, timestamp
3. **Product external system coverage map** — visual matrix of product × external system
4. **Intelligent user management** — roles, sessions, activity, force-logout
5. **Clear module structure** — logical grouping that matches mental models
6. **Design system** — consistent tokens, components, spacing, typography
7. **Platform health** — sync status, error logs, data quality alerts
8. **Pricing intelligence** — history, trends, multi-currency comparison

---

## Files In This Docs Folder

| File | Contents |
|---|---|
| `00-overview.md` | This file — overview and goals |
| `01-data-models.md` | All entity types and their fields |
| `02-navigation-modules.md` | Route structure and module reorganization |
| `03-products.md` | Product management — full logic |
| `04-characteristics.md` | Both characteristic systems explained |
| `05-external-systems.md` | External systems and integration configs |
| `06-dealers-partners.md` | Dealer hierarchy and discount logic |
| `07-users-roles-permissions.md` | User management and permission system |
| `08-audit-activity.md` | Audit trail and activity log |
| `09-analytics-dashboard.md` | Dashboard and analytics requirements |
| `10-reference-data.md` | All lookup/reference tables |
| `11-design-tokens.md` | Design system tokens and themes |
| `12-new-system-plan.md` | Complete new system blueprint |
| `13-ux-improvements.md` | UX problems and their solutions |
