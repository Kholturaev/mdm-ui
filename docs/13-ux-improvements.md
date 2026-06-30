# UX Improvements — Problems & Solutions

Every problem listed here comes from analyzing the current system. Solutions are concrete, not vague.

---

## 1. Empty Dashboard

**Problem:** Dashboard shows "Welcome! You are logged in." — zero useful information.

**Why it matters:** The dashboard is the first thing users see. If it's empty, the system feels unfinished and users don't know where to start.

**Solution:**
- KPI cards (products count, coverage %, active users, alerts)
- External system coverage progress bars
- Recent activity feed (last 10 actions)
- Data quality alerts
- See `09-analytics-dashboard.md` for full spec

---

## 2. Confusing Sidebar Grouping

**Problem:** "Partners" section contains geographic data (Regions). "Reference Books" contains both lookup data AND products. "Additional Characteristics" is cryptic.

**Solution:**
- Restructure into 6 clear groups: **Catalog**, **Characteristics**, **Pricing**, **Integrations**, **Partners**, **Administration**
- Rename "Additional Characteristics" → "Specification Tables" with description tooltip
- Geographic data gets its own section
- See `02-navigation-modules.md` for full structure

---

## 3. Product Table Missing Critical Info

**Problem:** The product list shows name, SAP code, status — but doesn't show which external systems the product is in (or missing from). This is one of the most important MDM views.

**Solution:**
- Add External System Coverage column with mini icon badges per system
- Filter: "Not in SAP" shows all products missing from SAP
- Coverage summary at the top: "245/300 in SAP ERP (82%)"

**Visual:**
```
Samsung A54  SAP-4821  ● Active  ✓ SAP  ✓ 1C  ✗ WMS  ✓ E-com
Samsung A34  SAP-4822  ● Active  ✓ SAP  ✗ 1C  ✗ WMS  ✗ E-com
```

---

## 4. Two Characteristic Systems with No Explanation

**Problem:** Users don't know the difference between "Characteristics" and "Dynamic Tables". Both exist but the UI doesn't explain when to use which.

**Solution:**
- Add descriptive subtitles to both sections
- Add "?" tooltip icons with explanations
- On the characteristics assignment page, group them clearly:
  - "Standard Characteristics (searchable, filterable)"
  - "Specification Tables (tabular data)"
- Empty state for each should explain what it's for

---

## 5. No History/Audit Tab on Entity Detail Pages

**Problem:** To see who changed a product, you have to navigate to Monitoring → Sessions → find the session → find the action. It's 4 clicks from the product.

**Solution:**
- Add "History" tab to every entity detail page (Product, Dealer, User)
- Show a timeline of all changes with: timestamp, user, field, old value → new value
- Uses the audit API `getAuditByRecord(tableName, id)`

---

## 6. User List Missing Status & Last Login

**Problem:** User list shows name, email, phone, telegram. No way to tell if a user is active, when they last logged in, or if they have any active sessions.

**Solution:**
```
Name         | Role      | Last Login    | Sessions | Status
asliddin.k   | SUPER_ADMIN | 2 min ago   | 1 active | ● Online
john.doe     | DIRECTOR  | 1 hour ago    | 0        | ○ Recent
ivan.petrov  | ADMIN     | 3 days ago    | 0        | ○ Away
```

---

## 7. Forms Without Inline Validation Feedback

**Problem:** Forms show errors only after submit (toast). Field-level errors from the API (`fields: Record<string, string>`) are not shown next to the relevant field.

**Solution:**
- Map `ApiException.fields` to react-hook-form's `setError()` after API failure
- Show error text below each field in red
- Required field indicator (`*`) on all required fields
- Real-time validation for format-sensitive fields (GTIN, SAP code, phone)

---

## 8. No Empty States

**Problem:** When a table has no results (new install, or filter returns nothing), it shows an empty table with no guidance.

**Solution:**
Every table/list needs a designed empty state:

```
┌─────────────────────────────────────────┐
│                                         │
│            [product icon]               │
│                                         │
│       No products found                 │
│                                         │
│   Try adjusting your filters or         │
│   create a new product.                 │
│                                         │
│   [Clear Filters]   [+ Create Product]  │
│                                         │
└─────────────────────────────────────────┘
```

