import { redirect } from "next/navigation";
import { getCurrentTripSlug } from "@/lib/trips";

// The bare domain always points at whichever trip is "current" — the
// soonest one that hasn't happened yet, or the most recent past one once
// every trip has come and gone. Individual trips keep living at their own
// /{slug} link forever, so an old shared link never breaks.
export default function RootPage() {
  const slug = getCurrentTripSlug();
  if (!slug) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-navy px-6 text-center text-white/85">
        <p>No boat days set up yet. Head to /admin to create one.</p>
      </main>
    );
  }
  redirect(`/${slug}`);
}
