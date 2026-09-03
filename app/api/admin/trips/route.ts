import { NextResponse } from "next/server";
import type { CurrentTrip, Guest, GuestStatus, SkyCondition, TripStatus } from "@/lib/types";
import { dateToSlug, sanitizeSlug, dedupeSlug } from "@/lib/slug";
import { commitTripFile, listTripSlugsFromGitHub } from "@/lib/github";

const STATUSES: TripStatus[] = ["on", "weather-watch", "updated", "cancelled"];
const MOODS: SkyCondition[] = ["clear", "cloudy", "rain", "sunset", "night"];
const GUEST_STATUSES: GuestStatus[] = ["coming", "maybe", "not-coming"];

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

type ValidationResult = { ok: true; trip: CurrentTrip } | { ok: false; errors: string[] };

function validateTrip(body: any): ValidationResult {
  const errors: string[] = [];

  if (!isNonEmptyString(body?.date) || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
    errors.push("date must be an ISO date, e.g. 2026-09-05");
  }
  if (!isNonEmptyString(body?.meetTime)) errors.push("meetTime is required");
  if (!isNonEmptyString(body?.departTime)) errors.push("departTime is required");
  if (!isNonEmptyString(body?.estimatedReturnTime)) errors.push("estimatedReturnTime is required");
  if (!isNonEmptyString(body?.marinaLeaveTime)) errors.push("marinaLeaveTime is required");
  if (!isNonEmptyString(body?.marinaName)) errors.push("marinaName is required");
  if (!isNonEmptyString(body?.dayPlan)) errors.push("dayPlan is required");
  if (!isNonEmptyString(body?.lunchPlan)) errors.push("lunchPlan is required");
  if (!STATUSES.includes(body?.status)) errors.push(`status must be one of ${STATUSES.join(", ")}`);
  if (!isNonEmptyString(body?.statusLabel)) errors.push("statusLabel is required");
  if (!MOODS.includes(body?.backgroundMood)) errors.push(`backgroundMood must be one of ${MOODS.join(", ")}`);

  const coords = body?.coordinates ?? {};
  for (const key of ["marina", "peppercornReserve", "stairs"] as const) {
    const c = coords[key];
    if (!c || typeof c.lat !== "number" || typeof c.lon !== "number" || !isNonEmptyString(c.label)) {
      errors.push(`coordinates.${key} needs lat, lon and a label`);
    }
  }

  const guestsRaw = Array.isArray(body?.guests) ? body.guests : [];
  const guests: Guest[] = [];
  for (const g of guestsRaw) {
    if (!isNonEmptyString(g?.name)) continue;
    const status: GuestStatus = GUEST_STATUSES.includes(g.status) ? g.status : "coming";
    guests.push({
      name: g.name.trim(),
      role: isNonEmptyString(g.role) ? g.role.trim() : undefined,
      status,
    });
  }
  if (guests.length === 0) errors.push("at least one guest is required");

  if (errors.length > 0) return { ok: false, errors };

  const trip: CurrentTrip = {
    date: body.date,
    meetTime: body.meetTime.trim(),
    departTime: body.departTime.trim(),
    estimatedReturnTime: body.estimatedReturnTime.trim(),
    marinaLeaveTime: body.marinaLeaveTime.trim(),
    marinaName: body.marinaName.trim(),
    status: body.status,
    statusLabel: body.statusLabel.trim(),
    backgroundMood: body.backgroundMood,
    dayPlan: body.dayPlan.trim(),
    lunchPlan: body.lunchPlan.trim(),
    captainNote: isNonEmptyString(body?.captainNote) ? body.captainNote.trim() : undefined,
    guests,
    coordinates: {
      marina: {
        lat: coords.marina.lat,
        lon: coords.marina.lon,
        label: coords.marina.label.trim(),
        verified: !!coords.marina.verified,
      },
      peppercornReserve: {
        lat: coords.peppercornReserve.lat,
        lon: coords.peppercornReserve.lon,
        label: coords.peppercornReserve.label.trim(),
        verified: !!coords.peppercornReserve.verified,
      },
      stairs: {
        lat: coords.stairs.lat,
        lon: coords.stairs.lon,
        label: coords.stairs.label.trim(),
        verified: !!coords.stairs.verified,
      },
    },
  };

  return { ok: true, trip };
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const result = validateTrip(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.errors.join("; ") }, { status: 400 });
  }
  const { trip } = result;

  let existingSlugs: string[];
  try {
    existingSlugs = await listTripSlugsFromGitHub();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Couldn't reach GitHub" },
      { status: 502 }
    );
  }

  const requestedSlug = isNonEmptyString(body.slug) ? sanitizeSlug(body.slug) : "";
  const baseSlug = requestedSlug || dateToSlug(trip.date);
  // If the form explicitly says this is an edit of an existing trip, reuse
  // its slug exactly (overwrite) instead of appending a -2 suffix.
  const slug =
    body.overwrite && existingSlugs.includes(baseSlug)
      ? baseSlug
      : dedupeSlug(baseSlug, new Set(existingSlugs));

  try {
    await commitTripFile(
      slug,
      JSON.stringify(trip, null, 2) + "\n",
      `${existingSlugs.includes(slug) ? "Update" : "Add"} trip: ${trip.date} (${slug})`
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "GitHub commit failed" },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, slug, url: `https://boat.coconut.vision/${slug}` });
}

export async function GET() {
  try {
    const slugs = await listTripSlugsFromGitHub();
    return NextResponse.json({ slugs });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Couldn't reach GitHub" },
      { status: 502 }
    );
  }
}
