import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { IExternalSystem } from '@entities/external-system/model/types';
import { cn } from '@shared/lib/cn';
import { useClickOutside } from '@shared/lib/hooks/useClickOutside';
import { ChevronDownIcon } from '@shared/ui/icons/ChevronDownIcon';
import { LayersIcon } from '@shared/ui/icons/LayersIcon';
import { systemAbbr } from '../lib/systemAbbr';

type SystemMultiSelectProps = {
  systems: IExternalSystem[];
  selected: number[];
  onChange: (ids: number[]) => void;
  /** Approximate per-system counts — same "currently loaded page only" caveat as the sync-status dropdown. */
  counts: Record<number, number>;
};

export function SystemMultiSelect({
  systems,
  selected,
  onChange,
  counts,
}: SystemMultiSelectProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useClickOutside(containerRef, () => setIsOpen(false));

  const toggle = (id: number) => {
    onChange(
      selected.includes(id)
        ? selected.filter((existing) => existing !== id)
        : [...selected, id],
    );
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="border-border bg-surface hover:bg-surface-hover flex h-8 items-center gap-1.5 rounded border px-2.5 text-xs font-medium transition-colors"
      >
        <span className="text-fg-muted">{t('product.system')}:</span>
        <span className="text-fg-muted">
          <LayersIcon size={13} />
        </span>
        {selected.length === 0 ? (
          <span className="text-fg">{t('product.systemAll')}</span>
        ) : (
          <span className="flex items-center gap-1">
            {selected.slice(0, 3).map((id) => {
              const system = systems.find((s) => s.id === id);
              if (!system) return null;
              return (
                <span
                  key={id}
                  className="bg-primary/10 text-primary flex h-4 min-w-4 items-center justify-center rounded px-1 text-[9px] font-semibold"
                >
                  {systemAbbr(system.name)}
                </span>
              );
            })}
            {selected.length > 3 && (
              <span className="text-fg-muted text-[11px]">
                +{selected.length - 3}
              </span>
            )}
          </span>
        )}
        <ChevronDownIcon
          size={12}
          className={cn(
            'text-fg-muted transition-transform',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {isOpen && (
        <div className="border-border bg-surface absolute top-full left-0 z-50 mt-1 w-60 rounded-md border py-1.5 shadow-lg">
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-primary hover:bg-surface-hover w-full px-3 py-1.5 text-left text-xs font-medium transition-colors"
            >
              {t('product.systemAll')}
            </button>
          )}
          {systems.map((system) => {
            const checked = selected.includes(system.id);
            return (
              <label
                key={system.id}
                className="hover:bg-surface-hover flex cursor-pointer items-center gap-2.5 px-3 py-2 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(system.id)}
                  className="accent-primary size-3.5"
                />
                <span className="bg-primary/10 text-primary flex size-5 shrink-0 items-center justify-center rounded text-[10px] font-semibold">
                  {systemAbbr(system.name)}
                </span>
                <span className="text-fg flex-1 truncate text-xs">
                  {system.name}
                </span>
                <span className="text-fg-muted text-[11px]">
                  {counts[system.id] ?? 0}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
