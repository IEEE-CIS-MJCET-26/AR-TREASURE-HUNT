import { randomInt, randomUUID, timingSafeEqual } from "node:crypto";
import {
  CODE_LENGTH,
  MARKER_LOCATIONS,
  TEAM_NAME_MAX,
  findRoute,
} from "../../src/game/data.js";
import { getStore } from "./store.js";

export class GameError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function requireStore() {
  const store = getStore();
  if (!store) {
    throw new GameError(503, "Leaderboard storage is not set up yet.");
  }
  return store;
}

function sameToken(a, b) {
  const left = Buffer.from(String(a || ""));
  const right = Buffer.from(String(b || ""));
  return left.length === right.length && timingSafeEqual(left, right);
}

// Finished teams first in finish order, then the rest by digits found,
// ties going to whoever reached that count first.
export function rankTeams(teams) {
  return [...teams].sort((a, b) => {
    if (a.finishedAt && b.finishedAt) return a.finishedAt - b.finishedAt;
    if (a.finishedAt) return -1;
    if (b.finishedAt) return 1;
    if (a.found !== b.found) return b.found - a.found;
    const aLast = a.lastFoundAt || a.startedAt;
    const bLast = b.lastFoundAt || b.startedAt;
    return aLast - bLast;
  });
}

// What the team's own phone may see. Only digits already earned.
function ownView(team, rank = null) {
  return {
    id: team.id,
    name: team.name,
    routeId: team.routeId,
    found: team.found,
    digits: team.code.slice(0, team.found).split(""),
    startedAt: team.startedAt,
    finishedAt: team.finishedAt,
    finishRank: rank,
  };
}

async function finishRank(store, team) {
  if (!team.finishedAt) return null;
  const teams = await store.listTeams();
  return teams.filter((t) => t.finishedAt && t.finishedAt <= team.finishedAt)
    .length;
}

async function loadOwnTeam(store, id, token) {
  const team = id ? await store.getTeam(String(id)) : null;
  if (!team || !sameToken(team.token, token)) {
    throw new GameError(404, "Team not found on this phone.");
  }
  return team;
}

export async function createTeam({ name, routeId }) {
  const store = requireStore();
  const cleanName = String(name || "").replace(/\s+/g, " ").trim();
  if (!cleanName || cleanName.length > TEAM_NAME_MAX) {
    throw new GameError(
      400,
      `Team name must be 1 to ${TEAM_NAME_MAX} characters.`,
    );
  }
  if (!findRoute(routeId)) {
    throw new GameError(400, "Pick a route.");
  }

  const team = {
    id: randomUUID(),
    token: randomUUID(),
    name: cleanName,
    routeId,
    code: Array.from({ length: CODE_LENGTH }, () => randomInt(10)).join(""),
    found: 0,
    startedAt: Date.now(),
    lastFoundAt: null,
    finishedAt: null,
  };
  await store.saveTeam(team);
  return { token: team.token, team: ownView(team) };
}

export async function getOwnTeam(id, token) {
  const store = requireStore();
  const team = await loadOwnTeam(store, id, token);
  return { team: ownView(team, await finishRank(store, team)) };
}

export async function recordScan({ id, token, marker }) {
  const store = requireStore();
  const team = await loadOwnTeam(store, id, token);
  const location = MARKER_LOCATIONS[marker];
  if (location === undefined) {
    throw new GameError(400, "Unknown marker.");
  }

  const route = findRoute(team.routeId);
  let result;

  if (team.finishedAt) {
    result = "finished";
  } else if (route.stops[team.found] === location) {
    const now = Date.now();
    team.found += 1;
    team.lastFoundAt = now;
    if (team.found >= route.stops.length) team.finishedAt = now;
    await store.saveTeam(team);
    result = "correct";
  } else if (route.stops.slice(0, team.found).includes(location)) {
    result = "collected";
  } else {
    result = "wrong";
  }

  return {
    result,
    location,
    team: ownView(team, await finishRank(store, team)),
  };
}

export async function leaderboard() {
  const store = requireStore();
  const teams = rankTeams(await store.listTeams());
  return {
    updatedAt: Date.now(),
    teams: teams.map((team, index) => ({
      rank: index + 1,
      name: team.name,
      route: findRoute(team.routeId)?.number ?? null,
      found: team.found,
      startedAt: team.startedAt,
      finishedAt: team.finishedAt,
    })),
  };
}

export async function resetEvent(adminKey) {
  const expected = process.env.ADMIN_KEY;
  if (!expected || !sameToken(adminKey, expected)) {
    throw new GameError(403, "Not allowed.");
  }
  await requireStore().clear();
  return { ok: true };
}
