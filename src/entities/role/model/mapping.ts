import type { IRole, RoleFormValues } from './types';

export function toRoleFormValues(role?: IRole): RoleFormValues {
  return {
    name: role?.name ?? '',
    description: role?.description ?? '',
  };
}
