import { useState, useCallback, useRef } from "react";

const CODE_SEQUENCE = ["5", "6", "0", "6"];

export const BARCODE_LOCATIONS = {
  0: "Block 5",
  1: "Veg Canteen",
  2: "GA Hall",
  3: "Chemistry Lab",
  4: "Workshop",
};

export const ROUTES = [
  {
    id: "route-1",
    label: "Route 1",
    stops: ["Block 5", "Veg Canteen", "GA Hall", "Chemistry Lab"],
  },
  {
    id: "route-2",
    label: "Route 2",
    stops: ["Chemistry Lab", "Workshop", "Veg Canteen", "GA Hall"],
  },
  {
    id: "route-3",
    label: "Route 3",
    stops: ["Veg Canteen", "Block 5", "Workshop", "GA Hall"],
  },
  {
    id: "route-4",
    label: "Route 4",
    stops: ["Workshop", "Chemistry Lab", "GA Hall", "Block 5"],
  },
  {
    id: "route-5",
    label: "Route 5",
    stops: ["GA Hall", "Chemistry Lab", "Veg Canteen", "Block 5"],
  },
];

const LOCATION_HINTS = {
  "Veg Canteen": "Stationery is your neighbour, hunger is your guide.",
  "Chemistry Lab": "Where experiments go right and sometimes very wrong.",
  Workshop:
    "Where sparks fly and machines roar, your next clue waits at the entrance door.",
  "Block 5": "Count the blocks, stop at five.",
  "GA Hall":
    "Where the crowd roars and spotlights fall, legends are made in the biggest hall.",
};

const VAGUE_HINTS = {
  "Block 5": "Think numbers... small ones.",
  "Veg Canteen": "Look for sustenance nearby.",
  "GA Hall": "Where many gather.",
  "Chemistry Lab": "Science happens here.",
  Workshop: "Tools and making go here.",
};

const ALL_LOCATIONS = Object.values(BARCODE_LOCATIONS);

const getNextHint = (activeRoute, nextIndex) => {
  const nextLocation = activeRoute?.stops?.[nextIndex];

  if (!nextLocation) {
    return "All route clues collected.";
  }

  return LOCATION_HINTS[nextLocation] || "Clue updated.";
};

// ══════════════════════════════════════════════════════════════════
// GAME HOOK: useGameState
// ══════════════════════════════════════════════════════════════════

