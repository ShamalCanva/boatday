import GlassCard from "./GlassCard";
import JourneyMap from "./JourneyMap";
import { getMapSnapshotUrl } from "@/lib/mapSnapshot";
import { PinIcon, StairsIcon, AnchorIcon } from "./icons";

interface Point {
  lat: number;
  lon: number;
}

export default function RouteMapCard({
  reserve,
  marina,
  href,
}: {
  reserve: Point;
  marina: Point;
  href: string;
}) {
  const snapshotUrl = getMapSnapshotUrl([
    { lat: reserve.lat, lon: reserve.lon, color: "0B1F3A", markerStyle: "large" },
    { lat: marina.lat, lon: marina.lon, color: "D97A62", markerStyle: "balloon" },
  ]);

  if (!snapshotUrl) {
    // Maps credentials not set yet — fall back to the iconographic overview
    // rather than showing nothing. Same "not connected yet" pattern as
    // WeatherKit elsewhere in this app.
    return (
      <GlassCard>
        <JourneyMap
          stops={[
            { label: "Peppercorn Reserve", icon: <PinIcon className="h-5 w-5" /> },
            { label: "The stairs", icon: <StairsIcon className="h-5 w-5" /> },
            { label: "Marina gate", icon: <AnchorIcon className="h-5 w-5" />, emphasize: true },
          ]}
        />
      </GlassCard>
    );
  }

  return (
    <a
      href={href}
      className="block overflow-hidden rounded-card border border-white/15 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.15)]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- signed, dynamic Apple Maps URL; not a static asset next/image can optimize */}
      <img
        src={snapshotUrl}
        alt="Map showing the walk from Peppercorn Reserve to the marina gate"
        width={640}
        height={320}
        className="block h-auto w-full"
      />
    </a>
  );
}
