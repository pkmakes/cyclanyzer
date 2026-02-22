import type { CycleMeasurement } from '../../types/domain';
import { computeActivityShares, computeCycleStats } from '../../utils/statistics';
import { formatMs } from '../../utils/time';
import { Panel } from '../layout/Panel';
import { EmptyState } from '../common/EmptyState';
import { ActivityShareTable } from './ActivityShareTable';

type StatsPanelProps = {
  cycles: CycleMeasurement[];
};

export function StatsPanel({ cycles }: StatsPanelProps) {
  const stats = computeCycleStats(cycles);
  const shares = computeActivityShares(cycles);

  if (!stats) {
    return (
      <Panel title="Statistiken">
        <EmptyState message="Noch keine Daten für Statistiken." />
      </Panel>
    );
  }

  return (
    <Panel title="Statistiken">
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-card__label">Anzahl</span>
          <span className="stat-card__value">{stats.count}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Durchschnitt</span>
          <span className="stat-card__value">{formatMs(stats.mean)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Median</span>
          <span className="stat-card__value">{formatMs(stats.median)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Min</span>
          <span className="stat-card__value">{formatMs(stats.min)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Max</span>
          <span className="stat-card__value">{formatMs(stats.max)}</span>
        </div>
      </div>

      <ActivityShareTable shares={shares} />
    </Panel>
  );
}
