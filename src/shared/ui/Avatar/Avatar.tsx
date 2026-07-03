import { cn } from '@shared/lib/cn';

type AvatarSize = 'sm' | 'md' | 'lg';

type AvatarProps = {
  name: string;
  size?: AvatarSize;
  className?: string;
};

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: 'size-6 text-[10px]',
  md: 'size-8 text-xs',
  lg: 'size-10 text-sm',
};

/** Initials circle for a person — first letter of the given name, uppercased. */
export function Avatar({ name, size = 'md', className }: AvatarProps) {
  return (
    <span
      className={cn(
        'bg-primary text-primary-foreground flex shrink-0 items-center justify-center rounded-full font-semibold',
        SIZE_CLASSES[size],
        className,
      )}
    >
      {name.trim().charAt(0).toUpperCase() || '?'}
    </span>
  );
}
