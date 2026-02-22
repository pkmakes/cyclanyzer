/** Convert milliseconds to seconds */
export function msToSeconds(ms: number): number {
  return ms / 1000;
}

/** Format ms as readable seconds string, e.g. "12.3 s" */
export function formatMs(ms: number, decimals = 1): string {
  return `${msToSeconds(ms).toFixed(decimals)} s`;
}

/** Format ms as compact seconds for chart display */
export function formatMsForChart(ms: number): string {
  return msToSeconds(ms).toFixed(1);
}

/** Format a timestamp to locale date/time string */
export function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString('de-DE');
}

/** Format a timestamp to short time string */
export function formatTimestampShort(ts: number): string {
  return new Date(ts).toLocaleTimeString('de-DE');
}

/** Get current high-resolution timestamp */
export function now(): number {
  return Date.now();
}
