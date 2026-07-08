import type { ReactNode } from 'react';
import { PlusIcon } from '@shared/ui/icons/PlusIcon';
import { EyeIcon } from '@shared/ui/icons/EyeIcon';
import { EditIcon } from '@shared/ui/icons/EditIcon';
import { DeleteIcon } from '@shared/ui/icons/DeleteIcon';

/** Icon for a permission badge by the action implied by its key suffix (`_CREATE`, `_READ`, ...) — meaning, not color, distinguishes actions here. `null` for actions with no obvious CRUD equivalent (e.g. `_EXPORT`, `_ASSIGN_ROLE`). */
export function getPermissionActionIcon(value: string, size = 12): ReactNode {
  if (/_DELETE$/.test(value)) return <DeleteIcon size={size} />;
  if (/_UPDATE$/.test(value)) return <EditIcon size={size} />;
  if (/_(CREATE|ADD)$/.test(value)) return <PlusIcon size={size} />;
  if (/_(READ|GET|VIEW)$/.test(value)) return <EyeIcon size={size} />;
  return null;
}

/** `dealer` / `product_group` → `Dealer` / `Product group` — the backend's `nameEndpoint` values aren't guaranteed to be human-formatted. */
export function formatPermissionGroupName(nameEndpoint: string): string {
  const spaced = nameEndpoint.replace(/[_-]+/g, ' ').trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
