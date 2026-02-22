import { useEffect } from 'react';
import type { AppState } from '../types/domain';

const STORAGE_KEY = 'cyclanyzer-state';

/** Load state from localStorage */
export function loadFromLocalStorage(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppState;
  } catch {
    return null;
  }
}

/** Save state to localStorage */
export function saveToLocalStorage(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable – silently ignore
  }
}

/** Hook that auto-saves state to localStorage on every change */
export function useLocalStorageSync(state: AppState): void {
  useEffect(() => {
    saveToLocalStorage(state);
  }, [state]);
}
