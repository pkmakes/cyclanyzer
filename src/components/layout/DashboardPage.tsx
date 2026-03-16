import { useEffect, useRef, useState } from 'react';
import type { ActivityType, CycleMeasurement, CycleSegment } from '../../types/domain';
import { Panel } from './Panel';
import { CycleChart } from '../chart/CycleChart';
import { CycleTable } from '../cycles/CycleTable';
import { StatsPanel } from '../stats/StatsPanel';
import { isValidTargetTime } from '../../utils/validation';

type DashboardPageProps = {
  cycles: CycleMeasurement[];
  previewCycle: CycleMeasurement | null;
  activityTypes: ActivityType[];
  targetCycleTimeMs: number | undefined;
  onSetTargetTime: (ms: number | undefined) => void;
  onDeleteCycle: (id: string) => void;
  onDuplicateCycle: (id: string) => void;
  onUpdateSegments: (id: string, segments: CycleSegment[], totalDurationMs: number) => void;
  onUpdateNote: (id: string, note: string) => void;
};

export function DashboardPage({
  cycles,
  previewCycle,
  activityTypes,
  targetCycleTimeMs,
  onSetTargetTime,
  onDeleteCycle,
  onDuplicateCycle,
  onUpdateSegments,
  onUpdateNote,
}: DashboardPageProps) {
  const [editingTarget, setEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function openEditor() {
    setTargetInput(targetCycleTimeMs ? String(targetCycleTimeMs / 1000) : '');
    setEditingTarget(true);
  }

  useEffect(() => {
    if (editingTarget && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingTarget]);

  function commit() {
    if (targetInput.trim() === '') {
      onSetTargetTime(undefined);
    } else if (isValidTargetTime(targetInput)) {
      onSetTargetTime(Number(targetInput) * 1000);
    }
    setEditingTarget(false);
  }

  return (
    <div className="dashboard-page dashboard-page--single">
      {/* Target cycle time bar */}
      <div className="dashboard-target-bar">
        <span className="dashboard-target-bar__label">Ziel-Zykluszeit</span>
        {!editingTarget ? (
          <button className="target-time-chip" onClick={openEditor} title="Ziel-Zykluszeit festlegen">
            {targetCycleTimeMs
              ? <><span className="target-time-chip__icon">⏱</span>{(targetCycleTimeMs / 1000).toFixed(0)} s</>
              : <><span className="target-time-chip__icon">⏱</span>Festlegen</>
            }
          </button>
        ) : (
          <form
            className="target-time-inline"
            onSubmit={(e) => { e.preventDefault(); commit(); }}
          >
            <span className="target-time-inline__icon">⏱</span>
            <input
              ref={inputRef}
              className="target-time-inline__input"
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              onBlur={commit}
              placeholder="sec"
            />
            <span className="target-time-inline__unit">s</span>
          </form>
        )}
        {targetCycleTimeMs && !editingTarget && (
          <button
            className="target-time-clear"
            onClick={() => onSetTargetTime(undefined)}
            title="Zielzeit entfernen"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}
      </div>

      <Panel title="Zyklusdiagramm" className="panel--chart">
        <CycleChart
          cycles={cycles}
          previewCycle={previewCycle}
          targetCycleTimeMs={targetCycleTimeMs}
          activityTypes={activityTypes}
        />
      </Panel>
      <StatsPanel cycles={cycles} />
      <CycleTable
        cycles={cycles}
        activityTypes={activityTypes}
        onDelete={onDeleteCycle}
        onDuplicate={onDuplicateCycle}
        onUpdateSegments={onUpdateSegments}
        onUpdateNote={onUpdateNote}
      />
    </div>
  );
}
