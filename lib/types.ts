export type TripStatus = "on" | "weather-watch" | "updated" | "cancelled";

export interface CurrentTrip {
  /** ISO date, e.g. "2026-08-14" */
  date: string;
  /** e.g. "Friday" */
  dayLabel: string;
  guestCount: number;
  meetTime: string; // "10:00 am"
  departTime: string; // "10:30 am"
  marinaName: string; // "Corleone Marina, Drummoyne"
  status: TripStatus;
  statusLabel: string; // human label shown in the hero, e.g. "On"
  dayPlan: string; // multi-paragraph plain text, rendered as paragraphs
  lunchPlan: string;
  captainNote?: string;
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
