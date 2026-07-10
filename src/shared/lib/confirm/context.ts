import { createContext } from 'react';
import type { ReactNode } from 'react';

export type ConfirmOptions = {
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** `danger` (default) renders the confirm button red — use `primary` for non-destructive confirmations. */
  variant?: 'danger' | 'primary';
};

export type ConfirmContextValue = (options: ConfirmOptions) => Promise<boolean>;

export const ConfirmContext = createContext<ConfirmContextValue | null>(null);
