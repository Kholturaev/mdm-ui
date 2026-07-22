import type {
  CompletenessGroupDimension,
  CompletenessSummary,
  CompletenessTopIncompleteItem,
  CompletenessTrendPoint,
  FieldCompletenessItem,
  GroupCompletenessItem,
  SourceSystemCompletenessItem,
} from '../model/types';

const PRODUCT_NAMES = [
  'Montaj kopik 750ml professional',
  'Plastik podkladka 6mm 150x50mm',
  'Silikon germetik oq 280ml',
  'Gidroizolyatsiya membranasi 1x10m',
  'Armatura 12mm A500S',
  'Tsement M400 50kg',
  'Keramik plitka 300x300 oq',
  'Elektr kabel VVG 3x2.5',
  'Santexnika trubasi PPR 20mm',
  'Boʼyoq akril ichki ishlar uchun 5l',
  'Shpaklyovka gips asosli 20kg',
  'Metall profil UD 27x28',
  'Izolyatsiya penopleks 50mm',
  'Quyma beton blok 200x200x400',
  'Yogʼoch taxta qaragʻay 40x100',
];

const SYSTEMS = [
  { id: 1, name: 'SAP' },
  { id: 2, name: '1C' },
  { id: 3, name: 'B2B' },
  { id: 4, name: 'ESHOP' },
  { id: 5, name: 'WMS' },
];

const REQUIRED_FIELDS = [
  'barcode',
  'weight',
  'volume',
  'category',
  'unit',
  'manufacturer',
  'description',
];

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function pick<T>(rand: () => number, arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function isoDateOnly(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Completeness
// ---------------------------------------------------------------------------

const TOTAL_PRODUCTS = 29;

export function generateCompletenessSummary(): CompletenessSummary {
  return {
    overallScore: 78,
    totalProducts: TOTAL_PRODUCTS,
    fullComplete: 14,
    partial: 11,
    incomplete: 4,
    distribution: [
      { label: '90-100', count: 9 },
      { label: '70-89', count: 8 },
      { label: '50-69', count: 8 },
      { label: '0-49', count: 4 },
    ],
    topIncomplete: buildIncompleteItems(0, 5),
  };
}

function buildIncompleteItems(
  offset: number,
  count: number,
): CompletenessTopIncompleteItem[] {
  const rand = seededRandom(offset + 1);
  return Array.from({ length: count }, (_, index) => {
    const i = offset + index;
    const missingCount = 1 + Math.floor(rand() * 3);
    const missingFields = Array.from(
      new Set(
        Array.from({ length: missingCount }, () => pick(rand, REQUIRED_FIELDS)),
      ),
    );
    return {
      productId: 100 + i,
      article: `ART-${(1000 + i).toString()}`,
      name: pick(rand, PRODUCT_NAMES),
      score: 30 + Math.floor(rand() * 55),
      missingFields,
      missingFieldLabels: missingFields,
    };
  });
}

export function generateFieldCompleteness(): {
  totalProducts: number;
  fields: FieldCompletenessItem[];
} {
  const rand = seededRandom(7);
  return {
    totalProducts: TOTAL_PRODUCTS,
    fields: REQUIRED_FIELDS.map((field) => {
      const missingPercent = Math.round(rand() * 40);
      const missingCount = Math.round((missingPercent / 100) * TOTAL_PRODUCTS);
      return {
        field,
        filledCount: TOTAL_PRODUCTS - missingCount,
        missingCount,
        missingPercent,
      };
    }).sort((a, b) => b.missingPercent - a.missingPercent),
  };
}

const GROUP_NAMES: Record<CompletenessGroupDimension, (string | null)[]> = {
  PRODUCT_GROUP: [
    'Qurilish materiallari',
    'Elektr jihozlari',
    'Santexnika',
    null,
  ],
  CATEGORY: ['Germetiklar', 'Metall buyumlar', 'Boʼyoq va laklar', null],
};

export function generateGroupCompleteness(
  dimension: CompletenessGroupDimension,
  page: number,
  size: number,
): {
  data: GroupCompletenessItem[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
} {
  const rand = seededRandom(dimension === 'PRODUCT_GROUP' ? 11 : 13);
  const names = GROUP_NAMES[dimension];
  const all: GroupCompletenessItem[] = names.map((groupName, index) => {
    const productCount = 3 + Math.floor(rand() * 10);
    const fullCompleteCount = Math.floor(rand() * productCount);
    const incompleteCount = Math.floor(
      rand() * (productCount - fullCompleteCount),
    );
    return {
      groupId: groupName ? index + 1 : null,
      groupName,
      productCount,
      avgScore: 40 + Math.floor(rand() * 55),
      fullCompleteCount,
      incompleteCount,
    };
  });
  const start = page * size;
  return {
    data: all.slice(start, start + size),
    totalElements: all.length,
    totalPages: Math.ceil(all.length / size),
    currentPage: page,
  };
}

export function generateSourceSystemCompleteness(): SourceSystemCompletenessItem[] {
  const rand = seededRandom(17);
  return SYSTEMS.map((system) => ({
    externalSystemId: system.id,
    systemName: system.name,
    productCount: 10 + Math.floor(rand() * 19),
    avgScore: 50 + Math.floor(rand() * 45),
  }));
}

export function generateCompletenessTrend(days: number): {
  days: number;
  points: CompletenessTrendPoint[];
} {
  const points = Array.from({ length: days }, (_, index) => {
    const daysAgo = days - 1 - index;
    const rand = seededRandom(daysAgo + 100);
    const avgScore = Math.round(70 + Math.sin(index / 4) * 8 + rand() * 6);
    const incompleteCount = Math.max(0, Math.round(6 - index / (days / 4)));
    return {
      date: isoDateOnly(daysAgo),
      avgScore,
      totalProducts: TOTAL_PRODUCTS,
      fullCompleteCount: TOTAL_PRODUCTS - incompleteCount - 8,
      incompleteCount,
    };
  });
  return { days, points };
}

export function generateIncompleteProductsPage(
  page: number,
  size: number,
): {
  data: CompletenessTopIncompleteItem[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
} {
  const totalElements = 47;
  const start = page * size;
  return {
    data: buildIncompleteItems(
      start,
      Math.min(size, Math.max(0, totalElements - start)),
    ),
    totalElements,
    totalPages: Math.ceil(totalElements / size),
    currentPage: page,
  };
}
