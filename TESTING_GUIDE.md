# Testing Guide

Manual checks for the revamped hunt. Run them on a real phone before the event.

## Setup

1. `npm install`, then `npm run dev`.
2. Connect the phone to the same Wi-Fi and open the Network URL Vite prints.
3. Accept the certificate warning (the dev server uses a self-signed one).
4. Print the markers from `/markers/print-markers.html`.

On a desktop without markers, use the "Dev scan" buttons (dev mode only).

## Start screen

- [ ] Start stays disabled until a team name is typed and a route is tapped.
- [ ] Start opens a confirm panel with the name and route; Go back returns.
- [ ] Confirming opens the camera screen and the phone asks for camera access.

## Camera screen

- [ ] Camera feed fills the screen, gold corner brackets are visible.
- [ ] Top bar shows team name, route number and digits found (0/4).
- [ ] Clue panel shows the riddle for stop 1 and empty code slots.
- [ ] "3D clue" opens the model full screen; it can be turned with a finger.
- [ ] Blocking the camera shows the "Allow the camera" screen with steps.

## Scanning (example: route 1 = markers 0, 1, 2, 3)

- [ ] Scan a marker that is not the next stop: red panel, "Wrong marker",
      the stop you scanned, and a hint. It closes by itself after a few seconds.
- [ ] Scan the right marker: gold ring on the marker, phone vibrates (Android),
      gold panel with "Digit 1 is N", the next clue and a 3D model.
- [ ] Scan the same marker again: no change, or "Already found" once the gold
      panel is closed.
- [ ] Refresh the page mid hunt: it resumes with the same digits and clue.
- [ ] After the 4th stop the finish screen shows the full code, time taken and
      finishing place.

## Leaderboard

- [ ] `/leaderboard` lists teams: finished first in finish order (gold rank),
      then teams still playing by digits found.
- [ ] It updates within a few seconds of a scan, without reloading.
- [ ] Codes never appear on the leaderboard.
- [ ] On a laptop or projector each team fits on one line in large type.

## Before the event

- [ ] Upstash Redis and `ADMIN_KEY` are set on Vercel (see README).
- [ ] Test runs are cleared with `POST /api/reset`.
