# New MDM System — Complete Blueprint

This document defines the complete plan for the rebuilt MDM system. It preserves all existing business logic while redesigning the structure, UX, and analytics.

---

## Guiding Principles

1. **Every user should understand what they're looking at** — labels, tooltips, empty states, help text
2. **Data quality is always visible** — never hide that something is incomplete
3. **Every change is traceable** — who did it, when, what changed
4. **Products are the center** — all roads lead to and from the product
5. **External system coverage is first-class** — not an afterthought
6. **Simple things are simple, complex things are possible** — progressive disclosure

---

## Tech Stack (Retained, Enhanced)

| Layer | Technology | Notes |
|---|---|---|
| Framework | React 19 | No change |
| State / API | Redux Toolkit + RTK Query | No change |
| Routing | React Router v7 | New route structure |
| Forms | react-hook-form + zod | Add zod for validation schemas |
| Styling | Tailwind CSS v4 + CSS custom properties | New design tokens |
| Charts | Recharts or Tremor | New — for dashboard |
| Animations | Framer Motion | Retained |
| i18n | i18next | Retained, expanded |
| Tables | TanStack Table (or keep current) | Consider for advanced table features |
| Build | Vite 7 | No change |

---

## New Folder Structure

```
src/
├── app/
│   ├── router/
│   │   ├── routes.config.tsx     (new route tree)
│   │   └── guards/
│   └── store/
│       └── (existing slices + new: notifications, health)
├── entities/
│   └── (all current entities, reorganized)
├── features/
│   ├── auth-by-username/
│   ├── product-coverage/         (new — coverage matrix)
│   ├── data-quality/             (new — quality scoring)
│   └── platform-health/          (new — sync status)
├── pages/
│   ├── DashboardPage/
│   ├── ProductsPage/
│   ├── CharacteristicsPage/
│   ├── PricingPage/
│   ├── IntegrationsPage/
│   ├── PartnersPage/
│   ├── GeographyPage/
│   ├── ReferencePage/
│   ├── UsersPage/
│   ├── AuditPage/
│   ├── HealthPage/
│   └── SettingsPage/
└── shared/
    ├── api/
    ├── constants/
    │   ├── permissions.ts
    │   └── routes.ts             (new — centralize route strings)
    ├── design/                   (new — design tokens as JS/CSS)
    │   ├── tokens.css
    │   ├── tokens.ts
    │   └── themes.ts
    ├── hooks/
    ├── lib/
    └── ui/
        ├── Layout/
        ├── Feedback/             (new — alerts, toasts, empty states)
        ├── DataDisplay/          (new — stats cards, progress bars)
        ├── Charts/               (new — chart wrappers)
        ├── Form/
        ├── Table/
        ├── Navigation/           (new — breadcrumb, tabs, pagination)
        └── Overlay/              (new — modals, drawers, tooltips)
```

---

## Page-by-Page Specification

### Dashboard (`/dashboard`)

**Purpose:** At-a-glance system health and activity

**Components:**
- `KpiCardRow` — 5 metric cards (products, active, coverage, alerts, users online)
- `StatusDistributionChart` — product status donut
- `CoverageProgressBars` — external system coverage per system
- `RecentActivityFeed` — last 10 actions from audit log
- `DataQualityAlerts` — top N alerts, clickable
- `ProductGrowthChart` — line chart, last 30 days

**Data sources:**
- RTK Query endpoints (to be added to backend)
- `/dashboard/summary` — KPI numbers
- `/dashboard/coverage` — per-system coverage stats
- Activity log for recent actions

---

### Product List (`/products`)

**Purpose:** Browse and manage all products

**Table columns:** Name, SAP Code, Status, Type, Group, Nomenclature Type, External Coverage, Updated At, Actions

**Coverage column:** Inline icon badges per external system (✓/✗/⏳)

**Filters (sidebar):**
- Search (name / SAP code / article / GTIN)
- Status (multi-select)
- Type (RAW_MATERIAL / FINISHED_PRODUCT)
- Product Group (tree picker)
- Nomenclature Type (multi-select)
- Category (multi-select)
- Segment (multi-select)
- External System filter (in/not in)
- Date range (updated)

