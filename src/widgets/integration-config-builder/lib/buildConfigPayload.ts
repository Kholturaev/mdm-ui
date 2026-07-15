import type {
  IIntegrationConfigNomenclature,
  IIntegrationConfigSection,
  IIntegrationConfigSelectedItem,
  IIntegrationMapping,
  ISourceSchemaNode,
} from '@entities/external-system/model/types';
import type { SourceTab } from './constants';
import { TAB_TO_SECTION_TYPE } from './constants';
import type { TreeState } from './useTreeState';
import { buildMappingsForRoot } from './useMappings';

type SelectedItemType = IIntegrationConfigSelectedItem['itemType'];

function detectSelectedItemType(sourcePath: string): SelectedItemType | null {
  if (/\.chars\.\d+$/.test(sourcePath)) return 'CHARACTERISTIC';
  if (/\.tables\.\d+$/.test(sourcePath)) return 'DYNAMIC_TABLE';
  if (/\.groups\.\d+$/.test(sourcePath)) return 'GROUP';
  return null;
}

function subtreeHasSelection(
  node: ISourceSchemaNode,
  state: TreeState,
): boolean {
  if (state.selectedKeys[node.key]) return true;
  return node.children.some((child) => subtreeHasSelection(child, state));
}

/** Every characteristic-group/characteristic/dynamic-table node (identified by `itemId`) that has at least one selected descendant — the "which parts of this nomenclature type's schema does this config touch" list the backend uses to load context. */
function buildSelectedItems(
  root: ISourceSchemaNode,
  state: TreeState,
): IIntegrationConfigSelectedItem[] {
  const items: IIntegrationConfigSelectedItem[] = [];
  let position = 0;

  const visit = (node: ISourceSchemaNode) => {
    if (node.itemId !== undefined && subtreeHasSelection(node, state)) {
      const itemType = detectSelectedItemType(node.sourcePath || node.key);
      if (itemType) {
        items.push({
          id: 0,
          itemType,
          itemId: node.itemId,
          itemName: node.label,
          position: position++,
        });
      }
    }
    node.children.forEach(visit);
  };
  root.children.forEach(visit);

  return items;
}

export type NomenclatureRootEntry = {
  typeOfNomenclatureId: number;
  typeOfNomenclatureName: string;
  root: ISourceSchemaNode;
};

/**
 * Builds this tab's `IIntegrationConfigSection[]` (0 or 1 entries — an empty
 * tab contributes nothing) from the current tree selection state.
 *
 * For the Product tab specifically, mappings are computed separately per
 * root (the static product tree, then each selected nomenclature type's own
 * tree) rather than being flattened together and reverse-engineered
 * afterward — avoiding the akfa-data-frontend bug where every nomenclature
 * type ends up with every OTHER selected type's mappings when 2+ are picked.
 */
export function buildConfigSections(
  tab: SourceTab,
  primaryRoot: ISourceSchemaNode | null,
  nomenclatureEntries: NomenclatureRootEntry[],
  state: TreeState,
): IIntegrationConfigSection[] {
  const sectionType = TAB_TO_SECTION_TYPE[tab];

  if (tab !== 'product') {
    if (!primaryRoot) return [];
    const mappings = buildMappingsForRoot(primaryRoot, state);
    if (mappings.length === 0) return [];
    return [{ id: 0, sectionType, position: 0, mappings }];
  }

  const productMappings = primaryRoot
    ? buildMappingsForRoot(primaryRoot, state)
    : [];

  const nomenclatures: IIntegrationConfigNomenclature[] = nomenclatureEntries
    .map((entry, index) => {
      const mappings = buildMappingsForRoot(entry.root, state);
      const selectedItems = buildSelectedItems(entry.root, state);
      if (mappings.length === 0 && selectedItems.length === 0) return null;
      return {
        id: 0,
        typeOfNomenclatureId: entry.typeOfNomenclatureId,
        typeOfNomenclatureName: entry.typeOfNomenclatureName,
        position: index,
        selectedItems,
        mappings,
      };
    })
    .filter((entry): entry is IIntegrationConfigNomenclature => entry !== null);

  if (productMappings.length === 0 && nomenclatures.length === 0) return [];

  return [
    {
      id: 0,
      sectionType,
      position: 0,
      mappings: productMappings,
      nomenclatures,
    },
  ];
}

/** Strips the UI-local `id` (`map-<nodeKey>`) from every mapping before sending — the backend assigns its own ids. */
export function cleanMappings(
  mappings: IIntegrationMapping[],
): IIntegrationMapping[] {
  return mappings.map(({ id: _id, children, ...rest }) => ({
    ...rest,
    children: cleanMappings(children ?? []),
  }));
}