Different variants:
- No data at all (first use)
- No results match filters (show "clear filters" button)
- Permission denied (explain why it's empty)
- Error loading (show retry button)

---

## 9. Modals for Everything (Bad for Long Forms)

**Problem:** Long forms are stuffed into modals, causing the modal to be taller than the screen with internal scrolling.

**Solution:**
- Use **slide-out drawers** for create/edit of entities with many fields
- Modal only for: quick confirmations, small forms (1-3 fields), delete confirmation
- Full page navigation for very complex entities (Product detail, Integration config)
- Drawer width: 480px for simple, 720px for complex, 100% for very complex

---

## 10. No Unsaved Changes Warning (Most Forms)

**Problem:** The current system has `useUnsavedChangesGuard` hook but it's not used everywhere. Users can navigate away and lose changes.

**Solution:**
- Apply `useUnsavedChangesGuard` to every form
- Show a browser confirm dialog before navigation if form is dirty
- Show a visible "Unsaved changes" indicator in the form header

---

## 11. Dealer Discount System Has No Overlap Detection

**Problem:** You can create two discounts for the same dealer + segment with overlapping dates. This creates confusion about which applies.

**Solution:**
- When saving a discount, check for overlaps client-side
- Show warning: "⚠ Overlaps with existing discount (15%, Jan-Dec 2026)"
- Allow override but require confirmation

---

## 12. External System Status Not Visible

**Problem:** There's no indication in the UI whether an external system is reachable or when it was last synced.

**Solution:**
- Status indicator on external system list: ● Online, ⚠ Slow, ✕ Error
- Last sync timestamp: "2 hours ago" or "Never"
- On product detail External Systems tab: per-system status with last sync and error details

---

## 13. Product Prices Have No Context

**Problem:** The Rates tab shows price values but:
- No indication of which is "current" effective price
- No history comparison
- No who-set-this-rate information

**Solution:**
```
Prices — Premium Client (UZS)

Current effective rate (as of today):
Sales: 1,250,000 UZS    Purchase: 980,000 UZS
Set by asliddin.k on 2026-06-15

Price History:
Date        │ Sales      │ Purchase   │ Set By
────────────┼────────────┼────────────┼────────────
2026-06-15  │ 1,250,000  │ 980,000    │ asliddin.k  ← current
2026-03-01  │ 1,100,000  │ 850,000    │ john.doe
2025-12-01  │ 1,050,000  │ 800,000    │ asliddin.k

[Add New Price] [Import Prices]
```

---

## 14. Characteristics Assignment UX is Confusing

**Problem:** "Assign Characteristic" opens a form where you pick from all characteristics. But the product's TypeOfNomenclature should filter which characteristics are relevant.

**Solution:**
- Pre-filter characteristic dropdown by TypeOfNomenclature's groups
- Group the dropdown by CharacteristicsGroup
- Show value type next to characteristic name (TEXT, SELECT, etc.)
- Show already-assigned characteristics as non-selectable (grayed) with edit link

---

## 15. Import Wizard Has No Error Preview

**Problem:** Import shows validation errors only after execution. Users upload 1000 rows and find out 23 are invalid only after the fact.

**Solution:**
- During "Preview" step, run validation on all rows
- Show error rows highlighted in red with error description
- Show summary: "120 valid / 23 invalid — fix errors before importing or import valid rows only"
- Allow selective import: "Import valid rows only"

---

## 16. Table Columns Are Fixed Width

**Problem:** SAP code column is wide even for short codes. Name column is narrow and truncates long names.

**Solution:**
- Column resizing (drag column borders)
- Column visibility toggle (show/hide columns)
- Column preferences saved to localStorage per user
- Default widths based on content type: numbers narrow, names wide

---

## 17. No Bulk Actions

**Problem:** To change status for 20 products, users must edit them one by one.

**Solution:**
- Row checkboxes in all tables
- Bulk action toolbar appears when rows are selected:
```
☑ 5 products selected   [Change Status ▼]  [Export Selected]  [Delete Selected]  [✕ Clear]
```

---

## 18. Breadcrumb is Inconsistent

**Problem:** Some pages have breadcrumbs, some don't. Breadcrumb items sometimes show IDs instead of names.

**Solution:**
- Every non-root page has a breadcrumb
- Always show entity name (load it if needed)
- Breadcrumb max 4 levels, middle levels collapse with `...` on mobile
- Sticky breadcrumb at top when scrolling

---

## 19. No Keyboard Shortcuts

**Problem:** Power users can't do anything without the mouse.

**Solution:**
Implement minimal keyboard shortcuts:
- `Ctrl+K` — global search (open command palette)
- `Ctrl+N` — create new (context-sensitive to current page)
- `Escape` — close modal/drawer
- `Ctrl+S` — save current form
- Arrow keys — navigate table rows
- `Enter` — open selected table row

---

## 20. No "Recently Viewed" or Quick Access

**Problem:** Users who work with the same products daily have to search for them every time.

**Solution:**
- "Recently Viewed" section on Dashboard
- Quick links to last 5 products/dealers visited
- Global search with `Ctrl+K` shows recent items before typing

---

## UX Patterns to Adopt Consistently

### Loading States
- Skeleton screens (not spinners) for initial data loads
- Inline spinner for mutations (button turns into loading state)
- Progress bar for imports (shows percentage complete)

### Confirmation Dialogs
- Simple text: "Are you sure?" — replace with context-specific copy
- "Delete product 'Samsung A54'? This cannot be undone."
- Require typing entity name for destructive irreversible actions

### Toast Notifications
- Success: green, 3 seconds, dismissable
- Error: red, 5 seconds, with "Try again" action
- Warning: amber, persists until dismissed
- Info: blue, 4 seconds

### Help Text
- Every form field has a placeholder that shows example value
- Optional tooltip with `?` icon for complex fields
- Contextual help text below field (not just in tooltip)

### Table Pagination
- Show "Showing 1–20 of 1,247 results"
- Page size selector: 20 / 50 / 100
- First/Last page buttons alongside Previous/Next
- Current page input for jumping to specific page
