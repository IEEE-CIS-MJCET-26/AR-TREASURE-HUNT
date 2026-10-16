import { memo, useEffect, useRef } from "react";
import { MARKER_LOCATIONS } from "../game/data.js";
import { loadArLibraries } from "../game/scripts.js";

const MARKER_VALUES = Object.keys(MARKER_LOCATIONS).map(Number);

function el(tagName, attributes = {}) {
  const node = document.createElement(tagName);
  Object.entries(attributes).forEach(([name, value]) =>
    node.setAttribute(name, value),
  );
  return node;
}

function buildScene(onFound) {
  const scene = el("a-scene", {
    embedded: "",
    arjs: "sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3_HAMMING63;",
    renderer: "alpha: true; antialias: true;",
    "vr-mode-ui": "enabled: false",
  });

  scene.addEventListener("loaded", () => {
    scene.renderer?.setClearColor?.(0x000000, 0);
  });

  MARKER_VALUES.forEach((value) => {
    const marker = el("a-marker", { type: "barcode", value });
    marker.addEventListener("markerFound", () => onFound(value));

    // Gold ring on the marker so players can see it is being read.
    marker.appendChild(
      el("a-ring", {
        rotation: "-90 0 0",
        "radius-inner": "0.4",
        "radius-outer": "0.5",
        material: "color: #d4af37; shader: flat; side: double",
        animation:
          "property: scale; dir: alternate; dur: 700; easing: easeInOutSine; loop: true; to: 1.15 1.15 1.15",
      }),
    );
    scene.appendChild(marker);
  });

  scene.appendChild(el("a-entity", { camera: "" }));
  return scene;
}

/**
 * Camera view with marker tracking. Built once with plain DOM because
 * A-Frame owns these nodes; React re-renders must never touch them.
 */
const ARScene = memo(function ARScene({ onMarker, onCameraState }) {
  const containerRef = useRef(null);
  const onMarkerRef = useRef(onMarker);
  const onCameraStateRef = useRef(onCameraState);

  useEffect(() => {
    onMarkerRef.current = onMarker;
    onCameraStateRef.current = onCameraState;
  }, [onMarker, onCameraState]);

  useEffect(() => {
    const container = containerRef.current;
    let cancelled = false;
    let mirrorTimer = null;
    const report = (state) => !cancelled && onCameraStateRef.current?.(state);

    const onCameraError = () => report("error");
    window.addEventListener("camera-error", onCameraError);

    // AR.js keeps its own <video> hidden at the back of the page. Show the
    // same stream in a video inside our frame, which renders reliably on iOS.
    const preview = el("video", {
      class: "ar-live-preview",
      autoplay: "",
      playsinline: "",
      muted: "",
    });
    preview.muted = true;

    const playPreview = () =>
      preview
        .play()
        .then(() => report("ready"))
        .catch(() => {
          report("tap");
          window.addEventListener("pointerdown", playPreview, { once: true });
        });

    const attachMirror = () => {
      const source = document.querySelector("#arjs-video");
      if (!source?.srcObject) return;
      window.clearInterval(mirrorTimer);
      preview.srcObject = source.srcObject;
      playPreview();
    };

    loadArLibraries()
      .then(() => {
        if (cancelled) return;
        container.appendChild(preview);
        container.appendChild(
          buildScene((value) => onMarkerRef.current?.(value)),
        );
        mirrorTimer = window.setInterval(attachMirror, 250);
      })
      .catch(() => report("error"));

    return () => {
      cancelled = true;
      window.clearInterval(mirrorTimer);
      window.removeEventListener("camera-error", onCameraError);
      window.removeEventListener("pointerdown", playPreview);
      container.replaceChildren();
      preview.srcObject = null;

      // Turn the camera off when leaving the hunt.
      document.querySelectorAll("video#arjs-video").forEach((video) => {
        video.srcObject?.getTracks?.().forEach((track) => track.stop());
        video.remove();
      });
    };
  }, []);

  return <div ref={containerRef} className="ar-frame" />;
});

export default ARScene;
