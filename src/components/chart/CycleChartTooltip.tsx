import type { TooltipProps } from 'recharts';
import { formatPercent, formatSeconds } from '../../utils/format';
import type { SegmentChartMeta } from '../../types/domain';

type PayloadEntry = {
  dataKey: string;
  value: number;
  color: string;
  name: string;
};

type CustomPayload = {
  totalSeconds?: number;
  isPreview?: boolean;
  _meta?: SegmentChartMeta[];
};

export function CycleChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;

  const data = (payload[0]?.payload ?? {}) as CustomPayload;
  const entries = payload as unknown as PayloadEntry[];
  const meta = data._meta ?? [];
  const total = data.totalSeconds ?? 0;

  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__title">
        {label} {data.isPreview ? '(laufend)' : ''}
      </p>
      <p className="chart-tooltip__total">Gesamt: {formatSeconds(total)}</p>
      <ul className="chart-tooltip__list">
        {entries
          .filter((e) => e.value > 0)
          .map((entry) => {
            const segIndex = parseInt(entry.dataKey.replace('seg_', ''), 10);
            const segMeta = meta[segIndex];
            const pct = total > 0 ? (entry.value / total) * 100 : 0;
            return (
              <li key={entry.dataKey} className="chart-tooltip__item">
                <span
                  className="chart-tooltip__swatch"
                  style={{ backgroundColor: segMeta?.color ?? entry.color }}
                />
                <span>{segMeta?.label ?? entry.dataKey}</span>
                <span className="chart-tooltip__value">
                  {formatSeconds(entry.value)} ({formatPercent(pct)})
                </span>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
