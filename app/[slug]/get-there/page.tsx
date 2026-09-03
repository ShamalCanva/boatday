import { notFound } from "next/navigation";
import { getTripBySlug } from "@/lib/trips";
import GlassCard from "@/components/GlassCard";
import PageHeader from "@/components/PageHeader";
import WeatherBackground from "@/components/WeatherBackground";
import RouteMapCard from "@/components/RouteMapCard";
import TransportTabs from "@/components/TransportTabs";

function appleMapsUrl(lat: number, lon: number, label: string) {
  // saddr=Current Location forces Maps to default the "From" field to the
  // user's current location instead of leaving it blank for them to fill in
  // — without this, some Maps contexts (especially the web fallback) show
  // an empty "From" field the guest has to tap/type into themselves.
  return `https://maps.apple.com/?daddr=${lat},${lon}&saddr=${encodeURIComponent(
    "Current Location"
  )}&q=${encodeURIComponent(label)}&dirflg=w`;
}

function googleMapsUrl(lat: number, lon: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=walking`;
}

export default async function GetTherePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const currentTrip = getTripBySlug(slug);
  if (!currentTrip) notFound();

  const { peppercornReserve, marina, stairs } = currentTrip.coordinates;

  const steps = [
    {
      title: peppercornReserve.label,
      body: "Start here. Walk through the reserve towards the water.",
      point: peppercornReserve,
    },
    {
      title: "Stairs down to the marina",
      body: "At the back of the reserve, take the stairs down towards the marina. Take care — they're uneven and can be slippery, especially when wet.",
      point: stairs,
    },
    {
      title: currentTrip.marinaName,
      body: `Through the gate marked ${currentTrip.marinaName.split(",")[0]}. I'll meet you there.`,
      point: marina,
    },
  ];

  return (
    <main className="relative min-h-screen">
      <WeatherBackground condition={currentTrip.backgroundMood} />

      <div className="relative z-10 mx-auto max-w-md px-5">
        <PageHeader title="Get There" subtitle={currentTrip.marinaName} />

        <a
          href={appleMapsUrl(peppercornReserve.lat, peppercornReserve.lon, peppercornReserve.label)}
          className="flex items-center justify-center gap-2 rounded-full bg-coral px-6 py-4 text-[16px] font-semibold text-white shadow-[0_6px_18px_rgba(217,122,98,0.35)]"
        >
          Open in Apple Maps
        </a>
        <a
          href={googleMapsUrl(peppercornReserve.lat, peppercornReserve.lon)}
          className="mb-5 mt-3 block text-center text-[13px] text-white/80 underline"
        >
          Using Android or Google Maps instead? Tap here.
        </a>

        <div className="mb-4">
          <RouteMapCard
            reserve={peppercornReserve}
            marina={marina}
            href={appleMapsUrl(peppercornReserve.lat, peppercornReserve.lon, peppercornReserve.label)}
          />
        </div>

        <p className="mb-2 mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-white/85">
          How are you getting here?
        </p>
        <div className="mb-4">
          <TransportTabs />
        </div>

        <GlassCard className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/85">Meeting point</p>
          <p className="mt-1 text-[17px] font-semibold">{currentTrip.marinaName}</p>
          <p className="mt-1 text-[14px] text-white/85">Meet at the marina gate.</p>
        </GlassCard>

        <p className="mb-2 mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-white/85">
          The walk in, step by step
        </p>
        <div className="space-y-3 pb-10">
          {steps.map((step, i) => (
            <GlassCard key={step.title} className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-coral text-[14px] font-semibold text-white">
                {i + 1}
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-[15px] font-semibold">
                  {step.title}
                  {!step.point.verified && (
                    <span className="rounded-full bg-coral/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                      check pin
                    </span>
                  )}
                </p>
                <p className="mt-1 text-[14px] leading-relaxed text-white/85">{step.body}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </main>
  );
}
