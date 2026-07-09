import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetMeQuery } from '@entities/profile/api/profileApi';
import {
  getDisplayRoles,
  getProfileDisplayName,
} from '@entities/profile/lib/profileDisplay';
import { useGetMyPermissionsQuery } from '@entities/permission/api/permissionApi';
import { MyPermissionsPicker } from '@entities/permission/ui/MyPermissionsPicker';
import { UserCredentialsPanel } from '@entities/user/ui/UserCredentialsPanel';
import { Avatar } from '@shared/ui/Avatar';
import { Badge } from '@shared/ui/Badge';
import { Card } from '@shared/ui/Card';
import { Spinner } from '@shared/ui/Spinner';
import { Tabs } from '@shared/ui/Tabs';
import { ShieldIcon } from '@shared/ui/icons/ShieldIcon';
import { UserIcon } from '@shared/ui/icons/UserIcon';
import { LockIcon } from '@shared/ui/icons/LockIcon';

type TabKey = 'overview' | 'authorization' | 'credentials';

function ProfileField({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div>
      <p className="text-fg-muted text-xs">{label}</p>
      <p className="text-fg mt-0.5 text-sm font-medium">{value || '—'}</p>
    </div>
  );
}

export function ProfilePage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<TabKey>('overview');

  const { data: profileRes, isLoading: isProfileLoading } = useGetMeQuery();
  const profile = profileRes?.data;

  const { data: permissionsRes, isFetching: isPermissionsFetching } =
    useGetMyPermissionsQuery();
  const permissionGroups = useMemo(
    () => permissionsRes?.data ?? [],
    [permissionsRes],
  );
  const totalPermissions = useMemo(
    () =>
      permissionGroups.reduce(
        (sum, group) => sum + group.permissions.length,
        0,
      ),
    [permissionGroups],
  );

  if (isProfileLoading || !profile) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="text-fg-muted size-6" />
      </div>
    );
  }

  const displayName = getProfileDisplayName(profile, profile.username);
  const displayRoles = getDisplayRoles(profile.roles);

  return (
    <div className="flex h-full flex-col">
      <Card className="flex flex-col gap-4 rounded-none border-x-0 border-t-0 pb-0">
        <div className="flex items-center gap-3">
          <Avatar name={displayName} size="lg" />
          <div>
            <h1 className="text-fg text-lg font-semibold">{displayName}</h1>
            <p className="text-fg-muted text-sm">
              @{profile.username} · {profile.phone || '—'}
            </p>
          </div>
        </div>

        <Tabs
          className="-mx-5 px-5"
          items={[
            {
              key: 'overview',
              label: t('user.tabOverview'),
              icon: <UserIcon size={14} />,
            },
            {
              key: 'authorization',
              label: t('user.tabAuthorization'),
              icon: <ShieldIcon size={14} />,
            },
            {
              key: 'credentials',
              label: t('user.tabCredentials'),
              icon: <LockIcon size={14} />,
            },
          ]}
          value={tab}
          onChange={(key) => setTab(key as TabKey)}
        />
      </Card>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
        {tab === 'overview' && (
          <Card className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ProfileField
              label={t('profile.username')}
              value={profile.username}
            />
            <ProfileField label={t('profile.email')} value={profile.email} />
            <ProfileField label={t('profile.phone')} value={profile.phone} />
            <ProfileField label={t('profile.userId')} value={profile.id} />
          </Card>
        )}

        {tab === 'authorization' && (
          <Card className="flex min-h-0 flex-1 flex-col gap-3 p-4">
            <div>
              <span className="text-fg flex items-center gap-1.5 text-sm font-semibold">
                <span className="text-fg-muted flex items-center">
                  <ShieldIcon size={14} />
                </span>
                {t('user.rolesTitle')}
              </span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {displayRoles.length > 0 ? (
                  displayRoles.map((role) => (
                    <Badge key={role} variant="neutral">
                      {role}
                    </Badge>
                  ))
                ) : (
                  <span className="text-fg-muted text-xs">
                    {t('profile.noRoles')}
                  </span>
                )}
              </div>
            </div>

            <div className="border-border border-t" />

            <div className="flex min-h-0 flex-1 flex-col gap-2">
              <span className="text-fg flex items-center gap-1.5 text-sm font-semibold">
                <span className="text-fg-muted flex items-center">
                  <ShieldIcon size={14} />
                </span>
                {t('profile.permissions')}
                <Badge variant="neutral">{totalPermissions}</Badge>
              </span>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {isPermissionsFetching && permissionGroups.length === 0 ? (
                  <div className="flex justify-center py-8">
                    <Spinner className="text-fg-muted size-5" />
                  </div>
                ) : permissionGroups.length === 0 ? (
                  <p className="text-fg-muted text-sm">
                    {t('profile.noPermissions')}
                  </p>
                ) : (
                  <MyPermissionsPicker groups={permissionGroups} />
                )}
              </div>
            </div>
          </Card>
        )}

        {tab === 'credentials' && (
          <UserCredentialsPanel userId={profile.id} isOwnProfile />
        )}
      </div>
    </div>
  );
}
