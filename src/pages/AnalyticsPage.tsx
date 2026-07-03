import { useTranslation } from 'react-i18next';
import { AnalyticsDashboard } from '@widgets/analytics-dashboard/ui/AnalyticsDashboard';
import { usePageTitle } from '@shared/lib/pageTitle';

export function AnalyticsPage() {
  const { t } = useTranslation();
  usePageTitle(t('analytics.title'));

  return (
    <div className="h-full">
      <AnalyticsDashboard />
    </div>
  );
}
