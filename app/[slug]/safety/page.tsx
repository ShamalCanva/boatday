import { notFound } from "next/navigation";
import { getTripBySlug } from "@/lib/trips";
import GlassCard from "@/components/GlassCard";
import PageHeader from "@/components/PageHeader";
import WeatherBackground from "@/components/WeatherBackground";
import { LifeRingIcon, AnchorIcon } from "@/components/icons";

const RULES = [
  "Listen to the captain and crew at all times.",
  "The captain makes the final call on weather, route, swimming, and timing.",
  "Stay seated or hold on while the boat is moving unless directed otherwise.",
  "Ask before swimming or entering the water.",
  "Tell the captain about injuries, relevant medical needs, allergies, or swimming concerns.",
  "Do not arrive intoxicated or become too drunk to participate safely.",
];

const EQUIPMENT = [
  "Life jackets / personal flotation devices",
  "First-aid kit",
  "Fire extinguisher(s)",
  "Marine radio and emergency communication equipment",
  "Required distress equipment",
  "Anchor and retrieval equipment",
];

export default async function SafetyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const currentTrip = getTripBySlug(slug);
  if (!currentTrip) notFound();

  return (
    <main className="relative min-h-screen">
      <WeatherBackground condition={currentTrip.backgroundMood} />

      <div className="relative z-10 mx-auto max-w-md px-5 pb-10">
        <PageHeader title="Safety" />

        <GlassCard className="mb-4">
          <div className="mb-1 flex items-center gap-2">
            <LifeRingIcon className="h-5 w-5 text-coral" />
            <p className="text-[19px] font-semibold">Good vibes, safe vibes.</p>
          </div>
          <ul className="mt-3 space-y-2.5">
            {RULES.map((rule) => (
              <li key={rule} className="flex gap-2.5 text-[15px] leading-relaxed text-white/95">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard>
          <div className="mb-1 flex items-center gap-2">
            <AnchorIcon className="h-4 w-4 text-white/85" />
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/85">
              Equipment onboard
            </p>
          </div>
          <ul className="mt-3 space-y-2.5">
            {EQUIPMENT.map((item) => (
              <li key={item} className="flex gap-2.5 text-[15px] leading-relaxed text-white/95">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/50" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </main>
  );
}
