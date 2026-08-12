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

export async function getWeather(
  lat: number,
  lon: number,
  targetDate?: string,
  targetHour?: number
): Promise<WeatherResult> {
  try {
    const token = await getSignedToken();
    let url = `${WEATHERKIT_BASE}/en_US/${lat}/${lon}?dataSets=currentWeather,forecastHourly,forecastDaily&timezone=Australia%2FSydney`;

    // Without an explicit window, forecastHourly can fall back to a ~24h
    // default — not enough to reach a trip day that's more than a day out.
    // Request through the end of the trip date explicitly (Sydney is
    // UTC+10 in August — no daylight saving to account for).
    if (targetDate) {
      const hourlyStart = new Date();
      const hourlyEnd = new Date(`${targetDate}T23:59:59+10:00`);
      hourlyEnd.setUTCDate(hourlyEnd.getUTCDate() + 1);
      url += `&hourlyStart=${encodeURIComponent(hourlyStart.toISOString())}&hourlyEnd=${encodeURIComponent(
        hourlyEnd.toISOString()
      )}`;
    }

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
    const allHours = data.forecastHourly?.hours ?? [];

    // The trip day's daily summary, not necessarily today — WeatherKit
    // returns ~10 days starting from today, so match on date rather than
    // assuming index 0. Falls back to today if the trip date isn't in range.
    const forDayDaily =
      (targetDate && days.find((d: any) => sydneyDateHour(d.forecastStart).date === targetDate)) || days[0];

    // The specific hour on the trip day closest to the trip's meet time —
    // this is what actually drives the hero, since "today's weather" or a
    // 24-hour high/low isn't what a guest wants when checking ahead of time.
    const dayHours = targetDate
      ? allHours.filter((h: any) => sydneyDateHour(h.forecastStart).date === targetDate)
      : [];
    const wantHour = targetHour ?? 12;
    const atMeetTime = dayHours.reduce((best: any, h: any) => {
      if (!best) return h;
      const bestDiff = Math.abs(sydneyDateHour(best.forecastStart).hour - wantHour);
      const hDiff = Math.abs(sydneyDateHour(h.forecastStart).hour - wantHour);
      return hDiff < bestDiff ? h : best;
    }, null);

    // Prefer the specific hour's rain chance, then the daytime figure, then
    // the whole-day figure (which spans into the overnight period) — used
    // consistently below so the hero and "Weather on the Day" card never
    // show two different numbers for what a guest reads as the same question.
    const dayRainChance =
      atMeetTime?.precipitationChance ??
      forDayDaily?.daytimeForecast?.precipitationChance ??
      forDayDaily?.precipitationChance ??
      0;

    // Hourly strip (Wind card) — scoped to the trip day when we have one,
    // rather than "next 12 hours from now" which would be today's hours.
    const hourlySource = targetDate ? dayHours : allHours.slice(0, 12);

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
      today: forDayDaily
        ? {
            sunrise: forDayDaily.sunrise,
            sunset: forDayDaily.sunset,
            precipitationChanceMax: dayRainChance,
          }
        : undefined,
      forDay: atMeetTime
        ? {
            date: sydneyDateHour(atMeetTime.forecastStart).date,
            temperature: Math.round(atMeetTime.temperature),
            temperatureApparent:
              atMeetTime.temperatureApparent !== undefined ? Math.round(atMeetTime.temperatureApparent) : undefined,
            conditionCode: atMeetTime.conditionCode,
            conditionDescription: mapConditionDescription(atMeetTime.conditionCode),
            precipitationChance: dayRainChance,
            uvIndex: atMeetTime.uvIndex,
            windSpeed: atMeetTime.windSpeed,
            windGust: atMeetTime.windGust,
            windDirection: atMeetTime.windDirection,
          }
        : forDayDaily
        ? {
            date: sydneyDateHour(forDayDaily.forecastStart).date,
            temperature: Math.round(forDayDaily.temperatureMax),
            conditionCode: forDayDaily.daytimeForecast?.conditionCode ?? forDayDaily.conditionCode,
            conditionDescription: mapConditionDescription(
              forDayDaily.daytimeForecast?.conditionCode ?? forDayDaily.conditionCode
            ),
            precipitationChance: dayRainChance,
          }
        : undefined,
      hourly: hourlySource.map((h: any) => ({
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
