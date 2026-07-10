import { useContext, useEffect } from 'react';
import { BackLinkContext } from './context';
import type { BackLinkItem } from './context';

function useBackLinkContext() {
  const ctx = useContext(BackLinkContext);
  if (!ctx)
    throw new Error(
      'useBackLinkContext must be used within a BackLinkProvider',
    );
  return ctx;
}

/** Call from a detail page to put its "back to list" link in the app header — cleared automatically on unmount, so pages that never call this show nothing. */
export function useBackLink(item: BackLinkItem) {
  const { setItem } = useBackLinkContext();
  useEffect(() => {
    setItem(item);
    return () => setItem(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.label, item.href, setItem]);
}

export function useBackLinkValue() {
  return useBackLinkContext().item;
}
