import type { ReactNode } from "react";

export interface JourneyStop {
  label: string;
  icon: ReactNode;
  emphasize?: boolean;
}

/**
 * A quick-glance visual overview of the walk — not a real map, just an
 * iconographic route strip (start → stairs → gate). Deliberately stylized
 * rather than a literal map: we don't have real geodata to draw a route on,
 * and a fake-looking pseudo-map would feel worse than an honest illustration.
 * The detailed step cards below carry the real instructions; this is just
 * the "at a glance" version.
 */
export default function JourneyMap({ stops }: { stops: JourneyStop[] }) {
  return (
    <div className="relative flex items-start justify-between px-3 py-2">
      <div className="absolute left-[16%] right-[16%] top-[26px] border-t border-dashed border-white/30" />
      {stops.map((stop) => (
        <div key={stop.label} className="relative z-10 flex w-1/3 flex-col items-center gap-2 text-center">
          <div
            className={`flex h-[52px] w-[52px] items-center justify-center rounded-full border backdrop-blur-xl ${
              stop.emphasize
                ? "border-coral/40 bg-coral text-white shadow-[0_4px_14px_rgba(217,122,98,0.35)]"
                : "border-white/20 bg-white/15 text-white"
            }`}
          >
            {stop.icon}
          </div>
          <p className="text-[11px] font-medium leading-tight text-white/85">{stop.label}</p>
        </div>
      ))}
    </div>
  );
}
