
# Boat Day Guide

A mobile-first companion for boat days from Corleone Marina, Drummoyne. Built
with Next.js (App Router) + Tailwind v4, deployed to Vercel at
`boat.coconut.vision`.

Each boat day gets its own permanent link — `boat.coconut.vision/{slug}`
(e.g. `/05sep`) — so old trips keep working after a new one is created. The
bare domain always forwards to whichever trip is "current": the soonest one
that hasn't happened yet, or the most recent one once every trip is in the
past.

## Creating a new trip

Go to `boat.coconut.vision/admin`, log in with the admin password, and fill
out the form. Submitting it commits a new `data/trips/{slug}.json` file to
this repo via the GitHub API and Vercel auto-deploys — usually live within a
minute. You'll get the shareable link right there in the confirmation screen.

You can also add a trip by hand: drop a new `data/trips/{slug}.json` file
(copy an existing one as a template — see `lib/types.ts` for the shape) and
push.

### One-time setup for /admin

Copy `.env.example` to `.env.local` (and add the same values in Vercel →
Project Settings → Environment Variables) and fill in:

- `ADMIN_PASSWORD` — any password you choose; whoever knows it can publish
  trips.
- `ADMIN_COOKIE_SECRET` — a long random string for signing the login
  cookie, e.g. `openssl rand -hex 32`. Not a password itself.
- `GITHUB_TOKEN` — a fine-grained personal access token
  (github.com/settings/personal-access-tokens), scoped to just this repo,
  with **Contents: Read and write** permission. This is the one credential
  worth being careful with — it can push commits to this repo.
- `GITHUB_OWNER` / `GITHUB_REPO` / `GITHUB_BRANCH` — already filled in for
  this repo in `.env.example`.

Without these, everything except `/admin` still works — you'd just go back
to editing `data/trips/*.json` by hand and pushing yourself.

## Before you deploy a new trip

### Confirm the marina and stairs pins

The admin form's "Advanced: meeting point pins" section pre-fills the usual
Drummoyne pins. Peppercorn Reserve's coordinates are verified against its
real public address; the marina gate and stairs are close estimates (I
couldn't find "Corleone Marina" on a public map). If a trip ever leaves from
somewhere else, open Apple Maps yourself, find the real pins, and override
them in that section — otherwise you can leave it alone.

### Apple WeatherKit credentials

Already set up for this project (see `.env.local` / Vercel env vars):
`APPLE_WEATHERKIT_TEAM_ID`, `APPLE_WEATHERKIT_KEY_ID`,
`APPLE_WEATHERKIT_SERVICE_ID`, `APPLE_WEATHERKIT_PRIVATE_KEY`. Nothing to do
per-trip — every trip page pulls weather live for its own date and
coordinates. If these were ever unset, the Plan tab just shows "Weather
isn't connected yet" instead of breaking.

### Background photo

Each trip picks one of `clear` / `cloudy` / `rain` / `sunset` / `night` in
the admin form. Only `sunset.jpg` exists as a real photo right now (see
`public/backgrounds/README.txt` for the other filenames) — the rest fall
back to a generated gradient in the same mood, which still looks
intentional.

## Data sources (verified working during the build)

- **Weather** — Apple WeatherKit REST API (current conditions, hourly,
  sunrise/sunset), fetched per-trip for its own date and coordinates.
- **Tide times** — BOM's official Fort Denison station (`NSW_TP007`), the
  real reference station for Sydney Harbour. This is a live, undocumented
  BOM endpoint, not a formal API — if BOM changes it, `lib/marine.ts` is
  the only place that needs updating.
- **Wave height / current** — Open-Meteo Marine API, sampled just outside
  the harbour heads and clearly labelled "harbour entrance conditions" in
  the UI. There's no free API that models conditions inside upper Sydney
  Harbour, so rather than show a fabricated-looking number, the entrance
  reading is captioned honestly as open water, not the mooring.
- **Maps** — no interactive map SDK by default; falls back to a numbered
  walking-step list plus "Open in Apple/Google Maps" links. If
  `APPLE_MAPS_KEY_ID` / `APPLE_MAPS_PRIVATE_KEY` are set, the Get There page
  shows a real Apple Maps snapshot instead.

## How trip data works

There's no database — `data/trips/*.json` **is** the database. Each file's
name (minus `.json`) is the URL slug. `lib/trips.ts` reads that folder at
request time:

- `getTripBySlug(slug)` — one trip, for `/[slug]` and its sub-pages.
- `getCurrentTripSlug()` — the soonest upcoming trip, or the most recent
  past one — what `/` and legacy `/get-there` `/on-board` `/safety` links
  redirect to.

The admin API route (`app/api/admin/trips/route.ts`) validates the form
submission, works out a slug (from the form, or from the date as
`05sep`-style, de-duplicated against what's already on GitHub), and commits
`data/trips/{slug}.json` via `lib/github.ts`.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in WeatherKit values; ADMIN_* + GITHUB_* only needed to test /admin locally
npm run dev
```

Open http://localhost:3000 — resize your browser to an iPhone width (or use
Chrome DevTools' device toolbar) since this is designed mobile-first.

## Deploying

1. Push this folder to a GitHub repo (already done — `ShamalCanva/boatday`).
2. Import it in Vercel, connected to that repo.
3. Add the env vars from `.env.example` in Vercel → Project Settings →
   Environment Variables.
4. Since `boat.coconut.vision`'s DNS is already pointed, add the domain
   under Project Settings → Domains in Vercel and it should verify
   automatically.

From here, every `git push` to `main` redeploys — same as every `/admin`
submission, just triggered by you instead of the form.

## Known simplifications

- `/admin` is a single shared password, not per-user accounts — fine for
  one person publishing trips for their own family/friends.
- Publishing a trip takes a normal Vercel deploy (~30–60s), not an instant
  database write — acceptable for something shared a day or more ahead.
- No "edit an existing trip" UI yet — the admin form only creates. Editing
  a trip still means changing its `data/trips/{slug}.json` by hand and
  pushing (or resubmitting the form with the same slug, which overwrites).
- No interactive map by default — see "Maps" above.
