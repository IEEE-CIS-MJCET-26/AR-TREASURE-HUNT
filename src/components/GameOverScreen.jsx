import styles from "./GameOverScreen.module.css";

export default function GameOverScreen({
  completeCode,
  turnNumber,
  moveHistory,
  onRestart,
}) {
  return (
    <section className={styles.screen}>
      <div className={styles.card}>
        <p className={styles.kicker}>Round 1 Complete</p>
        <h1 className={styles.title}>You Won</h1>
        <p className={styles.message}>
          Code unlocked: <strong>{completeCode}</strong>
        </p>
        <p className={styles.nextStep}>Now head to 5606 for Round 2.</p>

        <div className={styles.stats}>
          <div>
            <span>Code Parts</span>
            <strong>4/4</strong>
          </div>
          <div>
            <span>Total Scans</span>
            <strong>{turnNumber}</strong>
          </div>
          <div>
            <span>Valid Stops</span>
            <strong>{moveHistory.length}</strong>
          </div>
        </div>

        <button className={styles.button} onClick={onRestart}>
          Thanks For Playing - Back To Main Page
        </button>
      </div>
    </section>
  );
}
