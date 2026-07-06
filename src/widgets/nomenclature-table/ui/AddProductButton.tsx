import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useClickOutside } from '@shared/lib/hooks/useClickOutside';
import { cn } from '@shared/lib/cn';
import { PlusIcon } from '@shared/ui/icons/PlusIcon';
import { ChevronDownIcon } from '@shared/ui/icons/ChevronDownIcon';
import { DocumentIcon } from '@shared/ui/icons/DocumentIcon';
import { DownloadIcon } from '@shared/ui/icons/DownloadIcon';

type AddProductButtonProps = {
  onCreateOneByOne: () => void;
};

type MenuPosition = { top: number; right: number };

/** Primary "add product" action with an attached dropdown for alternate creation methods (currently just one-by-one; Excel import is a placeholder until that endpoint is wired up). Clicking the main segment goes straight to one-by-one create. */
export function AddProductButton({ onCreateOneByOne }: AddProductButtonProps) {
  const { t } = useTranslation();
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isOpen = position !== null;

  useClickOutside([containerRef, menuRef], () => setPosition(null));

  const toggle = () => {
    if (isOpen) {
      setPosition(null);
      return;
    }
    const rect = chevronRef.current?.getBoundingClientRect();
    if (rect) {
      setPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="bg-primary text-primary-foreground divide-primary-foreground/20 flex h-8 w-fit shrink-0 items-stretch divide-x overflow-hidden rounded"
    >
      <button
        type="button"
        onClick={onCreateOneByOne}
        className="hover:bg-primary-hover flex items-center gap-1.5 px-3 text-xs font-medium transition-colors"
      >
        <PlusIcon size={15} />
        {t('product.addProduct')}
      </button>
      <button
        ref={chevronRef}
        type="button"
        onClick={toggle}
        aria-label={t('product.moreCreateOptions')}
        className="hover:bg-primary-hover flex items-center justify-center px-2 transition-colors"
      >
        <ChevronDownIcon size={14} />
      </button>

      {isOpen &&
        position &&
        createPortal(
          <div
            ref={menuRef}
            style={{ top: position.top, right: position.right }}
            className="border-border bg-surface fixed z-100 w-60 rounded border py-1 shadow-lg"
          >
            <button
              type="button"
              onClick={() => {
                setPosition(null);
                onCreateOneByOne();
              }}
              className={cn(
                'hover:bg-surface-hover text-fg flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
              )}
            >
              <DocumentIcon size={14} />
              {t('product.addOneByOne')}
            </button>
            <div
              className="text-fg-muted flex w-full cursor-not-allowed items-center gap-2 px-3 py-2 text-left text-sm opacity-50"
              title={t('common.comingSoon')}
            >
              <DownloadIcon size={14} />
              <span className="flex-1">{t('product.importExcel')}</span>
              <span className="text-[10px]">{t('common.comingSoon')}</span>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
