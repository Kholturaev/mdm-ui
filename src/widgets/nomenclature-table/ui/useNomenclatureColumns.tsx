import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { IExternalSystem } from '@entities/external-system/model/types';
import type { IProduct } from '@entities/product/model/types';
import { cn } from '@shared/lib/cn';
import { formatDateTime } from '@shared/lib/formatDate';
import type { CsvColumn } from '@shared/lib/exportToCsv';
import { Badge } from '@shared/ui/Badge';
import { RowActions } from '@shared/ui/Menu';
import type { SortDirection, ToggleableColumn } from '@shared/ui/Table';
import { EditIcon } from '@shared/ui/icons/EditIcon';
import { DeleteIcon } from '@shared/ui/icons/DeleteIcon';
import { ClockIcon } from '@shared/ui/icons/ClockIcon';
import { InfoIcon } from '@shared/ui/icons/InfoIcon';
import { SortableHeader } from '@shared/ui/Table';
import { STATUS_VARIANT } from '../lib/constants';
import { systemAbbr } from '@shared/lib/systemAbbr';
import { PersonCell } from './PersonCell';
import { TextCell } from './TextCell';
import { StatusFilterDropdown } from './StatusFilterDropdown';

type UseNomenclatureColumnsParams = {
  sortField: string | null;
  sortDirection: SortDirection;
  onSort: (field: string) => void;
  columnFilters: Record<string, string>;
  onColumnFiltersChange: (filters: Record<string, string>) => void;
  externalSystems: IExternalSystem[];
  systemFilter: number[];
  onSystemFilterChange: (ids: number[]) => void;
};

