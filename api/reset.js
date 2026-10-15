import { resetEvent } from "./_lib/game.js";
import { handle } from "./_lib/http.js";

// POST /api/reset  (x-admin-key header = ADMIN_KEY env var)
// Clears every team. Use before the event to wipe test runs.
export async function POST(request) {
  return handle(() => resetEvent(request.headers.get("x-admin-key")));
}
