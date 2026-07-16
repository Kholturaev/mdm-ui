import { cn } from '@shared/lib/cn';

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  title?: string;
};

const TRACK_SIZE: Record<'sm' | 'md', string> = {
  sm: 'h-5 w-9',
  md: 'h-6 w-11',
};

const THUMB_SIZE: Record<'sm' | 'md', string> = {
  sm: 'size-4',
  md: 'size-5',
};

const THUMB_TRANSLATE: Record<'sm' | 'md', string> = {
  sm: 'translate-x-4',
  md: 'translate-x-5',
};

/** Horizontal on/off toggle — pill track + sliding thumb — for a single boolean setting (e.g. "required"), as opposed to `Checkbox` which reads as a selection in a list. */
export function Switch({
  checked,
  onChange,
  disabled = false,
  size = 'sm',
  title,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      title={title}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        'relative inline-flex shrink-0 items-center rounded-full transition-colors',
        TRACK_SIZE[size],
        checked ? 'bg-primary' : 'bg-border-strong',
        disabled && 'cursor-not-allowed opacity-40',
      )}
    >
      <span
        className={cn(
          'bg-fg-invert inline-block rounded-full shadow-sm transition-transform',
          THUMB_SIZE[size],
          checked ? THUMB_TRANSLATE[size] : 'translate-x-0.5',
        )}
      />
    </button>
  );
}
