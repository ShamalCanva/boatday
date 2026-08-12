import { SignJWT, importPKCS8 } from "jose";
import type { WeatherResult } from "./types";

// WeatherKit REST API. See https://developer.apple.com/documentation/weatherkitrestapi
const WEATHERKIT_BASE = "https://weatherkit.apple.com/api/v1/weather";

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getSignedToken(): Promise<string> {
  const teamId = process.env.APPLE_WEATHERKIT_TEAM_ID;
  const keyId = process.env.APPLE_WEATHERKIT_KEY_ID;
  const serviceId = process.env.APPLE_WEATHERKIT_SERVICE_ID;
  const rawKey = process.env.APPLE_WEATHERKIT_PRIVATE_KEY;

  if (!teamId || !keyId || !serviceId || !rawKey) {
    throw new Error(
      "WeatherKit env vars are not set. Copy .env.example to .env.local and fill in APPLE_WEATHERKIT_TEAM_ID, APPLE_WEATHERKIT_KEY_ID, APPLE_WEATHERKIT_SERVICE_ID and APPLE_WEATHERKIT_PRIVATE_KEY."
    );
  }

  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expiresAt - 60 > now) {
    return cachedToken.token;
  }

  const pem = rawKey.includes("\\n") ? rawKey.replace(/\\n/g, "\n") : rawKey;
  const privateKey = await importPKCS8(pem, "ES256");

  const exp = now + 60 * 50; // 50 minutes, under Apple's 1 hour max
  const token = await new SignJWT({
    sub: serviceId,
  })
    .setProtectedHeader({ alg: "ES256", kid: keyId, id: `${teamId}.${serviceId}` })
    .setIssuer(teamId)
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .sign(privateKey);

  cachedToken = { token, expiresAt: exp };
  return token;
}

/**
 * WeatherKit timestamps are UTC instants; this reads them back out in
 * Sydney local time so date/hour matching lines up with what a guest here
 * actually experiences, regardless of what timezone param the request used.
 */
function sydneyDateHour(iso: string): { date: string; hour: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso));
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  return { date: `${map.year}-${map.month}-${map.day}`, hour: Number(map.hour) % 24 };
}

function mapConditionDescription(code: string): string {
  // Human-friendly fallback labels for Apple's WeatherKit condition codes.
  const map: Record<string, string> = {
    Clear: "Clear",
    MostlyClear: "Mostly clear",
    PartlyCloudy: "Partly cloudy",
    MostlyCloudy: "Mostly cloudy",
    Cloudy: "Cloudy",
    Haze: "Hazy",
    Windy: "Windy",
    Drizzle: "Drizzle",
    Rain: "Rain",
    HeavyRain: "Heavy rain",
    Showers: "Showers",
    IsolatedThunderstorms: "Isolated storms",
    Thunderstorms: "Thunderstorms",
    Fog: "Foggy",
  };
  return map[code] ?? code.replace(/([a-z])([A-Z])/g, "$1 $2");
}

export async function getWeather(lat: number, lon: number, targetDate?: string): Promise<WeatherResult> {
  try {
    const token = await getSignedToken();
    const url = `${WEATHERKIT_BASE}/en_US/${lat}/${lon}?dataSets=currentWeather,forecastHourly,forecastDaily&timezone=Australia%2FSydney`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 600 },
    });

    if (!res.ok) {
      return {
        available: false,
        reason: `WeatherKit returned ${res.status}. Check your Team ID / Key ID / Service ID match the key you generated, and that the key is enabled for WeatherKit.`,
      };
    }

    const data = await res.json();
    const cw = data.currentWeather;
    const days = data.forecastDaily?.days ?? [];
    // The trip day's forecast, not necessarily today — WeatherKit returns
    // ~10 days starting from today, so match on date rather than assuming
    // index 0. Falls back to today if the trip date isn't in range.
    const forDay =
      (targetDate && days.find((d: any) => (d.forecastStart ?? "").slice(0, 10) === targetDate)) || days[0];
    const hourly = (data.forecastHourly?.hours ?? []).slice(0, 12);
    // Prefer the daytime-specific rain chance over the whole-day figure (which
    // spans into the overnight period) — used consistently below so the hero
    // and the "Weather on the Day" card never show two different numbers for
    // what a guest reads as the same question.
    const dayRainChance = forDay?.daytimeForecast?.precipitationChance ?? forDay?.precipitationChance ?? 0;

    return {
      available: true,
      current: {
        temperature: Math.round(cw.temperature),
        temperatureApparent: Math.round(cw.temperatureApparent),
        conditionCode: cw.conditionCode,
        conditionDescription: mapConditionDescription(cw.conditionCode),
        windSpeed: cw.windSpeed,
        windGust: cw.windGust,
        windDirection: cw.windDirection,
        uvIndex: cw.uvIndex,
        precipitationChance: cw.precipitationChance ?? 0,
        isDaylight: cw.daylight ?? true,
      },
      today: forDay
        ? {
            sunrise: forDay.sunrise,
            sunset: forDay.sunset,
            precipitationChanceMax: dayRainChance,
          }
        : undefined,
      forDay: forDay
        ? {
            date: (forDay.forecastStart ?? "").slice(0, 10),
            temperatureMax: Math.round(forDay.temperatureMax),
            temperatureMin: Math.round(forDay.temperatureMin),
            conditionCode: forDay.daytimeForecast?.conditionCode ?? forDay.conditionCode,
            conditionDescription: mapConditionDescription(
              forDay.daytimeForecast?.conditionCode ?? forDay.conditionCode
            ),
            precipitationChance: dayRainChance,
          }
        : undefined,
      hourly: hourly.map((h: any) => ({
        time: h.forecastStart,
        temperature: Math.round(h.temperature),
        windSpeed: h.windSpeed,
        windDirection: h.windDirection,
        precipitationChance: h.precipitationChance ?? 0,
      })),
    };
  } catch (err) {
    return {
      available: false,
      reason: err instanceof Error ? err.message : "Unknown WeatherKit error.",
    };
  }
}
