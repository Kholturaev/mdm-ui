// ProductsListPage — /products
// Client-side filtered table of AKFA products with external coverage indicators.
// Data source: MOCK_PRODUCTS + EXTERNAL_SYSTEMS (src/shared/mocks/index.mock.ts).
// No API calls.
//
// TODO Phase 2: replace mock data with RTK Query endpoint GET /products
// TODO Phase 2: add server-side pagination and sort
// TODO Phase 2: persist filter state in URL search params

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from '../../shared/ui/StatusBadge';
import {
  MOCK_PRODUCTS,
  EXTERNAL_SYSTEMS,
  type MockProduct,
  type CoverageState,
} from '../../shared/mocks/index.mock';

// ── Coverage mini-badge ────────────────────────────────────────────────────────
// Renders icon + code — never color alone (a11y requirement from AGENTS.md).

interface CovStyle {
  color: string;
  bg: string;
  border: string;
  icon: string;
}

const COV_STYLES: Record<CoverageState, CovStyle> = {
  SYNCED:  { color: 'var(--badge-active-text)',  bg: 'var(--badge-active-bg)',  border: 'var(--badge-active-border)',  icon: '✓' },
  MISSING: { color: 'var(--text-disabled)',       bg: 'var(--color-neutral-100)', border: 'var(--border-subtle)',       icon: '—' },
  // BACKEND-NEEDED: PENDING and FAILED states are mock-only until mapping.status is real.
  PENDING: { color: 'var(--badge-info-text)',    bg: 'var(--badge-info-bg)',    border: 'var(--badge-info-border)',    icon: '◷' },
  FAILED:  { color: 'var(--badge-error-text)',   bg: 'var(--badge-error-bg)',   border: 'var(--badge-error-border)',   icon: '✕' },
};

