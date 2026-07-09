import { Link } from 'react-router-dom';
import { useBackLinkValue } from '@shared/lib/backLink';
import { ThemeToggle } from '@features/theme-toggle/ui/ThemeToggle';
import { LanguageSwitcher } from '@features/language-switcher/ui/LanguageSwitcher';
import { ArrowLeftIcon } from '@shared/ui/icons/ArrowLeftIcon';
import { SystemHealthPill } from './SystemHealthPill';
import { UserMenu } from './UserMenu';

export function Header() {
  const backLink = useBackLinkValue();

  return (
    <header className="border-border bg-surface flex h-12 items-center border-b px-4">
      {backLink && (
        <Link
          to={backLink.href}
          className="text-fg-muted hover:text-fg flex items-center gap-1 text-xs"
        >
          <ArrowLeftIcon size={12} />
          {backLink.label}
        </Link>
      )}
      <div className="ml-auto flex items-center gap-3">
        <SystemHealthPill />
        <LanguageSwitcher />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
