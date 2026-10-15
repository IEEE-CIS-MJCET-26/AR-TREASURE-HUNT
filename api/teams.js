import { createTeam } from "./_lib/game.js";
import { handle, readBody } from "./_lib/http.js";

// POST /api/teams  { name, routeId }  -> { token, team }
export async function POST(request) {
  return handle(async () => createTeam(await readBody(request)));
}
