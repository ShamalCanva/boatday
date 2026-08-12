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
  date: "2026-08-14",
  dayLabel: "Friday",
  guestCount: 6,
  meetTime: "10:00 am",
  departTime: "10:30 am",
  estimatedReturnTime: "2:00 pm",
  marinaLeaveTime: "2:30 pm",
  marinaName: "Corleone Marina, Drummoyne",
  status: "on",
  statusLabel: "On",
  // Set by hand to match whatever mood/photo fits this specific day.
  // "sunset" pairs with public/backgrounds/sunset.jpg.
  backgroundMood: "sunset",
  dayPlan:
    "We'll cruise out, collect lunch from Doyles on the Wharf Takeaway at Watsons Bay, find a mooring to settle in, enjoy the harbour, then cruise a little more before heading back.",
  lunchPlan: "Doyles on the Wharf Takeaway, Watsons Bay",
  captainNote: undefined,
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
