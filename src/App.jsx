import { useEffect } from "react";
import FinishScreen from "./components/FinishScreen.jsx";
import PlayScreen from "./components/PlayScreen.jsx";
import StartScreen from "./components/StartScreen.jsx";
import { loadArLibraries } from "./game/scripts.js";
import useGame from "./game/useGame.js";
import styles from "./App.module.css";

export default function App() {
  const game = useGame();

  // Fetch the AR libraries while the team fills in the start screen.
  useEffect(() => {
    loadArLibraries().catch(() => {});
  }, []);

  switch (game.status) {
    case "resuming":
      return (
        <main className={styles.centered}>
          <p className="label">Loading your team...</p>
        </main>
      );
    case "resume-error":
      return (
        <main className={styles.centered}>
          <p className={`display ${styles.title}`}>No connection</p>
          <p className={styles.text}>
            Your progress is saved. Check your internet, then try again.
          </p>
          <button className="btn" type="button" onClick={game.retryResume}>
            Try again
          </button>
        </main>
      );
    case "playing":
      return (
        <PlayScreen
          team={game.team}
          result={game.result}
          onScan={game.scan}
          onDismissResult={game.dismissResult}
        />
      );
    case "finished":
      return <FinishScreen team={game.team} onLeave={game.leaveTeam} />;
    default:
      return <StartScreen onRegister={game.register} />;
  }
}
