# Audit & Activity Log

The system has two overlapping audit mechanisms that need to be unified into one coherent "who did what, when" interface.

---

## The Two Systems

### System 1: Audit Trail (DB-Level)

**API:** `/audit/info/by-table-name/{tableName}`

This is a **database-level change log**. Every INSERT, UPDATE, or DELETE on tracked tables creates an audit record with old and new field values.

```
IAuditEntry {
  id: number
  tableName: string           // DB table name, e.g., "product", "dealer"
  recordId: number            // which row changed
  actionType: 'INSERT' | 'UPDATE' | 'DELETE'
  fieldName: string           // which specific field changed
  oldValue: string | null     // value before the change
  newValue: string | null     // value after the change
  performedById: string       // user ID
  performedBy?: {
    id, firstName, lastName, username
  }
  actionTime: string          // timestamp
}
```

**Querying:**
- `GET /audit/info/by-table-name/{tableName}?page=0&size=20` — all changes to a table
- `GET /audit/info/by-table-name/{tableName}/record/{recordId}?page=0&size=20` — changes to specific record

**Characteristics:**
- Raw, field-by-field granularity
- Every single field has its own audit record (one UPDATE with 5 changed fields = 5 audit records)
- Linked to users but not to user sessions
- Paginated (Spring Page format)

---

### System 2: Activity Log (Session-Level)

**API:** `/activity` (session-based)

This is a **user behavior log**. It tracks user sessions and the actions they take within sessions.

```
IUserSession {
  id: string
  userId: string
  username: string
  email: string
  ipAddress: string
  deviceType: 'DESKTOP' | 'MOBILE' | 'TABLET' | 'UNKNOWN'
  browser: string
  os: string
  startedAt: string
  lastActivityAt: string | null
}

IActivityLog {
  id: string
  sessionId: string
  username: string
  action: ActivityAction
  actionLabel: string | null        // human-readable action name
  entityType: string | null         // 'PRODUCT', 'DEALER', etc.
  entityTypeLabel: string | null    // translated label
  entityId: string | null           // ID of the entity acted on
  pageUrl: string | null            // which URL was visited
  description: string | null        // free-form description
  createdAt: string
  changes?: IFieldChange[]          // field-level changes (linked from audit)
}

IFieldChange {
  tableName: string
  recordId: number
  actionType: 'INSERT' | 'UPDATE' | 'DELETE'
  fieldName: string | null
  oldValue: string | null
  newValue: string | null
}

ActivityAction:
  'PAGE_VIEW' | 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'IMPORT' | 'SEARCH'
```

**Characteristics:**
- Session-centric view (actions grouped by login session)
- Includes page views and searches (not just data changes)
- Has `changes[]` which are the field-level audit records for that action
- Better for "what did user X do in their session?"

---

## How They Should Work Together

The **IActivityLog.changes[]** field bridges both systems. An `UPDATE` activity log entry should include the `IFieldChange[]` records for that update, showing exactly what fields changed.

The ideal combined view:

```
Session: asliddin.k  │  Chrome 125 / Windows 11  │  IP: 192.168.1.15
Started: 2026-06-30 09:14:23  │  Last active: 09:47:12  │  Duration: 33 min

┌─────────────────────────────────────────────────────────────────────┐
│ Time     │ Action  │ Entity          │ Description                   │
├──────────┼─────────┼─────────────────┼───────────────────────────────┤
│ 09:14    │ Login   │ —               │ Session started               │
│ 09:15    │ View    │ Product list    │ Viewed /products               │
│ 09:16    │ Search  │ Products        │ Searched: "Samsung"            │
│ 09:18    │ View    │ Product #4821   │ Opened Samsung Galaxy A54      │
│ 09:21    │ UPDATE  │ Product #4821   │ Updated product                │
│          │         │   └ name        │ "Samsung A54" → "Samsung Galaxy A54" │
│          │         │   └ sapCode     │ "OLD-4821" → "SAP-4821"       │
│ 09:35    │ CREATE  │ ProductRate     │ Added price: 1,250,000 UZS    │
│ 09:47    │ EXPORT  │ Products        │ Exported 124 products to Excel│
└──────────┴─────────┴─────────────────┴───────────────────────────────┘
```

---

## Current Implementation Problems

### Problem 1: Audit and Activity are separate pages
- `/monitoring/sessions` → shows sessions list
- No unified audit trail
- Field changes only visible inside session logs
- Can't search "all changes to product X by any user"

### Problem 2: Audit API only queries by table name or record ID
- Can't filter by user
- Can't filter by date range without client-side filtering
- Can't search across all tables at once

### Problem 3: Activity log doesn't show audit details inline
The `IActivityLog.changes[]` field exists but the current `FieldChangesPanel` component shows it in a separate panel, not inline.

