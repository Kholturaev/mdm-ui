export interface AuditActorFixture {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  roleName: string;
}

/**
 * Local actor fixture for the still-mock audit dashboard — kept independent
 * of `@entities/user`, which now talks to the real backend and no longer
 * carries demo seed data (real users aren't guaranteed to match these
 * usernames).
 */
export const AUDIT_ACTOR_SEED: AuditActorFixture[] = [
  {
    id: 1,
    username: 'bingo',
    firstName: 'Asliddin',
    lastName: 'Kholturaev',
    roleName: 'Super Admin',
  },
  {
    id: 2,
    username: 'sh.karimov',
    firstName: 'Shahzod',
    lastName: 'Karimov',
    roleName: 'Manager',
  },
  {
    id: 3,
    username: 'a.tursunov',
    firstName: 'Aziz',
    lastName: 'Tursunov',
    roleName: 'Operator',
  },
  {
    id: 4,
    username: 'd.yusupova',
    firstName: 'Dilnoza',
    lastName: 'Yusupova',
    roleName: 'Operator',
  },
  {
    id: 5,
    username: 'm.nazarova',
    firstName: 'Malika',
    lastName: 'Nazarova',
    roleName: 'Manager',
  },
];
