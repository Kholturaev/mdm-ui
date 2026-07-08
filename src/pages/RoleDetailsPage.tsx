import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { RoleFormValues } from '@entities/role/model/types';
import {
  useDeleteRoleMutation,
  useGetRoleQuery,
  useSetRolePermissionsMutation,
  useUpdateRoleMutation,
} from '@entities/role/api/roleApi';
import { PERMISSION_CATALOG } from '@entities/permission/model/catalog';
import { PermissionPicker } from '@widgets/permission-picker/ui/PermissionPicker';
import { RoleForm } from '@features/role-create-edit/ui/RoleForm';
import { Card, CardHeader } from '@shared/ui/Card';
import { Modal } from '@shared/ui/Modal';
import { Button } from '@shared/ui/Button';
import { Badge } from '@shared/ui/Badge';
import { parseApiError } from '@shared/api/parseApiError';
import type { ApiException } from '@shared/api/type';
import { notify } from '@shared/lib/toast';
import { usePageTitle } from '@shared/lib/pageTitle';
import { ArrowLeftIcon } from '@shared/ui/icons/ArrowLeftIcon';
import { EditIcon } from '@shared/ui/icons/EditIcon';
import { DeleteIcon } from '@shared/ui/icons/DeleteIcon';
import { ShieldIcon } from '@shared/ui/icons/ShieldIcon';

export function RoleDetailsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const roleId = Number(id);

  const { data, isLoading } = useGetRoleQuery(roleId);
  const role = data?.data;
  usePageTitle(role?.name ?? t('role.title'));

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [updateRole, { isLoading: isSavingRole }] = useUpdateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();
  const [setPermissions, { isLoading: isSavingPermissions }] =
    useSetRolePermissionsMutation();

  const [draftKeys, setDraftKeys] = useState<Set<string>>(new Set());
  // Reset the draft only when navigating to a different role — adjusted
  // during render instead of an effect, per
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [loadedRoleId, setLoadedRoleId] = useState<number | null>(null);
  if (role && role.id !== loadedRoleId) {
    setLoadedRoleId(role.id);
    setDraftKeys(new Set(role.permissionKeys));
  }

  const isDirty = useMemo(() => {
    if (!role) return false;
    const original = role.permissionKeys;
    if (original.length !== draftKeys.size) return true;
    return original.some((key) => !draftKeys.has(key));
  }, [role, draftKeys]);

  const handleSavePermissions = async () => {
    try {
      await setPermissions({
        id: roleId,
        permissionKeys: Array.from(draftKeys),
      }).unwrap();
      notify.success(t('message.saved'));
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  const handleEditSubmit = async (values: RoleFormValues) => {
    try {
      await updateRole({ id: roleId, data: values }).unwrap();
      notify.success(t('message.saved'));
      setIsEditOpen(false);
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  const handleDelete = async () => {
    if (!role) return;
    try {
      await deleteRole(role.id).unwrap();
      notify.success(t('message.deleted'));
      navigate('/access/roles');
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  if (isLoading || !role) {
    return (
      <div className="text-fg-muted flex h-full items-center justify-center text-sm">
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-6">
      <Link
        to="/access/roles"
        className="text-fg-muted hover:text-fg flex w-fit items-center gap-1.5 text-sm"
      >
        <ArrowLeftIcon size={14} />
        {t('role.backToList')}
      </Link>

      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-fg text-lg font-semibold">{role.name}</h1>
            {role.description && (
              <p className="text-fg-muted mt-1 text-sm">{role.description}</p>
            )}
            <div className="mt-3 flex items-center gap-3">
              <Badge
                variant={role.permissionKeys.length > 0 ? 'success' : 'neutral'}
              >
                {t('role.permissionCount', {
                  count: role.permissionKeys.length,
                  total: PERMISSION_CATALOG.length,
                })}
              </Badge>
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

      <Card className="flex min-h-0 flex-1 flex-col">
        <CardHeader
          title={t('role.permissionsTitle')}
          subtitle={t('role.permissionsSubtitle')}
          icon={<ShieldIcon size={16} />}
          action={
            isDirty && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDraftKeys(new Set(role.permissionKeys))}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  size="sm"
                  isLoading={isSavingPermissions}
                  onClick={handleSavePermissions}
                >
                  {t('common.save')}
                </Button>
              </div>
            )
          }
        />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <PermissionPicker
            catalog={PERMISSION_CATALOG}
            selectedKeys={draftKeys}
            onChange={setDraftKeys}
          />
        </div>
      </Card>

      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={t('role.editTitle')}
      >
        <RoleForm
          role={role}
          isSubmitting={isSavingRole}
          onSubmit={handleEditSubmit}
          onCancel={() => setIsEditOpen(false)}
        />
      </Modal>
    </div>
  );
}
