import useLeaderboard from "../game/useLeaderboard.js";
import LeaderboardList from "./LeaderboardList.jsx";
import Logos from "./Logos.jsx";
import styles from "./Leaderboard.module.css";

// Full page at /leaderboard, sized for a projector as well as phones.
export default function Leaderboard() {
  const { board, error } = useLeaderboard();
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

      <LeaderboardList board={board} error={error} large />
    </main>
  );
}
