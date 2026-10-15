import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiError,
  clearSession,
  createTeam,
  fetchTeam,
  loadSession,
  saveSession,
  sendScan,
} from "./api.js";
import { MARKER_LOCATIONS, findRoute } from "./data.js";

// Ignore a marker for a moment after it is handled, because AR.js fires
// markerFound again whenever tracking flickers.
const SCAN_COOLDOWN_MS = 2500;
const FINISH_DELAY_MS = 2500;

export default function useGame() {
  const [status, setStatus] = useState(() =>
    loadSession() ? "resuming" : "start",
  ); // resuming | resume-error | start | playing | finished
  const [team, setTeam] = useState(null);
  const [result, setResult] = useState(null);
  const sessionRef = useRef(loadSession());
  const busyRef = useRef(false);
  const cooldownRef = useRef({});

  const resume = useCallback(async () => {
    const session = sessionRef.current;
    if (!session) return;
    try {
      const data = await fetchTeam(session);
      setTeam(data.team);
      setStatus(data.team.finishedAt ? "finished" : "playing");
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        clearSession();
        sessionRef.current = null;
        setStatus("start");
      } else {
        setStatus("resume-error");
      }
    }
  }, []);

  useEffect(() => {
    // Async: state is only set after the request settles.
    resume();
  }, [resume]);

  const retryResume = useCallback(() => {
    setStatus("resuming");
    resume();
  }, [resume]);

  const register = useCallback(async (name, routeId) => {
    const data = await createTeam(name, routeId);
    const session = { id: data.team.id, token: data.token };
    saveSession(session);
    sessionRef.current = session;
    cooldownRef.current = {};
    setResult(null);
    setTeam(data.team);
    setStatus("playing");
  }, []);

  const scan = useCallback(
    async (marker) => {
      const session = sessionRef.current;
      const location = MARKER_LOCATIONS[marker];
      if (!session || !team || status !== "playing" || !location) return;
      if (busyRef.current) return;

      const now = Date.now();
      if (now - (cooldownRef.current[marker] || 0) < SCAN_COOLDOWN_MS) return;
      cooldownRef.current[marker] = now;

      // Rescanning a stop already found needs no server trip, and must not
      // cover the "digit found" sheet for that same stop.
      const route = findRoute(team.routeId);
      if (route.stops.slice(0, team.found).includes(location)) {
        setResult((current) =>
          current?.type === "correct" && current.location === location
            ? current
            : { type: "collected", location, at: now },
        );
        return;
      }

      busyRef.current = true;
      try {
        const data = await sendScan(session, marker);
        setTeam(data.team);

        if (data.result === "correct") {
          navigator.vibrate?.([60, 40, 60]);
          setResult({
            type: "correct",
            location: data.location,
            step: data.team.found,
            digit: data.team.digits[data.team.found - 1],
            at: now,
          });
          if (data.team.finishedAt) {
            setTimeout(() => setStatus("finished"), FINISH_DELAY_MS);
          }
        } else if (data.result === "finished") {
          setStatus("finished");
        } else {
          setResult({ type: data.result, location: data.location, at: now });
        }
      } catch (error) {
        // Let the team rescan straight away after a failed request.
        cooldownRef.current[marker] = 0;
        setResult({ type: "error", message: error.message, at: now });
      } finally {
        busyRef.current = false;
      }
    },
    [team, status],
  );

  const dismissResult = useCallback(() => setResult(null), []);

  const leaveTeam = useCallback(() => {
    clearSession();
    sessionRef.current = null;
    setTeam(null);
    setResult(null);
    setStatus("start");
  }, []);

  return {
    status,
    team,
    result,
    register,
    scan,
    dismissResult,
    leaveTeam,
    retryResume,
  };
}
