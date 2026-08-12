import { NextResponse } from "next/server";
import { getMarineConditions } from "@/lib/marine";
import { currentTrip } from "@/lib/trip";

export const dynamic = "force-dynamic";

export async function GET() {
  const marine = await getMarineConditions(currentTrip.date);
  return NextResponse.json(marine);
}
