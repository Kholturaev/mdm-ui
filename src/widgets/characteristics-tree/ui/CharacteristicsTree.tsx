import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ITypeOfNomenclature } from '@entities/type-of-nomenclature/model/types';
import {
  useCreateTypeOfNomenclatureMutation,
  useDeleteTypeOfNomenclatureMutation,
  useGetTypeOfNomenclaturesQuery,
  useUpdateTypeOfNomenclatureMutation,
} from '@entities/type-of-nomenclature/api/typeOfNomenclatureApi';
import type { ICharacteristicsGroup } from '@entities/characteristic-group/model/types';
import {
  useCreateCharacteristicsGroupMutation,
  useDeleteCharacteristicsGroupMutation,
  useGetCharacteristicGroupsByNomenclatureQuery,
  useUpdateCharacteristicsGroupMutation,
} from '@entities/characteristic-group/api/characteristicGroupApi';
import { TypeOfNomenclatureForm } from '@features/type-of-nomenclature-create-edit/ui/TypeOfNomenclatureForm';
import { CharacteristicsGroupForm } from '@features/characteristics-group-create-edit/ui/CharacteristicsGroupForm';
import { Modal } from '@shared/ui/Modal';
import { Input } from '@shared/ui/Input';
import { Button } from '@shared/ui/Button';
import { Spinner } from '@shared/ui/Spinner';
import { Badge } from '@shared/ui/Badge';
import { PermissionGuard } from '@shared/ui/PermissionGuard';
import { InfoTooltip } from '@shared/ui/InfoTooltip';
import { ChevronDownIcon } from '@shared/ui/icons/ChevronDownIcon';
import { PackageIcon } from '@shared/ui/icons/PackageIcon';
import { ChecklistIcon } from '@shared/ui/icons/ChecklistIcon';
import { EditIcon } from '@shared/ui/icons/EditIcon';
import { DeleteIcon } from '@shared/ui/icons/DeleteIcon';
import { PlusIcon } from '@shared/ui/icons/PlusIcon';
import { SearchIcon } from '@shared/ui/icons/SearchIcon';
import { Permissions } from '@shared/constants/permissions';
import { useConfirm } from '@shared/lib/confirm';
import { cn } from '@shared/lib/cn';
import { parseApiError } from '@shared/api/parseApiError';
import type { ApiException } from '@shared/api/type';
import { notify } from '@shared/lib/toast';

type GroupModalState =
  | { mode: 'create'; typeOfNomenclatureId: number }
  | { mode: 'edit'; typeOfNomenclatureId: number; group: ICharacteristicsGroup }
  | null;

type TypeModalState =
  { mode: 'create' } | { mode: 'edit'; type: ITypeOfNomenclature } | null;

type CharacteristicsTreeProps = {
  selectedTypeId: number | null;
  selectedGroupId: number | null;
  onSelect: (typeId: number | null, groupId: number | null) => void;
};

