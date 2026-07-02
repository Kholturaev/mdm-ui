import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../Button';
import { LayersIcon } from '../icons/LayersIcon';
import { useClickOutside } from '@shared/lib/hooks/useClickOutside';

export type ToggleableColumn = { id: string; label: string };

type ColumnVisibilityButtonProps = {
  columns: ToggleableColumn[];
  visible: string[];
  onChange: (next: string[]) => void;
};

/** Lets the user show/hide table columns — in-memory only for now (no persistence across reloads), same as the reference this was ported from. */
export function ColumnVisibilityButton({
  columns,
  visible,
  onChange,
}: ColumnVisibilityButtonProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useClickOutside(containerRef, () => setIsOpen(false));

  const toggle = (id: string) => {
    onChange(
      visible.includes(id)
        ? visible.filter((existing) => existing !== id)
        : [...visible, id],
    );
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="outline"
        size="sm"
        icon={<LayersIcon size={14} />}
        onClick={() => setIsOpen((open) => !open)}
      >
        {t('common.columns')}
      </Button>

      {isOpen && (
        <div className="border-border bg-surface absolute top-full right-0 z-50 mt-1 w-56 rounded-md border p-3 shadow-lg">
          <p className="text-fg mb-2 text-xs font-semibold">
            {t('common.columns')}
          </p>
          <div className="-mx-1 flex max-h-72 flex-col overflow-y-auto">
            {columns.map((column) => (
              <label
                key={column.id}
                className="hover:bg-surface-hover flex cursor-pointer items-center gap-2 rounded px-1 py-1.5 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={visible.includes(column.id)}
                  onChange={() => toggle(column.id)}
                  className="accent-primary size-3.5 shrink-0"
                />
                <span className="text-fg truncate text-xs">{column.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
