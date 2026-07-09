import { createContext } from 'react';

export type BackLinkItem = {
  label: string;
  href: string;
};

export type BackLinkContextValue = {
  item: BackLinkItem | null;
  setItem: (item: BackLinkItem | null) => void;
};

export const BackLinkContext = createContext<BackLinkContextValue | null>(null);
