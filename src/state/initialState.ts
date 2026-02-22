import type { AppState } from '../types/domain';

export const initialAppState: AppState = {
  settings: {
    targetCycleTimeMs: undefined,
  },
  activityTypes: [],
  cycles: [],
};
