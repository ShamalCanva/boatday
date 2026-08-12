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

export async function getWeather(lat: number, lon: number): Promise<WeatherResult> {
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
    const daily = data.forecastDaily?.days?.[0];
    const hourly = (data.forecastHourly?.hours ?? []).slice(0, 12);

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
      today: daily
        ? {
            sunrise: daily.sunrise,
            sunset: daily.sunset,
            precipitationChanceMax: daily.precipitationChance,
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
