// Game data shared by the app and the API. The secret part (each team's
// code) lives only on the server; everything here is safe to ship.

// Printed barcode marker value -> stop it is placed at.
export const MARKER_LOCATIONS = {
  0: "Block 5",
  1: "Veg Canteen",
  2: "GA Hall",
  3: "Chemistry Lab",
  4: "Workshop",
};

export const ROUTES = [
  {
    id: "route-1",
    number: 1,
    stops: ["Block 5", "Veg Canteen", "GA Hall", "Chemistry Lab"],
  },
  {
    id: "route-2",
    number: 2,
    stops: ["Chemistry Lab", "Workshop", "Veg Canteen", "GA Hall"],
  },
  {
    id: "route-3",
    number: 3,
    stops: ["Veg Canteen", "Block 5", "Workshop", "GA Hall"],
  },
  {
    id: "route-4",
    number: 4,
    stops: ["Workshop", "Chemistry Lab", "GA Hall", "Block 5"],
  },
  {
    id: "route-5",
    number: 5,
    stops: ["GA Hall", "Chemistry Lab", "Veg Canteen", "Block 5"],
  },
];

// One code digit per stop, so the code length is the route length.
export const CODE_LENGTH = 4;

export const TEAM_NAME_MAX = 24;

// Riddle shown for the stop a team must find next.
export const LOCATION_HINTS = {
  "Veg Canteen": "Stationery is your neighbour, hunger is your guide.",
  "Chemistry Lab": "Where experiments go right and sometimes very wrong.",
  Workshop:
    "Where sparks fly and machines roar, your next clue waits at the entrance door.",
  "Block 5": "Count the blocks, stop at five.",
  "GA Hall":
    "Where the crowd roars and spotlights fall, legends are made in the biggest hall.",
};

// Extra nudge shown after scanning the wrong stop.
export const VAGUE_HINTS = {
  "Block 5": "Think numbers... small ones.",
  "Veg Canteen": "Look for sustenance nearby.",
  "GA Hall": "Where many gather.",
  "Chemistry Lab": "Science happens here.",
  Workshop: "Tools and making go here.",
};

export const findRoute = (routeId) =>
  ROUTES.find((route) => route.id === routeId) || null;
