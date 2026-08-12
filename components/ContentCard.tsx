import type { ReactNode } from "react";

export default function ContentCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-card border border-navy/5 bg-cream p-5 text-text-navy shadow-[0_1px_3px_rgba(11,31,58,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}
