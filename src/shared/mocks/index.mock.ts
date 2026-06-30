// src/shared/mocks/index.ts
// Phase 1 mock data. Replace each export with a real RTK Query endpoint in Phase 2.
// Product names + SAP codes are real AKFA nomenclature. Coverage/audit are illustrative.
//
// BACKEND-NEEDED for real coverage: the external-mapping record must carry
//   status ('SYNCED'|'PENDING'|'FAILED'), lastSyncAt (ISO), lastError (string|null).
//   STALE is derived: product.updatedAt > mapping.lastSyncAt.
// Until those exist, only 'SYNCED' | 'MISSING' are real; 'PENDING'/'FAILED' are mock.

export type CoverageState = 'SYNCED' | 'MISSING' | 'PENDING' | 'FAILED';
export type ProductStatus = 'ACTIVE' | 'PASSIVE' | 'TEMPORARILY_PASSIVE';

export interface ExternalSystem {
  id: number;
  name: string;
  code: string;
}

export const EXTERNAL_SYSTEMS: ExternalSystem[] = [
  { id: 1, name: 'SAP ERP', code: 'SAP' },
  { id: 2, name: '1C Accounting', code: '1C' },
  { id: 3, name: 'B2B Portal', code: 'B2B' },
  { id: 4, name: 'E-Commerce', code: 'ECOM' },
  { id: 5, name: 'WMS Warehouse', code: 'WMS' },
];

export interface MockProduct {
  id: number;
  name: string;
  sapCode: string;
  gtin: string;
  status: ProductStatus;
  productType: 'RAW_MATERIAL' | 'FINISHED_PRODUCT';
  group: string;
  nomenclatureType: string;
  category: string;
  updatedAt: string; // ISO
  // coverage[systemId] -> state
  coverage: Record<number, CoverageState>;
}

const c = (sap: CoverageState, oc: CoverageState, b2b: CoverageState, ecom: CoverageState, wms: CoverageState) =>
  ({ 1: sap, 2: oc, 3: b2b, 4: ecom, 5: wms } as Record<number, CoverageState>);

