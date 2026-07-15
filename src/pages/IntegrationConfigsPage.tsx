import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { IIntegrationConfig } from '@entities/external-system/model/types';
import {
  useDeleteIntegrationConfigMutation,
  useUpdateIntegrationConfigMutation,
} from '@entities/external-system/api/externalSystemApi';
import { IntegrationConfigForm } from '@features/integration-config-edit/ui/IntegrationConfigForm';
import { IntegrationConfigTable } from '@widgets/integration-config-table/ui/IntegrationConfigTable';
import { Modal } from '@shared/ui/Modal';
import { parseApiError } from '@shared/api/parseApiError';
import type { ApiException } from '@shared/api/type';
import { notify } from '@shared/lib/toast';
import { useConfirm } from '@shared/lib/confirm';

export function IntegrationConfigsPage() {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [editingConfig, setEditingConfig] = useState<IIntegrationConfig | null>(
    null,
  );

  const [updateConfig, { isLoading: isUpdating }] =
    useUpdateIntegrationConfigMutation();
  const [deleteConfig] = useDeleteIntegrationConfigMutation();

  const closeModal = () => setEditingConfig(null);

  const handleSubmit = async (values: {
    name: string;
    code: string;
    externalSystemId: number;
  }) => {
    if (!editingConfig) return;
    try {
      await updateConfig({
        id: editingConfig.id,
        data: {
          format: editingConfig.format,
          rootName: editingConfig.rootName,
          isDefault: editingConfig.isDefault,
          isActive: editingConfig.isActive,
          sections: editingConfig.sections,
          ...values,
        },
      }).unwrap();
      notify.success(t('message.saved'));
      closeModal();
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  const handleDelete = async (config: IIntegrationConfig) => {
    const confirmed = await confirm({
      title: t('integrationConfig.deleteTitle'),
      description: t('integrationConfig.deleteConfirm', { name: config.name }),
    });
    if (!confirmed) return;

    try {
      await deleteConfig(config.id).unwrap();
      notify.success(t('message.deleted'));
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  return (
    <div className="h-full">
      <IntegrationConfigTable
        onEdit={setEditingConfig}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={editingConfig !== null}
        onClose={closeModal}
        title={t('integrationConfig.editTitle')}
      >
        {editingConfig && (
          <IntegrationConfigForm
            entity={editingConfig}
            isSubmitting={isUpdating}
            onSubmit={handleSubmit}
            onCancel={closeModal}
          />
        )}
      </Modal>
    </div>
  );
}
