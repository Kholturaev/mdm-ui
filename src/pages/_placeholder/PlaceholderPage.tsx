// Reusable Phase-2 placeholder — every out-of-scope route renders this
// so no nav link is ever dead (AGENTS.md scope discipline rule).

import { useTranslation } from 'react-i18next';

interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  const { t } = useTranslation();
  return (
    <div
      style={{
        padding: 'var(--layout-page-padding)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      <h1
        style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 'var(--font-bold)' as React.CSSProperties['fontWeight'],
          color: 'var(--text-primary)',
          lineHeight: 'var(--leading-tight)',
          margin: 0,
        }}
      >
        {title}
      </h1>
      <p
        style={{
          fontSize: 'var(--text-base)',
          color: 'var(--text-secondary)',
          margin: 0,
        }}
      >
        {t('placeholder.phase2')}
      </p>
      <p
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-disabled)',
          margin: 0,
        }}
      >
        {t('placeholder.comingSoon')}
      </p>
    </div>
  );
}
