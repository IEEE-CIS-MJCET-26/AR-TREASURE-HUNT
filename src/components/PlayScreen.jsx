import { useCallback, useState } from "react";
import {
  CODE_LENGTH,
  LOCATION_HINTS,
  MARKER_LOCATIONS,
  findRoute,
} from "../game/data.js";
import useLeaderboard from "../game/useLeaderboard.js";
import ARScene from "./ARScene.jsx";
import CodeSlots from "./CodeSlots.jsx";
import LeaderboardList from "./LeaderboardList.jsx";
import { ModelModal } from "./ModelClue.jsx";
import ResultSheet from "./ResultSheet.jsx";
import styles from "./PlayScreen.module.css";

function CameraNotice({ state }) {
  if (state === "ready") return null;

  if (state === "error") {
    return (
      <div className={styles.cameraBlock}>
        <p className="label">Camera unavailable</p>
        <p className={`display ${styles.cameraTitle}`}>Allow the camera</p>
        <ul className={styles.cameraSteps}>
          <li>
            <strong>Android, Chrome:</strong> tap the icon left of the address,
            then Permissions, then turn on Camera.
          </li>
          <li>
            <strong>iPhone, Safari:</strong> tap aA in the address bar, then
            Website Settings, then set Camera to Allow.
          </li>
        </ul>
        <button
          className="btn"
          type="button"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <p className={styles.cameraPill}>
      {state === "tap" ? "Tap the screen to show the camera" : "Starting camera..."}
    </p>
  );
}

// Live leaderboard over the camera; the hunt keeps running underneath.
function LeaderboardOverlay({ team, onClose }) {
  const { board, error } = useLeaderboard();
  return (
    <div className={styles.boardOverlay} role="dialog" aria-modal="true">
      <div className={styles.boardHead}>
        <h2 className={`display ${styles.boardTitle}`}>Leaderboard</h2>
        <button className={styles.topButton} type="button" onClick={onClose}>
          Close
        </button>
      </div>
      <div className={styles.boardBody}>
        <LeaderboardList board={board} error={error} ownTeam={team} />
      </div>
    </div>
  );
}

export default function PlayScreen({ team, result, onScan, onDismissResult }) {
  const [cameraState, setCameraState] = useState("starting");
  const [showModel, setShowModel] = useState(false);
  const [showBoard, setShowBoard] = useState(false);
  const handleCameraState = useCallback((state) => setCameraState(state), []);

  const route = findRoute(team.routeId);
  const nextStop = route.stops[team.found] || null;

  return (
    <main className={styles.screen}>
      <ARScene onMarker={onScan} onCameraState={handleCameraState} />

      <header className={styles.topBar}>
        <span className={styles.teamName}>{team.name}</span>
        <span className={styles.topMeta}>
          Route {route.number}
          <span className={styles.count}>
            {team.found}/{CODE_LENGTH}
          </span>
          <button
            className={styles.topButton}
            type="button"
            onClick={() => setShowBoard(true)}
          >
            Leaderboard
          </button>
        </span>
      </header>

      {import.meta.env.DEV && (
        <div className={styles.devBar}>
          <span>Dev scan:</span>
          {Object.entries(MARKER_LOCATIONS).map(([value, name]) => (
            <button
              key={value}
              type="button"
              title={name}
              onClick={() => onScan(Number(value))}
            >
              {value}
            </button>
          ))}
        </div>
      )}

      {cameraState !== "error" && (
        <div className={styles.reticle} aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
      )}

      <CameraNotice state={cameraState} />

      <div className={styles.bottom}>
        {result ? (
          <ResultSheet
            key={result.at}
            result={result}
            nextStop={nextStop}
            onDismiss={onDismissResult}
          />
        ) : (
          nextStop && (
            <section className={styles.sheet}>
              <div className={styles.clueHead}>
                <p className={styles.sheetLabel}>
                  Clue for stop {team.found + 1} of {CODE_LENGTH}
                </p>
                <button
                  type="button"
                  className={styles.modelButton}
                  onClick={() => setShowModel(true)}
                >
                  3D clue
                </button>
              </div>
              <p className={styles.clue}>{LOCATION_HINTS[nextStop]}</p>
              <CodeSlots digits={team.digits} size="sm" />
            </section>
          )
        )}
      </div>

      {showBoard && (
        <LeaderboardOverlay team={team} onClose={() => setShowBoard(false)} />
      )}

      {showModel && nextStop && (
        <ModelModal stop={nextStop} onClose={() => setShowModel(false)} />
      )}
    </main>
  );
}
