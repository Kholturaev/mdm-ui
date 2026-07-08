import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAppSelector } from '@app/store';

function resolveIsDark(theme: 'light' | 'dark' | 'system'): boolean {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return theme === 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useAppSelector((state) => state.ui.theme);
  const colorTheme = useAppSelector((state) => state.ui.colorTheme);

  useEffect(() => {
    const apply = () =>
      document.documentElement.classList.toggle('dark', resolveIsDark(theme));
    apply();

    if (theme !== 'system') return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', colorTheme);
  }, [colorTheme]);

  return children;
}
