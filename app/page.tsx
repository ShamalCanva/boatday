import Link from "next/link";
import { currentTrip } from "@/lib/trip";
import { getWeather } from "@/lib/weatherkit";
import { getMarineConditions } from "@/lib/marine";
import { formatDateLong, formatTime, kmhToKnots } from "@/lib/format";
import WeatherBackground, { type SkyCondition } from "@/components/WeatherBackground";
import GlassCard from "@/components/GlassCard";
import WindCompass from "@/components/WindCompass";
import TideCurve from "@/components/TideCurve";

export const revalidate = 600;

function skyConditionFor(
  weather: Awaited<ReturnType<typeof getWeather>>
): SkyCondition {
  if (!weather.available || !weather.current) return "clear";
  const { conditionCode, isDaylight } = weather.current;
  const sunset = weather.today?.sunset ? new Date(weather.today.sunset).getTime() : undefined;

  if (sunset) {
    const diffMin = Math.abs(Date.now() - sunset) / 60000;
    if (diffMin < 45) return "sunset";
  }
  if (!isDaylight) return "night";

  if (/Rain|Shower|Drizzle|Thunder|Storm/i.test(conditionCode)) return "rain";
  if (/Cloudy|Overcast|Haze|Fog/i.test(conditionCode)) return "cloudy";
  return "clear";
}

function statusDotClass(status: string) {
  if (status === "cancelled") return "bg-coral";
  if (status === "weather-watch") return "bg-coral";
  return "bg-white";
}

