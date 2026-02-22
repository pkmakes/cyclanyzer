import type { ActivityType } from '../../types/domain';
import { getContrastTextColor } from '../../utils/format';

type ActivityPadProps = {
  activityTypes: ActivityType[];
  isRunning: boolean;
  onActivityClick: (activityType: ActivityType) => void;
};

export function ActivityPad({ activityTypes, isRunning, onActivityClick }: ActivityPadProps) {
  if (activityTypes.length === 0) {
    return (
      <div className="activity-pad activity-pad--empty">
        <p className="hint-text">Keine Tätigkeitsarten konfiguriert.</p>
      </div>
    );
  }

  return (
    <div className="activity-pad">
      <p className="activity-pad__info">
        Ein Klick markiert die vergangene Zeit als gewählte Tätigkeit.
        <br />
        <small>Die Zeit vom letzten Klick bis Stop wird als „Nicht zugeordnet" gespeichert.</small>
      </p>
      <div className="activity-pad__grid">
        {activityTypes.map((at, index) => {
          const shortcut = index < 9 ? index + 1 : index === 9 ? 0 : null;
          return (
            <button
              key={at.id}
              className={`activity-btn ${!isRunning ? 'activity-btn--disabled' : ''}`}
              style={{
                backgroundColor: isRunning ? at.color : undefined,
                color: isRunning ? getContrastTextColor(at.color) : undefined,
              }}
              disabled={!isRunning}
              onClick={() => onActivityClick(at)}
              title={`${at.label}${shortcut !== null ? ` [${shortcut}]` : ''}`}
            >
              <span className="activity-btn__label">{at.label}</span>
              {shortcut !== null && (
                <span className="activity-btn__shortcut">[{shortcut}]</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
