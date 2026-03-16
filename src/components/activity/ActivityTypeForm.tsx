import { useRef, useState } from 'react';
import type { ActivityType } from '../../types/domain';
import { isValidActivityLabel, isValidHexColor } from '../../utils/validation';
import { Button } from '../common/Button';

type ActivityTypeFormProps = {
  initial?: ActivityType;
  onSave: (label: string, color: string) => void;
  onCancel: () => void;
};

const PASTEL_COLORS = [
  '#7EB8DA', // blau
  '#A8D8A8', // gruen
  '#F7C59F', // orange
  '#F4A4A4', // rot
  '#C3A6D8', // violett
  '#F9D96C', // gelb
  '#8ED3C7', // tuerkis
  '#F2A7C3', // rosa
];

export function ActivityTypeForm({ initial, onSave, onCancel }: ActivityTypeFormProps) {
  const [label, setLabel] = useState(initial?.label ?? '');
  const defaultColor = initial?.color ?? PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)];
  const [color, setColor] = useState(defaultColor);
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ label?: string; color?: string }>({});
  const colorInputRef = useRef<HTMLInputElement>(null);

  const allSwatches = [...PASTEL_COLORS, ...customColors];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!isValidActivityLabel(label)) newErrors.label = 'Bezeichnung darf nicht leer sein.';
    if (!isValidHexColor(color)) newErrors.color = 'Bitte gültige HEX-Farbe eingeben.';
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      onSave(label.trim(), color);
    }
  }

  function handleCustomColorPick() {
    colorInputRef.current?.click();
  }

  function handleNativeColorChange(e: React.ChangeEvent<HTMLInputElement>) {
    const c = e.target.value;
    setColor(c);
    if (!allSwatches.includes(c)) {
      setCustomColors((prev) => [...prev, c]);
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
        <div className="color-palette">
          {allSwatches.map((c) => (
            <button
              key={c}
              type="button"
              className={`color-palette__swatch ${color === c ? 'color-palette__swatch--selected' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
              title={c}
            />
          ))}
          <button
            type="button"
            className="color-palette__swatch color-palette__swatch--add"
            onClick={handleCustomColorPick}
            title="Eigene Farbe wählen"
          >
            +
          </button>
          <input
            ref={colorInputRef}
            type="color"
            value={color}
            onChange={handleNativeColorChange}
            className="color-palette__hidden-input"
            tabIndex={-1}
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
