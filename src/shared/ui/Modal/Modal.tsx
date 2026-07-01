import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon } from '../icons/ChevronDownIcon';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  const portalRoot = document.getElementById('portal-root') ?? document.body;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="bg-surface w-full max-w-lg rounded-lg p-5 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          {title && (
            <h2 className="text-fg text-base font-semibold">{title}</h2>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-fg-muted hover:text-fg ml-auto"
          >
            <CloseIcon size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    portalRoot,
  );
}
