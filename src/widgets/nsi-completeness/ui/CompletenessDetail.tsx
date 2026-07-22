import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useCompletenessSummary } from '@entities/nsi-analytics/api/useCompleteness';
import { scoreTextClass } from '@entities/nsi-analytics/lib/scoreColor';
import { Card } from '@shared/ui/Card';
import { Tabs } from '@shared/ui/Tabs';
import type { TabItem } from '@shared/ui/Tabs';
import { LoadingBar } from '@shared/ui/LoadingBar';
import { ArrowLeftIcon } from '@shared/ui/icons/ArrowLeftIcon';
import { ChecklistIcon } from '@shared/ui/icons/ChecklistIcon';
import { LayersIcon } from '@shared/ui/icons/LayersIcon';
import { ShareIcon } from '@shared/ui/icons/ShareIcon';
import { TrendingUpIcon } from '@shared/ui/icons/TrendingUpIcon';
import { FieldCompletenessSection } from './FieldCompletenessSection';
import { GroupCompletenessSection } from './GroupCompletenessSection';
import { SourceSystemCompletenessSection } from './SourceSystemCompletenessSection';
import { CompletenessTrendSection } from './CompletenessTrendSection';
import { IncompleteProductsTable } from './IncompleteProductsTable';

type TabKey = 'byField' | 'byGroup' | 'bySourceSystem' | 'trend';

export function CompletenessDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>('byField');
  const { data, isFetching } = useCompletenessSummary();

  const tabs: TabItem[] = [
    {
      key: 'byField',
      label: t('nsiAnalytics.completenessDetail.byField.title'),
      icon: <ChecklistIcon size={14} />,
    },
    {
      key: 'byGroup',
      label: t('nsiAnalytics.completenessDetail.byGroup.title'),
      icon: <LayersIcon size={14} />,
    },
    {
      key: 'bySourceSystem',
      label: t('nsiAnalytics.completenessDetail.bySourceSystem.title'),
      icon: <ShareIcon size={14} />,
    },
    {
      key: 'trend',
      label: t('nsiAnalytics.completenessDetail.trend.title'),
      icon: <TrendingUpIcon size={14} />,
    },
  ];

  return (
    <div className="relative flex h-full flex-col overflow-y-auto">
      {isFetching && <LoadingBar />}

      <div className="flex flex-col gap-5 p-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/nsi-analytics')}
            aria-label={t('nsiAnalytics.backToHub')}
            className="border-border bg-surface text-fg-muted hover:bg-surface-hover hover:text-fg flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors"
          >
            <ArrowLeftIcon size={16} />
          </button>
          <div>
            <h1 className="text-fg text-xl font-semibold">
              {t('nsiAnalytics.completenessDetail.title')}
            </h1>
            <p className="text-fg-muted mt-0.5 text-sm">
              {t('nsiAnalytics.completenessDetail.subtitle')}
            </p>
          </div>
        </div>

        {data && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="flex flex-col gap-1">
              <span className="text-fg-muted text-xs font-medium tracking-wide uppercase">
                {t('nsiAnalytics.completenessDetail.stats.overallScore')}
              </span>
              <span
                className={`text-2xl font-semibold tabular-nums ${scoreTextClass(data.overallScore)}`}
              >
                {data.overallScore}%
              </span>
            </Card>
            <Card className="flex flex-col gap-1">
              <span className="text-fg-muted text-xs font-medium tracking-wide uppercase">
                {t('nsiAnalytics.completeness.fullComplete')}
              </span>
              <span className="text-fg text-2xl font-semibold tabular-nums">
                {data.fullComplete}
              </span>
            </Card>
            <Card className="flex flex-col gap-1">
              <span className="text-fg-muted text-xs font-medium tracking-wide uppercase">
                {t('nsiAnalytics.completeness.incomplete')}
              </span>
              <span className="text-danger text-2xl font-semibold tabular-nums">
                {data.incomplete}
              </span>
            </Card>
          </div>
        )}

        <Tabs
          items={tabs}
          value={tab}
          onChange={(key) => setTab(key as TabKey)}
        />

        {tab === 'byField' && <FieldCompletenessSection />}
        {tab === 'byGroup' && <GroupCompletenessSection />}
        {tab === 'bySourceSystem' && <SourceSystemCompletenessSection />}
        {tab === 'trend' && <CompletenessTrendSection />}

        <IncompleteProductsTable />
      </div>
    </div>
  );
}
