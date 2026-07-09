import { useState } from 'react';
import type { ReactNode } from 'react';
import { BackLinkContext } from './context';
import type { BackLinkItem } from './context';

export function BackLinkProvider({ children }: { children: ReactNode }) {
  const [item, setItem] = useState<BackLinkItem | null>(null);
  return (
    <BackLinkContext.Provider value={{ item, setItem }}>
      {children}
    </BackLinkContext.Provider>
  );
}
