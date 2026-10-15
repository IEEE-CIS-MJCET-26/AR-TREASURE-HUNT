import { useEffect } from "react";
import { CODE_LENGTH, LOCATION_HINTS, VAGUE_HINTS } from "../game/data.js";
import ModelClue from "./ModelClue.jsx";
import styles from "./PlayScreen.module.css";

const AUTO_CLOSE_MS = { wrong: 6000, collected: 4000, error: 6000 };

// Panel that slides over the clue after each scan.
export default function ResultSheet({ result, nextStop, onDismiss }) {
  useEffect(() => {
    const delay = AUTO_CLOSE_MS[result.type];
    if (!delay) return;
    const timer = setTimeout(onDismiss, delay);
    return () => clearTimeout(timer);
  }, [result, onDismiss]);

  if (result.type === "correct") {
    const done = result.step >= CODE_LENGTH;
    return (
      <section className={`${styles.sheet} ${styles.sheetGold}`} role="status">
        <p className={styles.sheetLabel}>
          {result.location} · stop {result.step} of {CODE_LENGTH}
        </p>
        <p className={`display ${styles.sheetTitle}`}>
          Digit {result.step} is {result.digit}
        </p>
        {done ? (
          <p className={styles.sheetText}>
            All {CODE_LENGTH} digits found. Opening your code...
          </p>
        ) : (
          <>
            <p className={styles.sheetText}>
              <strong>Next clue:</strong> {LOCATION_HINTS[nextStop]}
            </p>
            <ModelClue stop={nextStop} />
            <button
              className={`btn ${styles.darkButton}`}
              type="button"
              onClick={onDismiss}
            >
              Got it
            </button>
          </>
        )}
      </section>
    );
  }

  if (result.type === "wrong") {
    return (
      <section className={`${styles.sheet} ${styles.sheetRed}`} role="alert">
        <p className={styles.sheetLabel}>Not this stop</p>
        <p className={`display ${styles.sheetTitle}`}>Wrong marker</p>
        <p className={styles.sheetText}>
          That was the {result.location} marker.
          {nextStop && <> Hint: {VAGUE_HINTS[nextStop]}</>}
        </p>
        <button className="btn btn-ghost" type="button" onClick={onDismiss}>
          Keep looking
        </button>
      </section>
    );
  }

  if (result.type === "collected") {
    return (
      <section className={styles.sheet} role="status">
        <p className={styles.sheetLabel}>{result.location}</p>
        <p className={`display ${styles.sheetTitle}`}>Already found</p>
        <p className={styles.sheetText}>
          You have this stop&apos;s digit. Follow your next clue.
        </p>
      </section>
    );
  }

  return (
    <section className={`${styles.sheet} ${styles.sheetRed}`} role="alert">
      <p className={styles.sheetLabel}>Scan not saved</p>
      <p className={styles.sheetText}>{result.message}</p>
      <button className="btn btn-ghost" type="button" onClick={onDismiss}>
        Scan again
      </button>
    </section>
  );
}
