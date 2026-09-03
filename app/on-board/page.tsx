import { redirect, notFound } from "next/navigation";
import { getCurrentTripSlug } from "@/lib/trips";

// Legacy path from before multi-trip support — keeps old bookmarks working
// by forwarding to the current trip's On Board page.
export default function LegacyOnBoardPage() {
  const slug = getCurrentTripSlug();
  if (!slug) notFound();
  redirect(`/${slug}/on-board`);
}
