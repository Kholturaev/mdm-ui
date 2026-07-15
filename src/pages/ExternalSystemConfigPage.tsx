import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type {
  IIntegrationMapping,
  ISourceSchemaNode,
} from '@entities/external-system/model/types';
import {
  useCreateIntegrationConfigMutation,
  useGetDealerSourceTreeQuery,
  useGetIntegrationConfigsBySystemQuery,
  useGetOneExternalSystemQuery,
  useGetProductGroupSourceTreeQuery,
  useGetProductRateSourceTreeQuery,
  useGetProductSourceTreeQuery,
  useLazyGetNomenclatureSourceTreeByIdQuery,
  useUpdateIntegrationConfigMutation,
} from '@entities/external-system/api/externalSystemApi';
import { extractSourceNode } from '@entities/external-system/lib/sourceTree';
import { useTypeOfNomenclatureOptions } from '@entities/type-of-nomenclature/lib/useTypeOfNomenclatureOptions';
import type { SourceTab } from '@widgets/integration-config-builder/lib/constants';
import {
  SOURCE_TABS,
  TAB_TO_SECTION_TYPE,
} from '@widgets/integration-config-builder/lib/constants';
import { useTreeState } from '@widgets/integration-config-builder/lib/useTreeState';
import { buildMappingsForRoot } from '@widgets/integration-config-builder/lib/useMappings';
import type { NomenclatureRootEntry } from '@widgets/integration-config-builder/lib/buildConfigPayload';
import {
  buildConfigSections,
  cleanMappings,
} from '@widgets/integration-config-builder/lib/buildConfigPayload';
import { analyzeMappingConflicts } from '@widgets/integration-config-builder/lib/mappingConflicts';
import { prefixTreeKeys } from '@widgets/integration-config-builder/lib/treeUtils';
import { SourceSchemaTree } from '@widgets/integration-config-builder/ui/SourceSchemaTree';
import { LivePreview } from '@widgets/integration-config-builder/ui/LivePreview';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { Checkbox } from '@shared/ui/Checkbox';
import { Select } from '@shared/ui/Select';
import type { SelectOption } from '@shared/ui/Select';
import { SegmentedControl } from '@shared/ui/SegmentedControl';
import { Modal } from '@shared/ui/Modal';
import { Spinner } from '@shared/ui/Spinner';
import { PermissionGuard } from '@shared/ui/PermissionGuard';
import { ArrowLeftIcon } from '@shared/ui/icons/ArrowLeftIcon';
import { Permissions } from '@shared/constants/permissions';
import { parseApiError } from '@shared/api/parseApiError';
import type { ApiException } from '@shared/api/type';
import { notify } from '@shared/lib/toast';

function nomenclaturePrefix(id: number): string {
  return `nom_${id}_`;
}

