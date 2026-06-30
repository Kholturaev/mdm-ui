// Typed selectors for auth state.
// Uses a structural type for the store slice so shared/ never imports from app/.

import { useSelector } from 'react-redux';
import type { AuthState } from './authSlice';

interface StoreWithAuth {
  auth: AuthState;
}

export function useAuth(): AuthState {
  return useSelector((state: StoreWithAuth) => state.auth);
}

export function usePermission(permission: string): boolean {
  return useSelector((state: StoreWithAuth) =>
    state.auth.permissions.includes(permission),
  );
}
