import { useCallback, useEffect, useRef } from 'react';

/**
 * Warns the user via the browser's native beforeunload dialog
 * when they try to leave with unsaved changes.
 *
 * Returns `markDirty` (call after data changes) and `markClean` (call after save/import).
 */
export function useBeforeUnloadWarning() {
  const dirty = useRef(false);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (!dirty.current) return;
      e.preventDefault();
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const markDirty = useCallback(() => {
    dirty.current = true;
  }, []);

  const markClean = useCallback(() => {
    dirty.current = false;
  }, []);

  return { markDirty, markClean };
}
