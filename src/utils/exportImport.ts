import type { AppState, ExportData } from '../types/domain';
import { EXPORT_VERSION } from '../types/domain';

/** Create an ExportData object from the current app state */
export function buildExportData(state: AppState): ExportData {
  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    state,
  };
}

/** Trigger a file download in the browser */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Export the app state as a JSON file */
export function exportAsJson(state: AppState): void {
  const data = buildExportData(state);
  const json = JSON.stringify(data, null, 2);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  downloadFile(json, `cyclanyzer-export-${timestamp}.json`, 'application/json');
}

/** Read and parse a JSON file from a File input */
export function readJsonFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        resolve(data);
      } catch {
        reject(new Error('Die Datei enthält kein gültiges JSON.'));
      }
    };
    reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei.'));
    reader.readAsText(file);
  });
}
