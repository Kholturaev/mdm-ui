import { useCallback, useEffect, useState } from 'react';
import type { ApprovalRequest } from '../model/types';
import { APPROVAL_SEED } from './auditMockData';

let store: ApprovalRequest[] = [...APPROVAL_SEED];
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

/** In-memory pending-approval queue — resolves (approve/reject) immediately, since it's a local decision rather than a network round trip once wired to a real backend. */
export function useApprovalQueue(): {
  approvals: ApprovalRequest[];
  approve: (id: string) => void;
  reject: (id: string) => void;
} {
  const [, setVersion] = useState(0);

  useEffect(() => {
    const listener = () => setVersion((version) => version + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const remove = useCallback((id: string) => {
    store = store.filter((item) => item.id !== id);
    notify();
  }, []);

  return { approvals: store, approve: remove, reject: remove };
}
