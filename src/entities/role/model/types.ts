export interface IRole {
  id: number;
  name: string;
  description?: string;
  /** Keys from the permission catalog — the single source of truth for what this role can do. */
  permissionKeys: string[];
  createdAt: string;
}

export interface RoleFormValues {
  name: string;
  description?: string;
}
