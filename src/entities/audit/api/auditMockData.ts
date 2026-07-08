import { AUDIT_ACTOR_SEED } from './auditActors';
import type { ApprovalRequest, AuditActor, AuditEntry } from '../model/types';

function minutesAgo(minutes: number): string {
  const date = new Date();
  date.setMinutes(date.getMinutes() - minutes);
  return date.toISOString();
}

function actorFor(username: string): AuditActor {
  const user = AUDIT_ACTOR_SEED.find(
    (candidate) => candidate.username === username,
  );
  if (!user) throw new Error(`Unknown mock user: ${username}`);
  return {
    id: user.id,
    username: user.username,
    fullName: `${user.firstName} ${user.lastName}`,
  };
}

type EntrySpec = Omit<AuditEntry, 'actionTime' | 'performedBy' | 'id'> & {
  actor: string;
  minutesAgo: number;
};

// `minutesAgo` values are hand-placed rather than looped so the dashboard
// feed (today/yesterday) and the full log (date/person/action filters) both
// have a believable, non-uniform spread to demo against.
const SPECS: EntrySpec[] = [
  {
    actor: 'bingo',
    minutesAgo: 4,
    actionType: 'APPROVE',
    entityType: 'PRODUCT',
    recordId: 1002,
    recordName: 'AKFA Deraza 1800x1400',
    fieldChanges: [],
    description: 'approve',
    status: 'SUCCESS',
  },
  {
    actor: 'd.yusupova',
    minutesAgo: 26,
    actionType: 'UPDATE',
    entityType: 'PRODUCT',
    recordId: 1001,
    recordName: 'AKFA Deraza 1200x1200 2-qanotli',
    fieldChanges: [
      { fieldName: 'price', oldValue: '1 750 000', newValue: '1 820 000' },
      {
        fieldName: 'gtin',
        oldValue: '4780000010012',
        newValue: '4780000010013',
      },
      { fieldName: 'unit', oldValue: 'dona', newValue: 'kv.m' },
    ],
    description: 'update',
    status: 'SUCCESS',
  },
  {
    actor: 'a.tursunov',
    minutesAgo: 60,
    actionType: 'CREATE',
    entityType: 'PRODUCT',
    recordId: 10038,
    recordName: 'AKFA Petlya 3D regulirovka antrasit',
    fieldChanges: [],
    description: 'createWithSystems',
    status: 'SUCCESS',
    targetSystems: ['SAP', '1C', 'B2B', 'E-Shop', 'WMS'],
  },
  {
    actor: 'sh.karimov',
    minutesAgo: 82,
    actionType: 'UPDATE',
    entityType: 'DEALER',
    recordId: 44,
    recordName: 'BuildMax MChJ',
    fieldChanges: [
      {
        fieldName: 'phone',
        oldValue: '+998 71 200 10 10',
        newValue: '+998 71 200 10 20',
      },
      {
        fieldName: 'region',
        oldValue: 'Toshkent shahri',
        newValue: 'Toshkent viloyati',
      },
    ],
    description: 'update',
    status: 'SUCCESS',
  },
  {
    actor: 'system',
    minutesAgo: 115,
    actionType: 'SYNC',
    entityType: 'PRODUCT',
    recordId: 1023,
    recordName: 'AKFA Deraza 2000x1400 panorama',
    fieldChanges: [],
    description: 'syncFailed',
    status: 'FAILED',
    reason: 'timeout',
    targetSystems: ['B2B'],
  },
  {
    actor: 'system',
    minutesAgo: 300,
    actionType: 'SYNC',
    entityType: 'PRODUCT',
    recordName: '18 ta mahsulot',
    fieldChanges: [],
    description: 'syncSuccess',
    status: 'SUCCESS',
    targetSystems: ['SAP', '1C', 'WMS'],
  },
  {
    actor: 'm.nazarova',
    minutesAgo: 170,
    actionType: 'CREATE',
    entityType: 'UNIT',
    recordId: 78,
    recordName: "Pog'ona metr (pm)",
    fieldChanges: [],
    description: 'create',
    status: 'SUCCESS',
  },
  {
    actor: 'bingo',
    minutesAgo: 194,
    actionType: 'LOGIN',
    fieldChanges: [],
    description: 'login',
    status: 'SUCCESS',
    ipAddress: '213.230.71.4',
  },
  {
    actor: 'bingo',
    minutesAgo: 195,
    actionType: 'REJECT',
    entityType: 'PRODUCT',
    recordId: 10099,
    recordName: 'AKFA Test mahsulot SAP10099',
    fieldChanges: [],
    description: 'reject',
    status: 'SUCCESS',
    reason: "noto'g'ri GTIN format",
  },
  {
    actor: 'd.yusupova',
    minutesAgo: 220,
    actionType: 'DELETE',
    entityType: 'PRODUCT',
    recordId: 10099,
    recordName: 'AKFA Test mahsulot SAP10099',
    fieldChanges: [],
    description: 'delete',
    status: 'SUCCESS',
  },

  // --- yesterday ---
  {
    actor: 'sh.karimov',
    minutesAgo: 24 * 60 + 40,
    actionType: 'IMPORT',
    entityType: 'PRODUCT',
    fieldChanges: [],
    description: 'import',
    status: 'SUCCESS',
    recordName: '48 ta mahsulot',
  },
  {
    actor: 'a.tursunov',
    minutesAgo: 24 * 60 + 95,
    actionType: 'UPDATE',
    entityType: 'PRODUCT',
    recordId: 1015,
    recordName: 'Montaj kopik 750ml professional',
    fieldChanges: [
      { fieldName: 'price', oldValue: '42 000', newValue: '45 000' },
    ],
    description: 'update',
    status: 'SUCCESS',
  },
  {
    actor: 'system',
    minutesAgo: 24 * 60 + 140,
    actionType: 'SYNC',
    entityType: 'PRODUCT',
    recordId: 1017,
    recordName: 'Plastik podkladka 6mm 150x50mm',
    fieldChanges: [],
    description: 'syncSuccess',
    status: 'SUCCESS',
    targetSystems: ['SAP', '1C', 'WMS'],
  },
  {
    actor: 'd.yusupova',
    minutesAgo: 24 * 60 + 210,
    actionType: 'EXPORT',
    fieldChanges: [],
    description: 'export',
    status: 'SUCCESS',
    recordName: 'Nomenklatura',
  },
  {
    actor: 'm.nazarova',
    minutesAgo: 24 * 60 + 260,
    actionType: 'UPDATE',
    entityType: 'SEGMENT',
    recordId: 12,
    recordName: 'Santexnika',
    fieldChanges: [
      {
        fieldName: 'name',
        oldValue: 'Santexnika',
        newValue: 'Santexnika va armatura',
      },
    ],
    description: 'update',
    status: 'SUCCESS',
  },
  {
    actor: 'sh.karimov',
    minutesAgo: 24 * 60 + 340,
    actionType: 'LOGIN',
    fieldChanges: [],
    description: 'login',
    status: 'SUCCESS',
    ipAddress: '213.230.71.19',
  },

  // --- 2-9 days ago, sparser, for date-range filtering ---
  {
    actor: 'a.tursunov',
    minutesAgo: 3 * 24 * 60 + 90,
    actionType: 'CREATE',
    entityType: 'PRODUCT',
    recordId: 1030,
    recordName: 'AKFA Shpingalet 250mm',
    fieldChanges: [],
    description: 'create',
    status: 'SUCCESS',
  },
  {
    actor: 'd.yusupova',
    minutesAgo: 4 * 24 * 60 + 50,
    actionType: 'UPDATE',
    entityType: 'DEALER',
    recordId: 51,
    recordName: 'Ideal Servis Group',
    fieldChanges: [
      { fieldName: 'clientType', oldValue: 'Chakana', newValue: 'Ulgurji' },
    ],
    description: 'update',
    status: 'SUCCESS',
  },
  {
    actor: 'system',
    minutesAgo: 4 * 24 * 60 + 300,
    actionType: 'SYNC',
    entityType: 'PRODUCT',
    recordId: 1041,
    recordName: 'AKFA Deraza 1600x1400',
    fieldChanges: [],
    description: 'syncFailed',
    status: 'FAILED',
    reason: 'validatsiya xatosi',
    targetSystems: ['1C'],
  },
  {
    actor: 'bingo',
    minutesAgo: 5 * 24 * 60 + 20,
    actionType: 'APPROVE',
    entityType: 'DEALER',
    recordId: 44,
    recordName: 'BuildMax MChJ',
    fieldChanges: [],
    description: 'approve',
    status: 'SUCCESS',
  },
  {
    actor: 'm.nazarova',
    minutesAgo: 5 * 24 * 60 + 210,
    actionType: 'DELETE',
    entityType: 'UNIT',
    recordId: 65,
    recordName: 'Eskirgan birlik (old)',
    fieldChanges: [],
    description: 'delete',
    status: 'SUCCESS',
  },
  {
    actor: 'sh.karimov',
    minutesAgo: 6 * 24 * 60 + 75,
    actionType: 'IMPORT',
    entityType: 'PRODUCT',
    fieldChanges: [],
    description: 'import',
    status: 'SUCCESS',
    recordName: '112 ta mahsulot',
  },
  {
    actor: 'a.tursunov',
    minutesAgo: 7 * 24 * 60 + 130,
    actionType: 'UPDATE',
    entityType: 'PRODUCT',
    recordId: 1050,
    recordName: 'AKFA Deraza 900x1200',
    fieldChanges: [
      {
        fieldName: 'description',
        oldValue: 'Standart profil',
        newValue: 'Energiya tejamkor profil',
      },
      {
        fieldName: 'category',
        oldValue: 'Derazalar',
        newValue: 'Premium derazalar',
      },
    ],
    description: 'update',
    status: 'SUCCESS',
  },
  {
    actor: 'd.yusupova',
    minutesAgo: 8 * 24 * 60 + 45,
    actionType: 'REJECT',
    entityType: 'PRODUCT',
    recordId: 1055,
    recordName: 'AKFA Test mahsulot 2',
    fieldChanges: [],
    description: 'reject',
    status: 'SUCCESS',
    reason: 'narx manfiy qiymatga ega',
  },
  {
    actor: 'system',
    minutesAgo: 9 * 24 * 60 + 15,
    actionType: 'SYNC',
    entityType: 'PRODUCT',
    fieldChanges: [],
    description: 'syncSuccess',
    status: 'SUCCESS',
    recordName: '340 ta mahsulot',
    targetSystems: ['SAP', '1C', 'B2B', 'E-Shop', 'WMS'],
  },
];

