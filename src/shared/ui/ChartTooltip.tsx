import type { TooltipContentProps } from 'recharts';
import type {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';

type ChartTooltipProps = TooltipContentProps<ValueType, NameType> & {
  formatLabel?: (label: string) => string;
};

/** Token-driven replacement for recharts' default tooltip, so it follows light/dark theme like the rest of the UI. */
export function ChartTooltip({
  active,
  payload,
  label,
  formatLabel,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="border-border bg-surface min-w-32 rounded-md border px-3 py-2 shadow-lg">
      <div className="text-fg-muted mb-1.5 text-xs font-medium">
        {formatLabel ? formatLabel(String(label)) : label}
      </div>
      <div className="flex flex-col gap-1">
        {payload.map((entry) => (
          <div
            key={String(entry.dataKey)}
            className="flex items-center justify-between gap-3 text-xs"
          >
            <span className="text-fg-muted flex items-center gap-1.5">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}
            </span>
            <span className="text-fg font-medium tabular-nums">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
