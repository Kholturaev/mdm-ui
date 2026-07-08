import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetMeQuery } from '@entities/profile/api/profileApi';
import {
  getDisplayRoles,
  getProfileDisplayName,
} from '@entities/profile/lib/profileDisplay';
import { useAppDispatch } from '@app/store';
import { sessionExpired } from '@app/store/auth/authSlice';
import { apiService, logout } from '@shared/api';
import { useClickOutside } from '@shared/lib/hooks/useClickOutside';
import { Avatar } from '@shared/ui/Avatar';
import { Badge } from '@shared/ui/Badge';
import { Spinner } from '@shared/ui/Spinner';
import { LogOutIcon } from '@shared/ui/icons/LogOutIcon';

export function UserMenu() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { data, isLoading } = useGetMeQuery();
  const profile = data?.data;

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useClickOutside(containerRef, () => setIsOpen(false));

  const handleLogout = () => {
    logout(() => {
      dispatch(apiService.util.resetApiState());
      dispatch(sessionExpired());
    });
  };

  if (isLoading) {
    return <Spinner className="text-fg-muted size-4" />;
  }

  if (!profile) return null;

  const displayName = getProfileDisplayName(profile, profile.username);
  const displayRoles = getDisplayRoles(profile.roles);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="hover:bg-surface-hover flex items-center gap-2 rounded-md py-1 pr-2 pl-1 transition-colors"
      >
        <Avatar name={displayName} size="sm" />
        <span className="text-fg text-sm font-medium">{displayName}</span>
      </button>

      {isOpen && (
        <div className="border-border bg-surface absolute top-full right-0 z-50 mt-1 w-56 rounded-md border py-1.5 shadow-lg">
          <div className="border-border mb-1 border-b px-3 pb-2">
            <p className="text-fg truncate text-sm font-medium">
              {displayName}
            </p>
            {profile.email && (
              <p className="text-fg-muted truncate text-xs">{profile.email}</p>
            )}
            {displayRoles.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {displayRoles.map((role) => (
                  <Badge key={role} variant="neutral">
                    {role}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleLogout}
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