export default async function PlanPage() {
  const { marina } = currentTrip.coordinates;
  const [weather, marine] = await Promise.all([
    getWeather(marina.lat, marina.lon),
    getMarineConditions(currentTrip.date),
  ]);

  const sky = skyConditionFor(weather);
  const nextExtreme = marine.tide?.extremes.find(
    (e) => new Date(e.timeIso).getTime() > Date.now()
  );

  const relevantHourly =
    weather.hourly?.filter((h) => {
      const t = new Date(h.time).getTime();
      return t >= Date.now() - 3600_000 && t <= Date.now() + 6 * 3600_000;
    }) ?? [];

  return (
    <main className="relative min-h-screen">
      <WeatherBackground condition={sky} />

      <div className="mx-auto max-w-md px-5 pt-safe">
        {/* Hero */}
        <section className="pt-8 pb-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
            Boat Day
          </p>
          <h1 className="mt-1 text-[34px] font-semibold leading-tight">
            {formatDateLong(currentTrip.date)}
          </h1>

          <div className="mt-2 flex items-center gap-2 text-white/85">
            <span className={`h-2 w-2 rounded-full ${statusDotClass(currentTrip.status)}`} />
            <span className="text-sm font-medium">{currentTrip.statusLabel}</span>
            <span className="text-white/40">·</span>
            <span className="text-sm">{currentTrip.marinaName}</span>
          </div>

          <p className="mt-4 text-5xl font-semibold tabular-nums">
            {weather.available && weather.current ? `${weather.current.temperature}°` : "—°"}
            <span className="ml-3 text-xl font-medium text-white/85 align-middle">
              {weather.available && weather.current ? weather.current.conditionDescription : "Weather not connected yet"}
            </span>
          </p>

          <p className="mt-2 text-[15px] text-white/85">
            Meet {currentTrip.meetTime} · Depart {currentTrip.departTime}
          </p>

          <Link
            href="/get-there"
            className="mt-5 inline-flex items-center justify-center rounded-full bg-coral px-6 py-3 text-[15px] font-semibold text-white shadow-[0_6px_18px_rgba(217,122,98,0.35)]"
          >
            Get Directions
          </Link>
        </section>

        {/* Today's plan */}
        <GlassCard className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
            Today&rsquo;s Plan
          </p>
          <dl className="mt-3 space-y-2 text-[15px]">
            <div className="flex justify-between gap-3">
              <dt className="text-white/75">Meet at the marina</dt>
              <dd className="font-semibold">{currentTrip.meetTime}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-white/75">Scheduled departure</dt>
              <dd className="font-semibold">{currentTrip.departTime}</dd>
            </div>
          </dl>
          <p className="mt-4 text-[15px] leading-relaxed text-white/95">{currentTrip.dayPlan}</p>
          {currentTrip.captainNote && (
            <p className="mt-3 rounded-2xl bg-white/10 px-3 py-2 text-[13px] italic text-white/85">
              {currentTrip.captainNote}
            </p>
          )}
        </GlassCard>

        {/* Harbour conditions */}
        <p className="mb-2 mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
          Harbour Conditions
        </p>

        <div className="space-y-4">
          {/* Wind */}
          <GlassCard>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Wind</p>
                {weather.available && weather.current ? (
                  <>
                    <div className="mt-2 flex items-baseline gap-4">
                      <div>
                        <p className="text-3xl font-semibold tabular-nums">
                          {kmhToKnots(weather.current.windSpeed)}
                          <span className="text-base font-medium text-white/70"> kn</span>
                        </p>
                        <p className="text-xs text-white/70">Wind</p>
                      </div>
                      {weather.current.windGust !== undefined && (
                        <div>
                          <p className="text-xl font-semibold tabular-nums">
                            {kmhToKnots(weather.current.windGust)}
                            <span className="text-sm font-medium text-white/70"> kn</span>
                          </p>
                          <p className="text-xs text-white/70">Gusts</p>
                        </div>
                      )}
                    </div>
                    {relevantHourly.length > 0 && (
                      <p className="mt-3 text-[13px] text-white/80">
                        {relevantHourly
                          .map(
                            (h) =>
                              `${new Date(h.time).toLocaleTimeString("en-AU", {
                                hour: "numeric",
                                hour12: true,
                                timeZone: "Australia/Sydney",
                              })} ${kmhToKnots(h.windSpeed)}kn`
                          )
                          .join(" · ")}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="mt-2 text-[13px] text-white/70">
                    Weather isn&rsquo;t connected yet — add your WeatherKit key to see live wind here.
                  </p>
                )}
              </div>
              {weather.available && weather.current && (
                <WindCompass directionDeg={weather.current.windDirection} />
              )}
            </div>
          </GlassCard>

          {/* Tide & current */}
          <GlassCard>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Tide &amp; Current</p>
            {marine.available && marine.tide ? (
              <>
                {nextExtreme && (
                  <p className="mt-2 text-[15px]">
                    Next {nextExtreme.type === "high" ? "high" : "low"} tide
                    <br />
                    <span className="text-2xl font-semibold">{formatTime(nextExtreme.timeIso)}</span>
                    <span className="ml-2 text-sm text-white/70">{nextExtreme.heightM.toFixed(2)} m</span>
                  </p>
                )}
                <div className="mt-3">
                  <TideCurve extremes={marine.tide.extremes} />
                </div>
              </>
            ) : (
              <p className="mt-2 text-[13px] text-white/70">
                Couldn&rsquo;t load tide times from BOM right now{marine.reason ? ` (${marine.reason})` : ""}.
              </p>
            )}

            {marine.harbourEntrance && (
              <div className="mt-4 border-t border-white/10 pt-3">
                {marine.harbourEntrance.available ? (
                  <p className="text-[13px]">
                    <span className="font-semibold">Current</span>{" "}
                    {marine.harbourEntrance.currentSpeedKn?.toFixed(1)} kn
                    {marine.harbourEntrance.currentDirection !== undefined
                      ? ` · ${Math.round(marine.harbourEntrance.currentDirection)}°`
                      : ""}
                    {marine.harbourEntrance.waveHeightM !== undefined && (
                      <>
                        {" "}
                        · <span className="font-semibold">Waves</span> {marine.harbourEntrance.waveHeightM.toFixed(1)} m
                      </>
                    )}
                  </p>
                ) : (
                  <p className="text-[13px] text-white/70">Harbour-entrance conditions unavailable right now.</p>
                )}
                <p className="mt-1 text-[12px] italic text-white/60">{marine.harbourEntrance.note}</p>
              </div>
            )}
          </GlassCard>

          {/* Weather details */}
          <GlassCard>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Today&rsquo;s Weather</p>
            {weather.available && weather.current ? (
              <div className="mt-3 grid grid-cols-2 gap-4 text-[15px]">
                <div>
                  <p className="text-xs text-white/70">Feels like</p>
                  <p className="text-xl font-semibold">{weather.current.temperatureApparent}°</p>
                </div>
                <div>
                  <p className="text-xs text-white/70">UV index</p>
                  <p className="text-xl font-semibold">{weather.current.uvIndex}</p>
                </div>
                <div>
                  <p className="text-xs text-white/70">Rain chance</p>
                  <p className="text-xl font-semibold">{Math.round(weather.current.precipitationChance * 100)}%</p>
                </div>
                <div>
                  <p className="text-xs text-white/70">Sunset</p>
                  <p className="text-xl font-semibold">
                    {weather.today?.sunset ? formatTime(weather.today.sunset) : "—"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-[13px] text-white/70">
                Weather isn&rsquo;t connected yet. Add your Apple WeatherKit Team ID, Key ID, Service ID and
                private key to <code className="rounded bg-white/15 px-1">.env.local</code> — see the README.
                {weather.reason ? <span className="block mt-1 text-white/50">({weather.reason})</span> : null}
              </p>
            )}
          </GlassCard>

          {/* Source + disclaimer */}
          <div className="pb-8 pt-1 text-center text-[12px] text-white/60">
            <p>
              Tide data from{" "}
              <a href={marine.sourceUrl} target="_blank" rel="noreferrer" className="underline">
                the official BOM Sydney Harbour forecast
              </a>
              .
            </p>
            <p className="mt-1">
              These numbers are here to help you plan — the captain decides if today&rsquo;s conditions are right for the trip.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
