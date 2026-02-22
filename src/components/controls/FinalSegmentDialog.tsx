import type { ActivityType } from '../../types/domain';
import { getContrastTextColor } from '../../utils/format';
import { Button } from '../common/Button';

type FinalSegmentDialogProps = {
  activityTypes: ActivityType[];
  onSelect: (activityType?: ActivityType) => void;
};

export function FinalSegmentDialog({ activityTypes, onSelect }: FinalSegmentDialogProps) {
  return (
    <div className="modal-overlay modal-overlay--top">
      <div className="modal-content final-segment-dialog">
        <h3 className="modal-title">Letztes Segment zuordnen</h3>
        <p className="final-segment-dialog__hint">
          Welche Tätigkeit wurde seit dem letzten Klick bis jetzt ausgeführt?
        </p>
        <div className="final-segment-dialog__grid">
          {activityTypes.map((at, index) => {
            const shortcut = index < 9 ? index + 1 : index === 9 ? 0 : null;
            return (
              <button
                key={at.id}
                className="activity-btn"
                style={{
                  backgroundColor: at.color,
                  color: getContrastTextColor(at.color),
                }}
                onClick={() => onSelect(at)}
              >
                <span className="activity-btn__label">{at.label}</span>
                {shortcut !== null && (
                  <span className="activity-btn__shortcut">[{shortcut}]</span>
                )}
              </button>
            );
          })}
        </div>
        <div className="final-segment-dialog__footer">
          <Button variant="ghost" onClick={() => onSelect(undefined)}>
            Nicht zugeordnet lassen
          </Button>
        </div>
      </div>
    </div>
  );
}
