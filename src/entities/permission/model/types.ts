export const PERMISSION_MODULES = [
  'DEALER',
  'NOMENCLATURE',
  'ANALYTICS',
  'USER',
  'ROLE',
] as const;

export type PermissionModule = (typeof PERMISSION_MODULES)[number];

export interface IPermission {
  /** `${module}_${action}`, e.g. `DEALER_CREATE` — the value stored on a role's `permissionKeys`. */
  key: string;
  module: PermissionModule;
  action: string;
}

/**
 * Shape of the REAL backend's `/permission/me/permissions` response — the
 * currently logged-in user's actual granted permissions, grouped by backend
 * module. Distinct from `IPermission`/`PERMISSION_CATALOG` above, which is a
 * local, hand-maintained mock catalog used only by the Role management demo
 * pages — the two aren't guaranteed to share the same key namespace.
 */
export interface IMyPermissionItem {
  name: string;
  value: string;
}

export interface IMyPermissionGroup {
  nameEndpoint: string;
  permissions: IMyPermissionItem[];
}
