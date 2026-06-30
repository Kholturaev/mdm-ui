import React from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../shared/constants/routes';

export function ForbiddenPage() {
  const { t } = useTranslation();
  return (
    <div
      style={{
        padding: 'var(--layout-page-padding)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        alignItems: 'flex-start',
      }}
    >
      <h1
        style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 'var(--font-bold)' as React.CSSProperties['fontWeight'],
          color: 'var(--color-error-700)',
          margin: 0,
        }}
      >
        {t('forbidden.title')}
      </h1>
      <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', margin: 0 }}>
        {t('forbidden.message')}
      </p>
      <Link
        to={ROUTES.DASHBOARD}
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-link)',
          textDecoration: 'underline',
        }}
      >
        {t('forbidden.back')}
      </Link>
    </div>
  );
}
