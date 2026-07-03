import { useTranslation } from 'react-i18next';
import type { AuditEntry } from '@entities/audit/model/types';
import { auditFeedParams } from '@entities/audit/lib/actionMeta';
import { Modal } from '@shared/ui/Modal';

type AuditChangesModalProps = {
  entry: AuditEntry | null;
  onClose: () => void;
};

export function AuditChangesModal({ entry, onClose }: AuditChangesModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={entry != null}
      onClose={onClose}
      title={t('audit.changesModalTitle')}
    >
      {entry && (
        <div className="flex flex-col gap-3">
          <p className="text-fg text-sm">
            {t(`audit.feed.${entry.description}`, auditFeedParams(entry))}
          </p>
          {entry.fieldChanges.length === 0 ? (
            <p className="text-fg-muted text-sm">{t('audit.noChanges')}</p>
          ) : (
            <table className="text-sm">
              <thead>
                <tr className="text-fg-muted text-xs">
                  <th className="pr-4 pb-2 text-left font-medium">
                    {t('audit.columns.field')}
                  </th>
                  <th className="pr-4 pb-2 text-left font-medium">
                    {t('audit.columns.oldValue')}
                  </th>
                  <th className="pb-2 text-left font-medium">
                    {t('audit.columns.newValue')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {entry.fieldChanges.map((change) => (
                  <tr key={change.fieldName}>
                    <td className="text-fg py-1.5 pr-4 font-medium">
                      {change.fieldName}
                    </td>
                    <td className="text-fg-muted py-1.5 pr-4">
                      {change.oldValue ?? '—'}
                    </td>
                    <td className="text-fg py-1.5">{change.newValue ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {entry.reason && (
            <p className="text-fg-muted text-sm">
              <span className="font-medium">{t('audit.reason')}:</span>{' '}
              {entry.reason}
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}
