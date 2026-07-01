import { useAppDispatch, useAppSelector } from '@app/store';
import { setTheme } from '@app/store/ui/uiSlice';
import { SunIcon, MoonIcon } from '@shared/ui/icons/SunMoonIcon';

export function ThemeToggle() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={() => dispatch(setTheme(isDark ? 'light' : 'dark'))}
      aria-label="Toggle dark mode"
      className="text-fg-muted hover:bg-surface-hover hover:text-fg flex size-9 items-center justify-center rounded-md transition-colors"
    >
      {isDark ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}
