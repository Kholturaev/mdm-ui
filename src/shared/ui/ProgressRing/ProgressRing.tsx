import { cn } from '@shared/lib/cn';

type ProgressRingProps = {
  /** 0-100 */
  percent: number;
  size?: number;
  strokeWidth?: number;
  /** Ring turns this color at or above this percent (e.g. the "ready to activate" threshold) — amber below it. */
  completeThreshold?: number;
  className?: string;
};

/** Circular completion indicator — amber while filling in, green once past `completeThreshold`. Shows the rounded percentage in its center. */
export function ProgressRing({
  percent,
  size = 40,
  strokeWidth = 4,
  completeThreshold = 100,
  className,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);
  const isComplete = clamped >= completeThreshold;

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center',
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-border"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className={isComplete ? 'stroke-success' : 'stroke-warning'}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="text-fg absolute text-[10px] font-semibold">
        {Math.round(clamped)}%
      </span>
    </div>
  );
}
