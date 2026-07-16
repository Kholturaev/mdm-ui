import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SelectOption } from '@shared/ui/Select';
import { Input } from '@shared/ui/Input';
import { Spinner } from '@shared/ui/Spinner';
import { cn } from '@shared/lib/cn';
import { useClickOutside } from '@shared/lib/hooks/useClickOutside';
import { ChevronDownIcon } from '@shared/ui/icons/ChevronDownIcon';
import { SearchIcon } from '@shared/ui/icons/SearchIcon';
import { LayersIcon } from '@shared/ui/icons/LayersIcon';

type NomenclatureTypeMultiSelectProps = {
  options: SelectOption[];
  selectedIds: number[];
  onChange: (selected: { id: number; label: string }[]) => void;
  onSearchChange: (value: string) => void;
  isLoading: boolean;
};

/** Compact popover checklist — the full-width searchable `Select` read as oversized for a field that's often just 1-2 picks. */
export function NomenclatureTypeMultiSelect({
  options,
  selectedIds,
  onChange,
  onSearchChange,
  isLoading,
}: NomenclatureTypeMultiSelectProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useClickOutside(containerRef, () => setIsOpen(false));

  const toggle = (option: SelectOption) => {
    const id = Number(option.value);
    const next = selectedIds.includes(id)
      ? selectedIds.filter((existing) => existing !== id)
      : [...selectedIds, id];
    onChange(
      next
        .map((nextId) => {
          const match = options.find((o) => Number(o.value) === nextId);
          return match ? { id: nextId, label: match.label } : null;
        })
        .filter(
          (entry): entry is { id: number; label: string } => entry !== null,
        ),
    );
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="border-border bg-surface hover:bg-surface-hover flex h-8 items-center gap-1.5 rounded border px-2.5 text-xs font-medium transition-colors"
      >
        <span className="text-fg-muted">
          <LayersIcon size={13} />
        </span>
        <span className="text-fg-muted">
          {t('externalSystem.config.selectNomenclatureType')}:
        </span>
        {selectedIds.length === 0 ? (
          <span className="text-fg-muted">{t('common.noData')}</span>
        ) : (
          <span className="text-primary">{selectedIds.length}</span>
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
        <div className="border-border bg-surface absolute top-full left-0 z-50 mt-1 w-72 rounded-md border shadow-lg">
          <div className="border-border border-b p-2">
            <Input
              size="sm"
              autoFocus
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('common.search')}
              leftIcon={<SearchIcon size={13} />}
            />
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            {isLoading ? (
              <div className="flex justify-center py-3">
                <Spinner className="text-fg-muted size-4" />
              </div>
            ) : options.length === 0 ? (
              <p className="text-fg-muted px-3 py-2 text-xs">
                {t('common.noData')}
              </p>
            ) : (
              options.map((option) => {
                const checked = selectedIds.includes(Number(option.value));
                return (
                  <label
                    key={option.value}
                    className="hover:bg-surface-hover flex cursor-pointer items-center gap-2.5 px-3 py-2 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(option)}
                      className="accent-primary size-3.5"
                    />
                    <span className="text-fg flex-1 truncate text-xs">
                      {option.label}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
