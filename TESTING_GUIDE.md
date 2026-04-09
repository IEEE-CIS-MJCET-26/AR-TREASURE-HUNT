# AR TREASURE HUNT Testing Guide

This guide covers end-to-end manual testing for the current AR TREASURE HUNT build.

## 1. Scope and Version

- Game mode: Route-based AR TREASURE HUNT (Round 1)
- Marker type: AR.js barcode markers only (0 to 4)
- Round 1 code sequence: 5 -> 6 -> 0 -> 6
- End state: Game Over screen with Round 2 handoff location

## 2. Environment Setup

### Desktop setup

1. Install dependencies.

```bash
npm install
```

2. Run production build validation.

```bash
npm run build
```

Expected: Build completes with no errors.

3. Start dev server.

```bash
npx vite --host 0.0.0.0 --port 5173
```

### Mobile setup

1. Connect mobile device and development machine to the same Wi-Fi network.
2. Open the Vite network URL shown in terminal.
3. Accept local certificate/security warning if prompted.
4. Allow camera permission.
5. If prompted on iOS, allow motion/orientation permission.

## 3. Marker Assets

Use the existing marker sheet:

- /markers/print-markers.html

Expected active markers:

- barcode-0
- barcode-1
- barcode-2
- barcode-3
- barcode-4

## 4. Functional Mapping (Must Match App)

### Barcode to location mapping

- Barcode 0 -> Block 5
- Barcode 1 -> Veg Canteen
- Barcode 2 -> GA Hall
- Barcode 3 -> Chemistry Lab
- Barcode 4 -> Workshop

### Route definitions

- Route 1: Block 5 -> Veg Canteen -> GA Hall -> Chemistry Lab
- Route 2: Chemistry Lab -> Workshop -> Veg Canteen -> GA Hall
- Route 3: Veg Canteen -> Block 5 -> Workshop -> GA Hall
- Route 4: Workshop -> Chemistry Lab -> GA Hall -> Block 5
- Route 5: GA Hall -> Chemistry Lab -> Veg Canteen -> Block 5

### Round 1 completion rule

- Player must scan the 4 route stops in exact order.
- Correct scan reveals next code digit from 5, 6, 0, 6.
- After 4 correct scans, app transitions to Game Over screen.
- Game Over screen must show Round 2 location as the unused fifth location.

## 5. Core Test Cases

### TC-01 Route Assignment Screen

1. Launch app.
2. Verify Route Assignment page is shown first.
3. Verify Start button is disabled before lock.
4. Select any route from dropdown.
5. Click Lock Route.
6. Verify selected route preview appears.
7. Verify Start button becomes enabled.

Expected:

- Route must be locked before game can start.

### TC-02 Change Route Before Start

1. Select and lock a route.
2. Click Change Route.
3. Select another route and lock again.

Expected:

- Route selection can be changed only before gameplay starts.

### TC-03 Correct Route Scan Flow

1. Start game with a known route (for example Route 1).
2. Scan markers matching each stop in route order.
3. After each correct scan verify:

- Bottom code boxes update one slot at a time.
- History adds one correct scan row.
- Hint popup shows Clue Found.
- Next Location updates to next stop.

Expected final after 4 correct scans:

- Code boxes display 5 6 0 6.
- Game transitions to Game Over screen.

### TC-04 Wrong Scan Handling

1. Start game with a route.
2. Scan a location not equal to current Next Location.

Expected:

- No progress increment.
- No new code digit added.
- Popup shows Try Another Location.
- Debug/hint messaging points user to expected location.

### TC-05 Duplicate Scan Debounce

1. Hold one marker in view continuously.
2. Observe scan count and history while marker remains in frame.

Expected:

- App should not rapidly count repeated detections during lock interval.
- At most one accepted update per lock cycle.

### TC-06 Round 2 Location Resolution

Run once for each route (Route 1 to Route 5).

Expected Round 2 location:

- Route 1 -> Workshop
- Route 2 -> Block 5
- Route 3 -> Chemistry Lab
- Route 4 -> Veg Canteen
- Route 5 -> Workshop

### TC-07 Restart Loop

1. Complete Round 1 until Game Over screen appears.
2. Click Back To Route Assignment.
3. Start another run with a different route.

Expected:

- All transient state resets (progress, history, code boxes, hints).

## 6. UI and UX Validation

### Lightweight overlay checks

- Top panel remains readable over camera preview.
- Bottom code dock stays above mobile safe-area inset.
- Popup appears and auto-hides smoothly.
- Layout remains usable in portrait orientation.

### Accessibility checks

- Route dropdown and buttons are keyboard focusable on desktop.
- Text contrast remains legible over camera feed.
- No blocking overlay hides critical controls.

## 7. Browser and Device Matrix

Minimum recommended matrix:

- Android Chrome (latest)
- iOS Safari (latest)
- Desktop Chrome (latest)

Optional:

- Samsung Internet
- Edge mobile

## 8. Regression Checklist

- No legacy game branding text appears in gameplay flow.
- Only markers 0 to 4 are used.
- Route list and mapping match this document.
- Code sequence is exactly 5, 6, 0, 6.
- Game Over shows Round 2 location and restart action.

## 9. Known Operational Issues and Workarounds

### Camera feed appears black

1. Close the tab completely.
2. Reopen app and re-allow camera.
3. Confirm no other app is locking the camera.

### iOS motion permission not granted

1. Restart app page.
2. Trigger permission prompt again.
3. Ensure motion permission is enabled in Safari settings.

### Marker not detected

1. Ensure marker is printed clearly and flat.
2. Increase lighting and avoid glare.
3. Move camera slowly until marker locks.

## 10. Printable Testing Checklist

Use the printable HTML testing sheet here:

- /testing-guide-print.html

You can open it in browser and print directly using browser print.
