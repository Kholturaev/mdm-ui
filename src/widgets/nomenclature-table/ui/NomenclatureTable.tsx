import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  useCreateProductMutation,
  useGetProductsQuery,
} from '@entities/product/api/productApi';
import type {
  IProduct,
  ProductFormValues,
} from '@entities/product/model/types';
import { useGetExternalSystemsQuery } from '@entities/external-system/api/externalSystemApi';
import { RecordHistoryModal } from '@widgets/audit-log/ui/RecordHistoryModal';
import { ProductCreateForm } from '@features/product-create/ui/ProductCreateForm';
import {
  ColumnVisibilityButton,
  DataTable,
  ExportCsvButton,
  Pagination,
  TableToolbar,
} from '@shared/ui/Table';
import type { SortDirection } from '@shared/ui/Table';
import { Modal } from '@shared/ui/Modal';
import { parseApiError } from '@shared/api/parseApiError';
import type { ApiException } from '@shared/api/type';
import { notify } from '@shared/lib/toast';
import { useDebouncedValue } from '@shared/lib/hooks/useDebouncedValue';
import type { SyncStatusFilter } from '@shared/lib/nomenclatureLink';
import { FILTER_KEY_BY_COLUMN } from '../lib/constants';
import { AddProductButton } from './AddProductButton';
import { SyncStatusDropdown } from './SyncStatusDropdown';
import { SystemMultiSelect } from './SystemMultiSelect';
import { useNomenclatureColumns } from './useNomenclatureColumns';

const SYNC_STATUS_VALUES: SyncStatusFilter[] = [
  'all',
  'full',
  'partial',
  'error',
  'none',
];

