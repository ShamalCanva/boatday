export type SkyCondition = "clear" | "cloudy" | "rain" | "sunset" | "night";

const GRADIENTS: Record<SkyCondition, string> = {
  clear: "linear-gradient(180deg, #AFD4E8 0%, #E7EEE0 55%, #F5F0E6 100%)",
  cloudy: "linear-gradient(180deg, #93A6B4 0%, #B9C2C7 55%, #F5F0E6 100%)",
  rain: "linear-gradient(180deg, #3F5266 0%, #5E6E7E 55%, #F5F0E6 100%)",
  sunset: "linear-gradient(180deg, #2C3B58 0%, #C9825F 55%, #F3C79A 100%)",
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
    <div className="fixed inset-0 -z-10" aria-hidden>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(/backgrounds/${condition}.jpg), ${GRADIENTS[condition]}` }}
      />
      {/* Contrast scrim so glass cards and text stay readable over any photo */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-black/35" />
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
