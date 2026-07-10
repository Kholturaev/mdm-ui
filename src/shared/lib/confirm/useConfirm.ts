import { useContext } from 'react';
import { ConfirmContext } from './context';

/** Returns an async `confirm(options)` — resolves `true` on confirm, `false` on cancel/dismiss. */
export function useConfirm() {
  const confirm = useContext(ConfirmContext);
  if (!confirm) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return confirm;
}
