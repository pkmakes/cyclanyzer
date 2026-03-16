import { useState } from 'react';
import type { ActivityType, CycleSegment } from '../../types/domain';
import { UNASSIGNED_COLOR } from '../../types/domain';
import { Button } from '../common/Button';
import { TimerDisplay } from '../common/TimerDisplay';
import { HorizontalSegmentBar } from '../chart/HorizontalSegmentBar';
import { ActivityPad } from '../activity/ActivityPad';
import { ActivityTypeForm } from '../activity/ActivityTypeForm';
import { ConfirmDialog } from '../common/ConfirmDialog';

type MeasurementLayoutProps = {
  isRunning: boolean;
  startedAt: number | undefined;
  lastMarkAt: number | undefined;
  provisionalSegments: CycleSegment[];
  cycleNumber: number;
  activityTypes: ActivityType[];
  lastActivityLabel: string | undefined;
  lastActivityColor: string | undefined;
  lastActivityStartedAt: number | undefined;
  onStart: () => void;
  onStop: () => void;
  onActivityClick: (activityType: ActivityType) => void;
  onAddActivityType: (label: string, color: string) => void;
  onUpdateActivityType: (id: string, label: string, color: string) => void;
  onDeleteActivityType: (id: string) => void;
};

export function MeasurementLayout({
  isRunning,
  startedAt,
  lastMarkAt,
  provisionalSegments,
  cycleNumber,
  activityTypes,
  lastActivityLabel,
  lastActivityColor,
  lastActivityStartedAt,
  onStart,
  onStop,
  onActivityClick,
  onAddActivityType,
  onUpdateActivityType,
  onDeleteActivityType,
}: MeasurementLayoutProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityType | null>(null);
  const [confirmDeleteActivity, setConfirmDeleteActivity] = useState<ActivityType | null>(null);

  function handleAddSave(label: string, color: string) {
    onAddActivityType(label, color);
    setShowAddForm(false);
  }

  function handleEditSave(label: string, color: string) {
    if (editingActivity) {
      onUpdateActivityType(editingActivity.id, label, color);
      setEditingActivity(null);
    }
  }

  function handleDeleteConfirmed() {
    if (confirmDeleteActivity) {
      onDeleteActivityType(confirmDeleteActivity.id);
      setConfirmDeleteActivity(null);
      setEditingActivity(null);
    }
  }

  const activityCount = activityTypes.length;

  return (
    <div className="measure-layout">
      {/* Header */}
      <div className="measure-header">
        <div className="measure-header__left">
          <h2 className="measure-header__cycle">Zyklus {cycleNumber}</h2>
          <span className={`measure-header__status ${isRunning ? 'measure-header__status--running' : ''}`}>
            {isRunning ? 'Aufnahme läuft' : 'Bereit'}
          </span>
        </div>
      </div>

      {/* Scrollable main content */}
      <div className="measure-content">
        {/* Timer */}
        <div className="measure-timer-section">
          <TimerDisplay startedAt={startedAt} className="measure-timer__display measure-timer__display--large" />
          {isRunning && lastActivityLabel && (
            <div className="measure-activity-indicator">
              <span
                className="measure-activity-indicator__dot"
                style={{ backgroundColor: lastActivityColor ?? UNASSIGNED_COLOR }}
              />
              <span className="measure-activity-indicator__label">{lastActivityLabel}</span>
              <span className="measure-activity-indicator__sep">&middot;</span>
              <TimerDisplay startedAt={lastActivityStartedAt} className="measure-activity-indicator__time" />
            </div>
          )}
        </div>

        {/* Horizontal segment bar */}
        <div className="measure-bar-section">
          <HorizontalSegmentBar
            provisionalSegments={provisionalSegments}
            startedAt={startedAt}
            lastMarkAt={lastMarkAt}
            isRunning={isRunning}
            liveColor={lastActivityColor ?? UNASSIGNED_COLOR}
          />
        </div>

        {/* Activity buttons */}
        <div className={`measure-activities measure-body--cols-${activityCount + 1}`}>
          {activityCount > 0 && (
            <h3 className="measure-activities__title">Tätigkeit abschliessen</h3>
          )}
          <div className="measure-pad">
            <ActivityPad
              activityTypes={activityTypes}
              isRunning={isRunning}
              onActivityClick={onActivityClick}
              onAddNew={() => setShowAddForm(true)}
              onLongPress={(at) => setEditingActivity(at)}
            />
          </div>
        </div>
      </div>

      {/* Start / Stop button */}
      <div className="measure-footer">
        {isRunning ? (
          <button
            className="measure-round-btn measure-round-btn--stop"
            onClick={onStop}
            title="Messung stoppen"
          >
            <span className="measure-round-btn__icon measure-round-btn__icon--stop" />
          </button>
        ) : (
          <button
            className="measure-round-btn measure-round-btn--start"
            onClick={onStart}
            title="Messung starten"
          >
            <span className="measure-round-btn__icon measure-round-btn__icon--start" />
          </button>
        )}
      </div>

      {/* Add activity type modal */}
      {showAddForm && (
        <div className="modal-overlay modal-overlay--top">
          <div className="modal-content">
            <h3 className="modal-title">Neue Tätigkeitsart</h3>
            <ActivityTypeForm
              onSave={handleAddSave}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}

      {/* Edit activity type modal */}
      {editingActivity && !confirmDeleteActivity && (
        <div className="modal-overlay modal-overlay--top">
          <div className="modal-content">
            <h3 className="modal-title">Tätigkeitsart bearbeiten</h3>
            <ActivityTypeForm
              initial={editingActivity}
              onSave={handleEditSave}
              onCancel={() => setEditingActivity(null)}
            />
            <div className="edit-activity-delete">
              <Button
                variant="danger"
                size="sm"
                onClick={() => setConfirmDeleteActivity(editingActivity)}
              >
                Tätigkeitsart löschen
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete dialog */}
      <ConfirmDialog
        open={confirmDeleteActivity !== null}
        title="Tätigkeitsart löschen"
        message={`„${confirmDeleteActivity?.label}" wirklich löschen?`}
        confirmLabel="Löschen"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmDeleteActivity(null)}
      />
    </div>
  );
}
