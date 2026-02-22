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
import { UNASSIGNED_COLOR, UNASSIGNED_KEY, UNASSIGNED_LABEL } from '../../types/domain';
import { buildChartData, getActivityKeys } from '../../state/selectors';
import { msToSeconds } from '../../utils/time';
import { EmptyState } from '../common/EmptyState';
import { CycleChartTooltip } from './CycleChartTooltip';

type CycleChartProps = {
  cycles: CycleMeasurement[];
  previewCycle: CycleMeasurement | null;
  targetCycleTimeMs: number | undefined;
  activityTypes: ActivityType[];
};

export function CycleChart({ cycles, previewCycle, targetCycleTimeMs, activityTypes }: CycleChartProps) {
  const chartData = buildChartData(cycles, previewCycle);
  const activityKeys = getActivityKeys(cycles, previewCycle);

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

  // Build stack keys: use activity type IDs + unassigned key
  const stackKeys = activityKeys.map((ak) => ({
    key: ak.key,
    label: ak.label,
    color: ak.color,
  }));

  // Ensure unassigned is in the stack
  const hasUnassigned = stackKeys.some((sk) => sk.key === UNASSIGNED_KEY);
  if (!hasUnassigned) {
    // Check if any data has unassigned
    const needsUnassigned = chartData.some((d) => UNASSIGNED_KEY in d);
    if (needsUnassigned) {
      stackKeys.push({ key: UNASSIGNED_KEY, label: UNASSIGNED_LABEL, color: UNASSIGNED_COLOR });
    }
  }

  // Also include activity type IDs that might appear in the live preview
  const liveTrailingKey = '__unassigned__';
  const hasLiveTrailing = chartData.some((d) => liveTrailingKey in d && d[liveTrailingKey] !== UNASSIGNED_KEY);

  // For activity types, add from the config if not yet in stack
  for (const at of activityTypes) {
    if (!stackKeys.some((sk) => sk.key === at.id)) {
      const usedInData = chartData.some((d) => at.id in d);
      if (usedInData) {
        stackKeys.push({ key: at.id, label: at.label, color: at.color });
      }
    }
  }

  const targetSeconds = targetCycleTimeMs ? msToSeconds(targetCycleTimeMs) : undefined;

  return (
    <div className="cycle-chart">
      <ResponsiveContainer width="100%" height={360}>
        <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis
            label={{ value: 'Sekunden', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CycleChartTooltip />} />
          <Legend
            formatter={(value: string) => {
              const found = stackKeys.find((sk) => sk.key === value);
              return found ? found.label : value;
            }}
          />

          {stackKeys.map((sk) => (
            <Bar key={sk.key} dataKey={sk.key} stackId="segments" name={sk.label} fill={sk.color}>
              {chartData.map((entry, idx) => (
                <Cell
                  key={idx}
                  opacity={entry.isPreview ? 0.6 : 1}
                />
              ))}
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