export function NomenclatureTable() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
    {},
  );
  const debouncedColumnFilters = useDebouncedValue(columnFilters);
  // Seeded once from the URL so links from elsewhere (e.g. the analytics
  // dashboard's attention/coverage cards) land here pre-filtered — deep
  // linking only, not kept in sync as the user changes filters afterwards.
  const [systemFilter, setSystemFilter] = useState<number[]>(() => {
    const systemId = Number(searchParams.get('system'));
    return Number.isInteger(systemId) && systemId > 0 ? [systemId] : [];
  });
  const [syncStatusFilter, setSyncStatusFilter] = useState<SyncStatusFilter>(
    () => {
      const value = searchParams.get('sync') as SyncStatusFilter | null;
      return value && SYNC_STATUS_VALUES.includes(value) ? value : 'all';
    },
  );

  const { data: externalSystemsData } = useGetExternalSystemsQuery({
    page: 0,
    size: 100,
  });
  const externalSystems = useMemo(
    () => externalSystemsData?.data?.data ?? [],
    [externalSystemsData],
  );

  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [historyProduct, setHistoryProduct] = useState<IProduct | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createProduct, { isLoading: isCreatingProduct }] =
    useCreateProductMutation();

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

  const handleSystemFilterChange = useCallback((systemIds: number[]) => {
    setSystemFilter(systemIds);
    setPage(0);
  }, []);

  const handleCreateSubmit = async (values: ProductFormValues) => {
    try {
      const created = await createProduct(values).unwrap();
      notify.success(t('message.saved'));
      setIsCreateOpen(false);
      navigate(`/nomenclature/${created.data.id}`);
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  const filters = useMemo(() => {
    const entries: [string, unknown][] = Object.entries(debouncedColumnFilters)
      .filter(([, value]) => value.trim())
      .map(([columnId, value]) => [FILTER_KEY_BY_COLUMN[columnId], value]);
    if (systemFilter.length > 0) {
      entries.push(['externalSystemIds', systemFilter]);
    }
    return entries.length ? Object.fromEntries(entries) : undefined;
  }, [debouncedColumnFilters, systemFilter]);

  const { data, isFetching, refetch } = useGetProductsQuery({
    page,
    size: pageSize,
    sortField: sortField ?? undefined,
    sortDirection: sortDirection ?? undefined,
    filters,
  });
  const meta = data?.data;
  const rows = useMemo(() => meta?.data ?? [], [meta]);

  // No backend concept of sync status yet — this only buckets by how many of
  // the *currently loaded* page's rows have `externalSystemIds` filled in, so
  // it's a same-page quick filter rather than a real paginated search. "error"
  // has no backing data at all yet, so it always yields zero rows.
  const visibleRows = useMemo(() => {
    if (syncStatusFilter === 'all' || externalSystems.length === 0) return rows;
    if (syncStatusFilter === 'error') return [];
    return rows.filter((row) => {
      const count = row.externalSystemIds?.length ?? 0;
      if (syncStatusFilter === 'full') return count === externalSystems.length;
      if (syncStatusFilter === 'partial')
        return count > 0 && count < externalSystems.length;
      return count === 0;
    });
  }, [rows, syncStatusFilter, externalSystems.length]);

  // Approximate — the backend doesn't expose these aggregates yet, so these
  // are derived from whatever page is currently loaded, not the full dataset.
  const syncStatusCounts = useMemo<Record<SyncStatusFilter, number>>(() => {
    const counts: Record<SyncStatusFilter, number> = {
      all: meta?.totalElements ?? rows.length,
      full: 0,
      partial: 0,
      error: 0,
      none: 0,
    };
    if (externalSystems.length === 0) return counts;
    for (const row of rows) {
      const count = row.externalSystemIds?.length ?? 0;
      if (count === 0) counts.none += 1;
      else if (count === externalSystems.length) counts.full += 1;
      else counts.partial += 1;
    }
    return counts;
  }, [rows, externalSystems.length, meta?.totalElements]);

  const systemCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const system of externalSystems) {
      counts[system.id] = rows.filter((row) =>
        row.externalSystemIds?.includes(system.id),
      ).length;
    }
    return counts;
  }, [rows, externalSystems]);

  const { columns, toggleableColumns, exportColumns } = useNomenclatureColumns({
    sortField,
    sortDirection,
    onSort: handleSort,
    columnFilters,
    onColumnFiltersChange: handleColumnFiltersChange,
    externalSystems,
    systemFilter,
    onSystemFilterChange: handleSystemFilterChange,
    onShowHistory: setHistoryProduct,
    onEdit: (product) => navigate(`/nomenclature/${product.id}`),
  });

  const [visibleColumnKeys, setVisibleColumnKeys] = useState<string[]>(() =>
    toggleableColumns.map((column) => column.id),
  );

  const visibleColumns = useMemo(
    () =>
      columns.filter(
        (column) =>
          column.id === 'actions' ||
          (column.id ? visibleColumnKeys.includes(column.id) : true),
      ),
    [columns, visibleColumnKeys],
  );

  return (
    <div className="flex h-full flex-col">
      <TableToolbar
        title={t('product.title')}
        leftContent={
          <span className="text-fg-muted text-xs font-medium whitespace-nowrap">
            {t('product.totalCount', { count: meta?.totalElements ?? 0 })}
          </span>
        }
      >
        <SyncStatusDropdown
          value={syncStatusFilter}
          onChange={(value) => {
            setSyncStatusFilter(value);
            setPage(0);
          }}
          counts={syncStatusCounts}
        />

        {externalSystems.length > 0 && (
          <SystemMultiSelect
            systems={externalSystems}
            selected={systemFilter}
            onChange={handleSystemFilterChange}
            counts={systemCounts}
          />
        )}

        <ExportCsvButton
          filename="nomenclature"
          rows={visibleRows}
          columns={exportColumns}
        />

        <ColumnVisibilityButton
          columns={toggleableColumns}
          visible={visibleColumnKeys}
          onChange={setVisibleColumnKeys}
        />

        <AddProductButton onCreateOneByOne={() => setIsCreateOpen(true)} />
      </TableToolbar>

      <div className="min-h-0 flex-1">
        <DataTable
          columns={visibleColumns}
          data={visibleRows}
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

      {historyProduct && (
        <RecordHistoryModal
          isOpen
          onClose={() => setHistoryProduct(null)}
          tableName="product"
          recordId={historyProduct.id}
          recordTitle={historyProduct.name}
          recordCode={historyProduct.sapCode}
        />
      )}

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={t('product.createTitle')}
        size="lg"
      >
        <ProductCreateForm
          isSubmitting={isCreatingProduct}
          externalSystems={externalSystems}
          onSubmit={handleCreateSubmit}
          onCancel={() => setIsCreateOpen(false)}
        />
      </Modal>
    </div>
  );
}