**Actions:** Create, Import, Export, Bulk status change

---

### Product Detail (`/products/:id`)

**Layout:** Header (name, status badge, SAP code) + Tab bar + Tab content

**Tabs:**
1. `General Info` — all identity/classification fields, edit inline or via form
2. `Characteristics (N)` — standard characteristics by group, inline edit
3. `Spec Tables (N)` — dynamic table assignments
4. `Pricing (N)` — rates by client type + date + currency with history
5. `Units` — unit assignments and conversions
6. `External Systems` — coverage matrix for this product + sync status + export button
7. `History` — unified audit timeline (audit + activity merged)

**Header actions:** Edit, Change Status, Delete, Export to all systems

---

### Characteristics (`/characteristics`)

**Purpose:** Manage characteristic definitions

**Table:** Name, Key, Type, Group, Values Count, Products Count

**Create/Edit:** Slide-out drawer
- Name, Key (auto-generated from name), Type
- For SELECT/RADIO/CHECKBOX: value list with add/remove/reorder
- Group assignment

---

### Characteristic Groups (`/characteristics/groups`)

**Table:** Name, Nomenclature Type, Characteristics Count, Products Count

**Detail:** Shows all characteristics in this group, allows reordering

---

### Specification Tables (`/characteristics/tables`)

**Table:** Name, Group, Nomenclature Type, Columns Count, Rows Count

**Detail page:** Full spreadsheet view with:
- Column management (add/rename/reorder/delete)
- Row management (add/edit/delete inline)
- Import rows via Excel
- Link to products

---

### Pricing — Rates (`/pricing/rates`)

**Purpose:** View all product rates (centralized, not per-product)

**Table:** Product, Client Type, Currency, Rate (Sales), Rate (Purchase), Date, Type, Set By

**Filters:** Product, Client Type, Currency, Date Range, Rate Type

**Chart view:** Rate trend for selected product + currency combination

---

### Integrations (`/integrations`)

**Purpose:** Manage external systems + see coverage

**Top section:** Coverage matrix overview (all systems × product count)

**System list:**
- System name, URL, Auth Type, Status (Online/Offline), Products Covered, Last Sync

**Click into system:** System detail with integration configs

---

### External System Detail (`/integrations/:id`)

**Tabs:**
1. `Overview` — system info, auth settings, API key management
2. `Integration Configs` — list of configs for this system
3. `Coverage` — all products × this system status
4. `Sync History` — past exports with results
5. `Errors` — failed syncs with error messages

**Config Builder** — accessed from Integration Configs tab:
1. Step 1: Format + sections
2. Step 2: Per-section field mapping
3. Step 3: Preview with sample product
4. Step 4: Save + activate

---

### Dealers (`/partners/dealers`)

**Table:** Name, Code, Status, Region, Client Type, Accounts, Branches, Active Discounts

**Filters:** Status, Region, Client Type, Has Active Discount

**Dealer Detail Tabs:**
1. `Overview` — dealer info card
2. `Bank Accounts (N)` — account list + add
3. `Branches (N)` — branch list + add + map link
4. `Discounts (N)` — active + upcoming + expired discounts
5. `History` — audit trail for this dealer

---

### Discounts (`/partners/discounts`)

**Purpose:** All discount rules, centralized view

**Table:** Dealer, Segment, Percent, Start Date, End Date, Status (Active/Upcoming/Expired)

**Warnings:** Overlap detection visible inline (⚠ Overlaps with another discount)

**Filters:** Dealer, Segment, Status, Date Range

**Chart:** Discount calendar (Gantt-style, showing which periods are covered)

---

### Users (`/users`)

**Table:** Name, Username, Role, Last Login, Active Sessions, Status

**Filters:** Role, Status

**User Detail Tabs:**
1. `Profile` — personal info, edit
2. `Security` — password reset, force logout
3. `Roles & Permissions` — role assignment, custom permissions
4. `Sessions (N)` — active and recent sessions
5. `Activity (N)` — all actions by this user

