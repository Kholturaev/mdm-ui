import { ThemeToggle } from '@features/theme-toggle/ui/ThemeToggle';
import { LanguageSwitcher } from '@features/language-switcher/ui/LanguageSwitcher';

export function Header() {
  return (
    <header className="border-border bg-surface flex h-14 items-center justify-end gap-3 border-b px-4">
      <LanguageSwitcher />
      <ThemeToggle />
    </header>
  );
}
