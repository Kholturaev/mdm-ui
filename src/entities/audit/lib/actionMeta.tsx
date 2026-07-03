import type { ReactNode } from 'react';
import type { BadgeVariant } from '@shared/ui/Badge';
import type { AuditActionType, AuditEntry } from '../model/types';
import { PlusIcon } from '@shared/ui/icons/PlusIcon';
import { EditIcon } from '@shared/ui/icons/EditIcon';
import { DeleteIcon } from '@shared/ui/icons/DeleteIcon';
import { RefreshIcon } from '@shared/ui/icons/RefreshIcon';
import { DownloadIcon } from '@shared/ui/icons/DownloadIcon';
import { CheckCircleIcon } from '@shared/ui/icons/CheckCircleIcon';
import { XCircleIcon } from '@shared/ui/icons/XCircleIcon';
import { UserIcon } from '@shared/ui/icons/UserIcon';

export const AUDIT_ACTION_TYPES: AuditActionType[] = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'SYNC',
  'IMPORT',
  'EXPORT',
  'APPROVE',
  'REJECT',
  'LOGIN',
];

export const AUDIT_ACTION_ICON: Record<AuditActionType, ReactNode> = {
  CREATE: <PlusIcon size={13} />,
  UPDATE: <EditIcon size={13} />,
  DELETE: <DeleteIcon size={13} />,
  SYNC: <RefreshIcon size={13} />,
  IMPORT: <DownloadIcon size={13} />,
  EXPORT: <DownloadIcon size={13} />,
  APPROVE: <CheckCircleIcon size={13} />,
  REJECT: <XCircleIcon size={13} />,
  LOGIN: <UserIcon size={13} />,
};

export const AUDIT_ACTION_COLOR: Record<AuditActionType, string> = {
  CREATE: 'bg-success/10 text-success',
  UPDATE: 'bg-fg/10 text-fg-muted',
  DELETE: 'bg-danger/10 text-danger',
  SYNC: 'bg-primary/10 text-primary',
  IMPORT: 'bg-fg/10 text-fg-muted',
  EXPORT: 'bg-fg/10 text-fg-muted',
  APPROVE: 'bg-success/10 text-success',
  REJECT: 'bg-danger/10 text-danger',
  LOGIN: 'bg-primary/10 text-primary',
};

/** Solid dot color per action type — for the trend chart's legend, distinct from the tinted `/10` backgrounds above used for icon badges. */
export const AUDIT_ACTION_DOT_CLASS: Record<AuditActionType, string> = {
  CREATE: 'bg-success',
  UPDATE: 'bg-fg-muted',
  DELETE: 'bg-danger',
  SYNC: 'bg-primary',
  IMPORT: 'bg-fg-muted',
  EXPORT: 'bg-fg-muted',
  APPROVE: 'bg-success',
  REJECT: 'bg-danger',
  LOGIN: 'bg-primary',
};

export const AUDIT_ACTION_BADGE_VARIANT: Record<AuditActionType, BadgeVariant> =
  {
    CREATE: 'success',
    UPDATE: 'neutral',
    DELETE: 'danger',
    SYNC: 'neutral',
    IMPORT: 'neutral',
    EXPORT: 'neutral',
    APPROVE: 'success',
    REJECT: 'danger',
    LOGIN: 'neutral',
  };

/** Interpolation values for `t(\`audit.feed.${entry.description}\`, ...)` — every feed/table message is built from this same fixed field set. */
export function auditFeedParams(entry: AuditEntry) {
  return {
    actor: entry.performedBy.fullName,
    record: entry.recordName,
    systems: entry.targetSystems?.join(', '),
    reason: entry.reason,
    ip: entry.ipAddress,
  };
}
