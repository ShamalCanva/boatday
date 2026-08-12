import ContentCard from "@/components/ContentCard";
import PageHeader from "@/components/PageHeader";

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

export default function SafetyPage() {
  return (
    <main className="min-h-screen bg-beige px-5 pb-10">
      <PageHeader title="Safety" />

      <ContentCard className="mb-4">
        <p className="text-[20px] font-semibold text-navy">Good vibes, safe vibes.</p>
        <ul className="mt-3 space-y-2.5">
          {RULES.map((rule) => (
            <li key={rule} className="flex gap-2.5 text-[15px] leading-relaxed">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </ContentCard>

      <ContentCard>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-harbour">Equipment onboard</p>
        <ul className="mt-3 space-y-2.5">
          {EQUIPMENT.map((item) => (
            <li key={item} className="flex gap-2.5 text-[15px] leading-relaxed">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-navy/50" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </ContentCard>
    </main>
  );
}
