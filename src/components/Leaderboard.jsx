import { useEffect, useState } from "react";
import { fetchLeaderboard } from "../game/api.js";
import { CODE_LENGTH } from "../game/data.js";
import { formatDuration } from "../game/format.js";
import Logos from "./Logos.jsx";
import styles from "./Leaderboard.module.css";

const REFRESH_MS = 4000;

function Progress({ found }) {
  return (
    <span className={styles.progress} aria-label={`${found} of ${CODE_LENGTH}`}>
      {Array.from({ length: CODE_LENGTH }, (_, index) => (
        <span
          key={index}
          className={`${styles.pip} ${index < found ? styles.pipOn : ""}`}
        />
      ))}
    </span>
  );
}

export default function Leaderboard() {
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

    // Pause polling while the tab is hidden, refresh as soon as it returns.
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

  const teams = board?.teams || [];
  const finishedCount = teams.filter((team) => team.finishedAt).length;

  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <Logos />
        <a href="/" className={styles.back}>
          Play
        </a>
      </header>

      <div className={styles.titleRow}>
        <div>
          <p className="label">AR Treasure Hunt</p>
          <h1 className={`display ${styles.title}`}>Leaderboard</h1>
        </div>
        {board && (
          <p className={styles.summary}>
            <span className={styles.summaryNum}>{finishedCount}</span> of{" "}
            {teams.length} finished
          </p>
        )}
      </div>

      {error && <p className={styles.error}>{error} Retrying...</p>}

      {board && teams.length === 0 && (
        <p className={styles.empty}>No teams yet. Teams appear here once they start.</p>
      )}

      {!board && !error && <p className={styles.empty}>Loading...</p>}

      {teams.length > 0 && (
        <ol className={styles.list}>
          {teams.map((team) => (
            <li
              key={`${team.name}-${team.startedAt}`}
              className={`${styles.row} ${team.finishedAt ? styles.done : ""}`}
            >
              <span className={styles.rank}>{team.rank}</span>
              <span className={styles.team}>
                <span className={styles.name}>{team.name}</span>
                <span className={styles.route}>Route {team.route}</span>
              </span>
              <Progress found={team.found} />
              <span className={styles.time}>
                {team.finishedAt
                  ? formatDuration(team.finishedAt - team.startedAt)
                  : "Playing"}
              </span>
            </li>
          ))}
        </ol>
      )}

      {board && (
        <p className={styles.updated}>
          Updated {new Date(board.updatedAt).toLocaleTimeString()}
        </p>
      )}
    </main>
  );
}
