import type { IProfile } from '../model/types';

/** Full name when available, falling back to the username, then a caller-supplied placeholder. */
export function getProfileDisplayName(
  profile:
    Pick<IProfile, 'firstName' | 'lastName' | 'username'> | null | undefined,
  fallback = '',
): string {
  if (!profile) return fallback;
  const fullName = [profile.firstName, profile.lastName]
    .filter(Boolean)
    .join(' ');
  return fullName || profile.username || fallback;
}

/** Identity-provider bookkeeping roles (Keycloak-style `default-roles-*`, `offline_access`, `uma_authorization`) aren't meaningful to a user — hide them from any role list shown in the UI. */
const TECHNICAL_ROLE_PATTERN = /^default-roles-/i;
const TECHNICAL_ROLES = new Set(['offline_access', 'uma_authorization']);

export function getDisplayRoles(roles: string[] | null | undefined): string[] {
  if (!roles) return [];
  return roles.filter(
    (role) => !TECHNICAL_ROLES.has(role) && !TECHNICAL_ROLE_PATTERN.test(role),
  );
}
