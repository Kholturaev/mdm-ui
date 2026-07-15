import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useClickOutside } from '@shared/lib/hooks/useClickOutside';
import { ExcelImportIcon } from '@shared/ui/icons/ExcelImportIcon';
import { TableIcon } from '@shared/ui/icons/TableIcon';
import { LinkIcon } from '@shared/ui/icons/LinkIcon';

type DynamicTableImportMenuProps = {
  onImportRows: () => void;
  onLinkProducts: () => void;
};

type MenuPosition = { top: number; right: number };

/**
 * Two distinct Excel-import flows live behind one trigger: bulk row import
 * (creates rows) and product-link import (links existing products to
 * existing rows — requires rows to already exist). Rendered as a single
 * row-action icon (matching the table list's edit/delete icon buttons)
 * rather than a labeled button, since it lives in that same actions cell.
 */
export function DynamicTableImportMenu({
  onImportRows,
  onLinkProducts,
}: DynamicTableImportMenuProps) {
  const { t } = useTranslation();
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isOpen = position !== null;

  useClickOutside([containerRef, menuRef], () => setPosition(null));

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
    <div ref={containerRef} className="inline-block shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          toggle();
        }}
        aria-label={t('dynamicCharacteristic.import.buttonLabel')}
        title={t('dynamicCharacteristic.import.buttonLabel')}
        className="text-fg-muted hover:bg-surface-hover hover:text-fg flex size-7 shrink-0 items-center justify-center transition-colors"
      >
        <ExcelImportIcon size={14} />
      </button>

      {isOpen &&
        position &&
        createPortal(
          <div
            ref={menuRef}
            style={{ top: position.top, right: position.right }}
            className="border-border bg-surface fixed z-100 w-80 rounded border py-1 shadow-lg"
          >
            <button
              type="button"
              onClick={() => {
                setPosition(null);
                onImportRows();
              }}
              className="hover:bg-surface-hover flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors"
            >
              <span className="text-fg-muted mt-0.5 shrink-0">
                <TableIcon size={15} />
              </span>
              <span className="min-w-0">
                <span className="text-fg block text-sm font-medium">
                  {t('dynamicCharacteristic.import.rowsLabel')}
                </span>
                <span className="text-fg-muted mt-0.5 block text-xs leading-snug">
                  {t('dynamicCharacteristic.import.rowsHint')}
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPosition(null);
                onLinkProducts();
              }}
              className="hover:bg-surface-hover flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors"
            >
              <span className="text-fg-muted mt-0.5 shrink-0">
                <LinkIcon size={15} />
              </span>
              <span className="min-w-0">
                <span className="text-fg block text-sm font-medium">
                  {t('dynamicCharacteristic.import.linkProductsLabel')}
                </span>
                <span className="text-fg-muted mt-0.5 block text-xs leading-snug">
                  {t('dynamicCharacteristic.import.linkProductsHint')}
                </span>
              </span>
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}
