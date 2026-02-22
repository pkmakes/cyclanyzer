import { useState } from 'react';
import type { ActivityType, CycleMeasurement, CycleSegment } from '../../types/domain';
import { UNASSIGNED_LABEL } from '../../types/domain';
import { formatMs, formatTimestamp } from '../../utils/time';
import { getContrastTextColor } from '../../utils/format';
import { Button } from '../common/Button';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';
import { Panel } from '../layout/Panel';
import { CycleEditDialog } from './CycleEditDialog';

type CycleTableProps = {
  cycles: CycleMeasurement[];
  activityTypes: ActivityType[];
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onUpdateSegments: (id: string, segments: CycleSegment[], totalDurationMs: number) => void;
  onUpdateNote: (id: string, note: string) => void;
};

export function CycleTable({
  cycles,
  activityTypes,
  onDelete,
  onDuplicate,
  onUpdateSegments,
  onUpdateNote,
}: CycleTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editCycle, setEditCycle] = useState<CycleMeasurement | null>(null);

  function handleConfirmDelete() {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  }

  function handleSaveEdit(segments: CycleSegment[], totalDurationMs: number, note: string) {
    if (editCycle) {
      onUpdateSegments(editCycle.id, segments, totalDurationMs);
      onUpdateNote(editCycle.id, note);
      setEditCycle(null);
    }
  }

  if (cycles.length === 0) {
    return (
      <Panel title="Gemessene Zyklen">
        <EmptyState message="Noch keine Zyklen gemessen." />
      </Panel>
    );
  }

  // Build segment summaries per cycle
  function getSegmentSummary(cycle: CycleMeasurement): { label: string; color: string; durationMs: number }[] {
    const map = new Map<string, { color: string; durationMs: number }>();
    for (const seg of cycle.segments) {
      const label = seg.activityLabel ?? UNASSIGNED_LABEL;
      const existing = map.get(label);
      if (existing) {
        existing.durationMs += seg.durationMs;
      } else {
        map.set(label, { color: seg.color ?? '#B0BEC5', durationMs: seg.durationMs });
      }
    }
    return Array.from(map.entries()).map(([label, data]) => ({ label, ...data }));
  }

  return (
    <Panel title="Gemessene Zyklen" className="panel--table">
      <div className="cycle-table-wrapper">
        <table className="cycle-table">
          <thead>
            <tr>
              <th>Nr.</th>
              <th>Gesamtzeit</th>
              <th>Segmente</th>
              <th>Zeitstempel</th>
              <th>Notiz</th>
              <th className="cycle-table__actions-header">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {cycles.map((cycle) => {
              const summary = getSegmentSummary(cycle);
              return (
                <tr key={cycle.id}>
                  <td className="cycle-table__num">{cycle.cycleNumber}</td>
                  <td className="cycle-table__duration">{formatMs(cycle.totalDurationMs)}</td>
                  <td>
                    <div className="segment-pills">
                      {summary.map((s) => (
                        <span
                          key={s.label}
                          className="segment-pill"
                          style={{
                            backgroundColor: s.color,
                            color: getContrastTextColor(s.color),
                          }}
                        >
                          {s.label}: {formatMs(s.durationMs)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="cycle-table__ts">{formatTimestamp(cycle.startedAt)}</td>
                  <td className="cycle-table__note">{cycle.note ?? '–'}</td>
                  <td className="cycle-table__actions">
                    <Button size="sm" variant="ghost" onClick={() => setEditCycle(cycle)}>
                      Bearbeiten
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onDuplicate(cycle.id)}>
                      Duplizieren
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => setDeleteId(cycle.id)}>
                      Löschen
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="Zyklus löschen"
        message="Soll dieser Zyklus unwiderruflich gelöscht werden?"
        confirmLabel="Löschen"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      {editCycle && (
        <CycleEditDialog
          cycle={editCycle}
          activityTypes={activityTypes}
          onSave={handleSaveEdit}
          onCancel={() => setEditCycle(null)}
        />
      )}
    </Panel>
  );
}
