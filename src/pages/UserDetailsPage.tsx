import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetMeQuery } from '@entities/profile/api/profileApi';
import {
  useDeleteUserMutation,
  useGetOneUserQuery,
  useUpdateUserMutation,
} from '@entities/user/api/userApi';
import { UserRolesPanel } from '@entities/user/ui/UserRolesPanel';
import { UserPermissionsPanel } from '@entities/user/ui/UserPermissionsPanel';
import { UserCredentialsPanel } from '@entities/user/ui/UserCredentialsPanel';
import { UserForm } from '@features/user-create-edit/ui/UserForm';
import type { UserFormSubmitValues } from '@features/user-create-edit/ui/UserForm';
import { Card } from '@shared/ui/Card';
import { Modal } from '@shared/ui/Modal';
import { Button } from '@shared/ui/Button';
import { Avatar } from '@shared/ui/Avatar';
import { Tabs } from '@shared/ui/Tabs';
import { parseApiError } from '@shared/api/parseApiError';
import type { ApiException } from '@shared/api/type';
import { notify } from '@shared/lib/toast';
import { useBackLink } from '@shared/lib/backLink';
import { useConfirm } from '@shared/lib/confirm';
import { EditIcon } from '@shared/ui/icons/EditIcon';
import { DeleteIcon } from '@shared/ui/icons/DeleteIcon';
import { ShieldIcon } from '@shared/ui/icons/ShieldIcon';
import { UserIcon } from '@shared/ui/icons/UserIcon';
import { LockIcon } from '@shared/ui/icons/LockIcon';

type TabKey = 'overview' | 'authorization' | 'credentials';

export function UserDetailsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const userId = id ?? '';

  const { data, isLoading } = useGetOneUserQuery(userId, { skip: !userId });
  const user = data?.data;

  useBackLink({ label: t('user.backToList'), href: '/access/users' });
  const confirm = useConfirm();

  const { data: meData } = useGetMeQuery();
  const me = meData?.data;
  const isOwnProfile = Boolean(me && user && me.id === user.id);
  const isAdmin = useMemo(
    () => (me?.roles ?? []).some((role) => /admin/i.test(role)),
    [me],
  );

  const [tab, setTab] = useState<TabKey>('overview');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [updateUser, { isLoading: isSavingUser }] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const handleEditSubmit = async (values: UserFormSubmitValues) => {
    const { firstName, lastName, username, email, phone, telegramNickName } =
      values;
    try {
      await updateUser({
        id: userId,
        data: { firstName, lastName, username, email, phone, telegramNickName },
      }).unwrap();
      notify.success(t('message.saved'));
      setIsEditOpen(false);
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    const confirmed = await confirm({
      title: t('user.deleteTitle'),
      description: t('user.deleteConfirm', {
        name: `${user.firstName} ${user.lastName}`,
      }),
    });
    if (!confirmed) return;

    try {
      await deleteUser(user.id).unwrap();
      notify.success(t('message.deleted'));
      navigate('/access/users');
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  if (isLoading || !user) {
    return (
      <div className="text-fg-muted flex h-full items-center justify-center text-sm">
        {t('common.loading')}
      </div>
    );
  }

  const canManageAuthorization = isAdmin;
  const canSeeCredentials = isAdmin || isOwnProfile;

  return (
    <div className="flex h-full flex-col">
      <Card className="flex items-start justify-between gap-4 rounded-none border-x-0 border-t-0">
        <div>
          <div className="flex items-center gap-3">
            <Avatar name={user.firstName} size="lg" />
            <div>
              <h1 className="text-fg text-lg font-semibold">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-fg-muted text-sm">
                {user.username} · {user.phone || '—'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            className="h-7 gap-1 px-2 text-[11px]"
            icon={<EditIcon size={12} />}
            onClick={() => setIsEditOpen(true)}
          >
            {t('common.edit')}
          </Button>
          <Button
            variant="danger"
            className="h-7 gap-1 px-2 text-[11px]"
            icon={<DeleteIcon size={12} />}
            onClick={handleDelete}
          >
            {t('common.delete')}
          </Button>
        </div>
      </Card>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
        <Tabs
          items={[
            {
              key: 'overview',
              label: t('user.tabOverview'),
              icon: <UserIcon size={14} />,
            },
            ...(canManageAuthorization
              ? [
                  {
                    key: 'authorization',
                    label: t('user.tabAuthorization'),
                    icon: <ShieldIcon size={14} />,
                  },
                ]
              : []),
            ...(canSeeCredentials
              ? [
                  {
                    key: 'credentials',
                    label: t('user.tabCredentials'),
                    icon: <LockIcon size={14} />,
                  },
                ]
              : []),
          ]}
          value={tab}
          onChange={(key) => setTab(key as TabKey)}
        />

        {tab === 'overview' && (
          <Card className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-fg-muted text-xs">{t('user.firstName')}</p>
              <p className="text-fg mt-0.5 text-sm font-medium">
                {user.firstName}
              </p>
            </div>
            <div>
              <p className="text-fg-muted text-xs">{t('user.lastName')}</p>
              <p className="text-fg mt-0.5 text-sm font-medium">
                {user.lastName}
              </p>
            </div>
            <div>
              <p className="text-fg-muted text-xs">{t('user.username')}</p>
              <p className="text-fg mt-0.5 text-sm font-medium">
                {user.username}
              </p>
            </div>
            <div>
              <p className="text-fg-muted text-xs">{t('user.email')}</p>
              <p className="text-fg mt-0.5 text-sm font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-fg-muted text-xs">{t('user.phone')}</p>
              <p className="text-fg mt-0.5 text-sm font-medium">
                {user.phone || '—'}
              </p>
            </div>
            <div>
              <p className="text-fg-muted text-xs">{t('user.telegram')}</p>
              <p className="text-fg mt-0.5 text-sm font-medium">
                {user.telegramNickName || '—'}
              </p>
            </div>
          </Card>
        )}

        {tab === 'authorization' && canManageAuthorization && (
          <Card className="flex min-h-0 flex-1 flex-col gap-3 p-4">
            <UserRolesPanel userId={user.id} />
            <div className="border-border border-t" />
            <UserPermissionsPanel userId={user.id} />
          </Card>
        )}

        {tab === 'credentials' && canSeeCredentials && (
          <UserCredentialsPanel userId={user.id} isOwnProfile={isOwnProfile} />
        )}
      </div>

      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={t('user.editTitle')}
      >
        <UserForm
          user={user}
          isSubmitting={isSavingUser}
          onSubmit={handleEditSubmit}
          onCancel={() => setIsEditOpen(false)}
        />
      </Modal>
    </div>
  );
}
