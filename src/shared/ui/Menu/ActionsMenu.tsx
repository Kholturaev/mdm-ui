import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@shared/lib/cn';
import { useClickOutside } from '@shared/lib/hooks/useClickOutside';
import { DotsVerticalIcon } from '../icons/DotsIcon';

export type ActionsMenuItem = {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  danger?: boolean;
};

type ActionsMenuProps = {
  items: ActionsMenuItem[];
  /** Override the trigger button's own styling — e.g. to sit flush inside a connected button group. */
  triggerClassName?: string;
};

type MenuPosition = { top: number; right: number };

/** Kebab-menu for row actions — use instead of a row of separate buttons once there are more than one or two actions. */
export function ActionsMenu({ items, triggerClassName }: ActionsMenuProps) {
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isOpen = position !== null;

  useClickOutside(containerRef, () => setPosition(null));

  // Fixed positioning (computed from the trigger's rect) instead of `absolute`
  // so the menu escapes the table's `overflow-x-auto` clipping instead of
  // getting cut off or forcing the table to scroll to reveal it.
  useEffect(() => {
    if (!isOpen) return;
    const close = () => setPosition(null);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [isOpen]);

  const toggle = () => {
    if (isOpen) {
      setPosition(null);
      return;
    }
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
  };

  return (
    <div ref={containerRef} className="inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-label="Row actions"
        className={cn(
          'border-border bg-surface text-fg-muted hover:bg-surface-hover hover:text-fg flex size-7 items-center justify-center rounded-md border shadow-sm transition-colors',
          triggerClassName,
        )}
      >
        <DotsVerticalIcon />
      </button>

      {position && (
        <div
          style={{ top: position.top, right: position.right }}
          className="border-border bg-surface fixed z-40 w-40 rounded-md border py-1 shadow-lg"
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setPosition(null);
                item.onClick();
              }}
              className={cn(
                'hover:bg-surface-hover flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
                item.danger ? 'text-danger' : 'text-fg',
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
