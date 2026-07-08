export interface IProfile {
  id: string;
  username: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  roles: string[];
}
