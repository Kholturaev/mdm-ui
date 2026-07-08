import { useTranslation } from 'react-i18next';
import { Modal } from '@shared/ui/Modal';
import { RecordHistoryTimeline } from './RecordHistoryTimeline';

type RecordHistoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Backend audit table name, e.g. `product`. */
  tableName: string;
  recordId: number;
  recordTitle: string;
  recordCode?: string;
};

export function RecordHistoryModal({
  isOpen,
  onClose,
  tableName,
  recordId,
  recordTitle,
  recordCode,
}: RecordHistoryModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div>
          <p className="text-fg-muted text-xs font-normal">
            {t('audit.recordHistory.title')} · #{recordId}
          </p>
          <h2 className="text-fg text-base font-semibold">{recordTitle}</h2>
          {recordCode && (
            <p className="text-fg-muted mt-1 text-xs font-normal">
              {recordCode} · {tableName}
            </p>
          )}
        </div>
      }
    >
      <RecordHistoryTimeline
        tableName={tableName}
        recordId={recordId}
        skip={!isOpen}
      />
    </Modal>
  );
}
