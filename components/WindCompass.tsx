import { compassLabel } from "@/lib/format";

export default function WindCompass({
  directionDeg,
}: {
  directionDeg: number;
}) {
  const ticks = Array.from({ length: 8 }, (_, i) => i * 45);

  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.5"
        />
        {ticks.map((deg) => (
          <line
            key={deg}
            x1="50"
            y1="8"
            x2="50"
            y2="14"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="1.5"
            transform={`rotate(${deg} 50 50)`}
          />
        ))}
        <text x="50" y="10" textAnchor="middle" fontSize="8" fill="white" fontWeight="600">
          N
        </text>
        {/* Arrow points in the direction the wind is blowing toward */}
        <g transform={`rotate(${directionDeg} 50 50)`}>
          <path
            d="M50 20 L56 46 L50 40 L44 46 Z"
            fill="#D97A62"
          />
        </g>
        <circle cx="50" cy="50" r="3" fill="white" />
      </svg>
      <span className="absolute inset-x-0 bottom-0 text-center text-xs font-semibold text-white/90">
        {compassLabel(directionDeg)}
      </span>
    </div>
  );
}
