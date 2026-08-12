import { NextResponse } from "next/server";
import { getWeather } from "@/lib/weatherkit";
import { currentTrip } from "@/lib/trip";

export const dynamic = "force-dynamic";

export async function GET() {
  const { lat, lon } = currentTrip.coordinates.marina;
  const weather = await getWeather(lat, lon);
  return NextResponse.json(weather);
}
