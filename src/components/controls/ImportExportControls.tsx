import type { AppState } from '../../types/domain';
import { exportAsJson, readJsonFile } from '../../utils/exportImport';
import { exportCyclesCsv, exportSegmentsCsv } from '../../utils/csv';
import { validateImportData } from '../../utils/validation';
import { Button } from '../common/Button';
import { FileInput } from '../common/FileInput';

type ImportExportControlsProps = {
  state: AppState;
  onImport: (state: AppState) => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
};

export function ImportExportControls({ state, onImport, onError, onSuccess }: ImportExportControlsProps) {
  async function handleImport(file: File) {
    try {
      const raw = await readJsonFile(file);
      const result = validateImportData(raw);
      if (result.valid && result.state) {
        onImport(result.state);
        onSuccess('Daten erfolgreich importiert.');
      } else {
        onError(result.error ?? 'Unbekannter Importfehler.');
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Fehler beim Importieren.');
    }
  }

  return (
    <div className="import-export-controls">
      <Button variant="ghost" size="sm" onClick={() => exportAsJson(state)}>
        JSON Export
      </Button>
      <FileInput label="JSON Import" accept=".json" onFile={handleImport} />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => exportCyclesCsv(state.cycles)}
        disabled={state.cycles.length === 0}
      >
        CSV Zyklen
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => exportSegmentsCsv(state.cycles)}
        disabled={state.cycles.length === 0}
      >
        CSV Segmente
      </Button>
    </div>
  );
}
