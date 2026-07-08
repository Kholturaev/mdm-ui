import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { IClientType } from '@entities/client-type/model/types';
import { Input } from '@shared/ui/Input';
import { Tabs } from '@shared/ui/Tabs/Tabs';
import type { TabItem } from '@shared/ui/Tabs/Tabs';
import { SearchIcon } from '@shared/ui/icons/SearchIcon';

/** Search-and-filter threshold — below this, a search box is just clutter above a handful of tabs. */
const SEARCH_VISIBLE_FROM = 7;

export function ClientTypeTabs({
  clientTypes,
  selectedId,
  onSelect,
  hasPrice,
}: {
  clientTypes: IClientType[];
  selectedId: number | null;
  onSelect: (clientType: IClientType) => void;
  hasPrice: (clientTypeId: number) => boolean;
}) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term
      ? clientTypes.filter((ct) => ct.name.toLowerCase().includes(term))
      : clientTypes;
  }, [clientTypes, search]);

  const items = useMemo<TabItem[]>(
    () =>
      filtered.map((ct) => ({
        key: String(ct.id),
        label: (
          <span className="flex flex-col items-start leading-tight">
            <span>{ct.name}</span>
            {ct.sapCode && (
              <span className="text-fg-muted text-[10px] font-normal">
                SAP: {ct.sapCode}
              </span>
            )}
          </span>
        ),
        icon: hasPrice(ct.id) ? (
          <span className="bg-success size-1.5 shrink-0 rounded-full" />
        ) : undefined,
      })),
    [filtered, hasPrice],
  );

  return (
    <div className="flex flex-col gap-2">
      {clientTypes.length >= SEARCH_VISIBLE_FROM && (
        <Input
          size="sm"
          leftIcon={<SearchIcon size={13} />}
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          containerClassName="max-w-xs"
        />
      )}

      {items.length === 0 ? (
        <p className="text-fg-muted border-border border-b py-2 text-sm">
          {t('product.price.noSearchResults')}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Tabs
            items={items}
            value={selectedId !== null ? String(selectedId) : ''}
            onChange={(key) => {
              const clientType = clientTypes.find(
                (ct) => String(ct.id) === key,
              );
              if (clientType) onSelect(clientType);
            }}
            className="min-w-max"
          />
        </div>
      )}
    </div>
  );
}
