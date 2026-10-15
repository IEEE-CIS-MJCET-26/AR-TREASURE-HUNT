import { findRoute } from "../game/data.js";
import { formatDuration, ordinal } from "../game/format.js";
import CodeSlots from "./CodeSlots.jsx";
import Logos from "./Logos.jsx";
import styles from "./FinishScreen.module.css";

export default function FinishScreen({ team, onLeave }) {
  const route = findRoute(team.routeId);

  return (
    <main className={styles.screen}>
      <header>
        <Logos />
      </header>

      <section className={styles.hero}>
        <p className="label">Hunt complete</p>
        <h1 className={`display ${styles.team}`}>{team.name}</h1>
        {team.finishRank && (
          <p className={`display ${styles.rank}`}>
            {ordinal(team.finishRank)} to finish
          </p>
        )}
      </section>

      <section className={styles.codeBlock}>
        <p className="label">Your team code</p>
        <CodeSlots digits={team.digits} size="lg" />
      </section>

      <dl className={styles.stats}>
        <div>
          <dt className="label">Time taken</dt>
          <dd>{formatDuration(team.finishedAt - team.startedAt)}</dd>
        </div>
        <div>
          <dt className="label">Route</dt>
          <dd>{route?.number}</dd>
        </div>
      </dl>

      <div className={styles.actions}>
        <a className="btn" href="/leaderboard">
          See the leaderboard
        </a>
        <button
          className="text-button"
          type="button"
          onClick={() => {
            if (window.confirm("Remove this team from this phone?")) onLeave();
          }}
        >
          Use this phone for another team
        </button>
      </div>
    </main>
  );
}