export const MOCK_PRODUCTS: MockProduct[] = [
  { id: 144, name: 'AKFA Deraza 1200x1200 2-qanotli PVC', sapCode: 'SAP10001', gtin: '4780121310001', status: 'ACTIVE', productType: 'FINISHED_PRODUCT', group: 'Derazalar', nomenclatureType: 'Oyna', category: 'PVC oyna', updatedAt: '2026-06-29T14:05:00Z', coverage: c('SYNCED','SYNCED','SYNCED','SYNCED','SYNCED') },
  { id: 145, name: 'AKFA Deraza 1400x1400 3-qanotli PVC', sapCode: 'SAP10002', gtin: '4780121310002', status: 'ACTIVE', productType: 'FINISHED_PRODUCT', group: 'Derazalar', nomenclatureType: 'Oyna', category: 'PVC oyna', updatedAt: '2026-06-30T09:21:00Z', coverage: c('SYNCED','SYNCED','SYNCED','PENDING','SYNCED') },
  { id: 146, name: 'AKFA Deraza 600x900 1-qanotli PVC', sapCode: 'SAP10003', gtin: '4780121310003', status: 'ACTIVE', productType: 'FINISHED_PRODUCT', group: 'Derazalar', nomenclatureType: 'Oyna', category: 'PVC oyna', updatedAt: '2026-06-21T10:00:00Z', coverage: c('SYNCED','SYNCED','SYNCED','SYNCED','MISSING') },
  { id: 147, name: 'AKFA Deraza 1800x1400 4-qanotli PVC', sapCode: 'SAP10004', gtin: '4780121310004', status: 'ACTIVE', productType: 'FINISHED_PRODUCT', group: 'Derazalar', nomenclatureType: 'Oyna', category: 'PVC oyna', updatedAt: '2026-06-28T16:40:00Z', coverage: c('SYNCED','SYNCED','FAILED','SYNCED','SYNCED') },
  { id: 148, name: "AKFA Balkon bo'lim eshigi 2100x800", sapCode: 'SAP10005', gtin: '4780121310005', status: 'ACTIVE', productType: 'FINISHED_PRODUCT', group: 'Eshiklar', nomenclatureType: 'Eshik', category: 'Balkon eshigi', updatedAt: '2026-06-20T11:15:00Z', coverage: c('SYNCED','SYNCED','SYNCED','MISSING','SYNCED') },
  { id: 149, name: 'AKFA Kirish eshigi PVC-metal 2050x900', sapCode: 'SAP10006', gtin: '4780121310006', status: 'ACTIVE', productType: 'FINISHED_PRODUCT', group: 'Eshiklar', nomenclatureType: 'Eshik', category: 'Kirish eshigi', updatedAt: '2026-06-18T09:00:00Z', coverage: c('SYNCED','SYNCED','MISSING','MISSING','SYNCED') },
  { id: 150, name: 'AKFA Ichki eshik laminat olcha 2000x800', sapCode: 'SAP10007', gtin: '4780121310007', status: 'ACTIVE', productType: 'FINISHED_PRODUCT', group: 'Eshiklar', nomenclatureType: 'Eshik', category: 'Ichki eshik', updatedAt: '2026-06-27T13:10:00Z', coverage: c('SYNCED','FAILED','SYNCED','SYNCED','SYNCED') },
  { id: 151, name: 'AKFA Ichki eshik laminat eman 2000x700', sapCode: 'SAP10008', gtin: '4780121310008', status: 'ACTIVE', productType: 'FINISHED_PRODUCT', group: 'Eshiklar', nomenclatureType: 'Eshik', category: 'Ichki eshik', updatedAt: '2026-06-15T08:30:00Z', coverage: c('SYNCED','SYNCED','SYNCED','SYNCED','SYNCED') },
  { id: 154, name: 'AKFA PVC profil 5-kamerali oq 6m', sapCode: 'SAP10011', gtin: '4780121310011', status: 'ACTIVE', productType: 'RAW_MATERIAL', group: 'Profillar', nomenclatureType: 'Material', category: 'PVC profil', updatedAt: '2026-06-29T15:00:00Z', coverage: c('SYNCED','SYNCED','MISSING','MISSING','SYNCED') },
  { id: 156, name: "AKFA Furnitura to'plami deraza standart", sapCode: 'SAP10013', gtin: '4780121310013', status: 'ACTIVE', productType: 'RAW_MATERIAL', group: 'Furnitura', nomenclatureType: 'Material', category: 'Furnitura', updatedAt: '2026-06-22T12:00:00Z', coverage: c('SYNCED','SYNCED','SYNCED','PENDING','SYNCED') },
  { id: 159, name: 'AKFA Montaj kopik 750ml professional', sapCode: 'SAP10016', gtin: '4780121310016', status: 'TEMPORARILY_PASSIVE', productType: 'RAW_MATERIAL', group: 'Materiallar', nomenclatureType: 'Material', category: 'Montaj', updatedAt: '2026-06-10T10:00:00Z', coverage: c('MISSING','MISSING','MISSING','MISSING','MISSING') },
  { id: 160, name: 'AKFA Germetik silikonli 280ml shaffof', sapCode: 'SAP10017', gtin: '4780121310017', status: 'ACTIVE', productType: 'RAW_MATERIAL', group: 'Materiallar', nomenclatureType: 'Material', category: 'Germetik', updatedAt: '2026-06-26T14:00:00Z', coverage: c('SYNCED','SYNCED','MISSING','SYNCED','PENDING') },
  { id: 184, name: 'AKFA Deraza 1600x1200 3-qanotli energotejamkor', sapCode: 'SAP10022', gtin: '4780121310022', status: 'ACTIVE', productType: 'FINISHED_PRODUCT', group: 'Derazalar', nomenclatureType: 'Oyna', category: 'PVC oyna', updatedAt: '2026-06-30T08:00:00Z', coverage: c('SYNCED','SYNCED','SYNCED','SYNCED','SYNCED') },
  { id: 185, name: 'AKFA Deraza 2000x1400 4-qanotli panorama', sapCode: 'SAP10023', gtin: '4780121310023', status: 'ACTIVE', productType: 'FINISHED_PRODUCT', group: 'Derazalar', nomenclatureType: 'Oyna', category: 'PVC oyna', updatedAt: '2026-06-30T07:30:00Z', coverage: c('SYNCED','SYNCED','FAILED','FAILED','SYNCED') },
  { id: 195, name: 'AKFA Plastik podkladka 6mm 150x50mm', sapCode: 'SAP10033', gtin: '4780121310033', status: 'PASSIVE', productType: 'RAW_MATERIAL', group: 'Materiallar', nomenclatureType: 'Material', category: 'Montaj', updatedAt: '2026-05-30T09:00:00Z', coverage: c('MISSING','MISSING','MISSING','MISSING','MISSING') },
  { id: 200, name: 'AKFA Petlya 3D regulirovka antrasit', sapCode: 'SAP10038', gtin: '4780121310038', status: 'ACTIVE', productType: 'RAW_MATERIAL', group: 'Furnitura', nomenclatureType: 'Material', category: 'Furnitura', updatedAt: '2026-06-30T13:40:00Z', coverage: c('SYNCED','SYNCED','SYNCED','SYNCED','SYNCED') },
];

