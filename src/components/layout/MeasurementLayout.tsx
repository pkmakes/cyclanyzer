import type { ReactNode } from 'react';
import { formatMs } from '../../utils/time';

type MeasurementLayoutProps = {
  isRunning: boolean;
  elapsedMs: number;
  activityCount: number;
  onStart: () => void;
  onStop: () => void;
  onExitMeasureMode: () => void;
  chart: ReactNode;
  activityPad: ReactNode;
};

export function MeasurementLayout({
  isRunning,
  elapsedMs,
  activityCount,
  onStart,
  onStop,
  onExitMeasureMode,
  chart,
  activityPad,
}: MeasurementLayoutProps) {
  return (
    <div className="measure-layout">
      {/* Header – minimal, same style as dashboard */}
      <div className="measure-header">
        <span className="measure-header__title">Cyclanyzer</span>
        <button className="measure-header__exit" onClick={onExitMeasureMode} title="Zum Dashboard wechseln">
          ◳ Dashboard
        </button>
      </div>

      {/* Timer zone – status, time, start/stop */}
      <div className={`measure-timer ${isRunning ? 'measure-timer--running' : ''}`}>
        <span className={`measure-timer__status ${isRunning ? '' : 'measure-timer__status--idle'}`}>
          {isRunning ? '● Messung läuft' : '○ Bereit'}
        </span>
        <span className="measure-timer__display">{formatMs(elapsedMs, 1)}</span>
        <div className="measure-timer__actions">
          <button
            className="measure-action-btn measure-action-btn--start"
            disabled={isRunning}
            onClick={onStart}
          >
            ▶ Start
          </button>
          <button
            className="measure-action-btn measure-action-btn--stop"
            disabled={!isRunning}
            onClick={onStop}
          >
            ■ Stop
          </button>
        </div>
      </div>

      {/* Body – chart + activity pad, no scroll */}
      <div className={`measure-body measure-body--cols-${activityCount}`}>
        <div className="measure-chart">{chart}</div>
        <div className="measure-pad">{activityPad}</div>
      </div>
    </div>
  );
}
