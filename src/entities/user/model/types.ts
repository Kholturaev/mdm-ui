export interface IUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  telegramNickName: string;
}

export type UserFormValues = Omit<IUser, 'id'>;

export type UserCreateFormValues = UserFormValues & {
  password: string;
};

/** A Keycloak realm role, as returned by the auth-service — not `@entities/role`'s local numeric-id role. */
export interface IUserRole {
  id: string;
  name: string;
  description?: string;
}
