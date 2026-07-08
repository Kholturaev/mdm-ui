import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColumnDef } from '@tanstack/react-table';
import type {
  IProductAttribute,
  IProductAttributeExternalSystem,
  ProductAttributeFormValues,
} from '@entities/product-attribute/model/types';
import {
  useCreateProductAttributeMutation,
  useDeleteProductAttributeMutation,
  useGetProductAttributesQuery,
  useUpdateProductAttributeMutation,
} from '@entities/product-attribute/api/productAttributeApi';
import { getSystemColor } from '@entities/external-system/lib/systemColor';
import { ProductAttributeForm } from '@features/product-attribute-create-edit/ui/ProductAttributeForm';
import { Badge } from '@shared/ui/Badge';
import { Button } from '@shared/ui/Button';
import { Card, CardHeader } from '@shared/ui/Card';
import { Input } from '@shared/ui/Input';
import { Modal } from '@shared/ui/Modal';
import { DataTable } from '@shared/ui/Table';
import { RowActions } from '@shared/ui/Menu';
import { PlusIcon } from '@shared/ui/icons/PlusIcon';
import { EditIcon } from '@shared/ui/icons/EditIcon';
import { DeleteIcon } from '@shared/ui/icons/DeleteIcon';
import { ChecklistIcon } from '@shared/ui/icons/ChecklistIcon';
import { ChevronDownIcon } from '@shared/ui/icons/ChevronDownIcon';
import { LayersIcon } from '@shared/ui/icons/LayersIcon';
import { LinkIcon } from '@shared/ui/icons/LinkIcon';
import { RefreshIcon } from '@shared/ui/icons/RefreshIcon';
import { SearchIcon } from '@shared/ui/icons/SearchIcon';
import { TableIcon } from '@shared/ui/icons/TableIcon';
import { cn } from '@shared/lib/cn';
import { parseApiError } from '@shared/api/parseApiError';
import type { ApiException } from '@shared/api/type';
import { notify } from '@shared/lib/toast';

type ModalState =
  { mode: 'create' } | { mode: 'edit'; attribute: IProductAttribute } | null;

type ViewMode = 'grouped' | 'table';

function matchesSearch(attribute: IProductAttribute, term: string): boolean {
  if (!term) return true;
  const haystack =
    `${attribute.name} ${attribute.key} ${attribute.value}`.toLowerCase();
  return haystack.includes(term);
}

function useAttributeColumns({
  onEdit,
  onDelete,
  showSystems,
}: {
  onEdit: (attribute: IProductAttribute) => void;
  onDelete: (attribute: IProductAttribute) => void;
  showSystems: boolean;
}) {
  const { t } = useTranslation();

  return useMemo<ColumnDef<IProductAttribute>[]>(() => {
    const columns: ColumnDef<IProductAttribute>[] = [
      { accessorKey: 'name', id: 'name', header: t('product.attr.name') },
      { accessorKey: 'key', id: 'key', header: t('product.attr.key') },
      { accessorKey: 'value', id: 'value', header: t('product.attr.value') },
    ];

    if (showSystems) {
      columns.push({
        id: 'externalSystems',
        header: t('product.attr.externalSystem'),
        cell: ({ row }) => {
          const systems = row.original.externalSystems ?? [];
          if (systems.length === 0) {
            return <span className="text-fg-muted">—</span>;
          }
          return (
            <div className="flex flex-wrap gap-1">
              {systems.map((system) => {
                const color = getSystemColor(system.id);
                return (
                  <span
                    key={system.id}
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
                      color.bg,
                      color.text,
                    )}
                  >
                    {system.name}
                  </span>
                );
              })}
            </div>
          );
        },
      });
    }

    columns.push({
      id: 'actions',
      header: '',
      meta: { pin: 'right' },
      cell: ({ row }) => (
        <RowActions
          items={[
            {
              label: t('common.edit'),
              icon: <EditIcon size={14} />,
              onClick: () => onEdit(row.original),
            },
            {
              label: t('common.delete'),
              icon: <DeleteIcon size={14} />,
              onClick: () => onDelete(row.original),
              danger: true,
            },
          ]}
        />
      ),
    });

    return columns;
  }, [t, onEdit, onDelete, showSystems]);
}

