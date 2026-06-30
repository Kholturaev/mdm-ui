# Users, Roles & Permissions

---

## User Entity

```
IUser {
  id: string
  username: string
  firstName: string
  lastName: string
  email: string
  phone: string
  telegramNickName: string
}
```

**Current gaps in user data model:**
- No `lastLoginAt` field (must derive from activity logs)
- No `isActive` / `isBlocked` flag
- No `createdAt` / `createdBy` fields
- No `avatar` / `profileImage`
- No department/position fields
- No associated region/warehouse

---

## Role System

### Built-in Roles

From the route config, the system has these role strings:
- `ADMIN`
- `SUPER_ADMIN`
- `DIRECTOR`
- `OWNER`

### Role Model

```
IRole {
  id: string
  name: string
  description?: string
}
```

**SUPER_ADMIN / ADMIN** bypass all permission checks and get full access.

**DIRECTOR / OWNER** get access to the Monitoring (audit/sessions) section.

All other users rely on individual permission grants.

---

## Permission System

### Architecture

```
User
  ├── Roles[] (via assignRoleToUser)
  │     └── each Role has default permissions set
  └── Direct Permissions[] (via addPermissionToUser)
        → overrides or supplements role defaults
```

**Effective permissions** = Role's default permissions + Direct user permissions - Revoked permissions

### Permission API Operations

```
GET    /permission/me/permissions    → current user's permissions
GET    /permission/me/roles          → current user's roles

GET    /users/{id}/permissions       → a specific user's permissions
POST   /users/{id}/permissions       → add permission to user
DELETE /users/{id}/permissions/{perm} → remove permission from user
POST   /users/{id}/permissions/reset  → reset to role defaults

GET    /users/{id}/roles             → user's roles
POST   /users/{id}/roles             → assign role to user

GET    /roles                        → all available roles
GET    /roles/{id}/permissions       → role's default permissions
PUT    /roles/{id}/permissions       → set role's default permissions

POST   /users/{id}/password/reset    → admin resets user password
POST   /users/password/change        → user changes own password
```

---

## Permission Groups (UI Display)

Permissions are grouped by entity for display in the role/user permission editor:

```
PermissionGroupType {
  nameEndpoint: string        // e.g., "product", "dealer", "user"
  permissions: PermissionItem[]
}

PermissionItem {
  name: string    // "Product — Read"
  value: string   // "PRODUCT_READ"
  id?: number
}
```

### All Permission Groups

| Group | Permissions |
|---|---|
| **Audit** | PERFORM_AUDIT |
| **User** | READ, CREATE, UPDATE, DELETE |
| **Unit** | READ, CREATE, UPDATE, DELETE |
| **Characteristics** | GET, CREATE, UPDATE, DELETE |
| **Characteristics Group** | READ, CREATE, UPDATE, DELETE |
| **Characteristic Table** | READ, CREATE |
| **Characteristic Row** | CREATE |
| **Characteristic Column** | CREATE |
| **Product** | READ, CREATE, UPDATE, DELETE |
| **Product Group** | READ, CREATE, UPDATE, DELETE |
| **Product Category** | READ, CREATE, UPDATE, DELETE |
| **Product Attribute** | READ, CREATE, UPDATE, DELETE |
| **Product Characteristics** | GET, CREATE, UPDATE, DELETE |
| **Product Rate** | READ, CREATE, UPDATE, DELETE |
| **Accounting Product** | READ, CREATE, UPDATE, DELETE |
| **Series** | READ, CREATE, UPDATE, DELETE |
| **Type of Nomenclature** | READ, CREATE, UPDATE, DELETE |
| **Dealer** | READ, CREATE, UPDATE, DELETE |
| **Dealer Account** | READ, CREATE, UPDATE, DELETE |
| **Dealer Branch** | READ, CREATE, UPDATE, DELETE |
| **Dealer Discount** | READ, CREATE, UPDATE, DELETE |
| **Account Group** | READ, CREATE, UPDATE, DELETE |
| **Account Group Debt Limits** | READ, CREATE, UPDATE, DELETE |
| **Segment** | READ, CREATE, UPDATE, DELETE |
| **Client Type** | READ, CREATE, UPDATE, DELETE |
| **Client** | READ, CREATE, UPDATE, DELETE |
| **Contractor** | READ, CREATE, UPDATE, DELETE |
| **Region** | READ, CREATE, UPDATE, DELETE |
| **Regional Base** | READ, CREATE, UPDATE, DELETE |
| **Currency** | READ, CREATE, UPDATE, DELETE |
| **Currency Rate** | READ, CREATE |
| **External System** | READ, CREATE, UPDATE, DELETE |
| **Integration Config** | READ, CREATE, UPDATE, DELETE |
| **Conversion** | GET_BY_FROM, GET_BY_MAIN, ADD, UPDATE, DELETE |
| **Setting** | GET, CREATE, UPDATE, DELETE |
| **Employee** | READ, CREATE, UPDATE, DELETE |

