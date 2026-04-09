import { useEffect, useState } from "react";
import styles from "./WrongCodeMessage.module.css";

export default function WrongCodeMessage({ lastScanEvent }) {
  const [message, setMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!lastScanEvent?.description) {
      return;
    }

    setMessage(lastScanEvent.description);
    setIsVisible(true);

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [lastScanEvent]);

  if (!isVisible || !message) {
    return null;
  }

  return (
    <div className={styles.messageOverlay}>
      <div className={styles.messageBox}>
        <p className={styles.messageText}>{message}</p>
      </div>
    </div>
  );
}
