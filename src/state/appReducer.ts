import type { ActivityType, AppState, CycleMeasurement, CycleSegment } from '../types/domain';

export type AppAction =
  | { type: 'ADD_ACTIVITY_TYPE'; payload: ActivityType }
  | { type: 'UPDATE_ACTIVITY_TYPE'; payload: ActivityType }
  | { type: 'DELETE_ACTIVITY_TYPE'; payload: { id: string } }
  | { type: 'SET_TARGET_CYCLE_TIME'; payload: { ms: number | undefined } }
  | { type: 'ADD_CYCLE'; payload: CycleMeasurement }
  | { type: 'UPDATE_CYCLE'; payload: CycleMeasurement }
  | { type: 'DELETE_CYCLE'; payload: { id: string } }
  | { type: 'UPDATE_CYCLE_NOTE'; payload: { id: string; note: string } }
  | { type: 'UPDATE_CYCLE_SEGMENTS'; payload: { id: string; segments: CycleSegment[]; totalDurationMs: number } }
  | { type: 'DUPLICATE_CYCLE'; payload: { id: string; newCycle: CycleMeasurement } }
  | { type: 'IMPORT_STATE'; payload: AppState }
  | { type: 'RESET_STATE'; payload: AppState };

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_ACTIVITY_TYPE':
      return {
        ...state,
        activityTypes: [...state.activityTypes, action.payload],
      };

    case 'UPDATE_ACTIVITY_TYPE':
      return {
        ...state,
        activityTypes: state.activityTypes.map((at) =>
          at.id === action.payload.id ? action.payload : at
        ),
      };

    case 'DELETE_ACTIVITY_TYPE':
      return {
        ...state,
        activityTypes: state.activityTypes.filter((at) => at.id !== action.payload.id),
      };

    case 'SET_TARGET_CYCLE_TIME':
      return {
        ...state,
        settings: { ...state.settings, targetCycleTimeMs: action.payload.ms },
      };

    case 'ADD_CYCLE':
      return {
        ...state,
        cycles: [...state.cycles, action.payload],
      };

    case 'UPDATE_CYCLE':
      return {
        ...state,
        cycles: state.cycles.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };

    case 'DELETE_CYCLE':
      return {
        ...state,
        cycles: state.cycles.filter((c) => c.id !== action.payload.id),
      };

    case 'UPDATE_CYCLE_NOTE':
      return {
        ...state,
        cycles: state.cycles.map((c) =>
          c.id === action.payload.id ? { ...c, note: action.payload.note } : c
        ),
      };

    case 'UPDATE_CYCLE_SEGMENTS':
      return {
        ...state,
        cycles: state.cycles.map((c) =>
          c.id === action.payload.id
            ? { ...c, segments: action.payload.segments, totalDurationMs: action.payload.totalDurationMs }
            : c
        ),
      };

    case 'DUPLICATE_CYCLE':
      return {
        ...state,
        cycles: [...state.cycles, action.payload.newCycle],
      };

    case 'IMPORT_STATE':
      return action.payload;

    case 'RESET_STATE':
      return action.payload;

    default:
      return state;
  }
}
