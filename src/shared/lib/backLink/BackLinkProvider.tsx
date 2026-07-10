import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { BackLinkContext } from './context';
import type { BackLinkItem } from './context';

export function BackLinkProvider({ children }: { children: ReactNode }) {
  const [item, setItem] = useState<BackLinkItem | null>(null);
  const value = useMemo(() => ({ item, setItem }), [item]);
  return (
    <BackLinkContext.Provider value={value}>
      {children}
    </BackLinkContext.Provider>
  );
}
