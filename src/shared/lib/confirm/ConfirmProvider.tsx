import { useCallback, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@shared/ui/Modal';
import { Button } from '@shared/ui/Button';
import { ConfirmContext } from './context';
import type { ConfirmOptions } from './context';

type PendingConfirm = Required<
  Pick<ConfirmOptions, 'title' | 'confirmLabel' | 'cancelLabel' | 'variant'>
> &
  Pick<ConfirmOptions, 'description'>;

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  const resolveRef = useRef<(result: boolean) => void>(null);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        resolveRef.current = resolve;
        setPending({
          title: options.title,
          description: options.description,
          confirmLabel: options.confirmLabel ?? t('common.delete'),
          cancelLabel: options.cancelLabel ?? t('common.cancel'),
          variant: options.variant ?? 'danger',
        });
      }),
    [t],
  );

  const settle = (result: boolean) => {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setPending(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        isOpen={pending !== null}
        onClose={() => settle(false)}
        title={pending?.title}
      >
        {pending && (
          <div className="flex flex-col gap-4">
            {pending.description && (
              <div className="text-fg-muted text-sm">{pending.description}</div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => settle(false)}>
                {pending.cancelLabel}
              </Button>
              <Button
                variant={pending.variant === 'danger' ? 'danger' : 'primary'}
                onClick={() => settle(true)}
              >
                {pending.confirmLabel}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </ConfirmContext.Provider>
  );
}
