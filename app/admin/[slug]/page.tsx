"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { CurrentTrip } from "@/lib/types";
import TripForm from "@/components/admin/TripForm";

export default function EditTripPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [trip, setTrip] = useState<CurrentTrip | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/trips/${slug}`);
        if (cancelled) return;
        if (res.status === 404) {
          setNotFound(true);
        } else if (res.ok) {
          setTrip(await res.json());
        } else {
          setNotFound(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-navy text-white/70">
        Loading…
      </main>
    );
  }

  if (notFound || !trip) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-navy px-6 text-center text-white/70">
        <p>
          No trip found for &ldquo;{slug}&rdquo;. It may have been renamed —{" "}
          <a href="/admin" className="text-coral underline">
            create a new one
          </a>{" "}
          instead.
        </p>
      </main>
    );
  }

  return <TripForm mode="edit" slug={slug} initialTrip={trip} />;
}
