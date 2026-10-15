// Third-party scripts, pinned to exact versions and loaded only when needed
// so the start screen and leaderboard stay light.
const AFRAME_URL = "https://aframe.io/releases/1.4.2/aframe.min.js";
const ARJS_URL =
  "https://cdn.jsdelivr.net/gh/AR-js-org/AR.js@3.4.8/aframe/build/aframe-ar.js";
const MODEL_VIEWER_URL =
  "https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js";

const pending = new Map();

function loadScript(src, type) {
  if (!pending.has(src)) {
    pending.set(
      src,
      new Promise((resolve, reject) => {
        const el = document.createElement("script");
        el.src = src;
        if (type) el.type = type;
        el.onload = resolve;
        el.onerror = () => {
          pending.delete(src);
          el.remove();
          reject(new Error(`Could not load ${src}`));
        };
        document.head.appendChild(el);
      }),
    );
  }
  return pending.get(src);
}

// AR.js must load after A-Frame.
export const loadArLibraries = () =>
  loadScript(AFRAME_URL).then(() => loadScript(ARJS_URL));

export const loadModelViewer = () => loadScript(MODEL_VIEWER_URL, "module");
