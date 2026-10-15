import { useState } from "react";
import { ROUTES, TEAM_NAME_MAX } from "../game/data.js";
import Logos from "./Logos.jsx";
import styles from "./StartScreen.module.css";

const STEPS = [
  "Read the clue and walk to that stop.",
  "Scan the marker at the stop to earn a digit.",
  "Collect all 4 digits to unlock your team code.",
];

export default function StartScreen({ onRegister }) {
  const [name, setName] = useState("");
  const [routeId, setRouteId] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const cleanName = name.replace(/\s+/g, " ").trim();
  const route = ROUTES.find((r) => r.id === routeId);
  const ready = cleanName.length > 0 && Boolean(route);

  const handleStart = async () => {
    setSubmitting(true);
    setError("");
    try {
      await onRegister(cleanName, routeId);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <Logos />
      </header>

      <section className={styles.intro}>
        <p className="label">IEEE CIS MJCET</p>
        <h1 className={`display ${styles.title}`}>AR Treasure Hunt</h1>
        <ol className={styles.steps}>
          {STEPS.map((step, index) => (
            <li key={step}>
              <span className={styles.stepNo}>{index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          if (ready) setConfirming(true);
        }}
      >
        <label className={styles.field}>
          <span className="label">Team name</span>
          <input
            className={styles.input}
            value={name}
            maxLength={TEAM_NAME_MAX}
            autoComplete="off"
            autoCapitalize="words"
            enterKeyHint="next"
            placeholder="Your team name"
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <fieldset className={styles.field}>
          <legend className="label">Route on your chit</legend>
          <div className={styles.routes}>
            {ROUTES.map((r) => (
              <button
                key={r.id}
                type="button"
                className={`${styles.route} ${routeId === r.id ? styles.routeOn : ""}`}
                aria-pressed={routeId === r.id}
                aria-label={`Route ${r.number}`}
                onClick={() => setRouteId(r.id)}
              >
                {r.number}
              </button>
            ))}
          </div>
        </fieldset>

        <button className="btn" type="submit" disabled={!ready}>
          Start the hunt
        </button>
        <p className={styles.note}>
          Your phone will ask for camera access. Allow it to scan markers.
        </p>
      </form>

      <footer className={styles.footer}>
        <a href="/leaderboard" className={styles.footerLink}>
          Leaderboard
        </a>
        <span>© 2026 IEEE CIS MJCET</span>
      </footer>

      {confirming && route && (
        <div className={styles.backdrop} role="dialog" aria-modal="true">
          <div className={styles.sheet}>
            <p className="label">Check before you start</p>
            <p className={`display ${styles.confirmName}`}>{cleanName}</p>
            <p className={styles.confirmRoute}>Route {route.number}</p>
            <p className={styles.confirmNote}>
              The route can't be changed once the hunt starts.
            </p>
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.sheetActions}>
              <button
                className="btn"
                type="button"
                disabled={submitting}
                onClick={handleStart}
              >
                {submitting ? "Starting..." : "Start"}
              </button>
              <button
                className="btn btn-ghost"
                type="button"
                disabled={submitting}
                onClick={() => {
                  setConfirming(false);
                  setError("");
                }}
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
