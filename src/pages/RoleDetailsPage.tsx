import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import type { RoleFormValues } from '@entities/role/model/types';
import {
  useDeleteRoleMutation,
  useGetOneRoleQuery,
  useUpdateRoleMutation,
} from '@entities/role/api/roleApi';
import { RolePermissionsPanel } from '@entities/role/ui/RolePermissionsPanel';
import { RoleForm } from '@features/role-create-edit/ui/RoleForm';
import { Card } from '@shared/ui/Card';
import { Modal } from '@shared/ui/Modal';
import { Button } from '@shared/ui/Button';
import { parseApiError } from '@shared/api/parseApiError';
import type { ApiException } from '@shared/api/type';
import { notify } from '@shared/lib/toast';
import { useBackLink } from '@shared/lib/backLink';
import { useConfirm } from '@shared/lib/confirm';
import { EditIcon } from '@shared/ui/icons/EditIcon';
import { DeleteIcon } from '@shared/ui/icons/DeleteIcon';

export function RoleDetailsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const roleName = id ?? '';

  const { data, isLoading } = useGetOneRoleQuery(roleName, {
    skip: !roleName,
  });
  const role = data?.data;

  useBackLink({ label: t('role.backToList'), href: '/access/roles' });
  const confirm = useConfirm();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [updateRole, { isLoading: isSavingRole }] = useUpdateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();

  const handleEditSubmit = async (values: RoleFormValues) => {
    try {
      await updateRole({ id: roleName, data: values }).unwrap();
      notify.success(t('message.saved'));
      setIsEditOpen(false);
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  const handleDelete = async () => {
    if (!role) return;
    const confirmed = await confirm({
      title: t('role.deleteTitle'),
      description: t('role.deleteConfirm', { name: role.name }),
    });
    if (!confirmed) return;

    try {
      await deleteRole(roleName).unwrap();
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
    <div className="flex h-full flex-col">
      <Card className="flex items-start justify-between gap-4 rounded-none border-x-0 border-t-0">
        <div>
          <h1 className="text-fg text-base font-semibold">{role.name}</h1>
          {role.description && (
            <p className="text-fg-muted mt-0.5 text-xs">{role.description}</p>
          )}
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

      <div className="min-h-0 flex-1 p-6">
        <Card className="flex h-full min-h-0 flex-col">
          <RolePermissionsPanel roleName={roleName} />
        </Card>
      </div>

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
