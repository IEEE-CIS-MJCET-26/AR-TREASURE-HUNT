import { useEffect, useState } from "react";
import { fetchLeaderboard } from "./api.js";

const REFRESH_MS = 4000;

// Polls the leaderboard while mounted; pauses while the tab is hidden.
export default function useLeaderboard() {
  const [board, setBoard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let timer = null;
    let stopped = false;

    const refresh = async () => {
      try {
        const data = await fetchLeaderboard();
        if (stopped) return;
        setBoard(data);
        setError("");
      } catch (err) {
        if (!stopped) setError(err.message);
      }
      if (!stopped) timer = setTimeout(refresh, REFRESH_MS);
    };

    const onVisibility = () => {
      clearTimeout(timer);
      if (document.visibilityState === "visible") refresh();
    };

    refresh();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stopped = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return { board, error };
}
