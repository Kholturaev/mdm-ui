import { usePageTitleValue } from '@shared/lib/pageTitle';
import { ThemeToggle } from '@features/theme-toggle/ui/ThemeToggle';
import { LanguageSwitcher } from '@features/language-switcher/ui/LanguageSwitcher';

export function Header() {
  const title = usePageTitleValue();

  return (
    <header className="border-border bg-surface flex h-12 items-center justify-between border-b px-4">
      <h1 className="text-fg text-sm font-semibold">{title}</h1>
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}
