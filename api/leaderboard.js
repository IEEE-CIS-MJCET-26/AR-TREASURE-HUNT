import { leaderboard } from "./_lib/game.js";
import { handle } from "./_lib/http.js";

// GET /api/leaderboard -> { updatedAt, teams: [...] }
export async function GET() {
  return handle(() => leaderboard());
}
