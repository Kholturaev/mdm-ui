import { InfoIcon } from '../icons/InfoIcon';
import { cn } from '@shared/lib/cn';

type InfoTooltipProps = {
  content?: string | null;
  className?: string;
};

/** Small hover/focus tooltip for entity descriptions — renders nothing when there's no description to show. */
export function InfoTooltip({ content, className }: InfoTooltipProps) {
  if (!content) return null;

  return (
    <span
      className={cn(
        'group/tooltip relative inline-flex shrink-0 items-center',
        className,
      )}
    >
      <span
        tabIndex={0}
        aria-label={content}
        className="text-fg-muted hover:text-primary focus-visible:text-primary inline-flex cursor-help outline-none"
      >
        <InfoIcon size={13} />
      </span>
      <span
        role="tooltip"
        className="border-border bg-surface text-fg pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 w-max max-w-64 -translate-x-1/2 rounded-md border px-2.5 py-1.5 text-xs opacity-0 shadow-lg transition-opacity duration-150 group-focus-within/tooltip:opacity-100 group-hover/tooltip:opacity-100"
      >
        {content}
      </span>
    </span>
  );
}
