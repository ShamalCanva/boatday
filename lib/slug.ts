// Slug helpers shared by the server (lib/trips.ts, the admin API route) and
// the admin form (client-side preview of what slug a date will produce).
// Kept dependency-free so it's safe to import from "use client" components.

const MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

/** "2026-09-05" -> "05sep". No year — trips are short-lived, one-off links. */
export function dateToSlug(dateIso: string): string {
  const [, month, day] = dateIso.split("-");
  const monthIndex = Number(month) - 1;
  return `${day}${MONTHS[monthIndex] ?? "xxx"}`;
}

/** Lowercases, strips anything that isn't a-z/0-9/hyphen, collapses repeats. */
export function sanitizeSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Appends -2, -3, ... until the slug isn't in `taken`. */
export function dedupeSlug(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}
