import { useTranslation } from 'react-i18next';
import { Badge } from '@shared/ui/Badge';
import { ClockIcon } from '@shared/ui/icons/ClockIcon';

type ComingSoonTabProps = {
  entityLabel: string;
};

/** Shown for entity types with no analytics yet — an honest, user-facing placeholder rather than an empty/broken-looking tab (no implementation-detail wording). */
export function ComingSoonTab({ entityLabel }: ComingSoonTabProps) {
  const { t } = useTranslation();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 overflow-y-auto p-6 text-center">
      <span className="bg-warning/10 text-warning flex size-12 items-center justify-center rounded-full">
        <ClockIcon size={22} />
      </span>
      <Badge variant="warning">{t('nsiAnalytics.comingSoon.badge')}</Badge>
      <h2 className="text-fg text-lg font-semibold">
        {t('nsiAnalytics.comingSoon.title', { entity: entityLabel })}
      </h2>
      <p className="text-fg-muted max-w-md text-sm">
        {t('nsiAnalytics.comingSoon.description')}
      </p>
    </div>
  );
}
