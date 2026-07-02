import { UserIcon } from '@shared/ui/icons/UserIcon';

export function PersonCell({ name }: { name?: string }) {
  if (!name) return '—';
  return (
    <span className="text-fg-muted flex items-center gap-1.5">
      <UserIcon size={13} />
      <span className="text-fg truncate">{name}</span>
    </span>
  );
}
