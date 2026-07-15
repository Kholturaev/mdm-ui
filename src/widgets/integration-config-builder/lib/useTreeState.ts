import { useCallback, useMemo, useState } from 'react';
import type {
  IIntegrationMapping,
  ISourceSchemaNode,
} from '@entities/external-system/model/types';
import type { NodeMappingMode, TableViewMode } from './constants';
import {
  collectSelectableKeys,
  findAncestorKeys,
  findNodeByKey,
  findNodeBySourcePath,
  getTableArrayChild,
  getTableColumnChildren,
  isTableContainerNode,
} from './treeUtils';

export type TreeState = {
  selectedKeys: Record<string, boolean>;
  targetPathByKey: Record<string, string>;
  requiredByKey: Record<string, boolean>;
  nodeModeByKey: Record<string, NodeMappingMode>;
  tableViewByKey: Record<string, TableViewMode>;
  expandedKeys: Record<string, boolean>;
};

const EMPTY_STATE: TreeState = {
  selectedKeys: {},
  targetPathByKey: {},
  requiredByKey: {},
  nodeModeByKey: {},
  tableViewByKey: {},
  expandedKeys: {},
};

function defaultTargetPath(node: ISourceSchemaNode): string {
  return node.fieldKey || node.label;
}

/** Removes every empty (no static children, but was only ever a wrapper) selected container bottom-up, so toggling a leaf off doesn't leave a stray, meaningless selected ancestor behind. */
function pruneEmptyContainers(
  roots: ISourceSchemaNode[],
  selectedKeys: Record<string, boolean>,
): Record<string, boolean> {
  const next = { ...selectedKeys };
  const visit = (node: ISourceSchemaNode): boolean => {
    const anyChildSelected = node.children.map(visit).some(Boolean);
    if (node.children.length > 0 && !anyChildSelected && !node.isLeaf) {
      delete next[node.key];
      return false;
    }
    return Boolean(next[node.key]) || anyChildSelected;
  };
  roots.forEach(visit);
  return next;
}

