import type { SkyCondition } from "@/lib/types";

// Darker and more saturated than the original pass — these need to hold
// contrast for white text on their own, before the scrim below even helps.
// (Verified on the live deploy: pale washed-out tones + a light scrim left
// hero text almost unreadable. Any future adjustment here should be checked
// against real white text on top, not just judged as a standalone swatch.)
const GRADIENTS: Record<SkyCondition, string> = {
  clear: "linear-gradient(180deg, #6FA3C4 0%, #4C7C9E 55%, #2E5872 100%)",
  cloudy: "linear-gradient(180deg, #62727E 0%, #4B5964 55%, #333E47 100%)",
  rain: "linear-gradient(180deg, #2C3B4D 0%, #3E4E60 55%, #26313D 100%)",
  sunset: "linear-gradient(180deg, #263450 0%, #A8623F 55%, #C98A55 100%)",
  night: "linear-gradient(180deg, #07172B 0%, #0B1F3A 60%, #16314F 100%)",
};

/**
 * Drop real photos into /public/backgrounds/ named exactly:
 * clear.jpg, cloudy.jpg, rain.jpg, sunset.jpg, night.jpg
 * If a file is missing this quietly falls back to a generated gradient
 * in the same mood, so nothing ever breaks.
 */
export default function WeatherBackground({ condition }: { condition: SkyCondition }) {
  return (
    // z-0 (not a negative z-index) — a negative z-index here empirically
    // caused this fixed layer to paint behind the page's own background in
    // testing, washing out all contrast. z-0 plus normal DOM order (this
    // renders before the content wrapper) keeps it correctly behind content
    // without the negative-z quirk.
    <div className="fixed inset-0 z-0" aria-hidden>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(/backgrounds/${condition}.jpg), ${GRADIENTS[condition]}` }}
      />
      {/* Contrast scrim so glass cards and text stay readable over any photo.
          Kept deliberately strong (not the subtle 10-25% we started with) —
          this has to guarantee contrast against ANY photo you drop in, not
          just a favorable one, so err dark. */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/35 to-black/55" />
      {condition === "night" && (
        <div className="absolute inset-0">
          {Array.from({ length: 40 }).map((_, i) => (
            <span
              key={i}
              className="absolute h-[2px] w-[2px] rounded-full bg-white/70"
              style={{
                left: `${(i * 37) % 100}%`,
                top: `${(i * 53) % 60}%`,
                opacity: 0.3 + ((i * 13) % 50) / 100,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
