import { useEffect, useState } from "react";
import { STOP_MODELS } from "../game/models.js";
import { loadModelViewer } from "../game/scripts.js";
import styles from "./ModelClue.module.css";

function Viewer({ src, interactive }) {
  return (
    <model-viewer
      src={src}
      alt="3D clue model"
      auto-rotate
      rotation-per-second="20deg"
      interaction-prompt="none"
      disable-zoom
      disable-pan
      {...(interactive ? { "camera-controls": "" } : {})}
      shadow-intensity="0.8"
      exposure="1"
      className={styles.viewer}
    />
  );
}

// Full-screen 3D model of a stop. Players can rotate it with a finger.
export function ModelModal({ stop, onClose }) {
  const src = STOP_MODELS[stop];
  useEffect(() => {
    loadModelViewer().catch(() => {});
  }, []);
  if (!src) return null;

  return (
    <div className={styles.modal} role="dialog" aria-modal="true">
      <p className="label">3D clue, drag to turn it</p>
      <div className={styles.modalStage}>
        <Viewer src={src} interactive />
      </div>
      <button className="btn btn-ghost" type="button" onClick={onClose}>
        Close
      </button>
    </div>
  );
}

// Small 3D model that opens full screen when tapped.
export default function ModelClue({ stop }) {
  const [open, setOpen] = useState(false);
  const src = STOP_MODELS[stop];
  useEffect(() => {
    loadModelViewer().catch(() => {});
  }, []);
  if (!src) return null;

  return (
    <>
      <button
        type="button"
        className={styles.thumb}
        onClick={() => setOpen(true)}
        aria-label="Open the 3D clue full screen"
      >
        <Viewer src={src} />
        <span className={styles.expand}>Tap to enlarge</span>
      </button>
      {open && <ModelModal stop={stop} onClose={() => setOpen(false)} />}
    </>
  );
}
