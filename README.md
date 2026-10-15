# AR Treasure Hunt

Campus treasure hunt by IEEE CIS MJCET. Teams follow riddles to five stops,
scan the printed marker at each stop with their phone camera, and earn one
digit of their team code per stop. A live leaderboard shows every team.

## How a game runs

1. Teams draw a chit with their route number (1 to 5).
2. On the start screen the team types its name, taps its route and starts.
3. The clue panel shows a riddle (and a 3D model) for the next stop.
4. At the stop, they point the camera at the marker:
   - right stop: the next digit of their code is revealed, with the next clue
   - wrong stop: a red panel and a gentler hint
5. After 4 stops the team sees its full code, finish time and finishing place.
6. `/leaderboard` shows all teams live: finished teams in finish order, then
   teams still playing by digits found.

Each team gets its own random 4 digit code, created on the server when the team
starts. Digits are only sent to the phone as they are earned, so one team's
code is useless to another. If a phone refreshes or the browser crashes, the
hunt resumes where it left off.

## Stops and markers

| Marker | Stop          |
| ------ | ------------- |
| 0      | Block 5       |
| 1      | Veg Canteen   |
| 2      | GA Hall       |
| 3      | Chemistry Lab |
| 4      | Workshop      |

| Route | Stops in order                                   |
| ----- | ------------------------------------------------ |
| 1     | Block 5, Veg Canteen, GA Hall, Chemistry Lab     |
| 2     | Chemistry Lab, Workshop, Veg Canteen, GA Hall    |
| 3     | Veg Canteen, Block 5, Workshop, GA Hall          |
| 4     | Workshop, Chemistry Lab, GA Hall, Block 5        |
| 5     | GA Hall, Chemistry Lab, Veg Canteen, Block 5     |

Stops, routes and clue text live in [src/game/data.js](src/game/data.js).
Print the markers from `/markers/print-markers.html`.

## Tech

- React 19 + Vite 8
- A-Frame 1.4.2 and AR.js 3.4.8 (barcode markers, `3x3_HAMMING63`), loaded
  from pinned CDN URLs only when the camera screen opens
- `<model-viewer>` 3.5.0 for the 3D clue models
- Vercel Functions in [api/](api) with Upstash Redis for team state

## Run locally

```bash
npm install
npm run dev
```

The dev server runs the `/api` functions itself and keeps teams in memory,
so no Vercel CLI or database is needed. It serves over HTTPS on your local
network, so phones on the same Wi-Fi can open it and use the camera.

In dev mode the play screen shows a "Dev scan" bar with buttons 0 to 4 that
act as marker scans, for testing without printed markers.

## Deploy (Vercel)

The Vercel project is connected to this repository and deploys on every push
to `main`.

One-time setup:

1. In the Vercel project, open **Storage**, add **Upstash for Redis** from the
   Marketplace (free plan) and connect it. This sets `KV_REST_API_URL` and
   `KV_REST_API_TOKEN`.
2. Add an `ADMIN_KEY` environment variable (any long random string).
3. Redeploy.

Without Redis the API answers 503, because memory is not shared between
serverless instances.

### Clearing test runs before the event

```bash
curl -X POST https://<your-domain>/api/reset -H "x-admin-key: <ADMIN_KEY>"
```

## API

| Method | Path                | Purpose                                           |
| ------ | ------------------- | ------------------------------------------------- |
| POST   | `/api/teams`        | Register `{ name, routeId }`, returns team + token |
| GET    | `/api/team?id=`     | Resume a team (`x-team-token` header)             |
| POST   | `/api/scan`         | Record a scan `{ id, marker }` (`x-team-token`)   |
| GET    | `/api/leaderboard`  | Ranked teams, no codes                            |
| POST   | `/api/reset`        | Wipe all teams (`x-admin-key`)                    |

## Scripts

- `npm run dev`: dev server with the local API
- `npm run build`: production build
- `npm run lint`: ESLint

© 2026 IEEE CIS MJCET
