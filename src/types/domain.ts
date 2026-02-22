/** Configurable activity type (up to 10) */
export type ActivityType = {
  id: string;
  label: string;
  color: string; // hex, e.g. "#4CAF50"
};

/**
 * A time segment within a cycle.
 *
 * Segment logic:
 * - A click on an activity button marks the END of the previous time span.
 * - That previous span is assigned to the activity chosen at click time.
 * - The span from the last click to Stop is "unassigned" by default.
 */
export type CycleSegment = {
  id: string;
  activityTypeId?: string; // undefined = unassigned
  activityLabel?: string;
  color?: string;
  durationMs: number;
  startOffsetMs: number;
  endOffsetMs: number;
};

export type CycleMeasurement = {
  id: string;
  cycleNumber: number;
  startedAt: number; // timestamp ms
  endedAt: number; // timestamp ms
  totalDurationMs: number;
  segments: CycleSegment[];
  note?: string;
};

export type AppSettings = {
  targetCycleTimeMs?: number;
};

export type AppState = {
  settings: AppSettings;
  activityTypes: ActivityType[];
  cycles: CycleMeasurement[];
};

/** Transient state for the currently running measurement */
export type ActiveCycleState = {
  isRunning: boolean;
  startedAt?: number;
  lastMarkAt?: number; // timestamp of last activity click or cycle start
  provisionalSegments: CycleSegment[];
};

/** Shape of the exported/imported JSON file */
export type ExportData = {
  version: number;
  exportedAt: string;
  state: AppState;
};

/** Chart data row – one per cycle/preview bar */
export type ChartDataRow = {
  label: string;
  cycleNumber: number;
  isPreview: boolean;
  totalSeconds: number;
  [activityKey: string]: string | number | boolean;
};

export const UNASSIGNED_KEY = '__unassigned__';
export const UNASSIGNED_LABEL = 'Nicht zugeordnet';
export const UNASSIGNED_COLOR = '#B0BEC5';

export const MAX_ACTIVITY_TYPES = 10;
export const EXPORT_VERSION = 1;
