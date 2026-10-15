import adsophosLogo from "../assets/logos/adsophos.png";
import ieeeLogo from "../assets/logos/white-logo.png";
import styles from "./Logos.module.css";

export default function Logos() {
  return (
    <div className={styles.logos}>
      <img src={ieeeLogo} alt="IEEE CIS MJCET" className={styles.logo} />
      <img
        src={adsophosLogo}
        alt="Adsophos"
        className={`${styles.logo} ${styles.adsophos}`}
      />
    </div>
  );
}
