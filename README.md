# Boat Day Guide

A mobile-first companion for Friday's boat day at Corleone Marina, Drummoyne.
Built with Next.js (App Router) + Tailwind v4, deployed to Vercel at
`boat.coconut.vision`.

## Before you deploy

There are three things only you can finish — I couldn't verify or access
these myself:

### 1. Confirm the marina and stairs pins

`lib/trip.ts` has three sets of coordinates. Peppercorn Reserve's are
verified against its real public address. The marina gate and the stairs
are placeholders sitting near the reserve — I couldn't find "Corleone
Marina" on a public map, so before sending this link to guests:

1. Open Apple Maps yourself, walk through it (or use satellite view),
   and find the real marina gate pin and the top/bottom of the stairs.
2. Update `lat`/`lon` in `lib/trip.ts` for `marina` and `stairs`, and
   flip `verified` to `true` once you've checked them.

The Get There tab shows a small "check pin" badge on any step that's
still unverified, so it's obvious at a glance what's left.

### 2. Add your Apple WeatherKit credentials

Copy `.env.example` to `.env.local` and fill in:

- `APPLE_WEATHERKIT_TEAM_ID` — from developer.apple.com/account → Membership
- `APPLE_WEATHERKIT_KEY_ID` — from the WeatherKit-enabled key you create under
  Certificates, Identifiers & Profiles → Keys
- `APPLE_WEATHERKIT_SERVICE_ID` — the identifier you register for this site
  (e.g. `vision.coconut.boatdayguide`)
- `APPLE_WEATHERKIT_PRIVATE_KEY` — the full contents of the `.p8` file Apple
  gives you, with line breaks written as literal `\n`

Add the same four variables in Vercel under Project Settings → Environment
Variables before deploying. Until they're set, the Plan tab still works —
it just shows "Weather isn't connected yet" instead of live conditions
rather than breaking.

### 3. Drop in your harbour photos

See `public/backgrounds/README.txt`. Until you add them, the Plan tab uses
generated sky gradients that match the palette, so it looks intentional
either way.

## Data sources (verified working during the build)

- **Weather** — Apple WeatherKit REST API (current conditions, hourly,
  sunrise/sunset).
- **Tide times** — BOM's official Fort Denison station (`NSW_TP007`), the
  real reference station for Sydney Harbour. This is a live, undocumented
  BOM endpoint, not a formal API — if BOM changes it, `lib/marine.ts` is
  the only place that needs updating.
- **Wave height / current** — Open-Meteo Marine API, sampled just outside
  the harbour heads and clearly labelled "harbour entrance conditions" in
  the UI. I tested Open-Meteo directly at Drummoyne's coordinates and it
  silently snapped to an offshore grid point with open-ocean swell numbers
  — meaningless for the sheltered water you'll actually be on. There's no
  free API that models conditions inside upper Sydney Harbour, so rather
  than show a fabricated-looking number, the entrance reading is captioned
  honestly as open water, not the mooring.
- **Maps** — no interactive map SDK (Apple MapKit JS needs its own paid
  Maps identifier, separate from WeatherKit). Instead: a big "Open in Apple
  Maps" deep link to Peppercorn Reserve, a Google Maps fallback link, and a
  numbered walking-step list. Simpler to build and just as usable on a
  phone that's about to open Maps anyway.

## Editing the trip

`lib/trip.ts` is the one file to touch for a different date, time, plan, or
status message. This build hardcodes just this Friday (14 Aug 2026) rather
than a "next upcoming trip" system — if you end up doing these regularly,
the natural next step is turning `trip.ts` into an array and picking the
next future entry automatically.

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in the WeatherKit values
npm run dev
```

Open http://localhost:3000 — resize your browser to an iPhone width (or
use Chrome DevTools' device toolbar) since this is designed mobile-first.

## Deploying

1. Push this folder to a GitHub repo.
2. Import it in Vercel.
3. Add the four `APPLE_WEATHERKIT_*` environment variables in Vercel.
4. Since `boat.coconut.vision`'s DNS is already pointed, add the domain
   under Project Settings → Domains in Vercel and it should verify
   automatically. If Vercel asks for a specific CNAME/A record, add
   whatever it shows you at your DNS provider.

## Known simplifications (given the "just this Friday" scope)

- One hardcoded trip, not a repeatable trip system.
- "Today's Weather" is one consolidated card (feels-like, UV, rain chance,
  sunset) rather than several separate cards — tidier on a phone screen.
- No interactive map — see "Maps" above.
- No password/login — the link is unlisted; anyone with the URL can view it.
