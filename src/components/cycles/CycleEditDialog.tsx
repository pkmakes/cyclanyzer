import { useState } from 'react';
import type { ActivityType, CycleMeasurement, CycleSegment } from '../../types/domain';
import { UNASSIGNED_LABEL, UNASSIGNED_COLOR } from '../../types/domain';
import { rebuildSegmentOffsets, recalcCycleDuration } from '../../utils/cycleSegmentation';
import { formatMs } from '../../utils/time';
import { getContrastTextColor } from '../../utils/format';
import { Button } from '../common/Button';

type CycleEditDialogProps = {
  cycle: CycleMeasurement;
  activityTypes: ActivityType[];
  onSave: (segments: CycleSegment[], totalDurationMs: number, note: string) => void;
  onCancel: () => void;
};

export function CycleEditDialog({ cycle, activityTypes, onSave, onCancel }: CycleEditDialogProps) {
  const [segments, setSegments] = useState<CycleSegment[]>(cycle.segments);
  const [note, setNote] = useState(cycle.note ?? '');

  function handleSegmentActivityChange(segIndex: number, activityTypeId: string) {
    setSegments((prev) =>
      prev.map((s, i) => {
        if (i !== segIndex) return s;
        if (activityTypeId === '') {
          return { ...s, activityTypeId: undefined, activityLabel: UNASSIGNED_LABEL, color: UNASSIGNED_COLOR };
        }
        const at = activityTypes.find((a) => a.id === activityTypeId);
        if (!at) return s;
        return { ...s, activityTypeId: at.id, activityLabel: at.label, color: at.color };
      })
    );
  }

  function handleSegmentDurationChange(segIndex: number, value: string) {
    const ms = Math.max(0, Math.round(Number(value) * 1000));
    if (isNaN(ms)) return;
    setSegments((prev) =>
      prev.map((s, i) => (i === segIndex ? { ...s, durationMs: ms } : s))
    );
  }

  function handleDeleteSegment(segIndex: number) {
    setSegments((prev) => prev.filter((_, i) => i !== segIndex));
  }

  function handleSave() {
    const rebuilt = rebuildSegmentOffsets(segments.filter((s) => s.durationMs > 0));
    const total = recalcCycleDuration(rebuilt);
    onSave(rebuilt, total, note);
  }

  const totalMs = recalcCycleDuration(segments);

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">Zyklus {cycle.cycleNumber} bearbeiten</h3>

        <div className="form-field">
          <label className="form-label">Notiz</label>
          <input
            className="form-input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optionale Notiz…"
          />
        </div>

        <div className="segment-edit-list">
          <h4>Segmente</h4>
          {segments.length === 0 && <p className="hint-text">Keine Segmente vorhanden.</p>}
          {segments.map((seg, i) => (
            <div key={seg.id} className="segment-edit-row">
              <span className="segment-edit-row__num">#{i + 1}</span>
              <select
                className="form-input form-input--select"
                value={seg.activityTypeId ?? ''}
                onChange={(e) => handleSegmentActivityChange(i, e.target.value)}
              >
                <option value="">Nicht zugeordnet</option>
                {activityTypes.map((at) => (
                  <option key={at.id} value={at.id}>{at.label}</option>
                ))}
              </select>
              <span
                className="segment-edit-row__swatch"
                style={{
                  backgroundColor: seg.color ?? UNASSIGNED_COLOR,
                  color: getContrastTextColor(seg.color ?? UNASSIGNED_COLOR),
                }}
              />
              <input
                type="number"
                className="form-input form-input--short"
                value={(seg.durationMs / 1000).toFixed(1)}
                onChange={(e) => handleSegmentDurationChange(i, e.target.value)}
                step={0.1}
                min={0}
              />
              <span className="segment-edit-row__unit">s</span>
              <button
                className="icon-btn icon-btn--danger"
                onClick={() => handleDeleteSegment(i)}
                title="Segment löschen"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="segment-edit-total">
          Gesamtdauer: <strong>{formatMs(totalMs)}</strong>
        </div>

        <div className="modal-actions">
          <Button variant="ghost" onClick={onCancel}>Abbrechen</Button>
          <Button variant="primary" onClick={handleSave}>Speichern</Button>
        </div>
      </div>
    </div>
  );
}
