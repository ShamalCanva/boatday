"use client";

import { useMemo, useState } from "react";
import type { GuestStatus, SkyCondition, TripStatus } from "@/lib/types";
import { dateToSlug, sanitizeSlug } from "@/lib/slug";

type GuestRow = { name: string; role: string; status: GuestStatus };

const DEFAULT_COORDS = {
  marina: { lat: -33.8531, lon: 151.1607, label: "Corleone Marina, Drummoyne", verified: false },
  peppercornReserve: {
    lat: -33.8524624,
    lon: 151.1611663,
    label: "Peppercorn Reserve, St Georges Cres, Drummoyne NSW 2047",
    verified: true,
  },
  stairs: {
    lat: -33.8528,
    lon: 151.1608,
    label: "Stairs down to the marina, behind Peppercorn Reserve",
    verified: false,
  },
};

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-[15px] text-white outline-none placeholder:text-white/40 focus:border-coral";
const labelClass = "mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-white/70";

export default function AdminPage() {
  const [date, setDate] = useState("");
  const [meetTime, setMeetTime] = useState("10:00 am");
  const [departTime, setDepartTime] = useState("10:30 am");
  const [estimatedReturnTime, setEstimatedReturnTime] = useState("2:00 pm");
  const [marinaLeaveTime, setMarinaLeaveTime] = useState("2:30 pm");
  const [marinaName, setMarinaName] = useState("Corleone Marina, Drummoyne");
  const [status, setStatus] = useState<TripStatus>("on");
  const [statusLabel, setStatusLabel] = useState("On");
  const [backgroundMood, setBackgroundMood] = useState<SkyCondition>("sunset");
  const [dayPlan, setDayPlan] = useState("");
  const [lunchPlan, setLunchPlan] = useState("");
  const [captainNote, setCaptainNote] = useState("");
  const [guests, setGuests] = useState<GuestRow[]>([
    { name: "Shamal", role: "Captain", status: "coming" },
  ]);
  const [slugOverride, setSlugOverride] = useState("");
  const [coords, setCoords] = useState(DEFAULT_COORDS);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ slug: string; url: string } | null>(null);

  const slugPreview = useMemo(() => {
    const explicit = sanitizeSlug(slugOverride);
    if (explicit) return explicit;
    return date ? dateToSlug(date) : "";
  }, [slugOverride, date]);

  function updateGuest(i: number, patch: Partial<GuestRow>) {
    setGuests((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function addGuest() {
    setGuests((rows) => [...rows, { name: "", role: "", status: "coming" }]);
  }

  function removeGuest(i: number) {
    setGuests((rows) => rows.filter((_, idx) => idx !== i));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    setResult(null);

    const body = {
      date,
      meetTime,
      departTime,
      estimatedReturnTime,
      marinaLeaveTime,
      marinaName,
      status,
      statusLabel,
      backgroundMood,
      dayPlan,
      lunchPlan,
      captainNote: captainNote || undefined,
      guests: guests
        .filter((g) => g.name.trim())
        .map((g) => ({ name: g.name, role: g.role || undefined, status: g.status })),
      coordinates: coords,
      slug: slugOverride || undefined,
    };

    try {
      const res = await fetch("/api/admin/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? `Failed with status ${res.status}`);
      } else {
        setResult({ slug: json.slug, url: json.url });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  if (result) {
    return (
      <main className="mx-auto min-h-screen max-w-lg px-6 py-16 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Published</p>
        <h1 className="mt-2 text-2xl font-semibold">Trip is live</h1>
        <p className="mt-3 text-[15px] text-white/85">
          Vercel is redeploying now — usually live within a minute. Share this link once it's up:
        </p>
        <a
          href={result.url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 block truncate rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-coral underline"
        >
          {result.url}
        </a>
        <button
          onClick={() => setResult(null)}
          className="mt-6 rounded-full bg-white/10 px-5 py-2.5 text-[14px] font-semibold text-white"
        >
          Create another trip
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-lg px-6 py-10 pb-24 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">New Boat Day</h1>
        <button onClick={handleLogout} className="text-[13px] text-white/60 underline">
          Log out
        </button>
      </div>
      <p className="mt-1 text-[14px] text-white/70">
        Fill this out and submit — it commits a new trip to the repo and Vercel deploys it
        automatically at the link below.
      </p>

      <div className="mt-6 space-y-5">
        <div>
          <label className={labelClass}>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Meet time</label>
            <input value={meetTime} onChange={(e) => setMeetTime(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Depart time</label>
            <input value={departTime} onChange={(e) => setDepartTime(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Estimated return</label>
            <input
              value={estimatedReturnTime}
              onChange={(e) => setEstimatedReturnTime(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Leave marina</label>
            <input
              value={marinaLeaveTime}
              onChange={(e) => setMarinaLeaveTime(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Marina name</label>
          <input value={marinaName} onChange={(e) => setMarinaName(e.target.value)} className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TripStatus)}
              className={inputClass}
            >
              <option value="on">on</option>
              <option value="weather-watch">weather-watch</option>
              <option value="updated">updated</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Status label</label>
            <input value={statusLabel} onChange={(e) => setStatusLabel(e.target.value)} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Background</label>
          <select
            value={backgroundMood}
            onChange={(e) => setBackgroundMood(e.target.value as SkyCondition)}
            className={inputClass}
          >
            <option value="sunset">sunset (real photo)</option>
            <option value="clear">clear (gradient)</option>
            <option value="cloudy">cloudy (gradient)</option>
            <option value="rain">rain (gradient)</option>
            <option value="night">night (gradient)</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Day plan</label>
          <textarea
            value={dayPlan}
            onChange={(e) => setDayPlan(e.target.value)}
            rows={6}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Lunch plan</label>
          <input value={lunchPlan} onChange={(e) => setLunchPlan(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Captain&rsquo;s note (optional)</label>
          <textarea
            value={captainNote}
            onChange={(e) => setCaptainNote(e.target.value)}
            rows={2}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Guests</label>
          <div className="space-y-2">
            {guests.map((g, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={g.name}
                  onChange={(e) => updateGuest(i, { name: e.target.value })}
                  placeholder="Name"
                  className={`${inputClass} flex-1`}
                />
                <input
                  value={g.role}
                  onChange={(e) => updateGuest(i, { role: e.target.value })}
                  placeholder="Role"
                  className={`${inputClass} w-24`}
                />
                <select
                  value={g.status}
                  onChange={(e) => updateGuest(i, { status: e.target.value as GuestStatus })}
                  className={`${inputClass} w-32`}
                >
                  <option value="coming">coming</option>
                  <option value="maybe">maybe</option>
                  <option value="not-coming">not coming</option>
                </select>
                <button
                  onClick={() => removeGuest(i)}
                  className="px-2 text-white/50"
                  aria-label="Remove guest"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addGuest}
            className="mt-2 rounded-full bg-white/10 px-4 py-1.5 text-[13px] font-semibold text-white"
          >
            + Add guest
          </button>
        </div>

        <div>
          <label className={labelClass}>URL slug</label>
          <input
            value={slugOverride}
            onChange={(e) => setSlugOverride(e.target.value)}
            placeholder={date ? dateToSlug(date) : "auto, from date"}
            className={inputClass}
          />
          {slugPreview && (
            <p className="mt-1 text-[13px] text-white/60">
              Will be live at boat.coconut.vision/{slugPreview}
            </p>
          )}
        </div>

        <details
          open={advancedOpen}
          onToggle={(e) => setAdvancedOpen((e.target as HTMLDetailsElement).open)}
          className="rounded-xl border border-white/15 px-4 py-3"
        >
          <summary className="cursor-pointer text-[14px] font-semibold text-white/85">
            Advanced: meeting point pins
          </summary>
          <p className="mt-2 text-[13px] text-white/60">
            Pre-filled with the usual Drummoyne pins — only change these if this trip leaves from
            somewhere else.
          </p>
          <div className="mt-3 space-y-4">
            {(["peppercornReserve", "marina", "stairs"] as const).map((key) => (
              <div key={key}>
                <label className={labelClass}>{key}</label>
                <input
                  value={coords[key].label}
                  onChange={(e) =>
                    setCoords((c) => ({ ...c, [key]: { ...c[key], label: e.target.value } }))
                  }
                  placeholder="Label"
                  className={`${inputClass} mb-2`}
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="any"
                    value={coords[key].lat}
                    onChange={(e) =>
                      setCoords((c) => ({ ...c, [key]: { ...c[key], lat: Number(e.target.value) } }))
                    }
                    placeholder="lat"
                    className={inputClass}
                  />
                  <input
                    type="number"
                    step="any"
                    value={coords[key].lon}
                    onChange={(e) =>
                      setCoords((c) => ({ ...c, [key]: { ...c[key], lon: Number(e.target.value) } }))
                    }
                    placeholder="lon"
                    className={inputClass}
                  />
                </div>
              </div>
            ))}
          </div>
        </details>

        {error && (
          <p className="rounded-xl bg-coral/20 px-4 py-3 text-[14px] text-white">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting || !date || !dayPlan || !lunchPlan}
          className="w-full rounded-full bg-coral px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_6px_18px_rgba(217,122,98,0.35)] disabled:opacity-50"
        >
          {submitting ? "Publishing…" : "Publish trip"}
        </button>
      </div>
    </main>
  );
}