function AttributeSystemGroup({
  system,
  attributes,
  columns,
  isFetching,
}: {
  system: IProductAttributeExternalSystem;
  attributes: IProductAttribute[];
  columns: ColumnDef<IProductAttribute>[];
  isFetching: boolean;
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);
  const color = getSystemColor(system.id);

  return (
    <Card className="flex flex-col gap-0 overflow-hidden p-0">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="hover:bg-surface-hover flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <ChevronDownIcon
            size={14}
            className={cn(
              'text-fg-muted shrink-0 transition-transform',
              !isOpen && '-rotate-90',
            )}
          />
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
              color.bg,
              color.text,
            )}
          >
            <LinkIcon size={12} />
            {system.name}
          </span>
          <span className="text-fg-muted shrink-0 text-xs">
            {t('product.attr.itemCount', { count: attributes.length })}
          </span>
        </div>
        <span className="text-success flex shrink-0 items-center gap-1 text-xs font-medium">
          <RefreshIcon size={12} />
          {t('product.attr.synced')}
        </span>
      </button>

      {isOpen && (
        <div className="border-border overflow-hidden border-t">
          <DataTable
            columns={columns}
            data={attributes}
            isLoading={isFetching}
            emptyMessage={t('product.attr.empty')}
          />
        </div>
      )}
    </Card>
  );
}

