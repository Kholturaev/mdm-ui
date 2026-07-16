import { useContext } from 'react';
import {
  FocusedSourcePathSetterContext,
  FocusedSourcePathValueContext,
} from './context';

/** The currently focused row's `sourcePath`, or null — subscribe from the live preview only, never from tree rows (see context.ts for why). */
export function useFocusedSourcePath() {
  return useContext(FocusedSourcePathValueContext);
}

/** Stable setter — safe to call from every tree row without causing them to re-render on focus change. */
export function useSetFocusedSourcePath() {
  return useContext(FocusedSourcePathSetterContext);
}
