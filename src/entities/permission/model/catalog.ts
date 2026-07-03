import type { IPermission, PermissionModule } from './types';

function definePermissions(
  module: PermissionModule,
  actions: string[],
): IPermission[] {
  return actions.map((action) => ({
    key: `${module}_${action}`,
    module,
    action,
  }));
}

/**
 * Scoped to what mdm-ui actually does today, not a fabricated 200-item list —
 * each entry maps to a real capability on an existing page. Grows as new
 * modules/actions are added; the permission-picker UI is built to handle
 * that scale (search + grouping), not just this current count.
 */
export const PERMISSION_CATALOG: IPermission[] = [
  ...definePermissions('DEALER', [
    'CREATE',
    'READ',
    'UPDATE',
    'DELETE',
    'EXPORT',
  ]),
  ...definePermissions('NOMENCLATURE', [
    'CREATE',
    'READ',
    'UPDATE',
    'DELETE',
    'EXPORT',
  ]),
  ...definePermissions('ANALYTICS', ['VIEW']),
  ...definePermissions('USER', [
    'CREATE',
    'READ',
    'UPDATE',
    'DELETE',
    'ASSIGN_ROLE',
    'RESET_PASSWORD',
  ]),
  ...definePermissions('ROLE', [
    'CREATE',
    'READ',
    'UPDATE',
    'DELETE',
    'ASSIGN_PERMISSIONS',
  ]),
];

export interface PermissionGroup {
  module: PermissionModule;
  permissions: IPermission[];
}

export function groupPermissionsByModule(
  catalog: IPermission[],
): PermissionGroup[] {
  const modules = Array.from(
    new Set(catalog.map((permission) => permission.module)),
  );
  return modules.map((module) => ({
    module,
    permissions: catalog.filter((permission) => permission.module === module),
  }));
}