function GroupRow({
  group,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: {
  group: ICharacteristicsGroup & { characteristicsCount: number };
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'group hover:bg-surface-hover flex items-center gap-2 rounded-md px-2.5 py-2 transition-colors',
        isSelected && 'bg-primary/10',
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex flex-1 items-center gap-2 overflow-hidden text-left"
      >
        <span
          className={cn(
            'shrink-0',
            isSelected ? 'text-primary' : 'text-fg-muted',
          )}
        >
          <ChecklistIcon size={14} />
        </span>
        <span
          className={cn(
            'truncate text-sm',
            isSelected ? 'text-primary font-medium' : 'text-fg',
          )}
        >
          {group.name}
        </span>
        <Badge
          variant="neutral"
          className={cn(isSelected && 'bg-primary/15 text-primary')}
        >
          {group.characteristicsCount}
        </Badge>
      </button>

      <InfoTooltip content={group.description} />

      <div className="hidden shrink-0 items-center gap-0.5 group-hover:flex">
        <PermissionGuard permission={Permissions.CHARACTERISTICS_GROUP.UPDATE}>
          <button
            type="button"
            onClick={onEdit}
            aria-label={t('common.edit')}
            className="text-fg-muted hover:bg-surface hover:text-fg inline-flex size-6 items-center justify-center rounded transition-colors"
          >
            <EditIcon size={12} />
          </button>
        </PermissionGuard>
        <PermissionGuard permission={Permissions.CHARACTERISTICS_GROUP.DELETE}>
          <button
            type="button"
            onClick={onDelete}
            aria-label={t('common.delete')}
            className="text-fg-muted hover:bg-danger/10 hover:text-danger inline-flex size-6 items-center justify-center rounded transition-colors"
          >
            <DeleteIcon size={12} />
          </button>
        </PermissionGuard>
      </div>
    </div>
  );
}

function TypeNode({
  type,
  isExpanded,
  selectedGroupId,
  onToggleExpand,
  onSelectGroup,
  onAddGroup,
  onEditGroup,
  onEditType,
  onDeleteType,
}: {
  type: ITypeOfNomenclature;
  isExpanded: boolean;
  selectedGroupId: number | null;
  onToggleExpand: () => void;
  onSelectGroup: (groupId: number | null) => void;
  onAddGroup: () => void;
  onEditGroup: (group: ICharacteristicsGroup) => void;
  onEditType: () => void;
  onDeleteType: () => void;
}) {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const { data, isFetching } = useGetCharacteristicGroupsByNomenclatureQuery(
    type.id,
    { skip: !isExpanded },
  );
  const groups = data?.data ?? [];
  const [deleteGroup] = useDeleteCharacteristicsGroupMutation();

  const handleDelete = async (group: ICharacteristicsGroup) => {
    const confirmed = await confirm({
      title: t('characteristicsGroup.deleteTitle'),
      description: t('characteristicsGroup.deleteConfirm', {
        name: group.name,
      }),
    });
    if (!confirmed) return;

    try {
      await deleteGroup(group.id).unwrap();
      notify.success(t('message.deleted'));
      if (group.id === selectedGroupId) onSelectGroup(null);
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  return (
    <div className="group/type flex flex-col gap-1 pb-1">
      <div className="hover:bg-surface-hover flex items-center gap-2 rounded-md px-2.5 py-2 transition-colors">
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex flex-1 items-center gap-2 overflow-hidden text-left"
        >
          <ChevronDownIcon
            size={12}
            className={cn(
              'text-fg-muted shrink-0 transition-transform',
              !isExpanded && '-rotate-90',
            )}
          />
          <span className="text-fg-muted shrink-0">
            <PackageIcon size={14} />
          </span>
          <span className="text-fg truncate text-sm font-semibold">
            {type.name}
          </span>
        </button>

        <InfoTooltip content={type.description} />

        <div className="hidden shrink-0 items-center gap-0.5 group-hover/type:flex">
          <PermissionGuard permission={Permissions.TYPE_OF_NOMENCLATURE.UPDATE}>
            <button
              type="button"
              onClick={onEditType}
              aria-label={t('common.edit')}
              className="text-fg-muted hover:bg-surface hover:text-fg inline-flex size-6 items-center justify-center rounded transition-colors"
            >
              <EditIcon size={12} />
            </button>
          </PermissionGuard>
          <PermissionGuard permission={Permissions.TYPE_OF_NOMENCLATURE.DELETE}>
            <button
              type="button"
              onClick={onDeleteType}
              aria-label={t('common.delete')}
              className="text-fg-muted hover:bg-danger/10 hover:text-danger inline-flex size-6 items-center justify-center rounded transition-colors"
            >
              <DeleteIcon size={12} />
            </button>
          </PermissionGuard>
        </div>
      </div>

      {isExpanded && (
        <div className="border-border ml-4 flex flex-col gap-1 border-l pl-3.5">
          {isFetching ? (
            <div className="flex justify-center py-2">
              <Spinner className="text-fg-muted size-4" />
            </div>
          ) : (
            groups.map((group) => (
              <GroupRow
                key={group.id}
                group={{
                  ...group,
                  characteristicsCount:
                    group.characteristics.length + group.dynamicTables.length,
                }}
                isSelected={group.id === selectedGroupId}
                onSelect={() => onSelectGroup(group.id)}
                onEdit={() => onEditGroup(group)}
                onDelete={() => handleDelete(group)}
              />
            ))
          )}

          <PermissionGuard
            permission={Permissions.CHARACTERISTICS_GROUP.CREATE}
          >
            <button
              type="button"
              onClick={onAddGroup}
              className="text-primary hover:bg-surface-hover flex items-center gap-1.5 rounded-md px-2.5 py-2 text-left text-sm font-medium transition-colors"
            >
              <PlusIcon size={13} />
              {t('characteristicsGroup.addGroup')}
            </button>
          </PermissionGuard>
        </div>
      )}
    </div>
  );
}

export function CharacteristicsTree({
  selectedTypeId,
  selectedGroupId,
  onSelect,
}: CharacteristicsTreeProps) {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [search, setSearch] = useState('');
  const [expandedTypeIds, setExpandedTypeIds] = useState<Set<number>>(
    new Set(),
  );
  const [typeModalState, setTypeModalState] = useState<TypeModalState>(null);
  const [groupModalState, setGroupModalState] = useState<GroupModalState>(null);

  const { data, isFetching } = useGetTypeOfNomenclaturesQuery({
    page: 0,
    size: 200,
  });
  const types = useMemo(() => data?.data?.data ?? [], [data]);
  const filteredTypes = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return types;
    return types.filter((type) => type.name.toLowerCase().includes(query));
  }, [types, search]);

  const [createType, { isLoading: isCreatingType }] =
    useCreateTypeOfNomenclatureMutation();
  const [updateType, { isLoading: isUpdatingType }] =
    useUpdateTypeOfNomenclatureMutation();
  const [deleteType] = useDeleteTypeOfNomenclatureMutation();
  const [createGroup, { isLoading: isCreatingGroup }] =
    useCreateCharacteristicsGroupMutation();
  const [updateGroup, { isLoading: isUpdatingGroup }] =
    useUpdateCharacteristicsGroupMutation();

  const toggleExpand = (typeId: number) => {
    setExpandedTypeIds((prev) => {
      const next = new Set(prev);
      if (next.has(typeId)) next.delete(typeId);
      else next.add(typeId);
      return next;
    });
  };

  const handleTypeSubmit = async (values: {
    name: string;
    description?: string;
  }) => {
    try {
      if (typeModalState?.mode === 'edit') {
        await updateType({
          id: typeModalState.type.id,
          data: values,
        }).unwrap();
      } else {
        const created = await createType(values).unwrap();
        setExpandedTypeIds((prev) => new Set(prev).add(created.data.id));
      }
      notify.success(t('message.saved'));
      setTypeModalState(null);
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  const handleDeleteType = async (type: ITypeOfNomenclature) => {
    const confirmed = await confirm({
      title: t('typeOfNomenclature.deleteTitle'),
      description: t('typeOfNomenclature.deleteConfirm', {
        name: type.name,
      }),
    });
    if (!confirmed) return;

    try {
      await deleteType(type.id).unwrap();
      notify.success(t('message.deleted'));
      setExpandedTypeIds((prev) => {
        const next = new Set(prev);
        next.delete(type.id);
        return next;
      });
      if (type.id === selectedTypeId) onSelect(null, null);
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  const handleGroupSubmit = async (values: {
    name: string;
    description?: string | null;
    typeOfNomenclatureId: number;
  }) => {
    try {
      if (groupModalState?.mode === 'edit') {
        await updateGroup({
          id: groupModalState.group.id,
          data: values,
        }).unwrap();
      } else {
        await createGroup(values).unwrap();
      }
      notify.success(t('message.saved'));
      setGroupModalState(null);
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-border flex items-center justify-between gap-2 border-b px-3 py-2.5">
        <h2 className="text-fg text-sm font-semibold">
          {t('typeOfNomenclature.title')}
        </h2>
        <PermissionGuard permission={Permissions.TYPE_OF_NOMENCLATURE.CREATE}>
          <Button
            size="sm"
            icon={<PlusIcon size={13} />}
            onClick={() => setTypeModalState({ mode: 'create' })}
          >
            {t('common.create')}
          </Button>
        </PermissionGuard>
      </div>

      <div className="border-border border-b p-2">
        <Input
          size="sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('common.search')}
          leftIcon={<SearchIcon size={14} />}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isFetching ? (
          <div className="flex justify-center py-6">
            <Spinner className="text-fg-muted size-5" />
          </div>
        ) : filteredTypes.length === 0 ? (
          <p className="text-fg-muted py-6 text-center text-sm">
            {t('common.noData')}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredTypes.map((type) => (
              <TypeNode
                key={type.id}
                type={type}
                isExpanded={expandedTypeIds.has(type.id)}
                selectedGroupId={
                  type.id === selectedTypeId ? selectedGroupId : null
                }
                onToggleExpand={() => toggleExpand(type.id)}
                onSelectGroup={(groupId) => onSelect(type.id, groupId)}
                onAddGroup={() =>
                  setGroupModalState({
                    mode: 'create',
                    typeOfNomenclatureId: type.id,
                  })
                }
                onEditGroup={(group) =>
                  setGroupModalState({
                    mode: 'edit',
                    typeOfNomenclatureId: type.id,
                    group,
                  })
                }
                onEditType={() => setTypeModalState({ mode: 'edit', type })}
                onDeleteType={() => handleDeleteType(type)}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={typeModalState !== null}
        onClose={() => setTypeModalState(null)}
        title={
          typeModalState?.mode === 'edit'
            ? t('typeOfNomenclature.editTitle')
            : t('typeOfNomenclature.createTitle')
        }
      >
        <TypeOfNomenclatureForm
          entity={
            typeModalState?.mode === 'edit' ? typeModalState.type : undefined
          }
          isSubmitting={isCreatingType || isUpdatingType}
          onSubmit={handleTypeSubmit}
          onCancel={() => setTypeModalState(null)}
        />
      </Modal>

      <Modal
        isOpen={groupModalState !== null}
        onClose={() => setGroupModalState(null)}
        title={
          groupModalState?.mode === 'edit'
            ? t('characteristicsGroup.editTitle')
            : t('characteristicsGroup.createTitle')
        }
      >
        {groupModalState && (
          <CharacteristicsGroupForm
            entity={
              groupModalState.mode === 'edit'
                ? groupModalState.group
                : undefined
            }
            typeOfNomenclatureId={groupModalState.typeOfNomenclatureId}
            isSubmitting={isCreatingGroup || isUpdatingGroup}
            onSubmit={handleGroupSubmit}
            onCancel={() => setGroupModalState(null)}
          />
        )}
      </Modal>
    </div>
  );
}
