import { useEffect } from 'react';

type ShortcutHandler = {
  onSpace: () => void;
  onDigit?: (index: number) => void;
};

function isInputFocused(): boolean {
  const tag = document.activeElement?.tagName?.toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
  if ((document.activeElement as HTMLElement)?.isContentEditable) return true;
  return false;
}

export function useKeyboardShortcuts({ onSpace, onDigit }: ShortcutHandler): void {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isInputFocused()) return;

      if (e.code === 'Space') {
        e.preventDefault();
        onSpace();
        return;
      }

      if (onDigit) {
        // Keys 1-9 map to indices 0-8, key 0 maps to index 9
        const digitMatch = e.code.match(/^(?:Digit|Numpad)(\d)$/);
        if (digitMatch) {
          e.preventDefault();
          const digit = parseInt(digitMatch[1], 10);
          const index = digit === 0 ? 9 : digit - 1;
          onDigit(index);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSpace, onDigit]);
}
