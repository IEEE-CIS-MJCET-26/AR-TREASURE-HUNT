const SESSION_KEY = "ath.session";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function call(path, { method = "GET", token, body } = {}) {
  let response;
  try {
    response = await fetch(path, {
      method,
      headers: {
        ...(body ? { "content-type": "application/json" } : {}),
        ...(token ? { "x-team-token": token } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("No connection. Check your internet and try again.", 0);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(data.error || "Something went wrong.", response.status);
  }
  return data;
}

export const createTeam = (name, routeId) =>
  call("/api/teams", { method: "POST", body: { name, routeId } });

export const fetchTeam = ({ id, token }) =>
  call(`/api/team?id=${encodeURIComponent(id)}`, { token });

export const sendScan = ({ id, token }, marker) =>
  call("/api/scan", { method: "POST", token, body: { id, marker } });

export const fetchLeaderboard = () => call("/api/leaderboard");

// The phone remembers its team so a refresh or crash resumes the hunt.
export function loadSession() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    return session?.id && session?.token ? session : null;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Private mode: the hunt still works, it just won't survive a refresh.
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}