### Problem 4: No "history tab" on entity detail pages
Product, Dealer, User detail pages don't have an audit/history tab. To see what changed, you'd have to go to `/monitoring/sessions` and search.

---

## Required Audit Features

### 1. Entity-Level History Tab

Every detail page should have a "History" tab:

```
Product: Samsung Galaxy A54

[General] [Characteristics] [Prices] [External Systems] [History]

History (23 changes)

Filters: [User ▼] [Date Range ▼] [Action ▼]

06/30 09:21  Updated by asliddin.k
  name        "Samsung A54" → "Samsung Galaxy A54"
  sapCode     "OLD-4821"    → "SAP-4821"

06/28 14:05  Updated by ivan.petrov
  productStatus  "ACTIVE" → "TEMPORARILY_PASSIVE"

06/25 11:30  Created by john.doe
  (initial values shown)
```

### 2. Global Audit Trail Page

```
/audit/changes

Filters:
  User: [All ▼]
  Entity Type: [Product ▼]
  Action: [UPDATE ▼]
  Date From: [2026-06-01]
  Date To: [2026-06-30]

┌──────────────┬────────────────┬────────────────┬─────────────────┐
│ When         │ Who            │ What           │ Changes         │
├──────────────┼────────────────┼────────────────┼─────────────────┤
│ 06/30 09:21  │ asliddin.k     │ Product #4821  │ 2 fields        │
│ 06/29 14:00  │ john.doe       │ Dealer #120    │ 5 fields        │
│ 06/28 11:45  │ ivan.petrov    │ Product #3901  │ 1 field         │
└──────────────┴────────────────┴────────────────┴─────────────────┘
```

### 3. User Sessions View (Improved)

```
/audit/sessions

Active sessions: 2      Sessions today: 8     Total this week: 31

Filters: [Username ▼] [Date ▼] [Device ▼]

┌────────────┬──────────────┬────────────┬───────────┬──────────────┐
│ User       │ Login Time   │ Duration   │ Actions   │ Device       │
├────────────┼──────────────┼────────────┼───────────┼──────────────┤
│ asliddin.k │ 09:14 today  │ 33 min     │ 7 actions │ Chrome/Win11 │
│ john.doe   │ 08:30 today  │ 2h 15m     │ 45 actions│ Safari/Mac   │
│ ivan.petrov│ Yesterday    │ 1h 02m     │ 12 actions│ Chrome/Win10 │
└────────────┴──────────────┴────────────┴───────────┴──────────────┘
```

### 4. Failed Operations Log

```
/audit/errors

Date          │ Who           │ Operation        │ Error
──────────────┼───────────────┼──────────────────┼──────────────
06/30 10:15   │ john.doe      │ Export to SAP    │ Connection refused
06/29 16:30   │ ivan.petrov   │ Import Products  │ 23 validation errors
06/29 14:00   │ asliddin.k    │ Delete Dealer    │ Permission denied
```

---

## Audit for Sensitive Actions

These actions MUST always be in the audit trail:

| Action | Required Audit Fields |
|---|---|
| User created | createdBy, timestamp, initial values |
| Password reset | resetBy, resetFor, timestamp |
| Role assigned/removed | changedBy, user affected, role, timestamp |
| Permission granted/revoked | changedBy, user affected, permission, timestamp |
| Product deleted | deletedBy, timestamp, what was deleted |
| Dealer deactivated | changedBy, timestamp, old/new status |
| Discount created/modified | changedBy, timestamp, dealer, segment, percent, dates |
| External system credentials changed | changedBy, timestamp |
| Integration config activated/deactivated | changedBy, timestamp |
| Data imported | importedBy, timestamp, entity type, record count, error count |
| Bulk export triggered | exportedBy, timestamp, entity type, filter criteria |

---

## What "Monitoring" Section Should Become

**Current:** `/monitoring/sessions` — basic session list

**Proposed `/audit` section with sub-pages:**

```
Audit & Activity
├── /audit/sessions        — user sessions (who logged in, when, from where)
│   └── /audit/sessions/:id — session detail with all actions
├── /audit/changes         — global change log (all entities, filterable)
├── /audit/errors          — failed operations
└── /audit/imports         — import history (who, when, what, errors)
```

---

## Audit Data Quality

The audit system has two different storage models. To unify them requires:

1. **Frontend:** When showing "history", query **both** APIs and merge results
2. **Ideal:** Backend provides a unified `/audit/timeline/{entityType}/{entityId}` endpoint

Until unified API is available, the frontend should:
- Call audit API for field-level changes: `getAuditByRecord(tableName, recordId)`
- Call activity API for session context
- Merge and display in chronological order with change details
