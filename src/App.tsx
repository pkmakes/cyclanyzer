import { useCallback, useReducer, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { ActivityType, AppState, CycleSegment } from './types/domain';
import { FinalSegmentDialog } from './components/controls/FinalSegmentDialog';
import { appReducer } from './state/appReducer';
import { initialAppState } from './state/initialState';
import { getNextCycleNumber } from './state/selectors';
import { useCycleTimer } from './hooks/useCycleTimer';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { loadFromLocalStorage, useLocalStorageSync } from './hooks/useLocalStorageSync';
import { AppLayout } from './components/layout/AppLayout';
import { MeasurementLayout } from './components/layout/MeasurementLayout';
import { Panel } from './components/layout/Panel';
import { CycleControls } from './components/controls/CycleControls';
import { TargetCycleTimeInput } from './components/controls/TargetCycleTimeInput';
import { ImportExportControls } from './components/controls/ImportExportControls';
import { ActivityTypeConfigPanel } from './components/activity/ActivityTypeConfigPanel';
import { ActivityPad } from './components/activity/ActivityPad';
import { CycleChart } from './components/chart/CycleChart';
import { CycleTable } from './components/cycles/CycleTable';
import { StatsPanel } from './components/stats/StatsPanel';
import { ToastContainer, type ToastMessage } from './components/common/Toast';
import { Button } from './components/common/Button';

function getInitialState(): AppState {
  return loadFromLocalStorage() ?? initialAppState;
}

export default function App() {
  const [state, dispatch] = useReducer(appReducer, undefined, getInitialState);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useLocalStorageSync(state);

  const nextCycleNumber = getNextCycleNumber(state);
  const { activeCycle, elapsedMs, previewCycle, start, freeze, finalize, stop, markActivity } = useCycleTimer(nextCycleNumber);

  // Pending-stop state: timer is frozen, waiting for final segment activity choice
  const [pendingStopTimestamp, setPendingStopTimestamp] = useState<number | null>(null);

  // Measurement mode toggle – auto-activates on start, user can exit manually
  const [measureMode, setMeasureMode] = useState(false);

  // Toast helpers
  const addToast = useCallback((text: string, type: ToastMessage['type']) => {
    setToasts((prev) => [...prev, { id: uuidv4(), text, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Cycle controls
  function handleStart() {
    if (activeCycle.isRunning) return;
    start();
  }

  function handleStop() {
    if (!activeCycle.isRunning) return;

    // If activity types are configured, freeze timer and ask for final segment
    if (state.activityTypes.length > 0) {
      const ts = freeze();
      setPendingStopTimestamp(ts);
      return;
    }

    // No activity types → finalize immediately
    const result = stop(nextCycleNumber);
    if (result) {
      dispatch({ type: 'ADD_CYCLE', payload: result });
    }
  }

  function handleFinalSegmentChoice(activityType?: ActivityType) {
    if (pendingStopTimestamp === null) return;
    const result = finalize(nextCycleNumber, pendingStopTimestamp, activityType);
    setPendingStopTimestamp(null);
    if (result) {
      dispatch({ type: 'ADD_CYCLE', payload: result });
    }
  }

  // Activity type management
  function handleAddActivityType(label: string, color: string) {
    dispatch({ type: 'ADD_ACTIVITY_TYPE', payload: { id: uuidv4(), label, color } });
  }

  function handleUpdateActivityType(id: string, label: string, color: string) {
    dispatch({ type: 'UPDATE_ACTIVITY_TYPE', payload: { id, label, color } });
  }

  function handleDeleteActivityType(id: string) {
    dispatch({ type: 'DELETE_ACTIVITY_TYPE', payload: { id } });
  }

  // Target cycle time
  function handleSetTargetTime(ms: number | undefined) {
    dispatch({ type: 'SET_TARGET_CYCLE_TIME', payload: { ms } });
  }

  // Activity click during running cycle
  function handleActivityClick(activityType: ActivityType) {
    if (!activeCycle.isRunning) return;
    markActivity(activityType);
  }

  // Cycle management
  function handleDeleteCycle(id: string) {
    dispatch({ type: 'DELETE_CYCLE', payload: { id } });
  }

  function handleDuplicateCycle(id: string) {
    const original = state.cycles.find((c) => c.id === id);
    if (!original) return;
    const newCycle = {
      ...original,
      id: uuidv4(),
      cycleNumber: getNextCycleNumber(state),
      segments: original.segments.map((s) => ({ ...s, id: uuidv4() })),
      note: original.note ? `${original.note} (Kopie)` : '(Kopie)',
    };
    dispatch({ type: 'DUPLICATE_CYCLE', payload: { id, newCycle } });
  }

  function handleUpdateSegments(id: string, segments: CycleSegment[], totalDurationMs: number) {
    dispatch({ type: 'UPDATE_CYCLE_SEGMENTS', payload: { id, segments, totalDurationMs } });
  }

  function handleUpdateNote(id: string, note: string) {
    dispatch({ type: 'UPDATE_CYCLE_NOTE', payload: { id, note } });
  }

  // Import/Export
  function handleImport(importedState: AppState) {
    dispatch({ type: 'IMPORT_STATE', payload: importedState });
  }

  // Keyboard shortcuts
  const handleSpace = useCallback(() => {
    if (activeCycle.isRunning) {
      handleStop();
    } else {
      handleStart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCycle.isRunning]);

  const handleDigit = useCallback(
    (index: number) => {
      if (!activeCycle.isRunning) return;
      const at = state.activityTypes[index];
      if (at) markActivity(at);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeCycle.isRunning, state.activityTypes]
  );

  useKeyboardShortcuts({ onSpace: handleSpace, onDigit: handleDigit });

  const showMeasureMode = measureMode;

  const header = (
    <div className="header-content">
      <h1 className="app-title">Cyclanyzer</h1>
      <div className="header-actions">
        <ImportExportControls
          state={state}
          onImport={handleImport}
          onError={(msg) => addToast(msg, 'error')}
          onSuccess={(msg) => addToast(msg, 'success')}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMeasureMode((prev) => !prev)}
          title={measureMode ? 'Zum Dashboard wechseln' : 'Zum Messmodus wechseln'}
        >
          {measureMode ? '◳ Dashboard' : '◱ Messmodus'}
        </Button>
      </div>
    </div>
  );

  const leftColumn = (
    <>
      <Panel title="Zyklusdiagramm" className="panel--chart">
        <CycleChart
          cycles={state.cycles}
          previewCycle={previewCycle}
          targetCycleTimeMs={state.settings.targetCycleTimeMs}
          activityTypes={state.activityTypes}
        />
      </Panel>
      <StatsPanel cycles={state.cycles} />
      <CycleTable
        cycles={state.cycles}
        activityTypes={state.activityTypes}
        onDelete={handleDeleteCycle}
        onDuplicate={handleDuplicateCycle}
        onUpdateSegments={handleUpdateSegments}
        onUpdateNote={handleUpdateNote}
      />
    </>
  );

  const rightColumn = (
    <>
      <Panel title="Zyklussteuerung" className="panel--controls">
        <CycleControls
          isRunning={activeCycle.isRunning}
          elapsedMs={elapsedMs}
          onStart={handleStart}
          onStop={handleStop}
        />
        <TargetCycleTimeInput
          targetMs={state.settings.targetCycleTimeMs}
          onChange={handleSetTargetTime}
        />
      </Panel>
      <Panel title="Activity Pad" className="panel--activity-pad">
        <ActivityPad
          activityTypes={state.activityTypes}
          isRunning={activeCycle.isRunning}
          onActivityClick={handleActivityClick}
        />
      </Panel>
      <ActivityTypeConfigPanel
        activityTypes={state.activityTypes}
        onAdd={handleAddActivityType}
        onUpdate={handleUpdateActivityType}
        onDelete={handleDeleteActivityType}
      />
    </>
  );

  return (
    <>
      {/* Dashboard is always in the DOM */}
      <AppLayout header={header} leftColumn={leftColumn} rightColumn={rightColumn} />

      {/* Measurement mode overlays when active */}
      {showMeasureMode && (
        <MeasurementLayout
          isRunning={activeCycle.isRunning}
          elapsedMs={elapsedMs}
          activityCount={state.activityTypes.length}
          onStart={handleStart}
          onStop={handleStop}
          onExitMeasureMode={() => setMeasureMode(false)}
          chart={
            <CycleChart
              cycles={state.cycles}
              previewCycle={previewCycle}
              targetCycleTimeMs={state.settings.targetCycleTimeMs}
              activityTypes={state.activityTypes}
              fillHeight
            />
          }
          activityPad={
            <ActivityPad
              activityTypes={state.activityTypes}
              isRunning={activeCycle.isRunning}
              onActivityClick={handleActivityClick}
            />
          }
        />
      )}

      <ToastContainer messages={toasts} onDismiss={dismissToast} />

      {/* Final segment dialog always renders on top regardless of layout mode */}
      {pendingStopTimestamp !== null && (
        <FinalSegmentDialog
          activityTypes={state.activityTypes}
          onSelect={handleFinalSegmentChoice}
        />
      )}
    </>
  );
}