/** `system` stands in for automated actions (sync jobs) that have no human actor — displayed as-is, not resolved against the user seed. */
const SYSTEM_ACTOR: AuditActor = {
  id: 0,
  username: 'system',
  fullName: 'Tizim',
};

export const AUDIT_SEED: AuditEntry[] = SPECS.map((spec, index) => {
  const { actor, minutesAgo: offset, ...rest } = spec;
  return {
    ...rest,
    id: String(index + 1),
    actionTime: minutesAgo(offset),
    performedBy: actor === 'system' ? SYSTEM_ACTOR : actorFor(actor),
  };
}).sort((a, b) => (a.actionTime < b.actionTime ? 1 : -1));

export const APPROVAL_SEED: ApprovalRequest[] = [
  {
    id: 'ap-1',
    requestedBy: actorFor('a.tursunov'),
    createdAt: minutesAgo(35),
    kind: 'priceChange',
    recordName: 'AKFA Deraza 1800x1400',
    fieldChanges: [
      { fieldName: 'price', oldValue: '1 800 000', newValue: '1 950 000' },
    ],
  },
  {
    id: 'ap-2',
    requestedBy: actorFor('sh.karimov'),
    createdAt: minutesAgo(70),
    kind: 'deleteRequest',
    recordName: 'AKFA Germetik 280ml',
  },
];
