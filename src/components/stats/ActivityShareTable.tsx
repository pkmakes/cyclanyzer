import type { ActivityShare } from '../../utils/statistics';
import { formatMs } from '../../utils/time';
import { formatPercent, getContrastTextColor } from '../../utils/format';

type ActivityShareTableProps = {
  shares: ActivityShare[];
};

export function ActivityShareTable({ shares }: ActivityShareTableProps) {
  if (shares.length === 0) return null;

  return (
    <div className="activity-share-table">
      <h4 className="stats-subtitle">Aktivitätsanteile (alle Zyklen)</h4>
      <table className="stats-table">
        <thead>
          <tr>
            <th>Tätigkeit</th>
            <th className="stats-table__right">Dauer</th>
            <th className="stats-table__right">Anteil</th>
          </tr>
        </thead>
        <tbody>
          {shares.map((s) => (
            <tr key={s.activityLabel}>
              <td>
                <span className="stats-table__swatch" style={{
                  backgroundColor: s.color,
                  color: getContrastTextColor(s.color),
                }}>
                  {s.activityLabel}
                </span>
              </td>
              <td className="stats-table__right">{formatMs(s.totalDurationMs)}</td>
              <td className="stats-table__right">{formatPercent(s.percent)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
