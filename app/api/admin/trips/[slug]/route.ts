import { NextResponse } from "next/server";
import { getTripBySlug } from "@/lib/trips";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const trip = getTripBySlug(slug);
  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(trip);
}
