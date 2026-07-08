import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ICharacteristic } from '@entities/characteristic/model/types';
import { Badge } from '@shared/ui/Badge';
import { Button } from '@shared/ui/Button';
import { CheckCircleIcon } from '@shared/ui/icons/CheckCircleIcon';
import { CharacteristicValueEditor } from './CharacteristicValueEditor';
import { areSameStringArrays } from '../lib/utils';

const TYPE_LABEL_KEY: Record<ICharacteristic['type'], string> = {
  TEXT: 'product.char.type.TEXT',
  SELECT: 'product.char.type.SELECT',
  RADIO: 'product.char.type.RADIO',
  CHECKBOX: 'product.char.type.CHECKBOX',
};

export function CharacteristicRow({
  characteristic,
  attachedValue,
  onSave,
  isSaving,
}: {
  characteristic: ICharacteristic;
  attachedValue: string[];
  onSave: (
    characteristic: ICharacteristic,
    value: string[],
  ) => Promise<boolean>;
  isSaving: boolean;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<string[] | null>(null);

  const value = draft ?? attachedValue;
  const isDirty = draft !== null && !areSameStringArrays(draft, attachedValue);
  const isAttached = attachedValue.length > 0;

  const handleSave = async () => {
    const success = await onSave(characteristic, value);
    if (success) setDraft(null);
  };

  return (
    <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-start sm:gap-4">
      <div className="min-w-0 shrink-0 sm:w-52">
        <p className="text-fg text-sm font-medium">{characteristic.name}</p>
        <p className="text-fg-muted mt-0.5 text-xs">
          {t(TYPE_LABEL_KEY[characteristic.type])}
        </p>
      </div>

      <div className="min-w-0 flex-1 sm:max-w-sm">
        <CharacteristicValueEditor
          characteristic={characteristic}
          value={value}
          onChange={setDraft}
          disabled={isSaving}
        />
      </div>

      <div className="flex h-9 shrink-0 items-center gap-2">
        {isDirty ? (
          <>
            <Button
              size="sm"
              variant="ghost"
              disabled={isSaving}
              onClick={() => setDraft(null)}
            >
              {t('common.cancel')}
            </Button>
            <Button size="sm" isLoading={isSaving} onClick={handleSave}>
              {t('common.save')}
            </Button>
          </>
        ) : isAttached ? (
          <Badge variant="success">
            <CheckCircleIcon size={12} />
            {t('product.char.filled')}
          </Badge>
        ) : (
          <Badge variant="neutral">{t('product.char.notFilled')}</Badge>
        )}
      </div>
    </div>
  );
}
