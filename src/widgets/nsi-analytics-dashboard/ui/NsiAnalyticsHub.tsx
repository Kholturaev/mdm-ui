import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs } from '@shared/ui/Tabs';
import type { TabItem } from '@shared/ui/Tabs';
import { NsiAnalyticsDashboard } from './NsiAnalyticsDashboard';
import { OverviewTab } from './OverviewTab';
import { ComingSoonTab } from './ComingSoonTab';

const TAB_KEYS = [
  'overview',
  'nomenclature',
  'dealers',
  'characteristics',
  'prices',
  'productGroups',
] as const;

type TabKey = (typeof TAB_KEYS)[number];

export function NsiAnalyticsHub() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<TabKey>('overview');

  const tabs: TabItem[] = TAB_KEYS.map((key) => ({
    key,
    label: t(`nsiAnalytics.tabs.${key}`),
  }));

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-1 p-6 pb-0">
        <h1 className="text-fg text-xl font-semibold">
          {t('nsiAnalytics.title')}
        </h1>
        <p className="text-fg-muted text-sm">{t('nsiAnalytics.subtitle')}</p>
      </div>

      <div className="px-6 pt-4">
        <Tabs
          items={tabs}
          value={tab}
          onChange={(key) => setTab(key as TabKey)}
        />
      </div>

      <div className="min-h-0 flex-1">
        {tab === 'overview' && <OverviewTab />}
        {tab === 'nomenclature' && <NsiAnalyticsDashboard />}
        {tab === 'dealers' && (
          <ComingSoonTab entityLabel={t('nsiAnalytics.tabs.dealers')} />
        )}
        {tab === 'characteristics' && (
          <ComingSoonTab entityLabel={t('nsiAnalytics.tabs.characteristics')} />
        )}
        {tab === 'prices' && (
          <ComingSoonTab entityLabel={t('nsiAnalytics.tabs.prices')} />
        )}
        {tab === 'productGroups' && (
          <ComingSoonTab entityLabel={t('nsiAnalytics.tabs.productGroups')} />
        )}
      </div>
    </div>
  );
}
