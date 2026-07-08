import { createSlice } from '@reduxjs/toolkit';

/**
 * `checking` — session validity is being confirmed against the server (see
 * `AuthGate`); route guards must not redirect either way while in this state,
 * since the httpOnly cookie's validity can't be known synchronously on boot.
 *
 * User identity itself (name, email, roles) is never stored here — it's
 * fetched live from `/users/me` (see `entities/profile`) wherever it's
 * displayed, so it's always the server's current answer, not a stale guess.
 */
export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

type AuthState = {
  status: AuthStatus;
};

const initialState: AuthState = {
  status: 'checking',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state) {
      state.status = 'authenticated';
    },
    /** The boot-time session check confirmed the httpOnly cookie is still valid. */
    sessionRestored(state) {
      state.status = 'authenticated';
    },
    /** No valid session — either the boot check, a 401 refresh attempt, or an explicit logout. */
    sessionExpired(state) {
      state.status = 'unauthenticated';
    },
  },
});

export const { login, sessionRestored, sessionExpired } = authSlice.actions;
export default authSlice.reducer;
