import type { ReactNode } from "react";

export default function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-card border border-white/15 bg-white/12 p-5 text-white backdrop-blur-2xl [box-shadow:inset_0_1px_0_rgba(255,255,255,0.15)] ${className}`}
    >
      {children}
    </div>
  );
}