export function ExternalSystemConfigPage() {
  const { id } = useParams<{ id: string }>();
  const systemId = Number(id);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: systemData } = useGetOneExternalSystemQuery(systemId);
  const system = systemData?.data;

  const { data: configListData, isFetching: isLoadingConfig } =
    useGetIntegrationConfigsBySystemQuery(
      { externalSystemId: systemId },
      { skip: !systemId },
    );
  const savedConfig = configListData?.data?.data?.[0] ?? null;

  const [createConfig, { isLoading: isCreating }] =
    useCreateIntegrationConfigMutation();
  const [updateConfig, { isLoading: isUpdating }] =
    useUpdateIntegrationConfigMutation();
  const isSaving = isCreating || isUpdating;

  // --- Config metadata (name/code/format/active) — populated once from the
  // saved config, editable, re-synced after a successful save.
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [format, setFormat] = useState<'JSON' | 'XML'>('JSON');
  const [isActive, setIsActive] = useState(true);
  const metaPopulatedRef = useRef(false);
  useEffect(() => {
    if (metaPopulatedRef.current || !savedConfig) return;
    setName(savedConfig.name);
    setCode(savedConfig.code);
    setFormat(savedConfig.format);
    setIsActive(savedConfig.isActive);
    metaPopulatedRef.current = true;
  }, [savedConfig]);

  // --- Static section trees (one per tab) ---------------------------------
  const { data: productTreeRaw, isFetching: isProductLoading } =
    useGetProductSourceTreeQuery();
  const { data: productGroupTreeRaw, isFetching: isProductGroupLoading } =
    useGetProductGroupSourceTreeQuery();
  const { data: rateTreeRaw, isFetching: isRateLoading } =
    useGetProductRateSourceTreeQuery();
  const { data: dealerTreeRaw, isFetching: isDealerLoading } =
    useGetDealerSourceTreeQuery();

  const productTree = useMemo(
    () => extractSourceNode(productTreeRaw),
    [productTreeRaw],
  );
  const productGroupTree = useMemo(
    () => extractSourceNode(productGroupTreeRaw),
    [productGroupTreeRaw],
  );
  const rateTree = useMemo(() => extractSourceNode(rateTreeRaw), [rateTreeRaw]);
  const dealerTree = useMemo(
    () => extractSourceNode(dealerTreeRaw),
    [dealerTreeRaw],
  );

  // --- Product tab's nomenclature-type picker ------------------------------
  const nomenclatureOptions = useTypeOfNomenclatureOptions();
  const [selectedNomenclatureIds, setSelectedNomenclatureIds] = useState<
    number[]
  >([]);
  const [nomenclatureTrees, setNomenclatureTrees] = useState<
    Record<number, ISourceSchemaNode>
  >({});
  const [nomenclatureNames, setNomenclatureNames] = useState<
    Record<number, string>
  >({});
  const [triggerNomenclatureTree, { isFetching: isNomenclatureTreeLoading }] =
    useLazyGetNomenclatureSourceTreeByIdQuery();

  const selectedNomenclatureKey = selectedNomenclatureIds.join(',');
  const loadedNomenclatureKey = Object.keys(nomenclatureTrees).join(',');

  useEffect(() => {
    const missingIds = selectedNomenclatureIds.filter(
      (nomId) => !(nomId in nomenclatureTrees),
    );
    if (missingIds.length === 0) return;
    let cancelled = false;
    Promise.all(
      missingIds.map(async (nomId) => {
        const res = await triggerNomenclatureTree(nomId).unwrap();
        return { nomId, node: extractSourceNode(res) };
      }),
    ).then((results) => {
      if (cancelled) return;
      setNomenclatureTrees((prev) => {
        const next = { ...prev };
        results.forEach(({ nomId, node }) => {
          if (node)
            next[nomId] = prefixTreeKeys(node, nomenclaturePrefix(nomId));
        });
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNomenclatureKey, loadedNomenclatureKey, triggerNomenclatureTree]);

  const productRoots = useMemo(
    () => [
      ...(productTree ? [productTree] : []),
      ...selectedNomenclatureIds
        .map((nomId) => nomenclatureTrees[nomId])
        .filter((node): node is ISourceSchemaNode => Boolean(node)),
    ],
    [productTree, selectedNomenclatureIds, nomenclatureTrees],
  );
  const allNomenclatureTreesReady = selectedNomenclatureIds.every(
    (nomId) => nomId in nomenclatureTrees,
  );

  // --- Per-tab tree state (kept alive across tab switches within the session) ---
  const productTreeState = useTreeState(productRoots);
  const productGroupTreeState = useTreeState(
    productGroupTree ? [productGroupTree] : [],
  );
  const rateTreeState = useTreeState(rateTree ? [rateTree] : []);
  const dealerTreeState = useTreeState(dealerTree ? [dealerTree] : []);

  const treeStateByTab = {
    product: productTreeState,
    productGroup: productGroupTreeState,
    rate: rateTreeState,
    dealer: dealerTreeState,
  };

  const rootsByTab: Record<SourceTab, ISourceSchemaNode[]> = {
    product: productRoots,
    productGroup: productGroupTree ? [productGroupTree] : [],
    rate: rateTree ? [rateTree] : [],
    dealer: dealerTree ? [dealerTree] : [],
  };

  const treeLoadingByTab: Record<SourceTab, boolean> = {
    product: isProductLoading,
    productGroup: isProductGroupLoading,
    rate: isRateLoading,
    dealer: isDealerLoading,
  };

  const productMappings = useMemo(
    () =>
      productRoots.flatMap((root) =>
        buildMappingsForRoot(root, productTreeState),
      ),
    [productRoots, productTreeState],
  );
  const productGroupMappings = useMemo(
    () =>
      productGroupTree
        ? buildMappingsForRoot(productGroupTree, productGroupTreeState)
        : [],
    [productGroupTree, productGroupTreeState],
  );
  const rateMappings = useMemo(
    () => (rateTree ? buildMappingsForRoot(rateTree, rateTreeState) : []),
    [rateTree, rateTreeState],
  );
  const dealerMappings = useMemo(
    () => (dealerTree ? buildMappingsForRoot(dealerTree, dealerTreeState) : []),
    [dealerTree, dealerTreeState],
  );

  const mappingsByTab: Record<SourceTab, IIntegrationMapping[]> = {
    product: productMappings,
    productGroup: productGroupMappings,
    rate: rateMappings,
    dealer: dealerMappings,
  };

  // --- Restore each tab's saved section exactly once, as soon as its tree is ready ---
  const restoredTabsRef = useRef<Set<SourceTab>>(new Set());
  const snapshotByTabRef = useRef<Partial<Record<SourceTab, string>>>({});
  const nomenclatureIdsPopulatedRef = useRef(false);

  useEffect(() => {
    const nomenclatures = savedConfig?.sections.find(
      (s) => s.sectionType === 'PRODUCT',
    )?.nomenclatures;
    if (nomenclatureIdsPopulatedRef.current || !nomenclatures?.length) return;

    nomenclatureIdsPopulatedRef.current = true;
    setSelectedNomenclatureIds(
      nomenclatures.map((n) => n.typeOfNomenclatureId),
    );
    setNomenclatureNames((prev) => {
      const next = { ...prev };
      nomenclatures.forEach((n) => {
        next[n.typeOfNomenclatureId] = n.typeOfNomenclatureName;
      });
      return next;
    });
  }, [savedConfig]);

  useEffect(() => {
    if (!savedConfig) return;
    SOURCE_TABS.forEach((tab) => {
      if (restoredTabsRef.current.has(tab)) return;
      if (rootsByTab[tab].length === 0) return;
      if (
        tab === 'product' &&
        selectedNomenclatureIds.length > 0 &&
        !allNomenclatureTreesReady
      ) {
        return;
      }

      const section = savedConfig.sections.find(
        (s) => s.sectionType === TAB_TO_SECTION_TYPE[tab],
      );
      const mappings = section
        ? [
            ...section.mappings,
            ...(section.nomenclatures?.flatMap((n) => n.mappings) ?? []),
          ]
        : [];
      treeStateByTab[tab].restoreFromMappings(mappings);
      restoredTabsRef.current.add(tab);
      snapshotByTabRef.current[tab] = JSON.stringify(mappingsByTab[tab]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    savedConfig,
    productTree,
    productGroupTree,
    rateTree,
    dealerTree,
    selectedNomenclatureKey,
    allNomenclatureTreesReady,
  ]);

  // --- Active tab + dirty guard --------------------------------------------
  const [activeTab, setActiveTab] = useState<SourceTab>('product');
  const [pendingTab, setPendingTab] = useState<SourceTab | null>(null);

  const isTabDirty = (tab: SourceTab) => {
    const snapshot = snapshotByTabRef.current[tab] ?? '[]';
    return JSON.stringify(mappingsByTab[tab]) !== snapshot;
  };

  const handleTabClick = (tab: SourceTab) => {
    if (tab === activeTab) return;
    if (isTabDirty(activeTab)) {
      setPendingTab(tab);
      return;
    }
    setActiveTab(tab);
  };

  const discardAndSwitch = () => {
    if (!pendingTab) return;
    treeStateByTab[activeTab].reset();
    restoredTabsRef.current.delete(activeTab);
    setActiveTab(pendingTab);
    setPendingTab(null);
  };

  // --- Conflicts + save ------------------------------------------------------
  const activeMappings = mappingsByTab[activeTab];
  const conflicts = useMemo(
    () => analyzeMappingConflicts(activeMappings),
    [activeMappings],
  );

  const isProductTabEmpty =
    activeTab === 'product' &&
    productRoots.length > 0 &&
    productMappings.length === 0;

  const buildNomenclatureEntries = (): NomenclatureRootEntry[] =>
    selectedNomenclatureIds
      .map((nomId) => {
        const root = nomenclatureTrees[nomId];
        if (!root) return null;
        return {
          typeOfNomenclatureId: nomId,
          typeOfNomenclatureName: nomenclatureNames[nomId] ?? '',
          root,
        };
      })
      .filter((entry): entry is NomenclatureRootEntry => entry !== null);

  const handleSave = async (switchToAfter?: SourceTab) => {
    if (conflicts.conflictCount > 0) {
      notify.error(
        t('externalSystem.config.duplicateTargetKeysFound', {
          count: conflicts.conflictCount,
        }),
      );
      return;
    }
    if (!name.trim() || !code.trim()) {
      notify.error(t('externalSystem.config.metadataRequired'));
      return;
    }

    const activeSections = buildConfigSections(
      activeTab,
      rootsByTab[activeTab][0] ?? null,
      activeTab === 'product' ? buildNomenclatureEntries() : [],
      treeStateByTab[activeTab],
    );

    const activeSectionType = TAB_TO_SECTION_TYPE[activeTab];
    const otherSavedSections = (savedConfig?.sections ?? []).filter(
      (section) => section.sectionType !== activeSectionType,
    );
    const finalSections = [
      ...activeSections.map((section) => ({
        ...section,
        mappings: cleanMappings(section.mappings),
        nomenclatures: section.nomenclatures?.map((n) => ({
          ...n,
          mappings: cleanMappings(n.mappings),
        })),
      })),
      ...otherSavedSections,
    ];

    const payload = {
      name: name.trim(),
      code: code.trim(),
      externalSystemId: systemId,
      format,
      rootName: savedConfig?.rootName ?? null,
      isDefault: savedConfig?.isDefault ?? true,
      isActive,
      sections: finalSections,
    };

    try {
      if (savedConfig?.id) {
        await updateConfig({ id: savedConfig.id, data: payload }).unwrap();
      } else {
        await createConfig(payload).unwrap();
      }
      notify.success(t('message.saved'));
      snapshotByTabRef.current[activeTab] = JSON.stringify(activeMappings);
      restoredTabsRef.current.delete(activeTab);
      if (switchToAfter) setActiveTab(switchToAfter);
      setPendingTab(null);
    } catch (error) {
      notify.error(parseApiError(error as ApiException));
    }
  };

  const emptyMessageByTab: Record<SourceTab, string> = {
    product: t('externalSystem.config.emptyProduct'),
    productGroup: t('externalSystem.config.emptyProductGroup'),
    rate: t('externalSystem.config.emptyRate'),
    dealer: t('externalSystem.config.emptyDealer'),
  };

  const nomenclatureSelectOptions: SelectOption[] = nomenclatureOptions.options;

  return (
    <div className="flex h-full flex-col">
      <div className="border-border flex shrink-0 items-center gap-3 border-b px-4 py-3">
        <button
          type="button"
          onClick={() => navigate('/external-systems')}
          className="text-fg-muted hover:bg-surface-hover hover:text-fg flex size-8 items-center justify-center rounded-md transition-colors"
        >
          <ArrowLeftIcon size={16} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-fg truncate text-sm font-semibold">
            {system?.name ?? '—'}
          </h1>
          <p className="text-fg-muted truncate text-xs">
            {t('externalSystem.config.title')}
          </p>
        </div>
      </div>

      <div className="border-border flex shrink-0 flex-wrap items-end gap-3 border-b px-4 py-3">
        <Input
          size="sm"
          label={t('externalSystem.config.configName')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('externalSystem.config.configNamePlaceholder')}
          containerClassName="w-48"
        />
        <Input
          size="sm"
          label={t('externalSystem.config.configCode')}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          containerClassName="w-40"
        />
        <div className="flex flex-col gap-1">
          <span className="text-fg-muted text-xs font-medium">
            {t('externalSystem.config.configFormat')}
          </span>
          <SegmentedControl
            value={format}
            onChange={setFormat}
            options={[
              { label: 'JSON', value: 'JSON' },
              { label: 'XML', value: 'XML' },
            ]}
          />
        </div>
        <Checkbox
          label={t('externalSystem.config.isActive')}
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="pb-1.5"
        />

        <PermissionGuard permission={Permissions.EXTERNAL_SYSTEM.UPDATE}>
          <Button
            size="sm"
            className="ml-auto"
            isLoading={isSaving}
            disabled={conflicts.conflictCount > 0 || isProductTabEmpty}
            onClick={() => handleSave()}
          >
            {savedConfig?.id ? t('common.update') : t('common.create')}
          </Button>
        </PermissionGuard>
      </div>

      <div className="border-border flex shrink-0 gap-1 border-b px-4">
        {SOURCE_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleTabClick(tab)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'border-primary text-fg'
                : 'text-fg-muted hover:text-fg border-transparent'
            }`}
          >
            {t(`externalSystem.config.tab.${tab}`)}
            {isTabDirty(tab) && <span className="text-primary ml-1">•</span>}
          </button>
        ))}
      </div>

      {isLoadingConfig && !savedConfig ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner className="text-fg-muted size-6" />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
          {activeTab === 'product' && (
            <Select<SelectOption, true>
              size="sm"
              isMulti
              isSearchable
              isLoading={
                nomenclatureOptions.isFetching || isNomenclatureTreeLoading
              }
              options={nomenclatureSelectOptions}
              value={nomenclatureSelectOptions.filter((option) =>
                selectedNomenclatureIds.includes(Number(option.value)),
              )}
              onChange={(next) => {
                const selected = next ?? [];
                setSelectedNomenclatureIds(
                  selected.map((option) => Number(option.value)),
                );
                setNomenclatureNames((prev) => {
                  const nextNames = { ...prev };
                  selected.forEach((option) => {
                    nextNames[Number(option.value)] = option.label;
                  });
                  return nextNames;
                });
              }}
              onInputChange={nomenclatureOptions.onInputChange}
              placeholder={t('externalSystem.config.selectNomenclatureType')}
            />
          )}

          <div className="grid min-h-0 flex-1 grid-cols-[2fr_1fr] gap-4">
            <SourceSchemaTree
              roots={rootsByTab[activeTab].map((root, index) => ({
                key: root.key,
                label:
                  activeTab === 'product' && index > 0
                    ? (nomenclatureNames[selectedNomenclatureIds[index - 1]] ??
                      '')
                    : undefined,
                node: root,
              }))}
              isLoading={treeLoadingByTab[activeTab]}
              emptyMessage={emptyMessageByTab[activeTab]}
              tree={treeStateByTab[activeTab]}
              conflictingSourcePaths={conflicts.conflictingSourcePaths}
            />
            <LivePreview
              mappings={activeMappings}
              format={format}
              rootName={savedConfig?.rootName ?? 'root'}
              conflicts={conflicts}
            />
          </div>
        </div>
      )}

      <Modal
        isOpen={pendingTab !== null}
        onClose={() => setPendingTab(null)}
        title={t('externalSystem.config.unsavedChangesTitle')}
      >
        <div className="flex flex-col gap-4">
          <p className="text-fg-muted text-sm">
            {t('externalSystem.config.unsavedChangesHint')}
          </p>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setPendingTab(null)}
            >
              {t('common.cancel')}
            </Button>
            <Button type="button" variant="outline" onClick={discardAndSwitch}>
              {t('externalSystem.config.discardChanges')}
            </Button>
            <Button
              type="button"
              isLoading={isSaving}
              onClick={() => handleSave(pendingTab ?? undefined)}
            >
              {t('common.save')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
