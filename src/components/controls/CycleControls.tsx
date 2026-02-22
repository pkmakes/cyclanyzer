import { Button } from '../common/Button';
import { TimerDisplay } from '../common/TimerDisplay';

type CycleControlsProps = {
  isRunning: boolean;
  startedAt: number | undefined;
  onStart: () => void;
  onStop: () => void;
};

export function CycleControls({ isRunning, startedAt, onStart, onStop }: CycleControlsProps) {
  return (
    <div className="cycle-controls">
      <div className="cycle-controls__status">
        <span className={`status-badge ${isRunning ? 'status-badge--running' : 'status-badge--idle'}`}>
          {isRunning ? '● Messung läuft' : '○ Bereit'}
        </span>
      </div>

      <div className="cycle-controls__timer">
        <TimerDisplay startedAt={startedAt} />
      </div>

      <div className="cycle-controls__buttons">
        <Button
          variant="success"
          size="xl"
          disabled={isRunning}
          onClick={onStart}
          aria-label="Zyklus starten"
        >
          ▶ Start Zyklus
        </Button>
        <Button
          variant="danger"
          size="xl"
          disabled={!isRunning}
          onClick={onStop}
          aria-label="Zyklus stoppen"
        >
          ■ Stop Zyklus
        </Button>
      </div>

      <p className="cycle-controls__hint">Tastenkürzel: Leertaste = Start / Stop</p>
    </div>
  );
}
