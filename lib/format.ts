export function formatTime(iso: string, timeZone = "Australia/Sydney"): string {
  return new Date(iso).toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone,
  });
}

export function kmhToKnots(kmh: number): number {
  return Math.round((kmh / 1.852) * 10) / 10;
}

export function compassLabel(deg: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

/** Parses "10:00 am" style strings into a 24-hour integer, e.g. 10 or 14. */
export function parseHour12(timeStr: string): number {
  const m = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (!m) return 12;
  let hour = Number(m[1]) % 12;
  if (m[3].toLowerCase() === "pm") hour += 12;
  return hour;
}

export function formatDateLong(dateIso: string): string {
  const d = new Date(`${dateIso}T00:00:00+10:00`);
  return d.toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Australia/Sydney",
  });
}
