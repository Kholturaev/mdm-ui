import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  FocusedSourcePathSetterContext,
  FocusedSourcePathValueContext,
} from './context';

export function FocusedFieldProvider({ children }: { children: ReactNode }) {
  const [focusedSourcePath, setFocusedSourcePath] = useState<string | null>(
    null,
  );
  return (
    <FocusedSourcePathSetterContext.Provider value={setFocusedSourcePath}>
      <FocusedSourcePathValueContext.Provider value={focusedSourcePath}>
        {children}
      </FocusedSourcePathValueContext.Provider>
    </FocusedSourcePathSetterContext.Provider>
  );
}
