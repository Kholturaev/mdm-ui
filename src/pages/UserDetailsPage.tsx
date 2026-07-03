import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { UserFormValues } from '@entities/user/model/types';
import {
  useAssignRolesMutation,
  useDeleteUserMutation,
  useGetUserQuery,
  useUpdateUserMutation,
} from '@entities/user/api/userApi';
import { useGetRolesQuery } from '@entities/role/api/roleApi';
import { PERMISSION_CATALOG } from '@entities/permission/model/catalog';
import { PermissionPicker } from '@widgets/permission-picker/ui/PermissionPicker';
import { UserForm } from '@features/user-create-edit/ui/UserForm';
import { Card, CardHeader } from '@shared/ui/Card';
import { Modal } from '@shared/ui/Modal';
import { Button } from '@shared/ui/Button';
import { Badge } from '@shared/ui/Badge';
import { Avatar } from '@shared/ui/Avatar';
import { Tabs } from '@shared/ui/Tabs';
import { Select } from '@shared/ui/Select';
import type { SelectOption } from '@shared/ui/Select';
import { formatDateTime } from '@shared/lib/formatDate';
import { parseApiError } from '@shared/api/parseApiError';
import type { ApiException } from '@shared/api/type';
import { notify } from '@shared/lib/toast';
import { usePageTitle } from '@shared/lib/pageTitle';
import { ArrowLeftIcon } from '@shared/ui/icons/ArrowLeftIcon';
import { EditIcon } from '@shared/ui/icons/EditIcon';
import { DeleteIcon } from '@shared/ui/icons/DeleteIcon';
import { ShieldIcon } from '@shared/ui/icons/ShieldIcon';
import { UserIcon } from '@shared/ui/icons/UserIcon';

type TabKey = 'overview' | 'permissions';

export function UserDetailsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);

  const { data, isLoading } = useGetUserQuery(userId);
  const user = data?.data;
  usePageTitle(user ? `${user.firstName} ${user.lastName}` : t('user.title'));

  const { data: rolesData } = useGetRolesQuery({ page: 0, size: 100 });
  const roles = useMemo(() => rolesData?.data.data ?? [], [rolesData]);
  const roleOptions = useMemo<SelectOption[]>(
    () => roles.map((role) => ({ label: role.name, value: role.id })),
    [roles],
  );

  const [tab, setTab] = useState<TabKey>('overview');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [updateUser, { isLoading: isSavingUser }] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [assignRoles, { isLoading: isSavingRoles }] = useAssignRolesMutation();

  const [draftRoleIds, setDraftRoleIds] = useState<number[]>([]);
  // Reset the draft only when navigating to a different user — adjusted
  // during render instead of an effect, per
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [loadedUserId, setLoadedUserId] = useState<number | null>(null);
  if (user && user.id !== loadedUserId) {
    setLoadedUserId(user.id);
    setDraftRoleIds(user.roleIds);
  }

  const isRolesDirty = useMemo(() => {
    if (!user) return false;
    if (user.roleIds.length !== draftRoleIds.length) return true;
    return user.roleIds.some((roleId) => !draftRoleIds.includes(roleId));
  }, [user, draftRoleIds]);

  const effectivePermissions = useMemo(() => {
    const keys = new Set<string>();
    const sources: Record<string, string[]> = {};
    for (const roleId of user?.roleIds ?? []) {
      const role = roles.find((candidate) => candidate.id === roleId);
      if (!role) continue;
      for (const key of role.permissionKeys) {
        keys.add(key);
        (sources[key] ??= []).push(role.name);
      }
    }
    return { keys, sources };
  }, [user, roles]);

  const handleSaveRoles = async () => {
    try {
      await assignRoles({ id: userId, roleIds: draftRoleIds }).unwrap();
      notify.success(t('message.saved'));
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  const handleEditSubmit = async (values: UserFormValues) => {
    try {
      await updateUser({ id: userId, data: values }).unwrap();
      notify.success(t('message.saved'));
      setIsEditOpen(false);
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  const handleDelete = async () => {
    if (!user) return;
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

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-6">
      <Link
        to="/access/users"
        className="text-fg-muted hover:text-fg flex w-fit items-center gap-1.5 text-sm"
      >
        <ArrowLeftIcon size={14} />
        {t('user.backToList')}
      </Link>

      <Card>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar name={user.firstName} size="lg" />
            <div>
              <h1 className="text-fg text-lg font-semibold">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-fg-muted text-sm">
                {user.username} · {user.email}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Badge
                  variant={user.status === 'ACTIVE' ? 'success' : 'neutral'}
                  dot
                >
                  {user.status === 'ACTIVE'
                    ? t('user.active')
                    : t('user.inactive')}
                </Badge>
                <span className="text-fg-muted text-xs">
                  {t('user.createdAt', {
                    date: formatDateTime(user.createdAt),
                  })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<EditIcon size={14} />}
              onClick={() => setIsEditOpen(true)}
            >
              {t('common.edit')}
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={<DeleteIcon size={14} />}
              onClick={handleDelete}
            >
              {t('common.delete')}
            </Button>
          </div>
        </div>
      </Card>

      <Tabs
        items={[
          {
            key: 'overview',
            label: t('user.tabOverview'),
            icon: <UserIcon size={14} />,
          },
          {
            key: 'permissions',
            label: t('user.tabPermissions'),
            icon: <ShieldIcon size={14} />,
          },
        ]}
        value={tab}
        onChange={(key) => setTab(key as TabKey)}
      />

      {tab === 'overview' ? (
        <Card className="flex flex-col gap-3">
          <CardHeader
            title={t('user.rolesTitle')}
            subtitle={t('user.rolesSubtitle')}
            icon={<ShieldIcon size={16} />}
            action={
              isRolesDirty && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDraftRoleIds(user.roleIds)}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    size="sm"
                    isLoading={isSavingRoles}
                    onClick={handleSaveRoles}
                  >
                    {t('common.save')}
                  </Button>
                </div>
              )
            }
          />
          <Select
            isMulti
            options={roleOptions}
            value={roleOptions.filter((option) =>
              draftRoleIds.includes(Number(option.value)),
            )}
            onChange={(selected) =>
              setDraftRoleIds(
                (selected as SelectOption[]).map((option) =>
                  Number(option.value),
                ),
              )
            }
          />
        </Card>
      ) : (
        <Card className="flex min-h-0 flex-1 flex-col">
          <CardHeader
            title={t('user.permissionsTitle')}
            subtitle={t('user.permissionsSubtitle')}
            icon={<ShieldIcon size={16} />}
          />
          <div className="min-h-0 flex-1 overflow-y-auto">
            <PermissionPicker
              catalog={PERMISSION_CATALOG}
              selectedKeys={effectivePermissions.keys}
              readOnly
              sourceLabels={effectivePermissions.sources}
            />
          </div>
        </Card>
      )}

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
