import type { CycleMeasurement } from '../types/domain';
import { UNASSIGNED_LABEL } from '../types/domain';

export type CycleStats = {
  count: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  bestRepeatable: number | null;
  totalDurationMs: number;
};

export type ActivityShare = {
  activityLabel: string;
  color: string;
  totalDurationMs: number;
  percent: number;
};

export function computeCycleStats(cycles: CycleMeasurement[]): CycleStats | null {
  if (cycles.length === 0) return null;

  const durations = cycles.map((c) => c.totalDurationMs).sort((a, b) => a - b);
  const totalDurationMs = durations.reduce((sum, d) => sum + d, 0);
  const mean = totalDurationMs / durations.length;

  const mid = Math.floor(durations.length / 2);
  const median =
    durations.length % 2 === 0
      ? (durations[mid - 1] + durations[mid]) / 2
      : durations[mid];

  return {
    count: durations.length,
    mean,
    median,
    min: durations[0],
    max: durations[durations.length - 1],
    bestRepeatable: durations.length >= 2 ? durations[1] : null,
    totalDurationMs,
  };
}

export function computeActivityShares(cycles: CycleMeasurement[]): ActivityShare[] {
  const totals = new Map<string, { durationMs: number; color: string }>();

  for (const cycle of cycles) {
    for (const seg of cycle.segments) {
      const label = seg.activityLabel ?? UNASSIGNED_LABEL;
      const color = seg.color ?? '#B0BEC5';
      const existing = totals.get(label);
      if (existing) {
        existing.durationMs += seg.durationMs;
      } else {
        totals.set(label, { durationMs: seg.durationMs, color });
      }
    }
  }

  const grandTotal = Array.from(totals.values()).reduce((sum, t) => sum + t.durationMs, 0);

  return Array.from(totals.entries())
    .map(([label, data]) => ({
      activityLabel: label,
      color: data.color,
      totalDurationMs: data.durationMs,
      percent: grandTotal > 0 ? (data.durationMs / grandTotal) * 100 : 0,
    }))
    .sort((a, b) => b.totalDurationMs - a.totalDurationMs);
}
