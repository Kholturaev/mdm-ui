// Centralised route strings — never hardcode paths in components.
// All values are the corrected 4-group structure defined in Phase 1, Part 2.

export const ROUTES = {
  ROOT: '/',
  DASHBOARD: '/dashboard',

  // ── CATALOG ──────────────────────────────────────────────────────────────
  PRODUCTS:           '/products',
  PRODUCTS_DETAIL:    '/products/:id',
  CHARACTERISTICS:    '/characteristics',
  CLASSIFICATION:     '/classification',

  // ── COMMERCIAL ───────────────────────────────────────────────────────────
  PRICING:                 '/pricing',
  PRICING_CURRENCIES:      '/pricing/currencies',
  PARTNERS_CLIENT_TYPES:   '/partners/client-types',
  PARTNERS_SEGMENTS:       '/partners/segments',
  PARTNERS_DISCOUNTS:      '/partners/discounts',

  // ── OPERATIONS ───────────────────────────────────────────────────────────
  INTEGRATIONS:            '/integrations',
  INTEGRATIONS_DETAIL:     '/integrations/:id',
  PARTNERS_DEALERS:        '/partners/dealers',
  PARTNERS_DEALERS_DETAIL: '/partners/dealers/:id',
  GEOGRAPHY:               '/geography',
  IMPORT:                  '/import',

  // ── ADMINISTRATION ───────────────────────────────────────────────────────
  USERS:                   '/users',
  USERS_DETAIL:            '/users/:id',
  AUDIT_SESSIONS:          '/audit/sessions',
  AUDIT_SESSIONS_DETAIL:   '/audit/sessions/:id',
  AUDIT_CHANGES:           '/audit/changes',
  HEALTH:                  '/health',
  SETTINGS:                '/settings',

  // ── META ─────────────────────────────────────────────────────────────────
  FORBIDDEN: '/forbidden',
} as const;

export type RouteValue = (typeof ROUTES)[keyof typeof ROUTES];
