import { Line, LineChart, ResponsiveContainer } from 'recharts';
import type { PerformanceTrendPoint } from '@entities/analytics/model/types';

type SparklineProps = {
  data: PerformanceTrendPoint[];
  color: string;
};

/** Minimal axis-free trend line for a compact metric row — built on recharts instead of hand-rolled SVG math. */
export function Sparkline({ data, color }: SparklineProps) {
  return (
    <div className="h-9 w-24 shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 2, right: 2, left: 2, bottom: 2 }}
        >
          <Line
            type="monotone"
            dataKey="avgHours"
            stroke={color}
            strokeWidth={1.75}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
