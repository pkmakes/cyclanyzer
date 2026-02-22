import { useState } from 'react';
import type { ActivityType } from '../../types/domain';
import { isValidActivityLabel, isValidHexColor } from '../../utils/validation';
import { Button } from '../common/Button';

type ActivityTypeFormProps = {
  initial?: ActivityType;
  onSave: (label: string, color: string) => void;
  onCancel: () => void;
};

const DEFAULT_COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0', '#00BCD4', '#795548', '#607D8B', '#E91E63', '#CDDC39'];

export function ActivityTypeForm({ initial, onSave, onCancel }: ActivityTypeFormProps) {
  const [label, setLabel] = useState(initial?.label ?? '');
  const [color, setColor] = useState(initial?.color ?? DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)]);
  const [errors, setErrors] = useState<{ label?: string; color?: string }>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!isValidActivityLabel(label)) newErrors.label = 'Bezeichnung darf nicht leer sein.';
    if (!isValidHexColor(color)) newErrors.color = 'Bitte gültige HEX-Farbe eingeben (z. B. #FF0000).';
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      onSave(label.trim(), color);
    }
  }

  return (
    <form className="activity-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label className="form-label">Bezeichnung</label>
        <input
          className={`form-input ${errors.label ? 'form-input--error' : ''}`}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="z. B. Wertschöpfung"
          autoFocus
        />
        {errors.label && <span className="form-error">{errors.label}</span>}
      </div>
      <div className="form-field">
        <label className="form-label">Farbe</label>
        <div className="color-input-row">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="color-picker"
          />
          <input
            className={`form-input form-input--short ${errors.color ? 'form-input--error' : ''}`}
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="#4CAF50"
          />
        </div>
        {errors.color && <span className="form-error">{errors.color}</span>}
      </div>
      <div className="activity-form__actions">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Abbrechen</Button>
        <Button type="submit" variant="primary" size="sm">{initial ? 'Speichern' : 'Hinzufügen'}</Button>
      </div>
    </form>
  );
}
