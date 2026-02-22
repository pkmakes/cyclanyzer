import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { CycleMeasurement, ActivityType } from '../../types/domain';
import { buildChartData, getActivityKeys, getMaxSegments } from '../../state/selectors';
import { msToSeconds } from '../../utils/time';
import { EmptyState } from '../common/EmptyState';
import { CycleChartTooltip } from './CycleChartTooltip';

type CycleChartProps = {
  cycles: CycleMeasurement[];
  previewCycle: CycleMeasurement | null;
  targetCycleTimeMs: number | undefined;
  activityTypes: ActivityType[];
  /** When true, chart stretches to fill its parent (used in measurement mode) */
  fillHeight?: boolean;
};

export function CycleChart({ cycles, previewCycle, targetCycleTimeMs, fillHeight }: CycleChartProps) {
  const chartData = buildChartData(cycles, previewCycle);
  const activityKeys = getActivityKeys(cycles, previewCycle);
  const maxSegs = getMaxSegments(chartData);

  if (chartData.length === 0) {
    return (
      <div className="chart-empty">
        <EmptyState
          message="Noch keine Zyklen gemessen."
          sub="Starte einen Zyklus, um die erste Messung zu sehen."
        />
      </div>
    );
  }

  const targetSeconds = targetCycleTimeMs ? msToSeconds(targetCycleTimeMs) : undefined;

  return (
    <div className={`cycle-chart ${fillHeight ? 'cycle-chart--fill' : ''}`}>
      <ResponsiveContainer width="100%" height={fillHeight ? '100%' : 360}>
        <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis
            label={{ value: 'Sekunden', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CycleChartTooltip />} />
          <Legend content={() => <ChartLegend items={activityKeys} />} />

          {Array.from({ length: maxSegs }, (_, i) => (
            <Bar
              key={`seg_${i}`}
              dataKey={`seg_${i}`}
              stackId="segments"
              isAnimationActive={false}
            >
              {chartData.map((entry, rowIdx) => {
                const meta = entry._meta[i];
                return (
                  <Cell
                    key={rowIdx}
                    fill={meta?.color ?? 'transparent'}
                    opacity={entry.isPreview ? 0.6 : 1}
                  />
                );
              })}
            </Bar>
          ))}

          {targetSeconds !== undefined && (
            <ReferenceLine
              y={targetSeconds}
              stroke="var(--danger)"
              strokeDasharray="6 4"
              strokeWidth={2}
              label={{
                value: `Ziel: ${targetSeconds} s`,
                position: 'right',
                fill: 'var(--danger)',
                fontSize: 12,
                fontWeight: 600,
              }}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartLegend({ items }: { items: { key: string; label: string; color: string }[] }) {
  if (items.length === 0) return null;
  return (
    <div className="chart-legend">
      {items.map((item) => (
        <div key={item.key} className="chart-legend__item">
          <span className="chart-legend__swatch" style={{ backgroundColor: item.color }} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
