import { useCallback, useRef } from 'react';
import type { ActivityType } from '../../types/domain';
import { MAX_ACTIVITY_TYPES } from '../../types/domain';
import { getContrastTextColor } from '../../utils/format';

const LONG_PRESS_MS = 500;

type ActivityPadProps = {
  activityTypes: ActivityType[];
  isRunning: boolean;
  onActivityClick: (activityType: ActivityType) => void;
  /** When provided, a "+Neu" button is rendered at the end of the grid */
  onAddNew?: () => void;
  /** Long-press on an activity button opens edit mode */
  onLongPress?: (activityType: ActivityType) => void;
};

function useLongPress(onLongPress: () => void, onClick: () => void) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);

  const start = useCallback(() => {
    firedRef.current = false;
    timerRef.current = setTimeout(() => {
      firedRef.current = true;
      onLongPress();
    }, LONG_PRESS_MS);
  }, [onLongPress]);

  const cancel = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const end = useCallback(() => {
    cancel();
    if (!firedRef.current) {
      onClick();
    }
  }, [cancel, onClick]);

  return {
    onMouseDown: start,
    onMouseUp: end,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: end,
    onTouchCancel: cancel,
  };
}

function ActivityButton({
  at,
  index,
  isRunning,
  onActivityClick,
  onLongPress,
}: {
  at: ActivityType;
  index: number;
  isRunning: boolean;
  onActivityClick: (activityType: ActivityType) => void;
  onLongPress?: (activityType: ActivityType) => void;
}) {
  const shortcut = index < 9 ? index + 1 : index === 9 ? 0 : null;

  const handleClick = useCallback(() => {
    if (isRunning) onActivityClick(at);
  }, [isRunning, onActivityClick, at]);

  const handleLongPress = useCallback(() => {
    onLongPress?.(at);
  }, [onLongPress, at]);

  const pressHandlers = useLongPress(handleLongPress, handleClick);

  return (
    <button
      className={`activity-btn ${!isRunning ? 'activity-btn--disabled' : ''}`}
      style={{
        backgroundColor: isRunning ? at.color : undefined,
        color: isRunning ? getContrastTextColor(at.color) : undefined,
      }}
      disabled={!isRunning && !onLongPress}
      onClick={(e) => e.preventDefault()}
      title={`${at.label}${shortcut !== null ? ` [${shortcut}]` : ''}`}
      {...(onLongPress ? pressHandlers : { onClick: handleClick })}
    >
      <span className="activity-btn__label">{at.label}</span>
      {shortcut !== null && (
        <span className="activity-btn__shortcut">[{shortcut}]</span>
      )}
    </button>
  );
}

export function ActivityPad({ activityTypes, isRunning, onActivityClick, onAddNew, onLongPress }: ActivityPadProps) {
  if (activityTypes.length === 0 && !onAddNew) {
    return (
      <div className="activity-pad activity-pad--empty">
        <p className="hint-text">Keine Tätigkeitsarten konfiguriert.</p>
      </div>
    );
  }

  const canAdd = onAddNew && activityTypes.length < MAX_ACTIVITY_TYPES;

  return (
    <div className="activity-pad">
      <p className="activity-pad__info">
        Ein Klick markiert die vergangene Zeit als gewählte Tätigkeit.
        <br />
        <small>Die Zeit vom letzten Klick bis Stop wird als „Nicht zugeordnet" gespeichert.</small>
      </p>
      <div className="activity-pad__grid">
        {activityTypes.map((at, index) => (
          <ActivityButton
            key={at.id}
            at={at}
            index={index}
            isRunning={isRunning}
            onActivityClick={onActivityClick}
            onLongPress={onLongPress}
          />
        ))}
        {canAdd && (
          <button
            className="activity-btn activity-btn--add-new"
            onClick={onAddNew}
            title="Neue Tätigkeitsart hinzufügen"
          >
            <span className="activity-btn__label">+ Neu</span>
          </button>
        )}
      </div>
    </div>
  );
}