export function ProductAttributesTab({ productId }: { productId: number }) {
  const { t } = useTranslation();
  const [modalState, setModalState] = useState<ModalState>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grouped');
  const [search, setSearch] = useState('');

  const { data, isFetching } = useGetProductAttributesQuery({
    page: 0,
    size: 200,
    filters: { productId },
  });
  const attributes = useMemo(() => data?.data?.data ?? [], [data]);

  const [createAttribute, { isLoading: isCreating }] =
    useCreateProductAttributeMutation();
  const [updateAttribute, { isLoading: isUpdating }] =
    useUpdateProductAttributeMutation();
  const [deleteAttribute] = useDeleteProductAttributeMutation();

  const closeModal = () => setModalState(null);

  const handleSubmit = async (values: ProductAttributeFormValues) => {
    try {
      if (modalState?.mode === 'edit') {
        await updateAttribute({
          id: modalState.attribute.id,
          data: values,
        }).unwrap();
      } else {
        await createAttribute(values).unwrap();
      }
      notify.success(t('message.saved'));
      closeModal();
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  const handleEdit = useCallback((attribute: IProductAttribute) => {
    setModalState({ mode: 'edit', attribute });
  }, []);

  const handleDelete = useCallback(
    async (attribute: IProductAttribute) => {
      try {
        await deleteAttribute(attribute.id).unwrap();
        notify.success(t('message.deleted'));
      } catch (error) {
        notify.error(parseApiError(error as ApiException));
      }
    },
    [deleteAttribute, t],
  );

  const searchTerm = search.trim().toLowerCase();
  const filteredAttributes = useMemo(
    () =>
      attributes.filter((attribute) => matchesSearch(attribute, searchTerm)),
    [attributes, searchTerm],
  );

  const { systemGroups, ungrouped } = useMemo(() => {
    const map = new Map<
      number,
      {
        system: IProductAttributeExternalSystem;
        attributes: IProductAttribute[];
      }
    >();
    const rest: IProductAttribute[] = [];

    filteredAttributes.forEach((attribute) => {
      const systems = attribute.externalSystems ?? [];
      if (systems.length === 0) {
        rest.push(attribute);
        return;
      }
      systems.forEach((system) => {
        const entry = map.get(system.id) ?? { system, attributes: [] };
        entry.attributes.push(attribute);
        map.set(system.id, entry);
      });
    });

    return {
      systemGroups: Array.from(map.values()).sort((a, b) =>
        a.system.name.localeCompare(b.system.name),
      ),
      ungrouped: rest,
    };
  }, [filteredAttributes]);

  const groupedColumns = useAttributeColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    showSystems: false,
  });
  const flatColumns = useAttributeColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    showSystems: true,
  });

  const hasAnyGroupResults = systemGroups.length > 0 || ungrouped.length > 0;

  return (
    <div className="wide:max-w-4xl wide:mx-auto flex w-full flex-col gap-4">
      <Card className="flex flex-col gap-3">
        <CardHeader
          icon={<ChecklistIcon size={15} />}
          title={
            <span className="flex items-center gap-2">
              {t('product.attr.title')}
              <Badge variant="neutral">{attributes.length}</Badge>
            </span>
          }
          subtitle={t('product.attr.desc')}
        />

        <div className="flex flex-wrap items-center gap-2">
          <Input
            size="sm"
            leftIcon={<SearchIcon size={14} />}
            placeholder={t('product.attr.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            containerClassName="min-w-[220px] flex-1"
          />

          <div className="border-border bg-surface-hover flex shrink-0 items-center gap-0.5 rounded-md border p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('grouped')}
              className={cn(
                'flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium transition-colors',
                viewMode === 'grouped'
                  ? 'bg-surface text-fg shadow-sm'
                  : 'text-fg-muted hover:text-fg',
              )}
            >
              <LayersIcon size={13} />
              {t('product.attr.groupBySystem')}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={cn(
                'flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium transition-colors',
                viewMode === 'table'
                  ? 'bg-surface text-fg shadow-sm'
                  : 'text-fg-muted hover:text-fg',
              )}
            >
              <TableIcon size={13} />
              {t('product.attr.tableView')}
            </button>
          </div>

          <Button
            size="sm"
            icon={<PlusIcon size={15} />}
            onClick={() => setModalState({ mode: 'create' })}
          >
            {t('product.attr.add')}
          </Button>
        </div>
      </Card>

      {viewMode === 'table' ? (
        <Card className="flex flex-col gap-3">
          <div className="border-border overflow-hidden rounded-lg border">
            <DataTable
              columns={flatColumns}
              data={filteredAttributes}
              isLoading={isFetching}
              emptyMessage={
                searchTerm
                  ? t('product.attr.noSearchResults')
                  : t('product.attr.empty')
              }
            />
          </div>
        </Card>
      ) : !hasAnyGroupResults ? (
        <Card className="flex flex-col items-center gap-1 py-10 text-center">
          <p className="text-fg-muted text-sm">
            {searchTerm
              ? t('product.attr.noSearchResults')
              : t('product.attr.empty')}
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {systemGroups.map(({ system, attributes: systemAttributes }) => (
            <AttributeSystemGroup
              key={system.id}
              system={system}
              attributes={systemAttributes}
              columns={groupedColumns}
              isFetching={isFetching}
            />
          ))}

          {ungrouped.length > 0 && (
            <Card className="flex flex-col gap-0 overflow-hidden p-0">
              <div className="flex items-center gap-2.5 px-4 py-3">
                <span className="bg-fg-muted/10 text-fg-muted inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold">
                  {t('product.attr.noSystemGroup')}
                </span>
                <span className="text-fg-muted text-xs">
                  {t('product.attr.itemCount', { count: ungrouped.length })}
                </span>
              </div>
              <div className="border-border overflow-hidden border-t">
                <DataTable
                  columns={groupedColumns}
                  data={ungrouped}
                  isLoading={isFetching}
                  emptyMessage={t('product.attr.empty')}
                />
              </div>
            </Card>
          )}
        </div>
      )}

      <Modal
        isOpen={modalState !== null}
        onClose={closeModal}
        title={
          modalState?.mode === 'edit'
            ? t('product.attr.editTitle')
            : t('product.attr.createTitle')
        }
      >
        <ProductAttributeForm
          productId={productId}
          attribute={
            modalState?.mode === 'edit' ? modalState.attribute : undefined
          }
          isSubmitting={isCreating || isUpdating}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
}
