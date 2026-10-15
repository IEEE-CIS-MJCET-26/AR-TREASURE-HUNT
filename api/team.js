import { getOwnTeam } from "./_lib/game.js";
import { handle } from "./_lib/http.js";

// GET /api/team?id=...  (x-team-token header)  -> { team }
export async function GET(request) {
  const id = new URL(request.url).searchParams.get("id");
  return handle(() => getOwnTeam(id, request.headers.get("x-team-token")));
}
