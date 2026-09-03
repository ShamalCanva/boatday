import fs from "node:fs";
import path from "node:path";
import type { CurrentTrip } from "./types";

/**
 * Multi-trip data layer. Each boat day lives as one JSON file in
 * data/trips/{slug}.json — the slug (filename minus .json) is the URL
 * segment, e.g. data/trips/05sep-2026.json -> /05sep-2026.
 *
 * New trips are added either by hand (drop a file here and redeploy) or via
 * the /admin form, which commits a new file to this same folder through the
 * GitHub API and lets Vercel's normal auto-deploy pick it up.
 */

const TRIPS_DIR = path.join(process.cwd(), "data", "trips");

function readTripFile(slug: string): CurrentTrip | undefined {
  const file = path.join(TRIPS_DIR, `${slug}.json`);
  // Guard against path traversal — slug should never contain a slash, but a
  // malformed dynamic-route param could in theory try.
  if (!file.startsWith(TRIPS_DIR)) return undefined;
  try {
    const raw = fs.readFileSync(file, "utf-8");
    return JSON.parse(raw) as CurrentTrip;
  } catch {
    return undefined;
  }
}

export function getAllTripSlugs(): string[] {
  try {
    return fs
      .readdirSync(TRIPS_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""));
  } catch {
    return [];
  }
}

export function getTripBySlug(slug: string): CurrentTrip | undefined {
  return readTripFile(slug);
}

/** "YYYY-MM-DD" for right now, in Sydney local time — for comparing against trip.date. */
function sydneyTodayIso(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  return `${map.year}-${map.month}-${map.day}`;
}

/**
 * Which trip "/" and the bottom nav should point at: the soonest trip that
 * hasn't happened yet, or — once every trip is in the past — the most
 * recent one, so old links don't suddenly 404 the day after a boat day.
 */
export function getCurrentTripSlug(): string | undefined {
  const today = sydneyTodayIso();
  const slugs = getAllTripSlugs();
  const trips = slugs
    .map((slug) => ({ slug, trip: readTripFile(slug) }))
    .filter((t): t is { slug: string; trip: CurrentTrip } => !!t.trip);

  if (trips.length === 0) return undefined;

  const upcoming = trips
    .filter((t) => t.trip.date >= today)
    .sort((a, b) => a.trip.date.localeCompare(b.trip.date));
  if (upcoming.length > 0) return upcoming[0].slug;

  const past = trips.sort((a, b) => b.trip.date.localeCompare(a.trip.date));
  return past[0].slug;
}

export function getCurrentTrip(): { slug: string; trip: CurrentTrip } | undefined {
  const slug = getCurrentTripSlug();
  if (!slug) return undefined;
  const trip = getTripBySlug(slug);
  if (!trip) return undefined;
  return { slug, trip };
}
