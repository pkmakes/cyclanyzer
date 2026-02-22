import type { AppState, ExportData } from '../types/domain';
import { EXPORT_VERSION, MAX_ACTIVITY_TYPES } from '../types/domain';

/** Validate a hex color string */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

/** Validate an activity label */
export function isValidActivityLabel(label: string): boolean {
  return label.trim().length > 0;
}

/** Check if the activity types limit has been reached */
export function canAddActivityType(count: number): boolean {
  return count < MAX_ACTIVITY_TYPES;
}

/** Validate a target cycle time value (in seconds) */
export function isValidTargetTime(value: string): boolean {
  const num = Number(value);
  return !isNaN(num) && num > 0;
}

/** Validate imported JSON data structure */
export function validateImportData(data: unknown): { valid: boolean; error?: string; state?: AppState } {
  if (data === null || typeof data !== 'object') {
    return { valid: false, error: 'Ungültiges Dateiformat: kein gültiges JSON-Objekt.' };
  }

  const obj = data as Record<string, unknown>;

  if (obj.version !== EXPORT_VERSION) {
    return { valid: false, error: `Nicht unterstützte Version: ${String(obj.version)}. Erwartet: ${EXPORT_VERSION}.` };
  }

  if (!obj.state || typeof obj.state !== 'object') {
    return { valid: false, error: 'Ungültige Datenstruktur: "state" fehlt.' };
  }

  const state = obj.state as Record<string, unknown>;

  if (!Array.isArray(state.activityTypes)) {
    return { valid: false, error: 'Ungültige Datenstruktur: "activityTypes" fehlt oder ist kein Array.' };
  }

  if (!Array.isArray(state.cycles)) {
    return { valid: false, error: 'Ungültige Datenstruktur: "cycles" fehlt oder ist kein Array.' };
  }

  if (!state.settings || typeof state.settings !== 'object') {
    return { valid: false, error: 'Ungültige Datenstruktur: "settings" fehlt.' };
  }

  const exportData = data as ExportData;
  return { valid: true, state: exportData.state };
}
