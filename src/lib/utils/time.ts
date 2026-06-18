export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function timeToMinutes(time: string): number {
  const parts = time.split(":");
  const h = parts[0] ? parseInt(parts[0], 10) : 0;
  const m = parts[1] ? parseInt(parts[1], 10) : 0;
  return h * 60 + m;
}