export function useTreeState(roots: ISourceSchemaNode[]) {
  const [state, setState] = useState<TreeState>(EMPTY_STATE);
  const [search, setSearch] = useState('');

  const findNode = useCallback(
    (sourcePath: string): ISourceSchemaNode | null => {
      for (const root of roots) {
        const found = findNodeBySourcePath(root, sourcePath);
        if (found) return found;
      }
      return null;
    },
    [roots],
  );

  const toggleExpand = useCallback((key: string) => {
    setState((prev) => ({
      ...prev,
      expandedKeys: { ...prev.expandedKeys, [key]: !prev.expandedKeys[key] },
    }));
  }, []);

  const expandKeys = useCallback((keys: string[]) => {
    setState((prev) => {
      const expandedKeys = { ...prev.expandedKeys };
      keys.forEach((key) => {
        expandedKeys[key] = true;
      });
      return { ...prev, expandedKeys };
    });
  }, []);

  const toggleNode = useCallback(
    (node: ISourceSchemaNode) => {
      const turningOn = !state.selectedKeys[node.key];
      const root = roots.find((r) => findNodeByKey(r, node.key));

      setState((prev) => {
        const selectedKeys = { ...prev.selectedKeys };
        const targetPathByKey = { ...prev.targetPathByKey };
        const requiredByKey = { ...prev.requiredByKey };

        // Toggling a container (non-leaf) selects/deselects its whole subtree
        // in one gesture — the common "map this entire branch" case.
        const subtreeKeys = node.isLeaf
          ? [node.key]
          : collectSelectableKeys(node);
        subtreeKeys.forEach((key) => {
          selectedKeys[key] = turningOn;
          if (turningOn && !(key in targetPathByKey)) {
            const subNode = key === node.key ? node : findNodeByKey(node, key);
            if (subNode) targetPathByKey[key] = defaultTargetPath(subNode);
          }
          if (turningOn && !(key in requiredByKey)) {
            requiredByKey[key] = true;
          }
        });

        // Selecting something implies its ancestor OBJECT/ARRAY wrappers must
        // be "selected" too, so the mapping tree nests correctly.
        if (turningOn && root) {
          const ancestorKeys = findAncestorKeys(root, node.key);
          ancestorKeys.forEach((key) => {
            selectedKeys[key] = true;
            if (!(key in targetPathByKey)) {
              const ancestorNode = findNodeByKey(root, key);
              if (ancestorNode)
                targetPathByKey[key] = defaultTargetPath(ancestorNode);
            }
          });
        }

        const prunedSelectedKeys = turningOn
          ? selectedKeys
          : pruneEmptyContainers(roots, selectedKeys);

        return {
          ...prev,
          selectedKeys: prunedSelectedKeys,
          targetPathByKey,
          requiredByKey,
        };
      });
    },
    [roots, state.selectedKeys],
  );

  const setTargetPath = useCallback((key: string, value: string) => {
    setState((prev) => ({
      ...prev,
      targetPathByKey: { ...prev.targetPathByKey, [key]: value },
    }));
  }, []);

  const setRequired = useCallback((key: string, value: boolean) => {
    setState((prev) => ({
      ...prev,
      requiredByKey: { ...prev.requiredByKey, [key]: value },
    }));
  }, []);

  const setNodeMode = useCallback((key: string, mode: NodeMappingMode) => {
    setState((prev) => ({
      ...prev,
      nodeModeByKey: { ...prev.nodeModeByKey, [key]: mode },
    }));
  }, []);

  /** Switching between Columns/Rows view purges whichever branch just became hidden, so stray selections don't silently leak into the saved payload. */
  const setTableView = useCallback(
    (node: ISourceSchemaNode, mode: TableViewMode) => {
      const arrayChild = getTableArrayChild(node);
      const columnChildren = getTableColumnChildren(node);
      const keysToPurge =
        mode === 'ROWS'
          ? columnChildren.flatMap(collectSelectableKeys)
          : arrayChild
            ? collectSelectableKeys(arrayChild)
            : [];

      setState((prev) => {
        const selectedKeys = { ...prev.selectedKeys };
        keysToPurge.forEach((key) => delete selectedKeys[key]);
        return {
          ...prev,
          tableViewByKey: { ...prev.tableViewByKey, [node.key]: mode },
          selectedKeys,
        };
      });
    },
    [],
  );

  const reset = useCallback(() => setState(EMPTY_STATE), []);

  /** Populates all state maps from a previously saved mapping tree — matches each mapping's `sourcePath` to a tree node, restores its target path/required/mode, and auto-selects+expands every ancestor so the restored branch is visible. */
  const restoreFromMappings = useCallback(
    (mappings: IIntegrationMapping[]) => {
      const selectedKeys: Record<string, boolean> = {};
      const targetPathByKey: Record<string, string> = {};
      const requiredByKey: Record<string, boolean> = {};
      const nodeModeByKey: Record<string, NodeMappingMode> = {};
      const tableViewByKey: Record<string, TableViewMode> = {};
      const expandedKeys: Record<string, boolean> = {};

      // Note: OBJECT nodes always restore as nested ('OBJECT' mode) rather
      // than trying to infer a prior Flat toggle from the saved shape —
      // telling the two apart reliably requires re-deriving the full source
      // tree structure around each mapping, and getting it wrong has no data
      // consequence (the live preview immediately shows the current shape,
      // so a user who wanted Flat just re-toggles it once).
      const visit = (mapping: IIntegrationMapping) => {
        const node = findNode(mapping.sourcePath);
        if (!node) return;

        selectedKeys[node.key] = true;
        targetPathByKey[node.key] = mapping.targetPath;
        requiredByKey[node.key] = mapping.required;

        const root = roots.find((r) => findNodeByKey(r, node.key));
        if (root) {
          findAncestorKeys(root, node.key).forEach((key) => {
            selectedKeys[key] = true;
            expandedKeys[key] = true;
          });
        }

        if (isTableContainerNode(node)) {
          tableViewByKey[node.key] =
            mapping.mappingType === 'ARRAY' ? 'ROWS' : 'COLUMNS';
        } else if (node.type === 'OBJECT') {
          nodeModeByKey[node.key] = 'OBJECT';
        }

        mapping.children?.forEach(visit);
      };

      mappings.forEach(visit);

      setState({
        selectedKeys,
        targetPathByKey,
        requiredByKey,
        nodeModeByKey,
        tableViewByKey,
        expandedKeys,
      });
    },
    [findNode, roots],
  );

  return useMemo(
    () => ({
      ...state,
      search,
      setSearch,
      toggleExpand,
      expandKeys,
      toggleNode,
      setTargetPath,
      setRequired,
      setNodeMode,
      setTableView,
      reset,
      restoreFromMappings,
    }),
    [
      state,
      search,
      toggleExpand,
      expandKeys,
      toggleNode,
      setTargetPath,
      setRequired,
      setNodeMode,
      setTableView,
      reset,
      restoreFromMappings,
    ],
  );
}

export type UseTreeStateReturn = ReturnType<typeof useTreeState>;
