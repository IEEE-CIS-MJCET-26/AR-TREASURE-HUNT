import { recordScan } from "./_lib/game.js";
import { handle, readBody } from "./_lib/http.js";

// POST /api/scan  { id, marker }  (x-team-token header)
//   -> { result: correct | wrong | collected | finished, location, team }
export async function POST(request) {
  return handle(async () => {
    const { id, marker } = await readBody(request);
    return recordScan({
      id,
      marker,
      token: request.headers.get("x-team-token"),
    });
  });
}
