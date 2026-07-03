import { useTranslation } from 'react-i18next';
import { AuditLogTable } from '@widgets/audit-log/ui/AuditLogTable';
import { usePageTitle } from '@shared/lib/pageTitle';

export function AuditLogPage() {
  const { t } = useTranslation();
  usePageTitle(t('audit.logTitle'));

  return (
    <div className="h-full">
      <AuditLogTable />
    </div>
  );
}
