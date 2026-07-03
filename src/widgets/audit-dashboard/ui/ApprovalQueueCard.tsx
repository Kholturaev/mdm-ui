import { useTranslation } from 'react-i18next';
import { useApprovalQueue } from '@entities/audit/api/approvalApi';
import { Card, CardHeader } from '@shared/ui/Card';
import { Avatar } from '@shared/ui/Avatar';
import { Button } from '@shared/ui/Button';
import { ClockIcon } from '@shared/ui/icons/ClockIcon';
import { CheckIcon } from '@shared/ui/icons/CheckIcon';
import { CheckCircleIcon } from '@shared/ui/icons/CheckCircleIcon';
import { formatRelativeTime } from '@shared/lib/formatDate';

export function ApprovalQueueCard() {
  const { t, i18n } = useTranslation();
  const { approvals, approve, reject } = useApprovalQueue();

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title={t('audit.approvals.title')}
        icon={<ClockIcon size={16} />}
      />

      {approvals.length === 0 ? (
        <div className="text-fg-muted flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center text-sm">
          <CheckCircleIcon size={22} />
          {t('audit.approvals.empty')}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {approvals.map((item) => (
            <div key={item.id} className="border-border rounded-md border p-3">
              <div className="flex items-start gap-2.5">
                <Avatar name={item.requestedBy.fullName} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-fg text-sm font-medium">
                    {item.requestedBy.fullName}
                  </p>
                  <p className="text-fg-muted text-xs">
                    {t(`audit.approvals.kind.${item.kind}`)} ·{' '}
                    {formatRelativeTime(item.createdAt, i18n.language)}
                  </p>
                </div>
              </div>
              <p className="text-fg mt-2 text-sm">
                {item.recordName}
                {item.fieldChanges && item.fieldChanges.length > 0 && (
                  <span className="text-fg-muted">
                    {' '}
                    {item.fieldChanges[0].oldValue} →{' '}
                    {item.fieldChanges[0].newValue}
                  </span>
                )}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Button
                  size="sm"
                  fullWidth
                  icon={<CheckIcon size={13} />}
                  className="bg-success text-fg-invert hover:bg-success"
                  onClick={() => approve(item.id)}
                >
                  {t('audit.approvals.approve')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  fullWidth
                  onClick={() => reject(item.id)}
                >
                  {t('audit.approvals.reject')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