/** Builds the product table's column definitions, the "show/hide columns" manifest, and the CSV export field list — all derived from the same field set so they stay in sync. */
export function useNomenclatureColumns({
  sortField,
  sortDirection,
  onSort,
  columnFilters,
  onColumnFiltersChange,
  externalSystems,
  systemFilter,
  onSystemFilterChange,
}: UseNomenclatureColumnsParams) {
  const { t } = useTranslation();

  // Every hideable column id, in table order — "actions" is left out since it
  // always stays visible. Not persisted across reloads (in-memory only).
  const toggleableColumns = useMemo<ToggleableColumn[]>(
    () => [
      { id: 'id', label: t('product.id') },
      { id: 'name', label: t('product.name') },
      { id: 'sapCode', label: t('product.sapCode') },
      { id: 'code', label: t('product.code') },
      { id: 'article', label: t('product.article') },
      { id: 'sapText', label: t('product.sapText') },
      { id: 'description', label: t('product.description') },
      { id: 'comment', label: t('product.comment') },
      { id: 'productGroup', label: t('product.productGroup') },
      { id: 'category', label: t('product.category') },
      { id: 'segment', label: t('product.segment') },
      { id: 'typeOfNomenclature', label: t('product.typeOfNomenclature') },
      { id: 'baseUnit', label: t('product.baseUnit') },
      { id: 'accountingProduct', label: t('product.accountingProduct') },
      { id: 'accountingUnit', label: t('product.accountingUnit') },
      { id: 'alternateUnit', label: t('product.alternateUnit') },
      {
        id: 'accountAmountPercent',
        label: t('product.accountAmountPercent'),
      },
      { id: 'gtin', label: t('product.gtin') },
      { id: 'additionalGtins', label: t('product.additionalGtins') },
      { id: 'productStatus', label: t('product.productStatus') },
      { id: 'createdAt', label: t('product.createdAt') },
      { id: 'createdBy', label: t('product.createdBy') },
      { id: 'updatedBy', label: t('product.updatedBy') },
      { id: 'externalSystems', label: t('product.externalSystems') },
    ],
    [t],
  );

  const columns = useMemo<ColumnDef<IProduct>[]>(
    () => [
      {
        accessorKey: 'id',
        id: 'id',
        size: 70,
        meta: { pin: 'left', filter: { type: 'text' } },
        header: t('product.id'),
        cell: ({ row }) => (
          <span className="text-fg-muted font-mono">
            <TextCell
              value={String(row.original.id)}
              query={columnFilters.id}
            />
          </span>
        ),
      },
      {
        accessorKey: 'name',
        id: 'name',
        size: 220,
        meta: { pin: 'left', filter: { type: 'text' } },
        header: () => (
          <SortableHeader
            label={t('product.name')}
            field="name"
            activeField={sortField}
            direction={sortDirection}
            onSort={onSort}
          />
        ),
        cell: ({ row }) => (
          <TextCell value={row.original.name} query={columnFilters.name} />
        ),
      },
      {
        accessorKey: 'sapCode',
        id: 'sapCode',
        size: 130,
        meta: { pin: 'left', filter: { type: 'text' } },
        header: () => (
          <SortableHeader
            label={t('product.sapCode')}
            field="sapCode"
            activeField={sortField}
            direction={sortDirection}
            onSort={onSort}
          />
        ),
        cell: ({ row }) => (
          <TextCell
            value={row.original.sapCode}
            query={columnFilters.sapCode}
          />
        ),
      },
      {
        id: 'code',
        size: 120,
        header: t('product.code'),
        cell: ({ row }) => row.original.code ?? '—',
      },
      {
        id: 'article',
        size: 150,
        header: t('product.article'),
        cell: ({ row }) => row.original.article ?? '—',
      },
      {
        id: 'sapText',
        size: 240,
        meta: { filter: { type: 'text' } },
        header: t('product.sapText'),
        cell: ({ row }) => (
          <TextCell
            value={row.original.sapText}
            query={columnFilters.sapText}
          />
        ),
      },
      {
        id: 'description',
        size: 240,
        header: t('product.description'),
        cell: ({ row }) => row.original.description ?? '—',
      },
      {
        id: 'comment',
        size: 200,
        header: t('product.comment'),
        cell: ({ row }) => row.original.comment ?? '—',
      },
      {
        id: 'productGroup',
        size: 160,
        meta: { filter: { type: 'text' } },
        header: t('product.productGroup'),
        cell: ({ row }) => (
          <TextCell
            value={row.original.productGroup?.name}
            query={columnFilters.productGroup}
          />
        ),
      },
      {
        id: 'category',
        size: 150,
        meta: { filter: { type: 'text' } },
        header: t('product.category'),
        cell: ({ row }) => (
          <TextCell
            value={row.original.category?.name}
            query={columnFilters.category}
          />
        ),
      },
      {
        id: 'segment',
        size: 150,
        meta: { filter: { type: 'text' } },
        header: t('product.segment'),
        cell: ({ row }) => (
          <TextCell
            value={row.original.segment?.name}
            query={columnFilters.segment}
          />
        ),
      },
      {
        id: 'typeOfNomenclature',
        size: 170,
        meta: { filter: { type: 'text' } },
        header: t('product.typeOfNomenclature'),
        cell: ({ row }) => (
          <TextCell
            value={row.original.typeOfNomenclature?.name}
            query={columnFilters.typeOfNomenclature}
          />
        ),
      },
      {
        id: 'baseUnit',
        size: 130,
        meta: { filter: { type: 'text' } },
        header: t('product.baseUnit'),
        cell: ({ row }) => (
          <TextCell
            value={row.original.baseUnit?.name}
            query={columnFilters.baseUnit}
          />
        ),
      },
      {
        id: 'accountingProduct',
        size: 170,
        header: t('product.accountingProduct'),
        cell: ({ row }) => row.original.accountingProduct?.name ?? '—',
      },
      {
        id: 'accountingUnit',
        size: 150,
        header: t('product.accountingUnit'),
        cell: ({ row }) => row.original.accountingUnit?.name ?? '—',
      },
      {
        id: 'alternateUnit',
        size: 150,
        header: t('product.alternateUnit'),
        cell: ({ row }) => row.original.alternateUnit?.name ?? '—',
      },
      {
        id: 'accountAmountPercent',
        size: 130,
        header: t('product.accountAmountPercent'),
        cell: ({ row }) => row.original.accountAmountPercent ?? '—',
      },
      {
        id: 'gtin',
        size: 140,
        meta: { filter: { type: 'text' } },
        header: t('product.gtin'),
        cell: ({ row }) => (
          <TextCell value={row.original.gtin} query={columnFilters.gtin} />
        ),
      },
      {
        id: 'additionalGtins',
        size: 150,
        header: t('product.additionalGtins'),
        cell: ({ row }) => row.original.additionalGtins ?? '—',
      },
      {
        id: 'productStatus',
        size: 160,
        meta: {
          filter: {
            type: 'custom',
            render: () => (
              <StatusFilterDropdown
                value={columnFilters.productStatus ?? ''}
                onChange={(next) =>
                  onColumnFiltersChange({
                    ...columnFilters,
                    productStatus: next,
                  })
                }
              />
            ),
          },
        },
        header: t('product.productStatus'),
        cell: ({ row }) => {
          const status = row.original.productStatus;
          if (!status) return '—';
          return (
            <Badge variant={STATUS_VARIANT[status]} dot>
              {t(`product.status.${status}`)}
            </Badge>
          );
        },
      },
      {
        id: 'createdAt',
        size: 150,
        meta: { filter: { type: 'date' } },
        header: t('product.createdAt'),
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
      {
        id: 'createdBy',
        size: 150,
        meta: { filter: { type: 'text' } },
        header: t('product.createdBy'),
        cell: ({ row }) => <PersonCell name={row.original.createdBy} />,
      },
      {
        id: 'updatedBy',
        size: 150,
        header: t('product.updatedBy'),
        cell: ({ row }) => <PersonCell name={row.original.updatedBy} />,
      },
      {
        id: 'externalSystems',
        header: t('product.externalSystems'),
        size: Math.max(150, externalSystems.length * 32 + 60),
        enableResizing: false,
        meta: {
          pin: 'right',
          filter: {
            type: 'custom',
            render: () => (
              <div className="flex items-center gap-1">
                {externalSystems.map((system) => {
                  const active = systemFilter.includes(system.id);
                  return (
                    <button
                      key={system.id}
                      type="button"
                      title={system.name}
                      onClick={() =>
                        onSystemFilterChange(
                          active
                            ? systemFilter.filter((id) => id !== system.id)
                            : [...systemFilter, system.id],
                        )
                      }
                      className={cn(
                        'flex h-6 min-w-6 items-center justify-center rounded px-1 text-[10px] font-semibold transition-colors',
                        active
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-primary/10 text-primary hover:bg-primary/20',
                      )}
                    >
                      {systemAbbr(system.name)}
                    </button>
                  );
                })}
              </div>
            ),
          },
        },
        cell: ({ row }) => {
          const ids = row.original.externalSystemIds ?? [];
          return (
            <div className="flex items-center gap-1">
              {externalSystems.map((system) => {
                const present = ids.includes(system.id);
                return (
                  <span
                    key={system.id}
                    title={system.name}
                    className={cn(
                      'flex h-5 min-w-5 items-center justify-center rounded px-1 text-[10px] font-semibold',
                      present
                        ? 'bg-success/10 text-success'
                        : 'border-border text-fg-muted/50 border border-dashed',
                    )}
                  >
                    {systemAbbr(system.name)}
                  </span>
                );
              })}
              <span className="text-fg-muted ml-1 text-[11px] font-medium whitespace-nowrap">
                {ids.length}/{externalSystems.length}
              </span>
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        size: 112,
        enableResizing: false,
        meta: { pin: 'right' },
        cell: () => (
          <RowActions
            items={[
              {
                label: t('common.edit'),
                icon: <EditIcon size={14} />,
                onClick: () => {},
              },
              {
                label: t('common.delete'),
                icon: <DeleteIcon size={14} />,
                onClick: () => {},
                danger: true,
              },
              {
                label: t('common.history'),
                icon: <ClockIcon size={14} />,
                onClick: () => {},
              },
              {
                label: t('common.properties'),
                icon: <InfoIcon size={14} />,
                onClick: () => {},
              },
            ]}
          />
        ),
      },
    ],
    [
      t,
      sortField,
      sortDirection,
      onSort,
      columnFilters,
      onColumnFiltersChange,
      externalSystems,
      systemFilter,
      onSystemFilterChange,
    ],
  );

  const exportColumns = useMemo<CsvColumn<IProduct>[]>(
    () => [
      { label: t('product.id'), getValue: (r) => r.id },
      { label: t('product.name'), getValue: (r) => r.name },
      { label: t('product.sapCode'), getValue: (r) => r.sapCode ?? '' },
      { label: t('product.code'), getValue: (r) => r.code ?? '' },
      { label: t('product.article'), getValue: (r) => r.article ?? '' },
      { label: t('product.sapText'), getValue: (r) => r.sapText ?? '' },
      {
        label: t('product.description'),
        getValue: (r) => r.description ?? '',
      },
      { label: t('product.comment'), getValue: (r) => r.comment ?? '' },
      {
        label: t('product.productGroup'),
        getValue: (r) => r.productGroup?.name ?? '',
      },
      {
        label: t('product.category'),
        getValue: (r) => r.category?.name ?? '',
      },
      {
        label: t('product.segment'),
        getValue: (r) => r.segment?.name ?? '',
      },
      {
        label: t('product.typeOfNomenclature'),
        getValue: (r) => r.typeOfNomenclature?.name ?? '',
      },
      {
        label: t('product.baseUnit'),
        getValue: (r) => r.baseUnit?.name ?? '',
      },
      {
        label: t('product.accountingProduct'),
        getValue: (r) => r.accountingProduct?.name ?? '',
      },
      {
        label: t('product.accountingUnit'),
        getValue: (r) => r.accountingUnit?.name ?? '',
      },
      {
        label: t('product.alternateUnit'),
        getValue: (r) => r.alternateUnit?.name ?? '',
      },
      { label: t('product.gtin'), getValue: (r) => r.gtin ?? '' },
      {
        label: t('product.additionalGtins'),
        getValue: (r) => r.additionalGtins ?? '',
      },
      {
        label: t('product.productStatus'),
        getValue: (r) => r.productStatus ?? '',
      },
      {
        label: t('product.createdAt'),
        getValue: (r) => formatDateTime(r.createdAt),
      },
      {
        label: t('product.createdBy'),
        getValue: (r) => r.createdBy ?? '',
      },
      {
        label: t('product.updatedBy'),
        getValue: (r) => r.updatedBy ?? '',
      },
    ],
    [t],
  );

  return { columns, toggleableColumns, exportColumns };
}
