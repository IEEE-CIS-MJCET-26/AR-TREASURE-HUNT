import { CODE_LENGTH } from "../game/data.js";
import { formatDuration } from "../game/format.js";
import styles from "./LeaderboardList.module.css";

const teamKey = (team) => `${team.name}-${team.startedAt}`;

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

// Ranked team rows. `ownTeam` (name + startedAt) is highlighted.
export default function LeaderboardList({ board, error, ownTeam, large }) {
  const teams = board?.teams || [];
  const ownKey = ownTeam ? teamKey(ownTeam) : null;

  return (
    <div className={large ? styles.large : ""}>
      {error && <p className={styles.error}>{error} Retrying...</p>}
      {!board && !error && <p className={styles.empty}>Loading...</p>}
      {board && teams.length === 0 && (
        <p className={styles.empty}>
          No teams yet. Teams appear here once they start.
        </p>
      )}

      {teams.length > 0 && (
        <ol className={styles.list}>
          {teams.map((team) => (
            <li
              key={teamKey(team)}
              className={[
                styles.row,
                team.finishedAt ? styles.done : "",
                teamKey(team) === ownKey ? styles.own : "",
              ].join(" ")}
            >
              <span className={styles.rank}>{team.rank}</span>
              <span className={styles.team}>
                <span className={styles.name}>{team.name}</span>
                <span className={styles.route}>
                  Route {team.route}
                  {teamKey(team) === ownKey && " · You"}
                </span>
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
    </div>
  );
}
