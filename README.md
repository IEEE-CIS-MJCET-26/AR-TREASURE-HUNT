<div align="center">

# AR TREASURE HUNT

Mobile-first augmented reality treasure hunt built with React and Vite.

Players scan printed barcode markers in sequence to collect clue progress, reveal 3D hint models, and complete the round code.

</div>

## Features

- Barcode-driven gameplay with markers `0` through `4`
- Five symbol types mapped to the board logic
- Full move history with turn-by-turn tracking
- Victory and game-over states
- Printable marker sheet for the barcode cards
- Mobile-friendly layout designed for phone use

## Tech Stack

| Icon                                                                                                      | Technology | Version          | Notes                     |
| --------------------------------------------------------------------------------------------------------- | ---------- | ---------------- | ------------------------- |
| <img src="https://api.iconify.design/logos:react.svg" alt="React" width="18" />                           | React      | `19.2.4`         | UI layer                  |
| <img src="https://api.iconify.design/logos:react.svg" alt="React DOM" width="18" />                       | React DOM  | `19.2.4`         | Browser rendering         |
| <img src="https://api.iconify.design/logos:vitejs.svg" alt="Vite" width="18" />                           | Vite       | `8.0.1`          | Dev server and build tool |
| <img src="https://api.iconify.design/simple-icons:aframe.svg?color=%23ef2d5e" alt="A-Frame" width="18" /> | A-Frame    | `1.4.2`          | Loaded via CDN            |
| <img src="https://api.iconify.design/mdi:augmented-reality.svg?color=%230a0e1f" alt="AR.js" width="18" /> | AR.js      | Latest CDN build | Barcode-based AR tracking |
| <img src="https://api.iconify.design/logos:eslint.svg" alt="ESLint" width="18" />                         | ESLint     | `9.39.4`         | Code quality checks       |

## Requirements

- Node.js 18 or newer
- A camera-enabled phone or tablet for AR gameplay
- HTTPS or a secure local network connection for mobile camera access

## Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open the app in a browser.

## Scripts

- `npm run dev` - Start the Vite development server
- `npm run build` - Build the production bundle
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint across the project

## How To Play

1. Open the app on a phone with camera access.
2. Start the game from the splash screen.
3. Point the camera at one of the printed barcode markers.
4. Each scanned barcode applies its effect immediately.
5. Reach position `100` to win.

## Barcode Mapping

- `0` - Block 5
- `1` - Veg Canteen
- `2` - GA Hall
- `3` - Chemistry Lab
- `4` - Workshop

## Marker Printing

Printable marker sheets are available in [public/markers/print-markers.html](public/markers/print-markers.html).

The generated barcode images used by the sheet are stored in [public/markers/generated](public/markers/generated).

## Project Structure

```text
src/
	App.jsx
	App.css
	index.css
	main.jsx
	components/
		ARScene.jsx
		GameOverScreen.jsx
		HUD_new.jsx
		MarkerPopup.jsx
		SplashScreen.jsx
		VictoryScreen.jsx
	hooks/
		useDeviceOrientation.js
		useGameState.js
public/
	markers/
		print-markers.html
		generated/
```

## Notes

- The AR camera layer is configured for mobile browser use and depends on camera permissions.
- The game uses only barcode markers `0` to `4`; higher values are not part of the current build.
- The project is intentionally kept in plain JavaScript and React for a lightweight mobile experience.
