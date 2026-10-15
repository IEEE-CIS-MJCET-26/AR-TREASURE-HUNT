import { GameError } from "./game.js";

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
}

export async function readBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export async function handle(run) {
  try {
    return json(await run());
  } catch (error) {
    if (error instanceof GameError) {
      return json({ error: error.message }, error.status);
    }
    console.error(error);
    return json({ error: "Something went wrong. Try again." }, 500);
  }
}
