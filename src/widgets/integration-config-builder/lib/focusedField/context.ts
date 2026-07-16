import { createContext } from 'react';

/** Split into two contexts so typing/focusing a row doesn't re-render the whole tree: the setter context's value (the `setState` function) never changes identity, so components that only call it (every tree row) never re-render when focus changes — only components that read the value context (the live preview) do. */
export const FocusedSourcePathValueContext = createContext<string | null>(null);
export const FocusedSourcePathSetterContext = createContext<
  (sourcePath: string | null) => void
>(() => {});
