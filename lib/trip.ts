import type { CurrentTrip } from "./types";

/**
 * THE SINGLE EDITABLE TRIP ENTRY.
 *
 * This is the only file you should need to touch between boat days.
 * Edit the fields below, redeploy (e.g. `git push` if Vercel is connected
 * to your repo), and the site updates.
 *
 * ⚠️ COORDINATES: Peppercorn Reserve is a real public park and its
 * coordinates below are verified (St Georges Crescent, Drummoyne NSW 2047).
 * "Corleone Marina" is not a name I could verify against a public map —
 * it reads like a private/informal name for the marina. The marina and
 * stairs coordinates below are placeholders sitting near Peppercorn Reserve.
 * Before you send this link to guests, open Apple Maps yourself, drop a pin
 * on the actual marina gate, and replace the `lat`/`lon` values below with
 * the real ones. I've flagged each with `verified: false` so it's obvious
 * in the code which pins still need your eyes on them.
 */
export const currentTrip: CurrentTrip = {
  date: "2026-09-05",
  dayLabel: "Saturday",
  guestCount: 8,
  meetTime: "10:00 am",
  departTime: "10:30 am",
  estimatedReturnTime: "4:00 pm",
  marinaLeaveTime: "4:30 pm",
  marinaName: "Corleone Marina, Drummoyne",
  status: "on",
  statusLabel: "On",
  // Set by hand to match whatever mood/photo fits this specific day.
  // "clear" falls back to a generated daytime gradient (no clear.jpg supplied yet).
  backgroundMood: "clear",
  dayPlan:
    "We'll enjoy a relaxed harbour cruise under the Bridge, head to Athol Bay for the beach, Opera House and skyline views, then berth at Darling Harbour for lunch — likely Nick's Seafood. We should be back at Drummoyne around 4pm.\n\nPlease bring a hat, sunscreen, a light jacket and comfortable soft-soled shoes. Lifejackets will be provided. If you're prone to seasickness, take your usual medication before arriving.\n\nWeather permitting — I'll confirm everything on Friday.",
  lunchPlan: "Nick's Seafood, Darling Harbour",
  captainNote: undefined,
  guests: [
    { name: "Shamal", role: "Captain", status: "coming" },
    { name: "Neelam", status: "coming" },
    { name: "Zev", status: "coming" },
    { name: "Tej", status: "coming" },
    { name: "Nani", status: "coming" },
    { name: "Nana", status: "coming" },
    { name: "Neil", status: "coming" },
    { name: "Shiv", status: "coming" },
  ],
  coordinates: {
    marina: {
      lat: -33.8531,
      lon: 151.1607,
      label: "Corleone Marina, Drummoyne",
      verified: false,
    },
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
  },
};
