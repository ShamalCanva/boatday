import type { ReactNode } from "react";

// Apple-Weather-style condition glyphs — coloured rather than currentColor,
// since a sun should read as gold and rain as blue regardless of the
// surrounding text colour. Kept as simple flat shapes rather than trying to
// replicate SF Symbols' gradients exactly.

const GOLD = "#FFC24B";
const CLOUD = "#E7ECF1";
const CLOUD_DIM = "#C7D0DA";
const RAIN = "#7FB8D6";

function SunGlyph() {
  return (
    <>
      <circle cx="12" cy="12" r="5" fill={GOLD} />
      <g stroke={GOLD} strokeWidth="1.7" strokeLinecap="round">
        <path d="M12 2.5v2.3M12 19.2v2.3M3.8 12H1.5M22.5 12h-2.3" />
        <path d="M5.9 5.9l1.6 1.6M16.5 16.5l1.6 1.6M18.1 5.9l-1.6 1.6M7.5 16.5l-1.6 1.6" />
      </g>
    </>
  );
}

function CloudGlyph({ fill = CLOUD, y = 0 }: { fill?: string; y?: number }) {
  return (
    <path
      d={`M6.5 ${17.5 + y}a3.9 3.9 0 0 1-.5-7.77A4.9 4.9 0 0 1 15.6 ${8 + y}a4.3 4.3 0 0 1 1.4 ${8.35 + y}Z`
        .replace(/  +/g, " ")}
      fill={fill}
    />
  );
}

export function WeatherIcon({ code, className }: { code: string; className?: string }) {
  const c = code;
  let content: ReactNode;

  if (c === "Clear" || c === "MostlyClear") {
    content = <SunGlyph />;
  } else if (c === "PartlyCloudy") {
    content = (
      <>
        <g transform="translate(3.5,-3.5) scale(0.62)">
          <SunGlyph />
        </g>
        <CloudGlyph y={1} />
      </>
    );
  } else if (c === "Haze" || c === "Fog") {
    content = (
      <>
        <CloudGlyph fill={CLOUD_DIM} />
        <g stroke="#ffffff" strokeOpacity="0.8" strokeWidth="1.4" strokeLinecap="round">
          <path d="M5 20.2h14M6.5 22h11" />
        </g>
      </>
    );
  } else if (c === "Windy") {
    content = (
      <g stroke={CLOUD} strokeWidth="1.7" strokeLinecap="round" fill="none">
        <path d="M3 9.5h11.5a2.3 2.3 0 1 0-2.1-3.2" />
        <path d="M3 14.5h15.5a2.3 2.3 0 1 1-2.1 3.2" />
        <path d="M3 19h9" />
      </g>
    );
  } else if (c === "Drizzle") {
    content = (
      <>
        <CloudGlyph y={-2} />
        <g stroke={RAIN} strokeWidth="1.6" strokeLinecap="round">
          <path d="M9 19v1.6M13 19v1.6" />
        </g>
      </>
    );
  } else if (c === "Rain" || c === "HeavyRain" || c === "Showers") {
    content = (
      <>
        <CloudGlyph y={-2} />
        <g stroke={RAIN} strokeWidth="1.7" strokeLinecap="round">
          <path d="M8 18.7v2.2M12 18.7v2.2M16 18.7v2.2" />
        </g>
      </>
    );
  } else if (c === "IsolatedThunderstorms" || c === "Thunderstorms") {
    content = (
      <>
        <CloudGlyph fill={CLOUD_DIM} y={-2} />
        <path d="M12.8 17.5 10 21.2h2.3l-1.4 3" stroke={GOLD} strokeWidth="1.7" strokeLinecap="round" fill="none" />
      </>
    );
  } else {
    // MostlyCloudy, Cloudy, and anything unmapped
    content = <CloudGlyph fill={c === "Cloudy" ? CLOUD_DIM : CLOUD} />;
  }

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      {content}
    </svg>
  );
}
