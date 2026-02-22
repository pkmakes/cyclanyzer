import type { CycleMeasurement } from '../types/domain';
import { UNASSIGNED_LABEL } from '../types/domain';
import { downloadFile } from './exportImport';
import { msToSeconds } from './time';

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Export cycle summary as CSV */
export function exportCyclesCsv(cycles: CycleMeasurement[]): void {
  const header = ['Zyklus-Nr', 'ID', 'Startzeit', 'Endzeit', 'Gesamtdauer (ms)', 'Gesamtdauer (s)', 'Notiz'];
  const rows = cycles.map((c) => [
    String(c.cycleNumber),
    c.id,
    new Date(c.startedAt).toISOString(),
    new Date(c.endedAt).toISOString(),
    String(c.totalDurationMs),
    msToSeconds(c.totalDurationMs).toFixed(3),
    escapeCsvField(c.note ?? ''),
  ]);

  const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  downloadFile(csv, `cyclanyzer-zyklen-${timestamp}.csv`, 'text/csv;charset=utf-8');
}

/** Export segment details as CSV */
export function exportSegmentsCsv(cycles: CycleMeasurement[]): void {
  const header = [
    'Zyklus-Nr',
    'Zyklus-ID',
    'Segment-ID',
    'Aktivität',
    'Dauer (ms)',
    'Dauer (s)',
    'Startoffset (ms)',
    'Endoffset (ms)',
  ];

  const rows: string[][] = [];
  for (const c of cycles) {
    for (const s of c.segments) {
      rows.push([
        String(c.cycleNumber),
        c.id,
        s.id,
        escapeCsvField(s.activityLabel ?? UNASSIGNED_LABEL),
        String(s.durationMs),
        msToSeconds(s.durationMs).toFixed(3),
        String(s.startOffsetMs),
        String(s.endOffsetMs),
      ]);
    }
  }

  const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  downloadFile(csv, `cyclanyzer-segmente-${timestamp}.csv`, 'text/csv;charset=utf-8');
}
