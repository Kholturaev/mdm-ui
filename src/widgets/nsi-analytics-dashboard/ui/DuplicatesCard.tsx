import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { DuplicatesResponse } from '@entities/nsi-analytics/model/types';
import { Card, CardHeader } from '@shared/ui/Card';
import { CopyStackIcon } from '@shared/ui/icons/CopyStackIcon';
import { ArrowRightIcon } from '@shared/ui/icons/ArrowRightIcon';

type DuplicatesCardProps = {
  duplicates: Pick<DuplicatesResponse, 'totalGroups' | 'affectedProducts'>;
};

export function DuplicatesCard({ duplicates }: DuplicatesCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="flex flex-col">
      <CardHeader
        title={t('nsiAnalytics.duplicates.title')}
        subtitle={t('nsiAnalytics.duplicates.subtitle')}
        icon={<CopyStackIcon size={16} />}
      />

      <div className="flex flex-1 flex-col justify-center gap-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-warning text-2xl font-semibold tabular-nums">
            {duplicates.totalGroups}
          </span>
          <span className="text-fg-muted text-sm">
            {t('nsiAnalytics.duplicates.groupsLabel')}
          </span>
        </div>
        {/* Plain sentence connecting the two numbers, instead of two bare
            stats side by side — a reader shouldn't have to guess how
            "groups" and "affected products" relate to each other. */}
        <p className="text-fg-muted text-xs">
          {t('nsiAnalytics.duplicates.explanation', {
            count: duplicates.affectedProducts,
          })}
        </p>
      </div>

      <Link
        to="/nsi-analytics/duplicates"
        className="text-primary mt-3 flex items-center gap-1 self-start text-xs font-semibold"
      >
        {t('nsiAnalytics.viewDetails')}
        <ArrowRightIcon size={12} />
      </Link>
    </Card>
  );
}
