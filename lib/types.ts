export type TripStatus = "on" | "weather-watch" | "updated" | "cancelled";

// The Plan tab's background mood. Set once per trip in lib/trip.ts, not
// computed live from weather — a boat day happens once, so the background
// doesn't need to shift under a guest as they look at the page.
export type SkyCondition = "clear" | "cloudy" | "rain" | "sunset" | "night";

export type GuestStatus = "coming" | "maybe" | "not-coming";

export interface Guest {
  name: string;
  role?: string; // e.g. "Captain" — a role, not an attendance status
  status: GuestStatus;
}

export interface CurrentTrip {
  /** ISO date, e.g. "2026-08-14" */
  date: string;
  /** e.g. "Friday" */
  dayLabel: string;
  guestCount: number;
  meetTime: string; // "10:00 am"
  departTime: string; // "10:30 am"
  estimatedReturnTime: string; // "2:00 pm" — back at the marina for a wash down
  marinaLeaveTime: string; // "2:30 pm" — final departure from the marina
  marinaName: string; // "Corleone Marina, Drummoyne"
  status: TripStatus;
  statusLabel: string; // human label shown in the hero, e.g. "On"
  /** Fixed background mood for this trip's Plan tab — see SkyCondition above. */
  backgroundMood: SkyCondition;
  dayPlan: string; // multi-paragraph plain text, rendered as paragraphs
  lunchPlan: string;
  captainNote?: string;
  guests: Guest[];
  /** Coordinates used for weather + "Open in Apple Maps". Confirm these — see README. */
  coordinates: {
    marina: { lat: number; lon: number; label: string; verified: boolean };
    peppercornReserve: { lat: number; lon: number; label: string; verified: boolean };
    stairs: { lat: number; lon: number; label: string; verified: boolean };
  };
}

export interface WeatherResult {
  available: boolean;
  reason?: string;
  current?: {
    temperature: number; // celsius
    temperatureApparent: number;
    conditionCode: string;
    conditionDescription: string;
    windSpeed: number; // km/h from WeatherKit; we convert to knots for display
    windGust?: number;
    windDirection: number; // degrees
    uvIndex: number;
    precipitationChance: number; // 0-1
    isDaylight: boolean;
  };
  today?: {
    sunrise?: string; // ISO
    sunset?: string; // ISO
    precipitationChanceMax?: number;
  };
  /**
   * Forecast for the trip day specifically, at (or nearest to) the trip's
   * meet time — not "today" unless the trip happens to be today, and not a
   * whole-day high/low either. Drives the hero: a guest checking this before
   * the boat day cares what it'll be like around when they're actually on
   * the water, not a 24-hour min/max that might be driven by an overnight low.
   */
  forDay?: {
    date: string; // ISO date, matches the day this forecast is for
    temperature: number;
    conditionCode: string;
    conditionDescription: string;
    precipitationChance: number; // 0-1
  };
  hourly?: Array<{
    time: string; // ISO
    temperature: number;
    windSpeed: number;
    windDirection: number;
    precipitationChance: number;
  }>;
}

export interface TideExtreme {
  type: "high" | "low";
  timeIso: string;
  heightM: number;
}

export interface MarineResult {
  available: boolean;
  reason?: string;
  station?: string;
  sourceUrl: string;
  tide?: {
    extremes: TideExtreme[];
    updatedAt: string;
  };
  harbourEntrance?: {
    available: boolean;
    reason?: string;
    waveHeightM?: number;
    waveDirection?: number;
    currentSpeedKn?: number;
    currentDirection?: number;
    note: string; // caption explaining this is entrance conditions, not the mooring
  };
}
