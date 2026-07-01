import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'mdm-theme';
const SIDEBAR_STORAGE_KEY = 'mdm-sidebar-collapsed';

type UiState = {
  theme: ThemeMode;
  isSidebarCollapsed: boolean;
};

function readStoredTheme(): ThemeMode {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'light' || stored === 'dark' || stored === 'system'
    ? stored
    : 'system';
}

const initialState: UiState = {
  theme: readStoredTheme(),
  isSidebarCollapsed: localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.theme = action.payload;
      localStorage.setItem(THEME_STORAGE_KEY, action.payload);
    },
    toggleSidebar(state) {
      state.isSidebarCollapsed = !state.isSidebarCollapsed;
      localStorage.setItem(
        SIDEBAR_STORAGE_KEY,
        String(state.isSidebarCollapsed),
      );
    },
  },
});

export const { setTheme, toggleSidebar } = uiSlice.actions;
export default uiSlice.reducer;
