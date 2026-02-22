/** Format a percentage value */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)} %`;
}

/** Format seconds for display */
export function formatSeconds(seconds: number, decimals = 1): string {
  return `${seconds.toFixed(decimals)} s`;
}

/**
 * Determine whether text on a given background color should be light or dark.
 * Uses relative luminance calculation.
 */
export function getContrastTextColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 0.5 ? '#1a1a2e' : '#ffffff';
}
