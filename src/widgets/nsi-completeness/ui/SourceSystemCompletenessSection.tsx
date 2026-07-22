import { useTranslation } from 'react-i18next';
import { useCompletenessBySourceSystem } from '@entities/nsi-analytics/api/useCompleteness';
import { scoreTextClass } from '@entities/nsi-analytics/lib/scoreColor';
import { Card, CardHeader } from '@shared/ui/Card';
import { Progress } from '@shared/ui/Progress';
import { ShareIcon } from '@shared/ui/icons/ShareIcon';

export function SourceSystemCompletenessSection() {
  const { t } = useTranslation();
  const { data, isLoading } = useCompletenessBySourceSystem();

  return (
    <Card>
      <CardHeader
        title={t('nsiAnalytics.completenessDetail.bySourceSystem.title')}
        subtitle={t('nsiAnalytics.completenessDetail.bySourceSystem.subtitle')}
        icon={<ShareIcon size={16} />}
      />

      {isLoading || !data ? (
        <div className="text-fg-muted py-8 text-center text-sm">
          {t('common.loading')}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {data.map((system) => (
            <div key={system.externalSystemId} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-fg font-medium">{system.systemName}</span>
                <span className="text-fg-muted tabular-nums">
                  <span className={scoreTextClass(system.avgScore)}>
                    {system.avgScore}%
                  </span>
                  {' · '}
                  {t('nsiAnalytics.completenessDetail.byGroup.productCount', {
                    count: system.productCount,
                  })}
                </span>
              </div>
              <Progress
                size="sm"
                max={100}
                segments={[
                  {
                    value: system.avgScore,
                    className:
                      system.avgScore >= 80
                        ? 'bg-success'
                        : system.avgScore >= 50
                          ? 'bg-warning'
                          : 'bg-danger',
                  },
                ]}
              />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
