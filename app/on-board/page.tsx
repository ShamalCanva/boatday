import ContentCard from "@/components/ContentCard";
import PageHeader from "@/components/PageHeader";
import { currentTrip } from "@/lib/trip";

const FAQS = [
  {
    q: "Is there a toilet onboard?",
    a: "Yes — ask when you get on and we'll point you to it.",
  },
  {
    q: "Can I swim?",
    a: "Yes, once we're anchored and the captain says it's OK. Always ask before getting in the water.",
  },
  {
    q: "What happens if I'm running late?",
    a: "Message the group chat or call — we'll try to wait a little, but the tide and the day's plan come first.",
  },
  {
    q: "What happens if the weather changes?",
    a: "The captain makes the call. If plans change you'll see it reflected on the Plan tab and hear from us directly.",
  },
];

export default function OnBoardPage() {
  return (
    <main className="min-h-screen bg-beige px-5 pb-10">
      <PageHeader title="On Board" subtitle="A few things to know before you step on." />

      <div className="space-y-4">
        <ContentCard>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-harbour">Shoes off</p>
          <p className="mt-2 text-[15px] leading-relaxed">
            Shoes come off before boarding to keep the boat clean and safe. We have storage for them.
          </p>
        </ContentCard>

        <ContentCard>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-harbour">Food</p>
          <p className="mt-2 text-[15px] leading-relaxed">Lunch is sorted: {currentTrip.lunchPlan}.</p>
        </ContentCard>

        <ContentCard>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-harbour">FAQs</p>
          <div className="divide-y divide-navy/8">
            {FAQS.map((item) => (
              <details key={item.q} className="group py-3 first:pt-0 last:pb-0">
                <summary className="flex cursor-pointer list-none items-center justify-between text-[15px] font-medium">
                  {item.q}
                  <span className="ml-3 text-text-navy/40 transition-transform group-open:rotate-180">⌄</span>
                </summary>
                <p className="mt-2 text-[14px] leading-relaxed text-text-navy/75">{item.a}</p>
              </details>
            ))}
          </div>
        </ContentCard>
      </div>
    </main>
  );
}