---

## User Management — Current Implementation

### User List Page
Shows a table with: username, firstName, lastName, email, phone, telegramNickName.

**Missing from user list:**
- Last login time
- Active sessions indicator
- Role badge (which role)
- Status (active/blocked)
- Actions count (how active is this user?)

### User Detail Page — Current Tabs

1. **Authorization tab** — password reset
2. **Credentials tab** — user details form (name, email, phone, etc.)
3. **Roles section** — view/assign roles
4. **Permission group** — view/assign/remove individual permissions

### User Detail Page — What's Missing

- **Sessions tab** — show all active/past sessions for this user
- **Activity tab** — show all actions this user performed
- **Force logout button** — terminate all active sessions
- **Account status toggle** — block/unblock user

---

## Permission Guard in UI

### Route-level guard

`PrivateRoute` checks permissions before rendering:
```typescript
// From guards/PrivateRoute.tsx logic:
if (route.permissions?.length && !hasPermission(permissions, route.permissions)) {
  redirect to /forbidden
}
if (route.roles?.length && !hasRole(roles, route.roles)) {
  redirect to /forbidden
}
```

### Component-level guard

`PermissionGuard` wrapper hides UI elements:
```tsx
<PermissionGuard permission={Permissions.PRODUCT.CREATE}>
  <Button>Create Product</Button>
</PermissionGuard>
```

The `usePermission` hook checks the Redux store's permissions array.

---

## Roles & Permissions Page

**Route:** `/role-permissions` (currently hidden from sidebar — only accessible via URL)

**Current implementation:**
- Shows all roles
- For each role: shows the default permissions
- Admin can toggle permissions per role

**Required improvements:**
- Show role → make it visible in sidebar for admins
- Show how many users have each role
- Show permission dependencies (e.g., UPDATE implies READ)
- Show last time role was modified and by whom
- Allow cloning a role
- Show diff between two roles

---

## Proposed User List View

```
USERS                                    [+ New User] [Export ▼]

Search: [___________] Role: [All ▼] Status: [All ▼]

┌──────────────────────────────────────────────────────────────────┐
│ User           │ Role         │ Last Login   │ Sessions │ Status │
├────────────────┼──────────────┼──────────────┼──────────┼────────┤
│ asliddin.k     │ SUPER_ADMIN  │ 2 min ago    │ 1 active │ ● On   │
│ john.doe       │ DIRECTOR     │ 1 hour ago   │ 0 active │ ○ Off  │
│ ivan.petrov    │ ADMIN        │ 3 days ago   │ 0 active │ ○ Off  │
│ test.user      │ (none)       │ Never        │ 0 active │ ✕ New  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Proposed User Detail Page

```
┌─────────────────────────────────────────────────────────┐
│ [Avatar]  Asliddin Kholturaev                     ●ACTIVE│
│           @asliddin.k | a.kholturaev@akfa.uz            │
│           +998 90 123 45 67 | Telegram: @asliddin        │
│                                                          │
│  [Edit Profile]   [Reset Password]   [Block User]        │
└─────────────────────────────────────────────────────────┘

[Roles & Permissions] [Active Sessions (1)] [Activity Log] [Security]

──── Roles ────────────────────────────────────────────────
SUPER_ADMIN   Full system access        [Remove]
+ Assign Role [DIRECTOR ▼] [Save]

──── Custom Permissions ───────────────────────────────────
These override role defaults:

● PRODUCT_CREATE (granted directly)    [Remove]
✕ DEALER_DELETE (revoked directly)    [Remove]
[+ Add permission]   [Reset to role defaults]
```

---

## Security Considerations

### Password Policy (to implement)
- Minimum 8 characters
- At least one uppercase, one number
- Password expiry (configurable)
- No reuse of last N passwords

### Session Management
- Sessions should expire after configurable inactivity
- Force logout should terminate all tokens/sessions
- Suspicious login detection (new IP, new device) — optional

### Audit on Users
Every user management action should appear in the audit trail:
- User created: by whom, when
- Password reset: by whom, for whom, when
- Role assigned/removed: by whom, when
- Permission granted/revoked: by whom, when
- User blocked/unblocked: by whom, when
