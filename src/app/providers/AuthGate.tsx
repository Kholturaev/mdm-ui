import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { performRefresh } from '@shared/api';
import { sessionExpired, sessionRestored } from '@app/store/auth/authSlice';
import { useAppDispatch } from '@app/store';

/**
 * Confirms the httpOnly session cookie is still valid once at app boot —
 * without this, `auth.status` would only ever be set by the login form, so a
 * hard page reload always started "logged out" and bounced straight to
 * /login even with a perfectly valid session. The route guards hold off on
 * redirecting until this resolves (see `PrivateRoute`/`PublicRoute`).
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let cancelled = false;
    performRefresh().then((isValid) => {
      if (cancelled) return;
      dispatch(isValid ? sessionRestored() : sessionExpired());
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs exactly once at app boot
  }, []);

  return children;
}