---

### Audit & Activity (`/audit`)

**Sub-pages:**
- `/audit/sessions` — all sessions with filters
- `/audit/sessions/:id` — session detail with action timeline
- `/audit/changes` — global change log with filters
- `/audit/errors` — failed operations
- `/audit/imports` — import history

---

### Platform Health (`/health`)

**Sections:**
- External system status (ping results)
- Database connection status
- Recent failed operations
- Data quality score + breakdown
- Storage metrics

---

## Key Shared Components to Build

### `CoverageMatrix`
A table where rows are products and columns are external systems.
Cell states: SYNCED (✓ green), MISSING (✗ red), PENDING (⏳ yellow), FAILED (✕ red filled).

### `AuditTimeline`
A vertical timeline of changes. Each item shows: timestamp, user, action, field changes (collapsed by default, expand to see old→new values).

### `DataQualityScore`
A circular progress + percentage number + breakdown list of issues.

### `KpiCard`
A stat card with: label, value, trend indicator (↑/↓), click-through action.

### `StatusBadge`
Consistent status display: color-coded, with icon, tooltip.

### `CoverageBar`
Horizontal progress bar with: label, count, percentage, color by coverage level.

### `EntityDrawer`
A slide-out panel from the right for create/edit operations. Keeps context visible.

### `FilterSidebar`
A collapsible left panel with all filters for a page. Can be saved as a preset.

### `TreePicker`
Multi-level tree with search, for selecting product groups.

---

## State Management Strategy

### Keep from current system:
- RTK Query for all API calls
- Redux slices for: auth (permissions/roles), sidebar state, ui theme
- Toast notifications via react-toastify

### Add new slices:
- `notifications` slice — alert count, notification list
- `coverage` slice — current coverage matrix data (cached)

### Data fetching improvements:
- Add `staleTime` to RTK Query endpoints that rarely change (reference data)
- Add `refetchOnWindowFocus` to critical real-time data (sessions, health)
- Add optimistic updates for status changes

---

## Error Handling Strategy

### Current:
- Global error middleware shows toast for any API error
- 401 redirects to login

### Improved:
- Form validation: field-level errors shown inline using `fields` from `ApiException`
- Global errors: toast for unexpected errors, banner for system-level issues
- Network errors: retry with backoff (RTK Query config)
- Empty states: every table/list has a designed empty state
- 403 Forbidden: show "You don't have permission" with contact info
- 404 Not Found: show "Entity not found" with navigation back
- 500 Server Error: show error boundary with retry button

---

## Import System (Improved)

### Current flow: 7-step import wizard

### Improved flow:
1. Select entity type (dropdown with description of what each imports)
2. Download template (shows sample with column explanations)
3. Upload file (drag and drop + file picker)
4. Auto-map columns (match source to target by header similarity)
5. Preview (first 10 rows with validation highlights)
6. Execute
7. Results summary + download error report

**Import history page:** Shows all past imports with status, by whom, when, counts, errors.

---

## Performance Considerations

- **Virtual scrolling** for large tables (1000+ rows) using TanStack Virtual
- **Pagination** default 20 per page, user can set 50/100
- **Debounced search** (300ms) for all search inputs
- **RTK Query caching** with appropriate tag invalidation
- **Code splitting** — each major route section is a lazy chunk
- **Infinite scroll** option for activity/audit logs

---

## Accessibility

- All interactive elements reachable via keyboard
- ARIA labels on icons without text
- Color is not the only differentiator (always text + icon + color for status)
- Focus ring visible on all interactive elements
- Form errors announced to screen readers (role="alert")
- Table has proper `<thead>`, `<th scope>` markup

---

## Internationalization

Current: Russian (ru) + Uzbek (uz) — both working.

New system:
- Keep both languages
- Add proper RTL support foundation (not needed now but don't hardcode LTR)
- Translate all new pages from start (don't leave `t('key')` with empty translations)
- Add English (en) as third language (future)
- All date/number formatting uses `Intl` APIs, locale-aware
