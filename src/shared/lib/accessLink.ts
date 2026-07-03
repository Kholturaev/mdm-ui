type UsersLinkParams = {
  roleId?: number;
};

/** Deep link into the Users list pre-filtered by role — mirrors `buildNomenclatureLink`'s contract (query param in, seeded on mount by the table). */
export function buildUsersLink({ roleId }: UsersLinkParams = {}): string {
  const search = new URLSearchParams();
  if (roleId != null) search.set('role', String(roleId));
  const query = search.toString();
  return query ? `/access/users?${query}` : '/access/users';
}
