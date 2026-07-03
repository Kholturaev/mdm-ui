import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@app/store';
import { logout } from '@shared/api';
import { useClickOutside } from '@shared/lib/hooks/useClickOutside';
import { Avatar } from '@shared/ui/Avatar';
import { LogOutIcon } from '@shared/ui/icons/LogOutIcon';

export function UserMenu() {
  const { t } = useTranslation();
  const username = useAppSelector((state) => state.auth.username);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useClickOutside(containerRef, () => setIsOpen(false));

  if (!username) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="hover:bg-surface-hover flex items-center gap-2 rounded-md py-1 pr-2 pl-1 transition-colors"
      >
        <Avatar name={username} size="sm" />
        <span className="text-fg text-sm font-medium">{username}</span>
      </button>

      {isOpen && (
        <div className="border-border bg-surface absolute top-full right-0 z-50 mt-1 w-40 rounded-md border py-1.5 shadow-lg">
          <button
            type="button"
            onClick={() => logout()}
            className="text-danger hover:bg-surface-hover flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors"
          >
            <LogOutIcon size={14} />
            {t('auth.logout')}
          </button>
        </div>
      )}
    </div>
  );
}
