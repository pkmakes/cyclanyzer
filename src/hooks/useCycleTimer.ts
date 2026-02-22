import { useCallback, useEffect, useRef, useState } from 'react';
import type { ActiveCycleState, ActivityType, CycleMeasurement } from '../types/domain';
import {
  buildLivePreviewCycle,
  registerActivityClick,
  startActiveCycle,
  stopActiveCycle,
} from '../utils/cycleSegmentation';
import { now } from '../utils/time';

/** Fast tick for the timer display (ms) */
const TIMER_TICK_MS = 50;
/** Slower tick for chart preview updates (ms) – 2 updates/second is enough visually */
const CHART_UPDATE_MS = 500;

type UseCycleTimerReturn = {
  activeCycle: ActiveCycleState;
  elapsedMs: number;
  previewCycle: CycleMeasurement | null;
  start: () => void;
  /** Freeze the timer and return the stop timestamp (used for pending-stop flow) */
  freeze: () => number;
  /** Finalize a frozen cycle with an optional activity for the last segment */
  finalize: (cycleNumber: number, stopTimestamp: number, finalActivity?: ActivityType) => CycleMeasurement | null;
  /** Convenience: stop immediately without pending dialog */
  stop: (cycleNumber: number, finalActivity?: ActivityType) => CycleMeasurement | null;
  markActivity: (activityType: ActivityType) => void;
};

const IDLE_STATE: ActiveCycleState = {
  isRunning: false,
  startedAt: undefined,
  lastMarkAt: undefined,
  provisionalSegments: [],
};

export function useCycleTimer(nextCycleNumber: number): UseCycleTimerReturn {
  const [activeCycle, setActiveCycle] = useState<ActiveCycleState>(IDLE_STATE);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [previewCycle, setPreviewCycle] = useState<CycleMeasurement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTick = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    const t = now();
    const cycle = startActiveCycle(t);
    setActiveCycle(cycle);
    setElapsedMs(0);
    setPreviewCycle(buildLivePreviewCycle(cycle, t, nextCycleNumber));
  }, [nextCycleNumber]);

  const freeze = useCallback((): number => {
    clearTick();
    return now();
  }, [clearTick]);

  const finalize = useCallback(
    (cycleNumber: number, stopTimestamp: number, finalActivity?: ActivityType): CycleMeasurement | null => {
      const result = stopActiveCycle(activeCycle, stopTimestamp, cycleNumber, finalActivity);
      setActiveCycle(IDLE_STATE);
      setElapsedMs(0);
      setPreviewCycle(null);
      return result;
    },
    [activeCycle]
  );

  const stop = useCallback(
    (cycleNumber: number, finalActivity?: ActivityType): CycleMeasurement | null => {
      const ts = now();
      clearTick();
      const result = stopActiveCycle(activeCycle, ts, cycleNumber, finalActivity);
      setActiveCycle(IDLE_STATE);
      setElapsedMs(0);
      setPreviewCycle(null);
      return result;
    },
    [activeCycle, clearTick]
  );

  const markActivity = useCallback(
    (activityType: ActivityType) => {
      setActiveCycle((prev) => {
        if (!prev.isRunning) return prev;
        return registerActivityClick(prev, activityType, now());
      });
    },
    []
  );

  useEffect(() => {
    if (activeCycle.isRunning && activeCycle.startedAt !== undefined) {
      let lastChartUpdate = 0;

      intervalRef.current = setInterval(() => {
        const t = now();
        setElapsedMs(t - activeCycle.startedAt!);

        if (lastChartUpdate === 0 || t - lastChartUpdate >= CHART_UPDATE_MS) {
          setPreviewCycle(buildLivePreviewCycle(activeCycle, t, nextCycleNumber));
          lastChartUpdate = t;
        }
      }, TIMER_TICK_MS);
    } else {
      clearTick();
    }

    return clearTick;
  }, [activeCycle, nextCycleNumber, clearTick]);

  return { activeCycle, elapsedMs, previewCycle, start, freeze, finalize, stop, markActivity };
}
