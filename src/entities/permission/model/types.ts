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
