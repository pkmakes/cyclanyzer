import { useRef } from 'react';
import { Button } from './Button';

type FileInputProps = {
  label: string;
  accept: string;
  onFile: (file: File) => void;
};

export function FileInput({ label, accept, onFile }: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onFile(file);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      <Button variant="ghost" size="sm" onClick={() => inputRef.current?.click()}>
        {label}
      </Button>
    </>
  );
}
