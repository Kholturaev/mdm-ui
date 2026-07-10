import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ICharacteristic } from '@entities/characteristic/model/types';
import {
  useCreateCharacteristicValueMutation,
  useDeleteCharacteristicValueMutation,
} from '@entities/characteristic-value/api/characteristicValueApi';
import { Modal } from '@shared/ui/Modal';
import { Input } from '@shared/ui/Input';
import { Button } from '@shared/ui/Button';
import { PermissionGuard } from '@shared/ui/PermissionGuard';
import { DeleteIcon } from '@shared/ui/icons/DeleteIcon';
import { PlusIcon } from '@shared/ui/icons/PlusIcon';
import { Permissions } from '@shared/constants/permissions';
import { parseApiError } from '@shared/api/parseApiError';
import type { ApiException } from '@shared/api/type';
import { notify } from '@shared/lib/toast';

type CharacteristicValuesModalProps = {
  characteristic: ICharacteristic | null;
  onClose: () => void;
};

export function CharacteristicValuesModal({
  characteristic,
  onClose,
}: CharacteristicValuesModalProps) {
  const { t } = useTranslation();
  const [newValue, setNewValue] = useState('');
  const [createValue, { isLoading: isCreating }] =
    useCreateCharacteristicValueMutation();
  const [deleteValue] = useDeleteCharacteristicValueMutation();

  const handleAdd = async () => {
    const value = newValue.trim();
    if (!value || !characteristic) return;
    try {
      await createValue({
        characteristicId: characteristic.id,
        value,
      }).unwrap();
      setNewValue('');
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  const handleDelete = async (valueId: number) => {
    try {
      await deleteValue(valueId).unwrap();
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  return (
    <Modal
      isOpen={characteristic !== null}
      onClose={onClose}
      title={
        characteristic
          ? t('characteristic.valuesTitle', { name: characteristic.name })
          : ''
      }
    >
      {characteristic && (
        <div className="flex flex-col gap-3">
          <PermissionGuard permission={Permissions.CHARACTERISTICS.UPDATE}>
            <div className="flex gap-2">
              <Input
                size="sm"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAdd();
                  }
                }}
                placeholder={t('characteristic.addValuePlaceholder')}
                containerClassName="flex-1"
              />
              <Button
                size="sm"
                icon={<PlusIcon size={14} />}
                isLoading={isCreating}
                disabled={!newValue.trim()}
                onClick={handleAdd}
              >
                {t('common.add')}
              </Button>
            </div>
          </PermissionGuard>

          {characteristic.values.length === 0 ? (
            <p className="text-fg-muted py-4 text-center text-sm">
              {t('characteristic.noValues')}
            </p>
          ) : (
            <div className="border-border divide-border max-h-72 divide-y overflow-y-auto rounded-md border">
              {characteristic.values.map((value) => (
                <div
                  key={value.id}
                  className="flex items-center justify-between gap-2 px-3 py-2"
                >
                  <span className="text-fg text-sm">{value.value}</span>
                  <PermissionGuard
                    permission={Permissions.CHARACTERISTICS.UPDATE}
                  >
                    <button
                      type="button"
                      onClick={() => handleDelete(value.id)}
                      aria-label={t('common.delete')}
                      className="text-fg-muted hover:bg-danger/10 hover:text-danger inline-flex size-6 shrink-0 items-center justify-center rounded transition-colors"
                    >
                      <DeleteIcon size={13} />
                    </button>
                  </PermissionGuard>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
