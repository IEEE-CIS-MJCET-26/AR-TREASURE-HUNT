import { useEffect, useState } from "react";
import styles from "./MarkerPopup.module.css";

const block5HintModelUrl = new URL("../../b5.glb", import.meta.url).href;

const vegCanteenHintModelUrl = new URL("../../vc.glb", import.meta.url).href;

const gaHallHintModelUrl = new URL("../../gahall.glb", import.meta.url).href;

const chemistryHintModelUrl = new URL("../../cl.glb", import.meta.url).href;

const workshopHintModelUrl = new URL("../../wk.glb", import.meta.url).href;

const HINT_MODELS = {
  "Block 5": block5HintModelUrl,
  "Veg Canteen": vegCanteenHintModelUrl,
  "GA Hall": gaHallHintModelUrl,
  "Chemistry Lab": chemistryHintModelUrl,
  Workshop: workshopHintModelUrl,
};

export default function MarkerPopup({ lastScanEvent }) {
  const [currentHintTarget, setCurrentHintTarget] = useState(null);

  useEffect(() => {
    const nextHintTarget = lastScanEvent?.hintTarget;

    if (!nextHintTarget) {
      return;
    }

    if (!HINT_MODELS[nextHintTarget]) {
      return;
    }

    setCurrentHintTarget(nextHintTarget);
  }, [lastScanEvent]);

  useEffect(() => {
    if (!currentHintTarget || !HINT_MODELS[currentHintTarget]) {
      return;
    }

    if (window.customElements?.get("model-viewer")) {
      return;
    }

    const scriptEl = document.createElement("script");
    scriptEl.type = "module";
    scriptEl.src =
      "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";
    document.head.appendChild(scriptEl);
  }, [currentHintTarget]);

  const activeHintModel = HINT_MODELS[currentHintTarget] || null;

  if (!activeHintModel) {
    return null;
  }

  return (
    <div className={styles.centerModelOverlay}>
      <model-viewer
        src={activeHintModel}
        interaction-prompt="none"
        disable-zoom
        disable-pan
        shadow-intensity="0.9"
        exposure="1"
        className={styles.centerModelViewer}
      />
    </div>
  );
}
