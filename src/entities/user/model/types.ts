export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface IUser {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  status: UserStatus;
  /** Permissions are never set directly on a user — they're the union of these roles' permissionKeys. */
  roleIds: number[];
  createdAt: string;
  lastLoginAt?: string;
}

export interface UserFormValues {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  status: UserStatus;
  roleIds: number[];
}
