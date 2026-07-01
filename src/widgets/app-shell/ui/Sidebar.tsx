import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@shared/lib/cn';

const NAV_ITEMS = [{ to: '/dealers', labelKey: 'nav.dealers' } as const];

export function Sidebar() {
  const { t } = useTranslation();

  return (
    <aside className="border-border bg-surface flex w-56 flex-col border-r">
      <div className="border-border flex h-14 items-center border-b px-4 text-sm font-semibold">
        MDM
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'text-fg-muted hover:bg-surface-hover hover:text-fg rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive && 'bg-primary/10 text-primary',
              )
            }
          >
            {t(item.labelKey)}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
