import type { AppState } from '../../types/domain';
import { exportSegmentsCsv } from '../../utils/csv';
import { exportChartAsPng } from '../../utils/exportChart';
import { Button } from '../common/Button';

type ImportExportControlsProps = {
  state: AppState;
};

export function ImportExportControls({ state }: ImportExportControlsProps) {
  return (
    <div className="import-export-controls">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => exportChartAsPng()}
        disabled={state.cycles.length === 0}
      >
        Export Diagramm
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => exportSegmentsCsv(state.cycles)}
        disabled={state.cycles.length === 0}
      >
        Export CSV
      </Button>
    </div>
  );
}
