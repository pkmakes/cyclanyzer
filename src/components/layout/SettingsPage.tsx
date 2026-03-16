import type { AppState } from '../../types/domain';
import { Panel } from './Panel';
import { ImportExportControls } from '../controls/ImportExportControls';
import { ActivityTypeConfigPanel } from '../activity/ActivityTypeConfigPanel';

type SettingsPageProps = {
  state: AppState;
  activityTypes: AppState['activityTypes'];
  onAddActivityType: (label: string, color: string) => void;
  onUpdateActivityType: (id: string, label: string, color: string) => void;
  onDeleteActivityType: (id: string) => void;
};

export function SettingsPage({
  state,
  activityTypes,
  onAddActivityType,
  onUpdateActivityType,
  onDeleteActivityType,
}: SettingsPageProps) {
  return (
    <div className="settings-page">
      <Panel title="Datenexport">
        <div className="settings-section">
          <ImportExportControls state={state} />
        </div>
      </Panel>

      <ActivityTypeConfigPanel
        activityTypes={activityTypes}
        onAdd={onAddActivityType}
        onUpdate={onUpdateActivityType}
        onDelete={onDeleteActivityType}
      />
    </div>
  );
}
