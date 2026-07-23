import { useTranslation } from 'react-i18next';
import type { CoverageResponse } from '@entities/analytics/model/dashboardKpisTypes';
import { Card } from '@shared/ui/Card';
import { TableIcon } from '@shared/ui/icons/TableIcon';

type CoverageMatrixProps = {
  coverage: CoverageResponse;
};

/** Entity types with no real per-system sync-coverage data yet — every cell in these rows is a placeholder. */
const PENDING_ENTITY_KEYS = [
  'dealers',
  'characteristics',
  'prices',
  'productGroups',
] as const;

type EntityKey = 'nomenclature' | (typeof PENDING_ENTITY_KEYS)[number];

/** Systems that structurally never handle a given entity type — confirmed with the user, not derived from API data. */
const NOT_ACCEPTED: Record<EntityKey, string[]> = {
  nomenclature: ['Akfa SMART'],
  dealers: ['Online savdo', 'Local online savdo'],
  characteristics: ['Akfa dealer web', 'Local dealer web'],
  prices: ['Akfa SMART'],
  productGroups: ['Akfa dealer web', 'Local online savdo'],
};

function coveragePercentClass(percent: number): string {
  return percent > 0 ? 'text-warning' : 'text-danger';
}

function NotAcceptedCell({ label }: { label: string }) {
  return (
    <td className="bg-fg/3 px-3 py-3 text-center">
      <div className="text-fg-muted text-sm font-semibold">—</div>
      <div className="text-fg-muted text-xs">{label}</div>
    </td>
  );
}

export function CoverageMatrix({ coverage }: CoverageMatrixProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <div className="mb-1 flex items-center gap-2">
        <span className="text-fg-muted">
          <TableIcon size={16} />
        </span>
        <h3 className="text-fg text-base font-semibold">
          {t('nsiAnalytics.overview.matrixTitle')}
        </h3>
      </div>
      <p className="text-fg-muted mb-4 text-sm">
        {t('nsiAnalytics.overview.matrixSubtitle')}
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-border border-b">
              <th className="text-fg-muted px-3 py-2 text-xs font-medium tracking-wide uppercase">
                {t('nsiAnalytics.overview.entityColumn')}
              </th>
              {coverage.systems.map((system) => (
                <th
                  key={system.externalSystemId}
                  className="text-fg-muted px-3 py-2 text-xs font-medium whitespace-nowrap"
                >
                  {system.systemName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            <tr>
              <td className="text-fg px-3 py-3 text-sm font-medium whitespace-nowrap">
                {t('nsiAnalytics.overview.entity.nomenclature')}
              </td>
              {coverage.systems.map((system) =>
                NOT_ACCEPTED.nomenclature.includes(system.systemName) ? (
                  <NotAcceptedCell
                    key={system.externalSystemId}
                    label={t('nsiAnalytics.overview.notAccepted')}
                  />
                ) : (
                  <td
                    key={system.externalSystemId}
                    className="px-3 py-3 text-center"
                  >
                    <div
                      className={`text-sm font-semibold tabular-nums ${coveragePercentClass(system.coveragePercent)}`}
                    >
                      {system.coveragePercent.toFixed(2)}%
                    </div>
                    <div className="text-fg-muted text-xs tabular-nums">
                      {system.syncedProductCount}/
                      {coverage.totalProducts.toLocaleString('en-US')}
                    </div>
                  </td>
                ),
              )}
            </tr>
            {PENDING_ENTITY_KEYS.map((key) => (
              <tr key={key}>
                <td className="text-fg px-3 py-3 text-sm font-medium whitespace-nowrap">
                  {t(`nsiAnalytics.overview.entity.${key}`)}
                </td>
                {coverage.systems.map((system) =>
                  NOT_ACCEPTED[key].includes(system.systemName) ? (
                    <NotAcceptedCell
                      key={system.externalSystemId}
                      label={t('nsiAnalytics.overview.notAccepted')}
                    />
                  ) : (
                    <td
                      key={system.externalSystemId}
                      className="px-3 py-3 text-center"
                    >
                      <div className="bg-warning/10 text-warning inline-block rounded-md px-3 py-1 text-sm font-medium">
                        {t('nsiAnalytics.overview.pending')}
                      </div>
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
