import { useCallback, useEffect, useRef, useState } from 'react';
import type { ActiveCycleState, ActivityType, CycleMeasurement } from '../types/domain';
import {
  buildLivePreviewCycle,
  registerActivityClick,
  startActiveCycle,
  stopActiveCycle,
} from '../utils/cycleSegmentation';
import { now } from '../utils/time';

const TICK_INTERVAL_MS = 50;

type UseCycleTimerReturn = {
  activeCycle: ActiveCycleState;
  elapsedMs: number;
  previewCycle: CycleMeasurement | null;
  start: () => void;
  stop: (cycleNumber: number) => CycleMeasurement | null;
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
    const cycle = startActiveCycle(now());
    setActiveCycle(cycle);
    setElapsedMs(0);
  }, []);

  const stop = useCallback(
    (cycleNumber: number): CycleMeasurement | null => {
      const result = stopActiveCycle(activeCycle, now(), cycleNumber);
      setActiveCycle(IDLE_STATE);
      setElapsedMs(0);
      setPreviewCycle(null);
      clearTick();
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

  // Tick loop for live elapsed time and preview
  useEffect(() => {
    if (activeCycle.isRunning && activeCycle.startedAt !== undefined) {
      intervalRef.current = setInterval(() => {
        const currentNow = now();
        setElapsedMs(currentNow - activeCycle.startedAt!);
        setPreviewCycle(buildLivePreviewCycle(activeCycle, currentNow, nextCycleNumber));
      }, TICK_INTERVAL_MS);
    } else {
      clearTick();
    }

    return clearTick;
  }, [activeCycle, nextCycleNumber, clearTick]);

  return { activeCycle, elapsedMs, previewCycle, start, stop, markActivity };
}
