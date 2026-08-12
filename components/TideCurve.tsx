import type { TideExtreme } from "@/lib/types";
import { formatTime } from "@/lib/format";

const WIDTH = 320;
const HEIGHT = 100;
const PAD_X = 12;
const PAD_TOP = 14;
const PAD_BOTTOM = 22;

function cosineInterp(y0: number, y1: number, t: number) {
  const t2 = (1 - Math.cos(t * Math.PI)) / 2;
  return y0 * (1 - t2) + y1 * t2;
}

export default function TideCurve({ extremes }: { extremes: TideExtreme[] }) {
  if (extremes.length < 2) return null;

  const sorted = [...extremes].sort(
    (a, b) => new Date(a.timeIso).getTime() - new Date(b.timeIso).getTime()
  );
  const startMs = new Date(sorted[0].timeIso).getTime();
  const endMs = new Date(sorted[sorted.length - 1].timeIso).getTime();
  const span = endMs - startMs;
  const heights = sorted.map((e) => e.heightM);
  const minH = Math.min(...heights);
  const maxH = Math.max(...heights);
  const range = Math.max(maxH - minH, 0.1);

  const xFor = (ms: number) => PAD_X + ((ms - startMs) / span) * (WIDTH - PAD_X * 2);
  const yFor = (h: number) =>
    HEIGHT - PAD_BOTTOM - ((h - minH) / range) * (HEIGHT - PAD_TOP - PAD_BOTTOM);

  const SAMPLES = 80;
  const points: [number, number][] = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const ms = startMs + (span * i) / SAMPLES;
    let segIdx = 0;
    for (let s = 0; s < sorted.length - 1; s++) {
      if (ms >= new Date(sorted[s].timeIso).getTime()) segIdx = s;
    }
    const a = sorted[segIdx];
    const b = sorted[segIdx + 1] ?? a;
    const aMs = new Date(a.timeIso).getTime();
    const bMs = new Date(b.timeIso).getTime();
    const t = bMs === aMs ? 0 : (ms - aMs) / (bMs - aMs);
    const h = cosineInterp(a.heightM, b.heightM, t);
    points.push([xFor(ms), yFor(h)]);
  }

  const pathD = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const areaD = `${pathD} L${points[points.length - 1][0].toFixed(1)},${HEIGHT - PAD_BOTTOM} L${points[0][0].toFixed(1)},${HEIGHT - PAD_BOTTOM} Z`;

  const now = Date.now();
  const showNow = now >= startMs && now <= endMs;
  const nowX = xFor(now);

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Tide curve for the day">
      <defs>
        <linearGradient id="tideFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#tideFill)" />
      <path d={pathD} fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
      {sorted.map((e) => {
        const x = xFor(new Date(e.timeIso).getTime());
        const y = yFor(e.heightM);
        return (
          <g key={e.timeIso}>
            <circle cx={x} cy={y} r="2.5" fill="white" />
            <text x={x} y={HEIGHT - 6} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.75)">
              {formatTime(e.timeIso)}
            </text>
          </g>
        );
      })}
      {showNow && (
        <line x1={nowX} y1={PAD_TOP} x2={nowX} y2={HEIGHT - PAD_BOTTOM} stroke="#D97A62" strokeWidth="1.5" strokeDasharray="3 3" />
      )}
    </svg>
  );
}
