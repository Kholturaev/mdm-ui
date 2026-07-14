import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'light' | 'dark' | 'system';
/** Accent/surface palette — independent of light/dark mode, each supports both (see `app/styles/tokens.css`). */
export type ColorTheme = 'default' | 'amethyst' | 'sunset';

const THEME_STORAGE_KEY = 'mdm-theme';
const COLOR_THEME_STORAGE_KEY = 'mdm-color-theme';
const SIDEBAR_STORAGE_KEY = 'mdm-sidebar-collapsed';

type UiState = {
  theme: ThemeMode;
  colorTheme: ColorTheme;
  isSidebarCollapsed: boolean;
};

function readStoredTheme(): ThemeMode {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'light' || stored === 'dark' || stored === 'system'
    ? stored
    : 'system';
}

function readStoredColorTheme(): ColorTheme {
  const stored = localStorage.getItem(COLOR_THEME_STORAGE_KEY);
  return stored === 'default' || stored === 'amethyst' || stored === 'sunset'
    ? stored
    : 'default';
}

const initialState: UiState = {
  theme: readStoredTheme(),
  colorTheme: readStoredColorTheme(),
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
    setColorTheme(state, action: PayloadAction<ColorTheme>) {
      state.colorTheme = action.payload;
      localStorage.setItem(COLOR_THEME_STORAGE_KEY, action.payload);
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

export const { setTheme, setColorTheme, toggleSidebar } = uiSlice.actions;
export default uiSlice.reducer;
