import { PERMISSION_CATALOG } from '@entities/permission/model/catalog';
import type { IRole } from '../model/types';

const ALL_PERMISSION_KEYS = PERMISSION_CATALOG.map(
  (permission) => permission.key,
);

function keysFor(modules: string[], actions: string[]): string[] {
  return PERMISSION_CATALOG.filter(
    (permission) =>
      modules.includes(permission.module) &&
      actions.includes(permission.action),
  ).map((permission) => permission.key);
}

export const ROLE_SEED: IRole[] = [
  {
    id: 1,
    name: 'Super Admin',
    description: 'Platformadagi barcha amallarga to’liq ruxsat',
    permissionKeys: ALL_PERMISSION_KEYS,
    createdAt: '2026-01-12T09:00:00.000Z',
  },
  {
    id: 2,
    name: 'Manager',
    description: 'Diler va nomenklaturani boshqaradi, analitikani ko’radi',
    permissionKeys: [
      ...keysFor(
        ['DEALER', 'NOMENCLATURE'],
        ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT'],
      ),
      ...keysFor(['ANALYTICS'], ['VIEW']),
    ],
    createdAt: '2026-01-15T09:00:00.000Z',
  },
  {
    id: 3,
    name: 'Operator',
    description: 'Kundalik ma’lumot kiritish, faqat o’z sohasida tahrirlash',
    permissionKeys: [
      ...keysFor(['DEALER'], ['READ']),
      ...keysFor(['NOMENCLATURE'], ['READ', 'UPDATE']),
      ...keysFor(['ANALYTICS'], ['VIEW']),
    ],
    createdAt: '2026-02-03T09:00:00.000Z',
  },
  {
    id: 4,
    name: 'Viewer',
    description: 'Faqat ko’rish huquqi',
    permissionKeys: [
      ...keysFor(['DEALER', 'NOMENCLATURE'], ['READ']),
      ...keysFor(['ANALYTICS'], ['VIEW']),
    ],
    createdAt: '2026-02-20T09:00:00.000Z',
  },
];