// ---- Dashboard KPIs (derived from products where possible) ----
const active = MOCK_PRODUCTS.filter(p => p.status === 'ACTIVE').length;
const total = MOCK_PRODUCTS.length;
const coveragePct = Math.round(
  (EXTERNAL_SYSTEMS.reduce((sum, s) =>
    sum + MOCK_PRODUCTS.filter(p => p.coverage[s.id] === 'SYNCED').length, 0) /
    (total * EXTERNAL_SYSTEMS.length)) * 100
);
const needsFix = MOCK_PRODUCTS.filter(p =>
  Object.values(p.coverage).some(v => v === 'FAILED' || v === 'MISSING')).length;

export const MOCK_DASHBOARD = {
  kpis: {
    totalProducts: total,
    activeProducts: active,
    avgCoveragePct: coveragePct,
    needsFix,
    usersOnline: 3,
  },
  // per-system coverage for the progress bars
  systemCoverage: EXTERNAL_SYSTEMS.map(s => ({
    system: s.name,
    covered: MOCK_PRODUCTS.filter(p => p.coverage[s.id] === 'SYNCED').length,
    total,
  })),
  alerts: [
    { id: 1, severity: 'CRITICAL', text: 'E-Commerce: oxirgi sinxronizatsiya muvaffaqiyatsiz (3 kun oldin)' },
    { id: 2, severity: 'HIGH', text: '2 mahsulot hech bir tashqi tizimda yo\'q' },
    { id: 3, severity: 'WARNING', text: '3 mahsulotda yuborish xatosi (B2B / E-Commerce)' },
    { id: 4, severity: 'INFO', text: '48 chegirma keyingi 30 kunda tugaydi' },
  ],
};

// ---- Recent activity feed (dashboard + reuse on audit pages) ----
export type ActivityAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'IMPORT' | 'LOGIN' | 'APPROVE';

export interface MockActivity {
  id: string;
  user: string;
  action: ActivityAction;
  entity: string;
  description: string;
  createdAt: string; // ISO
}

export const MOCK_ACTIVITY: MockActivity[] = [
  { id: 'a1', user: 'asliddin.k', action: 'UPDATE', entity: 'Product #144', description: 'AKFA Deraza 1200x1200 yangilandi', createdAt: '2026-06-30T14:05:00Z' },
  { id: 'a2', user: 'asliddin.k', action: 'APPROVE', entity: 'Rate #4002', description: 'Narx tasdiqlandi — SAP10002', createdAt: '2026-06-30T14:32:00Z' },
  { id: 'a3', user: 'dilnoza', action: 'CREATE', entity: 'Product #200', description: 'AKFA Petlya 3D yaratildi', createdAt: '2026-06-30T13:40:00Z' },
  { id: 'a4', user: 'system', action: 'EXPORT', entity: 'E-Commerce', description: 'Sinxronizatsiya muvaffaqiyatsiz (timeout)', createdAt: '2026-06-30T10:15:00Z' },
  { id: 'a5', user: 'ivan.petrov', action: 'IMPORT', entity: 'Products', description: '120 ta mahsulot import qilindi', createdAt: '2026-06-29T16:30:00Z' },
];

// ---- Per-product audit history (for the History tab / AuditTimeline) ----
export interface MockFieldChange { field: string; oldValue: string; newValue: string }
export interface MockAuditItem {
  id: string;
  user: string;
  action: ActivityAction;
  createdAt: string;
  changes: MockFieldChange[];
}

// keyed by product id
export const MOCK_PRODUCT_HISTORY: Record<number, MockAuditItem[]> = {
  144: [
    { id: 'h1', user: 'dilnoza', action: 'UPDATE', createdAt: '2026-06-29T14:05:00Z', changes: [
      { field: 'Narx (rate)', oldValue: '1 250 000', newValue: '1 320 000' },
      { field: 'Asosiy birlik', oldValue: 'dona', newValue: 'm²' },
    ]},
    { id: 'h2', user: 'asliddin.k', action: 'UPDATE', createdAt: '2026-06-15T10:30:00Z', changes: [
      { field: 'Status', oldValue: 'TEMPORARILY_PASSIVE', newValue: 'ACTIVE' },
    ]},
    { id: 'h3', user: 'asliddin.k', action: 'CREATE', createdAt: '2026-05-02T09:00:00Z', changes: [
      { field: 'name', oldValue: '—', newValue: 'AKFA Deraza 1200x1200 2-qanotli PVC' },
      { field: 'sapCode', oldValue: '—', newValue: 'SAP10001' },
    ]},
  ],
};
