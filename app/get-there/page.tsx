import { currentTrip } from "@/lib/trip";
import ContentCard from "@/components/ContentCard";
import PageHeader from "@/components/PageHeader";

function appleMapsUrl(lat: number, lon: number, label: string) {
  return `https://maps.apple.com/?daddr=${lat},${lon}&q=${encodeURIComponent(label)}&dirflg=w`;
}

function googleMapsUrl(lat: number, lon: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=walking`;
}

export default function GetTherePage() {
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
    <main className="min-h-screen bg-beige px-5">
      <PageHeader title="Get There" subtitle={currentTrip.marinaName} />

      <a
        href={appleMapsUrl(peppercornReserve.lat, peppercornReserve.lon, peppercornReserve.label)}
        className="mb-4 flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-4 text-[16px] font-semibold text-white shadow-sm"
      >
        Open in Apple Maps
      </a>
      <a
        href={googleMapsUrl(peppercornReserve.lat, peppercornReserve.lon)}
        className="mb-6 block text-center text-[13px] text-harbour underline"
      >
        Using Android or Google Maps instead? Tap here.
      </a>

      <ContentCard className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-harbour">Meeting point</p>
        <p className="mt-1 text-[17px] font-semibold">{currentTrip.marinaName}</p>
        <p className="mt-1 text-[14px] text-text-navy/70">Meet at the marina gate.</p>
      </ContentCard>

      <div className="space-y-3 pb-10">
        {steps.map((step, i) => (
          <ContentCard key={step.title} className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-[14px] font-semibold text-white">
              {i + 1}
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-[15px] font-semibold">
                {step.title}
                {!step.point.verified && (
                  <span className="rounded-full bg-coral/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-coral">
                    check pin
                  </span>
                )}
              </p>
              <p className="mt-1 text-[14px] leading-relaxed text-text-navy/75">{step.body}</p>
            </div>
          </ContentCard>
        ))}
      </div>
    </main>
  );
}
