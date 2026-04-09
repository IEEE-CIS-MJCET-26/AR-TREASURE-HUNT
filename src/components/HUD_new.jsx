import styles from "./HUD.module.css";

export default function HUD({ progressIndex, collectedCode, turnNumber }) {
  return (
    <div className={styles.hud}>
      <header className={styles.topBar}>
        <div className={styles.brand}>AR TREASURE HUNT</div>
        <div className={styles.statRow}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Progress</span>
            <span className={styles.statValue}>{progressIndex}/4</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Scans</span>
            <span className={styles.statValue}>{turnNumber}</span>
          </div>
        </div>
      </header>

      <section className={styles.codeDock}>
        {collectedCode.map((digit, index) => (
          <div key={`${digit}-${index}`} className={styles.codeBox}>
            {digit}
          </div>
        ))}
      </section>
    </div>
  );
}
