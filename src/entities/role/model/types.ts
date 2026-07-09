export interface IRole {
  id: number;
  name: string;
  description?: string;
}

export interface RoleFormValues {
  name: string;
  description?: string;
}
