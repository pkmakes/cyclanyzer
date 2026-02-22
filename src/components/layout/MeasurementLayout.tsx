import type { ReactNode } from 'react';
import { Button } from '../common/Button';
import { formatMs } from '../../utils/time';

type MeasurementLayoutProps = {
  isRunning: boolean;
  elapsedMs: number;
  onStart: () => void;
  onStop: () => void;
  onExitMeasureMode: () => void;
  chart: ReactNode;
  activityPad: ReactNode;
};

export function MeasurementLayout({
  isRunning,
  elapsedMs,
  onStart,
  onStop,
  onExitMeasureMode,
  chart,
  activityPad,
}: MeasurementLayoutProps) {
  return (
    <div className="measure-layout">
      <div className="measure-topbar">
        <button className="measure-topbar__exit" onClick={onExitMeasureMode} title="Zum Dashboard wechseln">
          ◳ Dashboard
        </button>

        <span className={`measure-topbar__status ${isRunning ? '' : 'measure-topbar__status--idle'}`}>
          {isRunning ? '● Messung läuft' : '○ Bereit'}
        </span>

        <span className="measure-topbar__timer">{formatMs(elapsedMs, 1)}</span>

        <div className="measure-topbar__actions">
          <Button variant="success" size="lg" disabled={isRunning} onClick={onStart}>
            ▶ Start
          </Button>
          <Button variant="danger" size="lg" disabled={!isRunning} onClick={onStop}>
            ■ Stop
          </Button>
        </div>
      </div>

      <div className="measure-body">
        <div className="measure-chart">{chart}</div>
        <div className="measure-pad">{activityPad}</div>
      </div>
    </div>
  );
}
