import { useTranslation } from 'react-i18next';
import { AuditDashboard } from '@widgets/audit-dashboard/ui/AuditDashboard';
import { usePageTitle } from '@shared/lib/pageTitle';

export function AuditPage() {
  const { t } = useTranslation();
  usePageTitle(t('audit.title'));

  return (
    <div className="h-full">
      <AuditDashboard />
    </div>
  );
}
