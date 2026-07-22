import { useTranslation } from 'react-i18next';
import { useCompletenessByField } from '@entities/nsi-analytics/api/useCompleteness';
import { Card, CardHeader } from '@shared/ui/Card';
import { Progress } from '@shared/ui/Progress';
import { ChecklistIcon } from '@shared/ui/icons/ChecklistIcon';

export function FieldCompletenessSection() {
  const { t } = useTranslation();
  const { data, isLoading } = useCompletenessByField();

  return (
    <Card>
      <CardHeader
        title={t('nsiAnalytics.completenessDetail.byField.title')}
        icon={<ChecklistIcon size={16} />}
      />

      {isLoading || !data ? (
        <div className="text-fg-muted py-8 text-center text-sm">
          {t('common.loading')}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {data.fields.map((field) => (
            <div key={field.field} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-fg font-medium">
                  {t(`nsiAnalytics.completenessDetail.field.${field.field}`, {
                    defaultValue: field.field,
                  })}
                </span>
                <span className="text-fg-muted tabular-nums">
                  {t('nsiAnalytics.completenessDetail.byField.missingCount', {
                    count: field.missingCount,
                    percent: field.missingPercent,
                  })}
                </span>
              </div>
              <Progress
                size="sm"
                max={100}
                segments={[
                  {
                    value: field.missingPercent,
                    className:
                      field.missingPercent > 20 ? 'bg-danger' : 'bg-warning',
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
