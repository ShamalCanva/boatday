import type { MarineResult, TideExtreme } from "./types";

// Sydney (Fort Denison) — BOM's official reference tide station for Sydney
// Harbour, the closest accurate live source to Drummoyne. Verified working
// against BOM's own tide page network calls.
const BOM_AAC = "NSW_TP007";
const BOM_TABLE_URL = "https://www.bom.gov.au/australia/tides/scripts/getTidesTable.php";
const BOM_SOURCE_URL =
  "https://www.bom.gov.au/australia/tides/#!/nsw-sydney-fort-denison";

// A point just outside Sydney Harbour's heads, in open coastal water — the
// only kind of spot Open-Meteo's marine model can represent meaningfully.
// This is deliberately NOT Drummoyne: the upper harbour is too enclosed for
// any free ocean model to resolve, so we're honest about what this number is.
const HARBOUR_ENTRANCE_COORDS = { lat: -33.83, lon: 151.29 };

// BOM requires a browser-like User-Agent or it returns "Access Denied".
const BOM_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
};

function parseTidesTable(html: string): TideExtreme[] {
  const rowRegex =
    /<td[^>]*data-time-utc="([^"]+)"[^>]*class="localtime (high|low)-tide">/g;
  const heightRegex = /<td class="height (?:high|low)-tide">([\d.]+)\s*m<\/td>/g;

  const times: { timeIso: string; type: "high" | "low" }[] = [];
  let m: RegExpExecArray | null;
  while ((m = rowRegex.exec(html)) !== null) {
    times.push({ timeIso: m[1], type: m[2] as "high" | "low" });
  }

  const heights: number[] = [];
  while ((m = heightRegex.exec(html)) !== null) {
    heights.push(parseFloat(m[1]));
  }

  return times.map((t, i) => ({
    type: t.type,
    timeIso: t.timeIso,
    heightM: heights[i] ?? NaN,
  }));
}

async function getTideExtremes(dateIso: string): Promise<TideExtreme[]> {
  const url = `${BOM_TABLE_URL}?type=tide&aac=${BOM_AAC}&date=${dateIso}&days=1&region=NSWRO&offset=false&offsetName=&tz=Australia%2FSydney`;
  const res = await fetch(url, {
    headers: BOM_HEADERS,
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`BOM tide table returned ${res.status}`);
  }
  const html = await res.text();
  const extremes = parseTidesTable(html);
  if (extremes.length === 0) {
    throw new Error("Could not parse any tide extremes from BOM's response.");
  }
  return extremes;
}

async function getHarbourEntranceConditions() {
  try {
    const { lat, lon } = HARBOUR_ENTRANCE_COORDS;
    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,ocean_current_velocity,ocean_current_direction&timezone=Australia%2FSydney&forecast_days=1`;
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) {
      return {
        available: false,
        reason: `Open-Meteo Marine returned ${res.status}`,
        note: "Open-water conditions near the harbour heads — the mooring inside the harbour will be calmer than this.",
      };
    }
    const data = await res.json();
    const c = data.current ?? {};
    return {
      available: true,
      waveHeightM: c.wave_height,
      waveDirection: c.wave_direction,
      currentSpeedKn: typeof c.ocean_current_velocity === "number" ? c.ocean_current_velocity / 1.852 : undefined,
      currentDirection: c.ocean_current_direction,
      note: "Open-water conditions near the harbour heads — the mooring inside the harbour will be calmer than this.",
    };
  } catch (err) {
    return {
      available: false,
      reason: err instanceof Error ? err.message : "Unknown Open-Meteo Marine error.",
      note: "Open-water conditions near the harbour heads — the mooring inside the harbour will be calmer than this.",
    };
  }
}

export async function getMarineConditions(dateIso: string): Promise<MarineResult> {
  const [tideResult, harbourEntrance] = await Promise.allSettled([
    getTideExtremes(dateIso),
    getHarbourEntranceConditions(),
  ]);

  const result: MarineResult = {
    available: tideResult.status === "fulfilled",
    station: "Sydney (Fort Denison)",
    sourceUrl: BOM_SOURCE_URL,
    harbourEntrance:
      harbourEntrance.status === "fulfilled"
        ? harbourEntrance.value
        : { available: false, reason: "Open-Meteo Marine request failed.", note: "" },
  };

  if (tideResult.status === "fulfilled") {
    result.tide = { extremes: tideResult.value, updatedAt: new Date().toISOString() };
  } else {
    result.reason =
      tideResult.reason instanceof Error ? tideResult.reason.message : "Could not load tide data.";
  }

  return result;
}
