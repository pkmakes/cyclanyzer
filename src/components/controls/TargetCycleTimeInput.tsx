import { useState, useEffect } from 'react';
import { NumberInput } from '../common/NumberInput';
import { isValidTargetTime } from '../../utils/validation';

type TargetCycleTimeInputProps = {
  targetMs: number | undefined;
  onChange: (ms: number | undefined) => void;
};

export function TargetCycleTimeInput({ targetMs, onChange }: TargetCycleTimeInputProps) {
  const [inputValue, setInputValue] = useState(targetMs ? String(targetMs / 1000) : '');

  useEffect(() => {
    setInputValue(targetMs ? String(targetMs / 1000) : '');
  }, [targetMs]);

  function handleChange(value: string) {
    setInputValue(value);
    if (value.trim() === '') {
      onChange(undefined);
    } else if (isValidTargetTime(value)) {
      onChange(Number(value) * 1000);
    }
  }

  return (
    <NumberInput
      label="Ziel-Zykluszeit"
      value={inputValue}
      onChange={handleChange}
      placeholder="z. B. 30"
      min={0}
      step={0.1}
      hint="in Sekunden"
      error={inputValue !== '' && !isValidTargetTime(inputValue) ? 'Bitte eine positive Zahl eingeben' : undefined}
    />
  );
}
