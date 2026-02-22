import { useState } from 'react';
import type { ActivityType } from '../../types/domain';
import { MAX_ACTIVITY_TYPES } from '../../types/domain';
import { canAddActivityType } from '../../utils/validation';
import { Button } from '../common/Button';
import { Panel } from '../layout/Panel';
import { ActivityTypeForm } from './ActivityTypeForm';
import { getContrastTextColor } from '../../utils/format';

type ActivityTypeConfigPanelProps = {
  activityTypes: ActivityType[];
  onAdd: (label: string, color: string) => void;
  onUpdate: (id: string, label: string, color: string) => void;
  onDelete: (id: string) => void;
};

export function ActivityTypeConfigPanel({ activityTypes, onAdd, onUpdate, onDelete }: ActivityTypeConfigPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  function handleAdd(label: string, color: string) {
    onAdd(label, color);
    setShowForm(false);
  }

  function handleUpdate(label: string, color: string) {
    if (editingId) {
      onUpdate(editingId, label, color);
      setEditingId(null);
    }
  }

  const editingType = activityTypes.find((at) => at.id === editingId);

  return (
    <Panel title="Tätigkeitsarten" className="panel--config">
      <div className="activity-type-list">
        {activityTypes.map((at, i) => (
          <div key={at.id} className="activity-type-item">
            {editingId === at.id ? (
              <ActivityTypeForm
                initial={editingType}
                onSave={handleUpdate}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="activity-type-item__row">
                <span
                  className="activity-type-item__swatch"
                  style={{ backgroundColor: at.color, color: getContrastTextColor(at.color) }}
                >
                  {i < 9 ? i + 1 : 0}
                </span>
                <span className="activity-type-item__label">{at.label}</span>
                <div className="activity-type-item__actions">
                  <button className="icon-btn" onClick={() => setEditingId(at.id)} title="Bearbeiten">✎</button>
                  <button className="icon-btn icon-btn--danger" onClick={() => onDelete(at.id)} title="Löschen">✕</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showForm && !editingId && (
        <ActivityTypeForm onSave={handleAdd} onCancel={() => setShowForm(false)} />
      )}

      {!showForm && !editingId && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowForm(true)}
          disabled={!canAddActivityType(activityTypes.length)}
        >
          + Tätigkeitsart hinzufügen
          {activityTypes.length >= MAX_ACTIVITY_TYPES && ' (Maximum erreicht)'}
        </Button>
      )}

      {activityTypes.length === 0 && !showForm && (
        <p className="hint-text">
          Keine Tätigkeitsarten konfiguriert. Zyklen werden ohne Segmentierung gespeichert.
        </p>
      )}
    </Panel>
  );
}
