import SplashScreen from "./components/SplashScreen.jsx";
import HUD from "./components/HUD_new.jsx";
import GameOverScreen from "./components/GameOverScreen.jsx";
import MarkerPopup from "./components/MarkerPopup.jsx";
import WrongCodeMessage from "./components/WrongCodeMessage.jsx";
import ARScene from "./components/ARScene.jsx";
import useGameState from "./hooks/useGameState.js";
import useDeviceOrientation from "./hooks/useDeviceOrientation.js";
import "./App.css";

export default function App() {
  const {
    phase,
    routes,
    activeRoute,
    progressIndex,
    nextLocation,
    collectedCode,
    completeCode,
    turnNumber,
    moveHistory,
    lastScanEvent,
    round2Location,
    debugLog,
    onMarkerDetected,
    onMarkerLost,
    startGame,
    restartGame,
  } = useGameState();

  const { permissionState, requestPermission } = useDeviceOrientation();

  return (
    <div
      className="app-container"
      style={{ background: phase === "playing" ? "transparent" : "var(--bg)" }}
    >
      {phase === "splash" && (
        <SplashScreen
          routes={routes}
          onLaunch={startGame}
          permissionState={permissionState}
          requestPermission={requestPermission}
        />
      )}

      {phase === "playing" && (
        <>
          {debugLog && <div className="debug-overlay">{debugLog}</div>}

          <ARScene
            onMarkerDetected={onMarkerDetected}
            onMarkerLost={onMarkerLost}
          />

          <HUD
            activeRoute={activeRoute}
            progressIndex={progressIndex}
            nextLocation={nextLocation}
            collectedCode={collectedCode}
            completeCode={completeCode}
            turnNumber={turnNumber}
            moveHistory={moveHistory}
            lastScanEvent={lastScanEvent}
          />

          <MarkerPopup lastScanEvent={lastScanEvent} />

          <WrongCodeMessage lastScanEvent={lastScanEvent} />

          {permissionState === "denied" && (
            <div className="permission-warning">
              Motion access denied. Restart app and grant permission.
            </div>
          )}
        </>
      )}

      {phase === "gameover" && (
        <GameOverScreen
          round2Location={round2Location}
          completeCode={completeCode}
          turnNumber={turnNumber}
          moveHistory={moveHistory}
          onRestart={restartGame}
        />
      )}
    </div>
  );
}