export default function useGameState() {
  // ── Game State ──
  const [phase, setPhase] = useState("splash"); // splash | playing | gameover
  const [routeId, setRouteId] = useState(null);
  const [progressIndex, setProgressIndex] = useState(0);
  const [turnNumber, setTurnNumber] = useState(0);
  const [moveHistory, setMoveHistory] = useState([]);
  const [collectedCode, setCollectedCode] = useState(["?", "?", "?", "?"]);
  const [lastScanEvent, setLastScanEvent] = useState(null);
  const [round2Location, setRound2Location] = useState(null);
  const [debugLog, setDebugLog] = useState(null);
  const lockRef = useRef(false);

  const activeRoute = ROUTES.find((route) => route.id === routeId) || null;
  const nextLocation = activeRoute?.stops?.[progressIndex] || null;
  const completeCode = collectedCode.join("");

  /**
   * Process barcode scan based on selected route order.
   * @param {number} barcodeValue - Scanned barcode (0-4)
   */
  const onMarkerDetected = useCallback(
    (barcodeValue) => {
      if (lockRef.current || phase !== "playing") {
        return;
      }

      lockRef.current = true;

      const scannedLocation = BARCODE_LOCATIONS[barcodeValue];

      if (!scannedLocation) {
        setDebugLog(`Invalid barcode: ${barcodeValue}`);
        setTimeout(() => setDebugLog(null), 2000);
        lockRef.current = false;
        return;
      }

      if (!activeRoute || !nextLocation) {
        setDebugLog("Select and lock a route to begin.");
        setTimeout(() => {
          lockRef.current = false;
          setDebugLog(null);
        }, 1500);
        return;
      }

      if (scannedLocation !== nextLocation) {
        setLastScanEvent({
          type: "wrong",
          name: scannedLocation,
          description: VAGUE_HINTS[nextLocation],
          hint: VAGUE_HINTS[nextLocation],
          marker: barcodeValue,
        });
        setTimeout(() => {
          lockRef.current = false;
          setDebugLog(null);
          setLastScanEvent(null);
        }, 1500);
        return;
      }

      const foundDigit = CODE_SEQUENCE[progressIndex];
      const nextIndex = progressIndex + 1;

      const completedMove = {
        turnNumber: turnNumber + 1,
        step: progressIndex + 1,
        location: scannedLocation,
        barcodeScanned: barcodeValue,
        codeDigit: foundDigit,
        hint: LOCATION_HINTS[scannedLocation],
        timestamp: Date.now(),
      };

      setMoveHistory((prev) => [...prev, completedMove]);
      setProgressIndex(nextIndex);
      setTurnNumber((prev) => prev + 1);
      setCollectedCode((prev) => {
        const nextCode = [...prev];
        nextCode[progressIndex] = foundDigit;
        return nextCode;
      });
      setLastScanEvent({
        type: "correct",
        name: scannedLocation,
        description: `Code piece found: ${foundDigit}`,
        hintTarget:
          nextIndex >= CODE_SEQUENCE.length
            ? null
            : activeRoute?.stops?.[nextIndex] || null,
        hint:
          nextIndex >= CODE_SEQUENCE.length
            ? "All 4 code pieces collected."
            : getNextHint(activeRoute, nextIndex),
        marker: barcodeValue,
      });

      if (nextIndex >= CODE_SEQUENCE.length) {
        const leftoverLocation =
          ALL_LOCATIONS.find(
            (location) => !activeRoute.stops.includes(location),
          ) || "Workshop";
        setRound2Location(leftoverLocation);
        setDebugLog(`Code complete: ${CODE_SEQUENCE.join("")}`);
        setTimeout(() => setPhase("gameover"), 1500);
      } else {
        setDebugLog(`Code piece ${foundDigit} collected`);
      }

      setTimeout(() => {
        lockRef.current = false;
        setDebugLog(null);
      }, 1500);
    },
    [phase, activeRoute, nextLocation, progressIndex, turnNumber],
  );

  const onMarkerLost = useCallback(() => {
    // Optional: handle marker loss
  }, []);

  // ── Phase transitions ──
  const startGame = useCallback((selectedRouteId) => {
    const selectedRoute = ROUTES.find((route) => route.id === selectedRouteId);

    if (!selectedRoute) {
      setDebugLog("Please select a valid route.");
      return;
    }

    setRouteId(selectedRouteId);
    setPhase("playing");
    setProgressIndex(0);
    setTurnNumber(0);
    setMoveHistory([]);
    setCollectedCode(["?", "?", "?", "?"]);
    setLastScanEvent(null);
    setRound2Location(null);
    setDebugLog(`Route locked: ${selectedRoute.label}`);
    lockRef.current = false;
  }, []);

  const restartGame = useCallback(() => {
    setPhase("splash");
    setRouteId(null);
    setProgressIndex(0);
    setTurnNumber(0);
    setMoveHistory([]);
    setCollectedCode(["?", "?", "?", "?"]);
    setLastScanEvent(null);
    setRound2Location(null);
    setDebugLog(null);
    lockRef.current = false;
  }, []);

  return {
    // Game state
    phase,
    routeId,
    activeRoute,
    progressIndex,
    nextLocation,
    turnNumber,
    moveHistory,
    collectedCode,
    completeCode,
    lastScanEvent,
    round2Location,
    barcodeLocations: BARCODE_LOCATIONS,
    routes: ROUTES,
    debugLog,

    // Actions
    onMarkerDetected,
    onMarkerLost,
    startGame,
    restartGame,
  };
}
