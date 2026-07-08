import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ICharacteristicsGroupWithItems } from '@entities/characteristic-group/model/types';
import type { ICharacteristic } from '@entities/characteristic/model/types';
import { Badge } from '@shared/ui/Badge';
import { Card } from '@shared/ui/Card';
import { ChevronDownIcon } from '@shared/ui/icons/ChevronDownIcon';
import { cn } from '@shared/lib/cn';
import { CharacteristicRow } from './CharacteristicRow';
import { DynamicTableRow } from './DynamicTableRow';

export function CharacteristicGroupSection({
  group,
  productId,
  getAttachedValue,
  onSaveCharacteristic,
  savingCharIds,
}: {
  group: ICharacteristicsGroupWithItems;
  productId: number;
  getAttachedValue: (characteristic: ICharacteristic) => string[];
  onSaveCharacteristic: (
    characteristic: ICharacteristic,
    value: string[],
  ) => Promise<boolean>;
  savingCharIds: Set<number>;
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);

  const characteristics = group.characteristics ?? [];
  const dynamicTables = group.dynamicTables ?? [];
  const itemCount = characteristics.length + dynamicTables.length;

  return (
    <Card className="flex flex-col gap-0 overflow-hidden p-0">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="hover:bg-surface-hover flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors"
      >
        <div className="flex min-w-0 items-center gap-2">
          <ChevronDownIcon
            size={14}
            className={cn(
              'text-fg-muted shrink-0 transition-transform',
              !isOpen && '-rotate-90',
            )}
          />
          <div className="min-w-0">
            <p className="text-fg truncate text-sm font-semibold">
              {group.name}
            </p>
            {group.description && (
              <p className="text-fg-muted truncate text-xs">
                {group.description}
              </p>
            )}
          </div>
        </div>
        <Badge variant="neutral">
          {t('product.char.groupCount', { count: itemCount })}
        </Badge>
      </button>

      {isOpen &&
        (itemCount === 0 ? (
          <p className="text-fg-muted border-border border-t px-4 py-4 text-sm">
            {t('product.char.groupEmpty')}
          </p>
        ) : (
          <div className="divide-border border-border divide-y border-t">
            {characteristics.map((characteristic) => (
              <CharacteristicRow
                key={characteristic.id}
                characteristic={characteristic}
                attachedValue={getAttachedValue(characteristic)}
                onSave={onSaveCharacteristic}
                isSaving={savingCharIds.has(characteristic.id)}
              />
            ))}
            {dynamicTables.map((table) => (
              <DynamicTableRow
                key={table.tableId}
                table={table}
                productId={productId}
              />
            ))}
          </div>
        ))}
    </Card>
  );
}