function CoverageCell({ state, code }: { state: CoverageState; code: string }) {
  const { t } = useTranslation();
  const s = COV_STYLES[state];
  return (
    <span
      title={`${code}: ${t(`common.status.${state}`)}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--font-medium)' as React.CSSProperties['fontWeight'],
        color: s.color,
        backgroundColor: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: 'var(--radius-sm)',
        padding: '1px 4px',
        whiteSpace: 'nowrap',
      }}
    >
      <span aria-hidden="true">{s.icon}</span>
      {code}
    </span>
  );
}

// ── Helper ─────────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// ── Column keys ────────────────────────────────────────────────────────────────

const COLUMNS = ['name', 'sapCode', 'status', 'type', 'group', 'nomenclatureType', 'coverage', 'updatedAt', 'actions'] as const;
type ColKey = typeof COLUMNS[number];

// ── ProductsListPage ───────────────────────────────────────────────────────────

export function ProductsListPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterMissingSystem, setFilterMissingSystem] = useState('');

  const filtered = useMemo<MockProduct[]>(() => {
    const q = search.trim().toLowerCase();
    return MOCK_PRODUCTS.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q) && !p.sapCode.toLowerCase().includes(q)) return false;
      if (filterStatus && p.status !== filterStatus) return false;
      if (filterType && p.productType !== filterType) return false;
      if (filterMissingSystem) {
        const sysId = parseInt(filterMissingSystem, 10);
        // "missing from system X" = not SYNCED in that system
        if (p.coverage[sysId] === 'SYNCED') return false;
      }
      return true;
    });
  }, [search, filterStatus, filterType, filterMissingSystem]);

  const inputStyle: React.CSSProperties = {
    fontSize: 'var(--text-sm)',
    color: 'var(--text-primary)',
    backgroundColor: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-2) var(--space-3)',
    outline: 'none',
    fontFamily: 'inherit',
    minWidth: 0,
    height: 'var(--input-height-sm)',
    boxSizing: 'border-box',
  };

  return (
    <div
      style={{
        padding: 'var(--layout-page-padding)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-5)',
        maxWidth: 'var(--layout-content-max-width)',
      }}
    >
      {/* Page title */}
      <h1
        style={{
          fontSize: 'var(--text-xl)',
          fontWeight: 'var(--font-semibold)' as React.CSSProperties['fontWeight'],
          color: 'var(--text-primary)',
          margin: 0,
          lineHeight: 'var(--leading-tight)',
        }}
      >
        {t('products.title')}
      </h1>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('products.filter.search')}
          style={{ ...inputStyle, flex: '1 1 200px' }}
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ ...inputStyle, flexShrink: 0 }}
        >
          <option value="">{t('products.filter.allStatuses')}</option>
          <option value="ACTIVE">{t('common.status.ACTIVE')}</option>
          <option value="PASSIVE">{t('common.status.PASSIVE')}</option>
          <option value="TEMPORARILY_PASSIVE">{t('common.status.TEMPORARILY_PASSIVE')}</option>
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{ ...inputStyle, flexShrink: 0 }}
        >
          <option value="">{t('products.filter.allTypes')}</option>
          <option value="FINISHED_PRODUCT">{t('products.type.FINISHED_PRODUCT')}</option>
          <option value="RAW_MATERIAL">{t('products.type.RAW_MATERIAL')}</option>
        </select>

        {/* "Missing from system X" quick filter */}
        <select
          value={filterMissingSystem}
          onChange={(e) => setFilterMissingSystem(e.target.value)}
          style={{ ...inputStyle, flexShrink: 0 }}
        >
          <option value="">{t('products.filter.anySystem')}</option>
          {EXTERNAL_SYSTEMS.map((s) => (
            <option key={s.id} value={String(s.id)}>
              {t('products.filter.missingFrom')}: {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div
        style={{
          backgroundColor: 'var(--surface-card)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-primary)',
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--border-default)',
                  backgroundColor: 'var(--table-header-bg)',
                }}
              >
                {COLUMNS.map((col) => (
                  <th
                    key={col}
                    style={{
                      padding: 'var(--space-2) var(--space-3)',
                      textAlign: col === 'actions' ? 'center' : 'left',
                      fontWeight: 'var(--font-semibold)' as React.CSSProperties['fontWeight'],
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase' as const,
                    }}
                  >
                    {t(`products.column.${col}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={COLUMNS.length}
                    style={{
                      padding: 'var(--space-8) var(--space-4)',
                      textAlign: 'center',
                      color: 'var(--text-disabled)',
                      fontSize: 'var(--text-sm)',
                    }}
                  >
                    {t('products.empty')}
                  </td>
                </tr>
              ) : (
                filtered.map((product, idx) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    isLast={idx === filtered.length - 1}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── ProductRow ────────────────────────────────────────────────────────────────

function ProductRow({ product, isLast }: { product: MockProduct; isLast: boolean }) {
  const { t } = useTranslation();
  const detailPath = `/products/${product.id}`;

  const cellStyle: React.CSSProperties = {
    padding: 'var(--space-2) var(--space-3)',
    verticalAlign: 'middle',
  };

  return (
    <tr
      style={{
        borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)',
      }}
    >
      {/* Name — link to detail */}
      <td style={{ ...cellStyle, maxWidth: 260 }}>
        <Link
          to={detailPath}
          style={{
            color: 'var(--text-link)',
            textDecoration: 'none',
            fontWeight: 'var(--font-medium)' as React.CSSProperties['fontWeight'],
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={product.name}
        >
          {product.name}
        </Link>
      </td>

      {/* SAP Code */}
      <td style={cellStyle}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
          }}
        >
          {product.sapCode}
        </span>
      </td>

      {/* Status */}
      <td style={{ ...cellStyle, whiteSpace: 'nowrap' }}>
        <StatusBadge status={product.status} size="sm" />
      </td>

      {/* Type */}
      <td style={{ ...cellStyle, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
        {t(`products.type.${product.productType}`)}
      </td>

      {/* Group */}
      <td style={{ ...cellStyle, whiteSpace: 'nowrap' }}>
        {product.group}
      </td>

      {/* Nomenclature Type */}
      <td style={{ ...cellStyle, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
        {product.nomenclatureType}
      </td>

      {/* External Coverage — one mini-badge per system */}
      <td style={cellStyle}>
        <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'nowrap' }}>
          {EXTERNAL_SYSTEMS.map((sys) => (
            <CoverageCell
              key={sys.id}
              state={product.coverage[sys.id] ?? 'MISSING'}
              code={sys.code}
            />
          ))}
        </div>
      </td>

      {/* Updated At */}
      <td style={cellStyle}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
          }}
        >
          {formatDate(product.updatedAt)}
        </span>
      </td>

      {/* Actions */}
      <td style={{ ...cellStyle, textAlign: 'center', whiteSpace: 'nowrap' }}>
        <Link
          to={detailPath}
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--text-link)',
            textDecoration: 'none',
            fontWeight: 'var(--font-medium)' as React.CSSProperties['fontWeight'],
          }}
        >
          {t('products.actions.view')}
        </Link>
      </td>
    </tr>
  );
}
