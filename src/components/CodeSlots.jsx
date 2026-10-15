import { CODE_LENGTH } from "../game/data.js";
import styles from "./CodeSlots.module.css";

// The team's code so far: earned digits in gold, the rest empty.
export default function CodeSlots({ digits, size = "md" }) {
  return (
    <div
      className={`${styles.row} ${styles[size]}`}
      aria-label={`${digits.length} of ${CODE_LENGTH} code digits found`}
    >
      {Array.from({ length: CODE_LENGTH }, (_, index) => (
        <span
          key={index}
          className={`${styles.slot} ${digits[index] !== undefined ? styles.filled : ""}`}
        >
          {digits[index] ?? ""}
        </span>
      ))}
    </div>
  );
}
