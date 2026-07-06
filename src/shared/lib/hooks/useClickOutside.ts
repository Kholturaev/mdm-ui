import { useEffect } from 'react';
import type { RefObject } from 'react';

/**
 * Closes on any mousedown outside all given refs. Accepts an array so
 * portaled content (e.g. a dropdown rendered into `document.body`, outside
 * the trigger's own DOM subtree) can be treated as "inside" too — otherwise
 * a mousedown on a portaled menu item would be seen as an outside click and
 * close the menu before its own onClick ever runs.
 */
export function useClickOutside(
  refs: RefObject<HTMLElement | null> | RefObject<HTMLElement | null>[],
  onOutsideClick: () => void,
) {
  useEffect(() => {
    const refList = Array.isArray(refs) ? refs : [refs];
    const handler = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInside = refList.some((ref) => ref.current?.contains(target));
      if (!isInside) onOutsideClick();
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
    // refs are stable useRef objects — read via .current at call time, so they don't need to be in the dependency array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onOutsideClick]);
}
