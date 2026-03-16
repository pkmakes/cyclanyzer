import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { ActivityType, AppState, CycleSegment } from './types/domain';
import { FinalSegmentDialog } from './components/controls/FinalSegmentDialog';
import { appReducer } from './state/appReducer';
import { initialAppState } from './state/initialState';
import { getNextCycleNumber } from './state/selectors';
import { useCycleTimer } from './hooks/useCycleTimer';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { loadFromLocalStorage, useLocalStorageSync } from './hooks/useLocalStorageSync';
import { useBeforeUnloadWarning } from './hooks/useBeforeUnloadWarning';
import { exportAsJson, readJsonFile } from './utils/exportImport';
import { validateImportData } from './utils/validation';
import { MeasurementLayout } from './components/layout/MeasurementLayout';
import { DashboardPage } from './components/layout/DashboardPage';
import { SettingsPage } from './components/layout/SettingsPage';
import { TabBar, type TabId } from './components/layout/TabBar';
import { ToastContainer, type ToastMessage } from './components/common/Toast';

function getInitialState(): AppState {
  return loadFromLocalStorage() ?? initialAppState;
}

function ProjectNameEditor({
  projectName,
  onCommit,
}: {
  projectName: string;
  onCommit: (name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  function startEdit() {
    setValue(projectName);
    setEditing(true);
  }

  function commit() {
    const trimmed = value.trim();
    if (trimmed && trimmed !== projectName) {
      onCommit(trimmed);
    }
    setEditing(false);
  }

  if (editing) {
    return (
      <form className="project-name-form" onSubmit={(e) => { e.preventDefault(); commit(); }}>
        <input
          ref={inputRef}
          className="project-name-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          maxLength={60}
        />
      </form>
    );
  }

  return (
    <button className="project-name-btn" onClick={startEdit} title="Projektname ändern">
      <span className="project-name-btn__text">{projectName}</span>
      <svg className="project-name-btn__icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        <path d="m15 5 4 4" />
      </svg>
    </button>
  );
}

function HamburgerMenu({
  onSave,
  onLoad,
  onNew,
}: {
  onSave: () => void;
  onLoad: () => void;
  onNew: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="header-menu" ref={menuRef}>
      <button
        className="hamburger-btn"
        onClick={() => setOpen((prev) => !prev)}
        title="Menü"
        aria-label="Menü"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      {open && (
        <div className="dropdown-menu">
          <button className="dropdown-menu__item" onClick={() => { onSave(); setOpen(false); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            Speichern
          </button>
          <button className="dropdown-menu__item" onClick={() => { onLoad(); setOpen(false); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Laden
          </button>
          <div className="dropdown-menu__divider" />
          <button className="dropdown-menu__item dropdown-menu__item--danger" onClick={() => { onNew(); setOpen(false); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
            Neues Projekt
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [state, dispatch] = useReducer(appReducer, undefined, getInitialState);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const { markDirty, markClean, isDirty } = useBeforeUnloadWarning();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useLocalStorageSync(state);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    markDirty();
  }, [state, markDirty]);

  const nextCycleNumber = getNextCycleNumber(state);
  const { activeCycle, previewCycle, start, freeze, finalize, stop, markActivity } = useCycleTimer(nextCycleNumber);

  const [pendingStopTimestamp, setPendingStopTimestamp] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('measure');

  const addToast = useCallback((text: string, type: ToastMessage['type']) => {
    setToasts((prev) => [...prev, { id: uuidv4(), text, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  function handleSetProjectName(name: string) {
    dispatch({ type: 'SET_PROJECT_NAME', payload: { name } });
  }

  // Cycle controls
  function handleStart() {
    if (activeCycle.isRunning) return;
    start();
  }

  function handleStop() {
    if (!activeCycle.isRunning) return;
    if (state.activityTypes.length > 0) {
      const ts = freeze();
      setPendingStopTimestamp(ts);
      return;
    }
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

  function handleAddActivityType(label: string, color: string) {
    dispatch({ type: 'ADD_ACTIVITY_TYPE', payload: { id: uuidv4(), label, color } });
  }

  function handleUpdateActivityType(id: string, label: string, color: string) {
    dispatch({ type: 'UPDATE_ACTIVITY_TYPE', payload: { id, label, color } });
  }

  function handleDeleteActivityType(id: string) {
    dispatch({ type: 'DELETE_ACTIVITY_TYPE', payload: { id } });
  }

  function handleSetTargetTime(ms: number | undefined) {
    dispatch({ type: 'SET_TARGET_CYCLE_TIME', payload: { ms } });
  }

  function handleActivityClick(activityType: ActivityType) {
    if (!activeCycle.isRunning) return;
    markActivity(activityType);
  }

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

  function handleImport(importedState: AppState) {
    dispatch({ type: 'IMPORT_STATE', payload: importedState });
  }

  function handleNew() {
    if (isDirty() && !window.confirm('Es gibt ungespeicherte Änderungen. Ohne Speichern fortfahren?')) {
      return;
    }
    dispatch({ type: 'RESET_STATE', payload: initialAppState });
    markClean();
  }

  function handleSave() {
    exportAsJson(state, state.projectName);
    markClean();
    addToast('Projekt gespeichert.', 'success');
  }

  function handleLoadTrigger() {
    fileInputRef.current?.click();
  }

  async function handleLoadFile(file: File) {
    try {
      const raw = await readJsonFile(file);
      const result = validateImportData(raw);
      if (result.valid && result.state) {
        handleImport(result.state);
        markClean();
        addToast('Daten erfolgreich geladen.', 'success');
      } else {
        addToast(result.error ?? 'Unbekannter Importfehler.', 'error');
      }
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Fehler beim Laden.', 'error');
    }
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

  const lastSegment = activeCycle.provisionalSegments.length > 0
    ? activeCycle.provisionalSegments[activeCycle.provisionalSegments.length - 1]
    : null;
  const lastActivity = lastSegment
    ? { label: lastSegment.activityLabel, color: lastSegment.color }
    : null;

  return (
    <div className="app-shell">
      {/* Hidden file input for loading */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleLoadFile(file);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }}
      />

      {/* Desktop header */}
      <header className="app-header">
        <div className="header-content">
          <div className="project-name-area">
            <ProjectNameEditor projectName={state.projectName} onCommit={handleSetProjectName} />
          </div>
          <div className="header-tabs">
            <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
          <HamburgerMenu onSave={handleSave} onLoad={handleLoadTrigger} onNew={handleNew} />
        </div>
      </header>

      {/* Mobile header */}
      <header className="mobile-header">
        <div className="project-name-area">
          <ProjectNameEditor projectName={state.projectName} onCommit={handleSetProjectName} />
        </div>
        <HamburgerMenu onSave={handleSave} onLoad={handleLoadTrigger} onNew={handleNew} />
      </header>

      {/* Page content */}
      <main className="app-page">
        {activeTab === 'measure' && (
          <MeasurementLayout
            isRunning={activeCycle.isRunning}
            startedAt={activeCycle.startedAt}
            lastMarkAt={activeCycle.lastMarkAt}
            provisionalSegments={activeCycle.provisionalSegments}
            cycleNumber={nextCycleNumber}
            activityTypes={state.activityTypes}
            lastActivityLabel={lastActivity?.label}
            lastActivityColor={lastActivity?.color}
            lastActivityStartedAt={activeCycle.lastMarkAt}
            onStart={handleStart}
            onStop={handleStop}
            onActivityClick={handleActivityClick}
            onAddActivityType={handleAddActivityType}
            onUpdateActivityType={handleUpdateActivityType}
            onDeleteActivityType={handleDeleteActivityType}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardPage
            cycles={state.cycles}
            previewCycle={previewCycle}
            activityTypes={state.activityTypes}
            targetCycleTimeMs={state.settings.targetCycleTimeMs}
            onSetTargetTime={handleSetTargetTime}
            onDeleteCycle={handleDeleteCycle}
            onDuplicateCycle={handleDuplicateCycle}
            onUpdateSegments={handleUpdateSegments}
            onUpdateNote={handleUpdateNote}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPage
            state={state}
            activityTypes={state.activityTypes}
            onAddActivityType={handleAddActivityType}
            onUpdateActivityType={handleUpdateActivityType}
            onDeleteActivityType={handleDeleteActivityType}
          />
        )}
      </main>

      {/* Mobile bottom tab bar */}
      <div className="mobile-tab-bar">
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <ToastContainer messages={toasts} onDismiss={dismissToast} />

      {pendingStopTimestamp !== null && (
        <FinalSegmentDialog
          activityTypes={state.activityTypes}
          onSelect={handleFinalSegmentChoice}
        />
      )}
    </div>
  );
}
