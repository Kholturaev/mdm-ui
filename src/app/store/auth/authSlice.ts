import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

type AuthState = {
  isAuthenticated: boolean;
  username: string | null;
};

const initialState: AuthState = {
  isAuthenticated: false,
  username: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<{ username: string }>) {
      state.isAuthenticated = true;
      state.username = action.payload.username;
    },
  },
});

export const { login } = authSlice.actions;
export default authSlice.reducer;
