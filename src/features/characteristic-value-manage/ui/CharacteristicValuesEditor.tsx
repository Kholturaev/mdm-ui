import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ICharacteristic } from '@entities/characteristic/model/types';
import { canHaveValues } from '@entities/characteristic/lib/canHaveValues';
import {
  useCreateCharacteristicValueMutation,
  useDeleteCharacteristicValueMutation,
} from '@entities/characteristic-value/api/characteristicValueApi';
import { Input } from '@shared/ui/Input';
import { Button } from '@shared/ui/Button';
import { PermissionGuard } from '@shared/ui/PermissionGuard';
import { DeleteIcon } from '@shared/ui/icons/DeleteIcon';
import { Permissions } from '@shared/constants/permissions';
import { useConfirm } from '@shared/lib/confirm';
import { parseApiError } from '@shared/api/parseApiError';
import type { ApiException } from '@shared/api/type';
import { notify } from '@shared/lib/toast';

type CharacteristicValuesEditorProps = {
  characteristic: ICharacteristic;
};

/** Inline values editor rendered inside a characteristic's expanded table row — no modal, matches the row it belongs to. */
export function CharacteristicValuesEditor({
  characteristic,
}: CharacteristicValuesEditorProps) {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [newValue, setNewValue] = useState('');
  const [createValue, { isLoading: isCreating }] =
    useCreateCharacteristicValueMutation();
  const [deleteValue] = useDeleteCharacteristicValueMutation();

  if (!canHaveValues(characteristic.type)) {
    return (
      <p className="text-fg-muted text-xs">
        {t('characteristic.type')}:{' '}
        {t(`product.char.type.${characteristic.type}`)}
      </p>
    );
  }

  const handleAdd = async () => {
    const value = newValue.trim();
    if (!value) return;
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

  const handleDelete = async (value: { id: number; value: string }) => {
    const confirmed = await confirm({
      title: t('characteristic.deleteValueTitle'),
      description: t('characteristic.deleteValueConfirm', {
        value: value.value,
      }),
    });
    if (!confirmed) return;

    try {
      await deleteValue(value.id).unwrap();
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <PermissionGuard permission={Permissions.CHARACTERISTICS.UPDATE}>
        <div className="flex max-w-md items-center gap-2">
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
            isLoading={isCreating}
            disabled={!newValue.trim()}
            onClick={handleAdd}
          >
            {t('common.save')}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!newValue}
            onClick={() => setNewValue('')}
          >
            {t('common.cancel')}
          </Button>
        </div>
      </PermissionGuard>

      {characteristic.values.length === 0 ? (
        <p className="text-fg-muted text-xs">{t('characteristic.noValues')}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {characteristic.values.map((value, index) => (
            <div
              key={value.id}
              className="border-border bg-surface flex items-center justify-between gap-3 rounded-md border px-3 py-2"
            >
              <span className="text-fg flex items-center gap-2 text-xs">
                <span className="text-fg-muted">{index + 1}.</span>
                {value.value}
              </span>
              <PermissionGuard permission={Permissions.CHARACTERISTICS.UPDATE}>
                <button
                  type="button"
                  onClick={() => handleDelete(value)}
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
  );
}
