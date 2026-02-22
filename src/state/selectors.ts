import type { AppState, ChartDataRow, CycleMeasurement } from '../types/domain';
import { UNASSIGNED_COLOR, UNASSIGNED_KEY, UNASSIGNED_LABEL } from '../types/domain';
import { msToSeconds } from '../utils/time';

/** Get the next cycle number */
export function getNextCycleNumber(state: AppState): number {
  if (state.cycles.length === 0) return 1;
  return Math.max(...state.cycles.map((c) => c.cycleNumber)) + 1;
}

/** Get all unique activity keys used across cycles (for chart stacking) */
export function getActivityKeys(
  cycles: CycleMeasurement[],
  previewCycle?: CycleMeasurement | null
): { key: string; label: string; color: string }[] {
  const keyMap = new Map<string, { label: string; color: string }>();

  const allCycles = previewCycle ? [...cycles, previewCycle] : cycles;

  for (const cycle of allCycles) {
    for (const seg of cycle.segments) {
      const key = seg.activityTypeId ?? UNASSIGNED_KEY;
      if (!keyMap.has(key)) {
        keyMap.set(key, {
          label: seg.activityLabel ?? UNASSIGNED_LABEL,
          color: seg.color ?? UNASSIGNED_COLOR,
        });
      }
    }
  }

  return Array.from(keyMap.entries()).map(([key, val]) => ({
    key,
    label: val.label,
    color: val.color,
  }));
}

/**
 * Build chart data rows from cycles.
 * Each row has a dynamic key per activity, holding the duration in seconds.
 */
export function buildChartData(
  cycles: CycleMeasurement[],
  previewCycle?: CycleMeasurement | null
): ChartDataRow[] {
  const allCycles = previewCycle ? [...cycles, previewCycle] : cycles;

  return allCycles.map((cycle) => {
    const row: ChartDataRow = {
      label: cycle.note
        ? `Zyklus ${cycle.cycleNumber} ${cycle.note}`
        : `Zyklus ${cycle.cycleNumber}`,
      cycleNumber: cycle.cycleNumber,
      isPreview: cycle.id === 'live-preview',
      totalSeconds: msToSeconds(cycle.totalDurationMs),
    };

    // Aggregate segment durations by activity key
    const durations = new Map<string, number>();
    for (const seg of cycle.segments) {
      const key = seg.activityTypeId ?? UNASSIGNED_KEY;
      durations.set(key, (durations.get(key) ?? 0) + msToSeconds(seg.durationMs));
    }

    for (const [key, seconds] of durations) {
      row[key] = Math.round(seconds * 100) / 100;
    }

    return row;
  });
}
