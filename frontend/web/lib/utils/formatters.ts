export function formatRainfall(mm: number): string {
  return `${mm.toFixed(1)} mm`;
}

export function formatSoilMoisture(percent: number): string {
  return `${percent.toFixed(0)}%`;
}

export function formatElevation(meters: number): string {
  return `${meters.toLocaleString()} m`;
}

export function formatSlope(deg: number): string {
  return `${deg.toFixed(1)}°`;
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}
