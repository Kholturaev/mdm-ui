import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetMeQuery } from '@entities/profile/api/profileApi';
import {
  getDisplayRoles,
  getProfileDisplayName,
} from '@entities/profile/lib/profileDisplay';
import { useGetMyPermissionsQuery } from '@entities/permission/api/permissionApi';
import { MyPermissionsPicker } from '@entities/permission/ui/MyPermissionsPicker';
import { Avatar } from '@shared/ui/Avatar';
import { Badge } from '@shared/ui/Badge';
import { Card, CardHeader } from '@shared/ui/Card';
import { Spinner } from '@shared/ui/Spinner';
import { ShieldIcon } from '@shared/ui/icons/ShieldIcon';
import { usePageTitle } from '@shared/lib/pageTitle';

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
  usePageTitle(t('profile.title'));

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
    <div className="wide:max-w-4xl wide:mx-auto flex h-full w-full flex-col gap-4 overflow-y-auto p-6">
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar
          name={displayName}
          size="lg"
          className="size-16 shrink-0 text-lg"
        />
        <div className="min-w-0 flex-1">
          <h1 className="text-fg text-lg font-semibold">{displayName}</h1>
          <p className="text-fg-muted text-sm">@{profile.username}</p>
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
      </Card>

      <Card className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ProfileField label={t('profile.username')} value={profile.username} />
        <ProfileField label={t('profile.email')} value={profile.email} />
        <ProfileField label={t('profile.phone')} value={profile.phone} />
        <ProfileField label={t('profile.userId')} value={profile.id} />
      </Card>

      <Card className="flex flex-col gap-3">
        <CardHeader
          icon={<ShieldIcon size={15} />}
          title={
            <span className="flex items-center gap-2">
              {t('profile.permissions')}
              <Badge variant="neutral">{totalPermissions}</Badge>
            </span>
          }
          subtitle={t('profile.permissionsHint')}
        />

        {isPermissionsFetching && permissionGroups.length === 0 ? (
          <div className="flex justify-center py-8">
            <Spinner className="text-fg-muted size-5" />
          </div>
        ) : permissionGroups.length === 0 ? (
          <p className="text-fg-muted text-sm">{t('profile.noPermissions')}</p>
        ) : (
          <MyPermissionsPicker groups={permissionGroups} />
        )}
      </Card>
    </div>
  );
}
