import { useState } from 'react';
import type { ReactNode } from 'react';
import { PageTitleContext } from './context';

export function PageTitleProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('');
  return (
    <PageTitleContext.Provider value={{ title, setTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
}
