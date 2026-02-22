import { v4 as uuidv4 } from 'uuid';
import type { ActiveCycleState, ActivityType, CycleMeasurement, CycleSegment } from '../types/domain';
import { UNASSIGNED_COLOR, UNASSIGNED_KEY, UNASSIGNED_LABEL } from '../types/domain';

const MIN_SEGMENT_DURATION_MS = 1;

/** Initialize a new active cycle */
export function startActiveCycle(nowMs: number): ActiveCycleState {
  return {
    isRunning: true,
    startedAt: nowMs,
    lastMarkAt: nowMs,
    provisionalSegments: [],
  };
}

/**
 * Register an activity button click during a running cycle.
 *
 * This marks the END of the previous time span and assigns it to the
 * chosen activity type. The segment covers [lastMarkAt .. now].
 */
export function registerActivityClick(
  activeCycle: ActiveCycleState,
  activityType: ActivityType,
  nowMs: number
): ActiveCycleState {
  if (!activeCycle.isRunning || activeCycle.startedAt === undefined || activeCycle.lastMarkAt === undefined) {
    return activeCycle;
  }

  const startOffsetMs = activeCycle.lastMarkAt - activeCycle.startedAt;
  const endOffsetMs = nowMs - activeCycle.startedAt;
  const durationMs = endOffsetMs - startOffsetMs;

  // Skip near-zero segments
  if (durationMs < MIN_SEGMENT_DURATION_MS) {
    return activeCycle;
  }

  const segment: CycleSegment = {
    id: uuidv4(),
    activityTypeId: activityType.id,
    activityLabel: activityType.label,
    color: activityType.color,
    durationMs,
    startOffsetMs,
    endOffsetMs,
  };

  return {
    ...activeCycle,
    lastMarkAt: nowMs,
    provisionalSegments: [...activeCycle.provisionalSegments, segment],
  };
}

/**
 * Stop the active cycle and produce a finalized CycleMeasurement.
 *
 * IMPORTANT: The time from the last activity click until Stop is stored
 * as "unassigned" (Nicht zugeordnet). This is the standard MVP behavior
 * to avoid silently mis-attributing the final segment.
 */
export function stopActiveCycle(
  activeCycle: ActiveCycleState,
  nowMs: number,
  cycleNumber: number
): CycleMeasurement | null {
  if (!activeCycle.isRunning || activeCycle.startedAt === undefined || activeCycle.lastMarkAt === undefined) {
    return null;
  }

  const totalDurationMs = nowMs - activeCycle.startedAt;
  const segments = [...activeCycle.provisionalSegments];

  // Add the remaining segment from last click to stop as "unassigned"
  const remainingStartOffset = activeCycle.lastMarkAt - activeCycle.startedAt;
  const remainingDuration = totalDurationMs - remainingStartOffset;

  if (remainingDuration >= MIN_SEGMENT_DURATION_MS) {
    segments.push({
      id: uuidv4(),
      activityTypeId: undefined,
      activityLabel: UNASSIGNED_LABEL,
      color: UNASSIGNED_COLOR,
      durationMs: remainingDuration,
      startOffsetMs: remainingStartOffset,
      endOffsetMs: totalDurationMs,
    });
  }

  return {
    id: uuidv4(),
    cycleNumber,
    startedAt: activeCycle.startedAt,
    endedAt: nowMs,
    totalDurationMs,
    segments,
  };
}

/**
 * Build a temporary cycle-like structure for the live chart preview.
 * Includes finalized segments plus a "running" trailing segment.
 */
export function buildLivePreviewCycle(
  activeCycle: ActiveCycleState,
  nowMs: number,
  nextCycleNumber: number
): CycleMeasurement | null {
  if (!activeCycle.isRunning || activeCycle.startedAt === undefined || activeCycle.lastMarkAt === undefined) {
    return null;
  }

  const elapsed = nowMs - activeCycle.startedAt;
  const segments = [...activeCycle.provisionalSegments];

  const trailingStartOffset = activeCycle.lastMarkAt - activeCycle.startedAt;
  const trailingDuration = elapsed - trailingStartOffset;

  if (trailingDuration >= MIN_SEGMENT_DURATION_MS) {
    segments.push({
      id: 'live-trailing',
      activityTypeId: UNASSIGNED_KEY,
      activityLabel: 'Laufend…',
      color: '#E0E0E0',
      durationMs: trailingDuration,
      startOffsetMs: trailingStartOffset,
      endOffsetMs: elapsed,
    });
  }

  return {
    id: 'live-preview',
    cycleNumber: nextCycleNumber,
    startedAt: activeCycle.startedAt,
    endedAt: nowMs,
    totalDurationMs: elapsed,
    segments,
    note: '(laufend)',
  };
}

/** Recalculate total duration from segments */
export function recalcCycleDuration(segments: CycleSegment[]): number {
  return segments.reduce((sum, s) => sum + s.durationMs, 0);
}

/** Rebuild segment offsets after editing */
export function rebuildSegmentOffsets(segments: CycleSegment[]): CycleSegment[] {
  let offset = 0;
  return segments.map((s) => {
    const updated = {
      ...s,
      startOffsetMs: offset,
      endOffsetMs: offset + s.durationMs,
    };
    offset += s.durationMs;
    return updated;
  });
}
