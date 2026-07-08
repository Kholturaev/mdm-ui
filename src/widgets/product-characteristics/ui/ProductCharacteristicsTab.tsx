import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetCharacteristicGroupsByNomenclatureQuery } from '@entities/characteristic-group/api/characteristicGroupApi';
import type { ICharacteristic } from '@entities/characteristic/model/types';
import {
  useAttachTextProductCharacteristicValueMutation,
  useBulkAttachProductCharacteristicValuesMutation,
  useGetProductCharacteristicValuesByProductQuery,
} from '@entities/product-characteristic-value/api/productCharacteristicValueApi';
import type { IProductCharacteristicValue } from '@entities/product-characteristic-value/model/types';
import type { ApiException } from '@shared/api/type';
import { parseApiError } from '@shared/api/parseApiError';
import { Card, CardHeader } from '@shared/ui/Card';
import { Input } from '@shared/ui/Input';
import { Spinner } from '@shared/ui/Spinner';
import { SearchIcon } from '@shared/ui/icons/SearchIcon';
import { SlidersIcon } from '@shared/ui/icons/SlidersIcon';
import { notify } from '@shared/lib/toast';
import { CharacteristicGroupSection } from './CharacteristicGroupSection';

export function ProductCharacteristicsTab({
  productId,
  typeOfNomenclatureId,
  onGoToGeneral,
}: {
  productId: number;
  typeOfNomenclatureId?: number | null;
  onGoToGeneral?: () => void;
}) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const { data: groupsRes, isFetching: isFetchingGroups } =
    useGetCharacteristicGroupsByNomenclatureQuery(typeOfNomenclatureId ?? 0, {
      skip: !typeOfNomenclatureId,
    });
  const groups = useMemo(() => groupsRes?.data ?? [], [groupsRes]);

  const { data: valuesRes, isFetching: isFetchingValues } =
    useGetProductCharacteristicValuesByProductQuery(productId);

  const attachedByCharId = useMemo(() => {
    const map = new Map<number, IProductCharacteristicValue[]>();
    (valuesRes?.data ?? []).forEach((item) => {
      const list = map.get(item.characteristicId) ?? [];
      list.push(item);
      map.set(item.characteristicId, list);
    });
    return map;
  }, [valuesRes]);

  const getAttachedValue = useCallback(
    (characteristic: ICharacteristic): string[] => {
      const items = attachedByCharId.get(characteristic.id) ?? [];
      if (characteristic.type === 'TEXT') {
        return items[0]?.value ? [items[0].value] : [];
      }
      return items
        .map((item) => item.charValueId?.toString())
        .filter((value): value is string => Boolean(value));
    },
    [attachedByCharId],
  );

  const [savingCharIds, setSavingCharIds] = useState<Set<number>>(new Set());
  const [bulkAttachValues] = useBulkAttachProductCharacteristicValuesMutation();
  const [attachTextValue] = useAttachTextProductCharacteristicValueMutation();

  const handleSaveCharacteristic = useCallback(
    async (characteristic: ICharacteristic, value: string[]) => {
      setSavingCharIds((prev) => new Set(prev).add(characteristic.id));
      try {
        if (characteristic.type === 'TEXT') {
          await attachTextValue({
            productId,
            characteristicId: characteristic.id,
            textValue: value[0] ?? '',
          }).unwrap();
        } else {
          await bulkAttachValues({
            productId,
            characteristicId: characteristic.id,
            valueIds: value.map(Number).filter(Boolean),
          }).unwrap();
        }
        notify.success(t('message.saved'));
        return true;
      } catch (error) {
        notify.error(parseApiError(error as ApiException));
        return false;
      } finally {
        setSavingCharIds((prev) => {
          const next = new Set(prev);
          next.delete(characteristic.id);
          return next;
        });
      }
    },
    [productId, attachTextValue, bulkAttachValues, t],
  );

  const totalItemCount = useMemo(
    () =>
      groups.reduce(
        (sum, group) =>
          sum + group.characteristics.length + group.dynamicTables.length,
        0,
      ),
    [groups],
  );

  const filteredGroups = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return groups;
    return groups
      .map((group) => ({
        ...group,
        characteristics: group.characteristics.filter((characteristic) =>
          characteristic.name.toLowerCase().includes(term),
        ),
        dynamicTables: group.dynamicTables.filter((table) =>
          table.tableName.toLowerCase().includes(term),
        ),
      }))
      .filter(
        (group) =>
          group.characteristics.length > 0 || group.dynamicTables.length > 0,
      );
  }, [groups, search]);

  const isLoading = isFetchingGroups || isFetchingValues;

  return (
    <div className="wide:max-w-4xl wide:mx-auto flex w-full flex-col gap-4">
      <Card className="flex flex-col gap-3">
        <CardHeader
          icon={<SlidersIcon size={15} />}
          title={t('product.char.title')}
          subtitle={t('product.char.desc', { count: totalItemCount })}
        />
        {groups.length > 0 && (
          <Input
            size="sm"
            leftIcon={<SearchIcon size={14} />}
            placeholder={t('product.char.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        )}
      </Card>

      {!typeOfNomenclatureId ? (
        <Card className="flex flex-col items-center gap-2 py-10 text-center">
          <p className="text-fg-muted text-sm">
            {t('product.char.noNomenclatureType')}
          </p>
          {onGoToGeneral && (
            <button
              type="button"
              onClick={onGoToGeneral}
              className="text-primary text-sm font-medium hover:underline"
            >
              {t('product.char.goToGeneral')}
            </button>
          )}
        </Card>
      ) : isLoading && groups.length === 0 ? (
        <Card className="flex items-center justify-center py-10">
          <Spinner className="text-fg-muted size-6" />
        </Card>
      ) : filteredGroups.length === 0 ? (
        <Card className="flex flex-col items-center gap-1 py-10 text-center">
          <p className="text-fg-muted text-sm">
            {search
              ? t('product.char.noSearchResults')
              : t('product.char.noGroups')}
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredGroups.map((group) => (
            <CharacteristicGroupSection
              key={group.id}
              group={group}
              productId={productId}
              getAttachedValue={getAttachedValue}
              onSaveCharacteristic={handleSaveCharacteristic}
              savingCharIds={savingCharIds}
            />
          ))}
        </div>
      )}
    </div>
  );
}
