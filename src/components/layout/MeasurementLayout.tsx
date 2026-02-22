import type { ReactNode } from 'react';
import { Button } from '../common/Button';
import { TimerDisplay } from '../common/TimerDisplay';

type MeasurementLayoutProps = {
  isRunning: boolean;
  startedAt: number | undefined;
  activityCount: number;
  onStart: () => void;
  onStop: () => void;
  onExitMeasureMode: () => void;
  chart: ReactNode;
  activityPad: ReactNode;
};

export function MeasurementLayout({
  isRunning,
  startedAt,
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
        <Button variant="ghost" size="sm" onClick={onExitMeasureMode} title="Zum Dashboard wechseln">
          ◳ Dashboard
        </Button>
      </div>

      {/* Timer zone – status, time, start/stop */}
      <div className={`measure-timer ${isRunning ? 'measure-timer--running' : ''}`}>
        <span className={`measure-timer__status ${isRunning ? '' : 'measure-timer__status--idle'}`}>
          {isRunning ? '● Messung läuft' : '○ Bereit'}
        </span>
        <TimerDisplay startedAt={startedAt} className="measure-timer__display" />
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
