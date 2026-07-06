import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@shared/lib/cn';
import { CloseIcon } from '../icons/ChevronDownIcon';

type ModalSize = 'md' | 'lg';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  /** `md` (default) matches the original max-w-lg dialog; `lg` widens it for content like a field-diff timeline. */
  size?: ModalSize;
};

const SIZE_CLASSES: Record<ModalSize, string> = {
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: ModalProps) {
  if (!isOpen) return null;

  const portalRoot = document.getElementById('portal-root') ?? document.body;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'bg-surface flex max-h-[85vh] w-full flex-col rounded-lg p-5 shadow-xl',
          SIZE_CLASSES[size],
        )}
      >
        <div className="mb-4 flex shrink-0 items-start justify-between gap-3">
          {title && (
            <div className="text-fg min-w-0 text-base font-semibold">
              {title}
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="border-border bg-surface text-fg-muted hover:bg-surface-hover hover:text-fg ml-auto flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors"
          >
            <CloseIcon size={16} />
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto">{children}</div>
      </div>
    </div>,
    portalRoot,
  );
}
