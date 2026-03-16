import type { AppState } from '../types/domain';

export const initialAppState: AppState = {
  projectName: 'Neues Projekt',
  settings: {
    targetCycleTimeMs: undefined,
  },
  activityTypes: [],
  cycles: [],
};
