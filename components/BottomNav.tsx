"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CompassIcon, PinIcon, AnchorIcon, LifeRingIcon } from "./icons";

const TABS = [
  { segment: "", label: "Plan", Icon: CompassIcon },
  { segment: "get-there", label: "Get There", Icon: PinIcon },
  { segment: "on-board", label: "On Board", Icon: AnchorIcon },
  { segment: "safety", label: "Safety", Icon: LifeRingIcon },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Admin pages have their own layout/flow — no guest-facing tab bar there.
  if (pathname?.startsWith("/admin")) return null;

  // First path segment after the root is the trip slug, e.g.
  // "/05sep-2026/get-there" -> "05sep-2026". Falls back to nothing while the
  // root "/" redirect is still resolving.
  const segments = pathname?.split("/").filter(Boolean) ?? [];
  const slug = segments[0];
  const currentSubSegment = segments[1] ?? "";

  if (!slug) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-navy/85 backdrop-blur-xl pb-safe"
      aria-label="Primary"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {TABS.map(({ segment, label, Icon }) => {
          const href = segment ? `/${slug}/${segment}` : `/${slug}`;
          const isActive = currentSubSegment === segment;
          return (
            <li key={segment || "plan"} className="flex-1">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className="flex min-h-[60px] flex-col items-center justify-center gap-1 px-2 py-2 text-center"
              >
                <Icon
                  className={`h-6 w-6 transition-opacity ${
                    isActive ? "text-coral opacity-100" : "text-white opacity-70"
                  }`}
                />
                <span
                  className={`text-[11px] font-medium tracking-tight ${
                    isActive ? "text-coral" : "text-white/70"
                  }`}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
