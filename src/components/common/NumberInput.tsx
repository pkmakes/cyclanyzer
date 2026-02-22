type NumberInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: number;
  step?: number;
  hint?: string;
  error?: string;
};

export function NumberInput({ label, value, onChange, placeholder, min, step, hint, error }: NumberInputProps) {
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      {hint && <span className="form-hint">{hint}</span>}
      <input
        type="number"
        className={`form-input ${error ? 'form-input--error' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        step={step}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
