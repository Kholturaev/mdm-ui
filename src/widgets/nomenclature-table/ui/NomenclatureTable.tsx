import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type { IProduct } from '@entities/product/model/types';
import { ProductStatus } from '@entities/product/model/types';
import { useGetProductsQuery } from '@entities/product/api/productApi';
import {
  DataTable,
  ExportCsvButton,
  Pagination,
  SortableHeader,
  TableToolbar,
} from '@shared/ui/Table';
import type { SortDirection } from '@shared/ui/Table';
import { RowActions } from '@shared/ui/Menu';
import { Badge } from '@shared/ui/Badge';
import type { BadgeVariant } from '@shared/ui/Badge';
import { HighlightMatch } from '@shared/ui';
import { EditIcon } from '@shared/ui/icons/EditIcon';
import { DeleteIcon } from '@shared/ui/icons/DeleteIcon';
import { UserIcon } from '@shared/ui/icons/UserIcon';
import { useDebouncedValue } from '@shared/lib/hooks/useDebouncedValue';
import { formatDateTime } from '@shared/lib/formatDate';

const STATUS_VARIANT: Record<ProductStatus, BadgeVariant> = {
  [ProductStatus.ACTIVE]: 'success',
  [ProductStatus.PASSIVE]: 'neutral',
  [ProductStatus.TEMPORARILY_PASSIVE]: 'warning',
};

// Only columns the backend actually supports filtering on get a search box in the filter row.
const FILTER_KEY_BY_COLUMN: Record<string, string> = {
  id: 'id',
  name: 'name',
  sapCode: 'sapCode',
  sapText: 'sapText',
  productGroup: 'productGroupName',
  category: 'categoryName',
  segment: 'segmentName',
  typeOfNomenclature: 'typeOfNomenclatureName',
  productStatus: 'productStatus',
  baseUnit: 'baseUnitName',
  gtin: 'gtin',
};

function PersonCell({ name }: { name?: string }) {
  if (!name) return '—';
  return (
    <span className="text-fg-muted flex items-center gap-1.5">
      <UserIcon size={13} />
      <span className="text-fg truncate">{name}</span>
    </span>
  );
}

function TextCell({ value, query }: { value?: string | null; query?: string }) {
  if (!value) return '—';
  return <HighlightMatch text={value} query={query} />;
}

export function NomenclatureTable() {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
    {},
  );
  const debouncedColumnFilters = useDebouncedValue(columnFilters);

  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = useCallback(
    (field: string) => {
      if (sortField !== field) {
        setSortField(field);
        setSortDirection('asc');
        return;
      }
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    },
    [sortField, sortDirection],
  );

  const handleColumnFiltersChange = useCallback(
    (next: Record<string, string>) => {
      setColumnFilters(next);
      setPage(0);
    },
    [],
  );

  const filters = useMemo(() => {
    const entries = Object.entries(debouncedColumnFilters)
      .filter(([, value]) => value.trim())
      .map(([columnId, value]) => [FILTER_KEY_BY_COLUMN[columnId], value]);
    return entries.length ? Object.fromEntries(entries) : undefined;
  }, [debouncedColumnFilters]);

  const { data, isFetching, refetch } = useGetProductsQuery({
    page,
    size: pageSize,
    sortField: sortField ?? undefined,
    sortDirection: sortDirection ?? undefined,
    filters,
  });
  const meta = data?.data;
  const rows = meta?.data ?? [];

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
            <HighlightMatch
              text={String(row.original.id)}
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
            onSort={handleSort}
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
            onSort={handleSort}
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
        size: 150,
        meta: {
          filter: {
            type: 'select',
            options: Object.values(ProductStatus).map((status) => ({
              value: status,
              label: t(`product.status.${status}`),
            })),
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
        header: t('product.createdAt'),
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
      {
        id: 'createdBy',
        size: 150,
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
        id: 'actions',
        header: '',
        size: 90,
        enableResizing: false,
        meta: { pin: 'right' },
        cell: () => (
          <RowActions
            items={[
              {
                label: t('common.edit'),
                icon: <EditIcon size={15} />,
                onClick: () => {},
              },
              {
                label: t('common.delete'),
                icon: <DeleteIcon size={15} />,
                onClick: () => {},
                danger: true,
              },
            ]}
          />
        ),
      },
    ],
    [t, sortField, sortDirection, handleSort, columnFilters],
  );

  return (
    <div className="flex h-full flex-col">
      <TableToolbar>
        <ExportCsvButton
          filename="nomenclature"
          rows={rows}
          columns={[
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
            // {
            //   label: t('product.accountAmountPercent'),
            //   getValue: (r) => r.accountAmountPercent ?? '',
            // },
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
          ]}
        />
      </TableToolbar>

      <div className="min-h-0 flex-1">
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isFetching}
          emptyMessage={t('common.noData')}
          sortedColumnId={sortField ?? undefined}
          enableColumnResizing
          columnFilters={columnFilters}
          onColumnFiltersChange={handleColumnFiltersChange}
        />
      </div>

      <Pagination
        page={page}
        totalPages={meta?.totalPages ?? 0}
        totalItems={meta?.totalElements ?? 0}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(0);
        }}
        onReload={refetch}
      />
    </div>
  );
}
