import { useEffect, useRef, memo } from "react";

/**
 * ARScene
 *
 * Injects the <a-scene> into the DOM and handles marker events.
 * It's memoised so it doesn't re-render and reset the camera when React state changes.
 */
const ARScene = memo(({ onMarkerDetected, onMarkerLost }) => {
  const containerRef = useRef(null);
  const previewVideoRef = useRef(null);
  const previewHintRef = useRef(null);
  const onFoundRef = useRef(onMarkerDetected);
  const onLostRef = useRef(onMarkerLost);

  // Keep refs up to date with the latest props
  useEffect(() => {
    onFoundRef.current = onMarkerDetected;
    onLostRef.current = onMarkerLost;
  }, [onMarkerDetected, onMarkerLost]);

  useEffect(() => {
    // We only want to inject this once
    if (!containerRef.current || containerRef.current.hasChildNodes()) return;

    const blockZeroModelUrl = new URL("../../Block 0.fbx.glb", import.meta.url)
      .href;

    const createSceneNode = (tagName, attributes = {}) => {
      const node = document.createElement(tagName);

      Object.entries(attributes).forEach(([name, value]) => {
        node.setAttribute(name, value);
      });

      return node;
    };

    const createCenteredGltfModel = ({
      modelUrl,
      targetSize = 0.7,
      position = "0 0 0",
      rotation = "-90 0 0",
      startHidden = false,
      onModelLoaded,
      onModelError,
    }) => {
      const anchorEl = createSceneNode("a-entity", {
        position,
        rotation,
        visible: startHidden ? "false" : "true",
        animation__bob:
          "property: position; dir: alternate; dur: 1400; easing: easeInOutSine; loop: true; to: 0 0.06 0",
      });

      const modelEl = createSceneNode("a-entity", {
        "gltf-model": `url(${modelUrl})`,
      });

      modelEl.addEventListener("model-loaded", () => {
        const Three = window.THREE;
        const mesh = modelEl.getObject3D("mesh");

        if (!Three || !mesh) {
          if (onModelError) {
            onModelError();
          }
          return;
        }

        mesh.updateMatrixWorld(true);

        const bounds = new Three.Box3().setFromObject(mesh);
        const center = bounds.getCenter(new Three.Vector3());
        const size = bounds.getSize(new Three.Vector3());
        const longestSide = Math.max(size.x, size.y, size.z);

        mesh.position.x -= center.x;
        mesh.position.y -= center.y;
        mesh.position.z -= center.z;

        if (longestSide > 0) {
          const uniformScale = targetSize / longestSide;
          modelEl.object3D.scale.set(uniformScale, uniformScale, uniformScale);
        }

        if (startHidden) {
          anchorEl.setAttribute("visible", "true");
        }

        if (onModelLoaded) {
          onModelLoaded();
        }
      });

      modelEl.addEventListener("model-error", () => {
        if (onModelError) {
          onModelError();
        }
      });

      anchorEl.appendChild(modelEl);
      return { anchorEl, modelEl };
    };

    // 1. Create the a-scene element
    const sceneEl = document.createElement("a-scene");

    // embedded: necessary to position it with CSS within our app
    // arjs: configuration for AR.js
    //   sourceType: webcam (default)
    //   debugUIEnabled: false
    //   detectionMode: mono_and_matrix
    //   matrixCodeType: 3x3_HAMMING_63 (for our barcode markers 0, 1, 2)
    sceneEl.setAttribute("embedded", "");
    sceneEl.setAttribute(
      "arjs",
      "sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3_HAMMING63;",
    );
    sceneEl.setAttribute("renderer", "alpha: true; antialias: true;");
    sceneEl.style.position = "absolute";
    sceneEl.style.inset = "0";
    sceneEl.style.width = "100%";
    sceneEl.style.height = "100%";
    sceneEl.style.background = "transparent";

    sceneEl.addEventListener("loaded", () => {
      const renderer = sceneEl.renderer;
      if (renderer && renderer.setClearColor) {
        renderer.setClearColor(0x000000, 0);
      }
    });

    // Add VR button removal
    sceneEl.setAttribute("vr-mode-ui", "enabled: false");

    // ── Pre-configured Markers ──
    const markers = [
      { type: "barcode", value: 0, eventData: { kind: "barcode", value: 0 } },
      { type: "barcode", value: 1, eventData: { kind: "barcode", value: 1 } },
      { type: "barcode", value: 2, eventData: { kind: "barcode", value: 2 } },
      { type: "barcode", value: 3, eventData: { kind: "barcode", value: 3 } },
      { type: "barcode", value: 4, eventData: { kind: "barcode", value: 4 } },
    ];

    markers.forEach((mcfg) => {
      const markerEl = document.createElement("a-marker");

      if (mcfg.type === "pattern") {
        markerEl.setAttribute("preset", mcfg.preset);
      } else if (mcfg.type === "barcode") {
        markerEl.setAttribute("type", "barcode");
        markerEl.setAttribute("value", mcfg.value);
      }

      // We use the Ref inside the listener so it's never stale
      markerEl.addEventListener("markerFound", () => {
        if (onFoundRef.current) {
          onFoundRef.current(mcfg.eventData.value);
        }
      });

      markerEl.addEventListener("markerLost", () => {
        if (onLostRef.current) {
          onLostRef.current(mcfg.eventData.value);
        }
      });

      // Visual indicator that tracking is active on this marker
      const boxEl = document.createElement("a-box");
      boxEl.setAttribute("position", "0 0.5 0");
      boxEl.setAttribute("scale", "0.5 0.5 0.5");
      boxEl.setAttribute(
        "material",
        "color: #00f5a0; opacity: 0.3; transparent: true;",
      );
      markerEl.appendChild(boxEl);

      if (mcfg.value === 0) {
        const centeredBlockModel = createCenteredGltfModel({
          modelUrl: blockZeroModelUrl,
          targetSize: 0.64,
          position: "0 0 0",
          rotation: "-90 0 0",
          startHidden: false,
        });

        markerEl.appendChild(centeredBlockModel.anchorEl);
      }

      sceneEl.appendChild(markerEl);
    });

    // ── Camera ──
    const cameraEl = document.createElement("a-entity");
    cameraEl.setAttribute("camera", "");
    sceneEl.appendChild(cameraEl);

    // Create a dedicated in-frame preview video.
    // We do not move AR.js' internal video node to avoid iOS rendering issues.
    const previewVideo = document.createElement("video");
    previewVideo.className = "ar-live-preview";
    previewVideo.setAttribute("autoplay", "true");
    previewVideo.setAttribute("playsinline", "true");
    previewVideo.setAttribute("muted", "true");
    previewVideo.muted = true;
    previewVideoRef.current = previewVideo;

    const previewHint = document.createElement("div");
    previewHint.className = "ar-preview-hint";
    previewHint.textContent = "Starting camera...";
    previewHintRef.current = previewHint;

    // Inject into frame: preview video first, then AR scene overlay.
    containerRef.current.appendChild(previewVideo);
    containerRef.current.appendChild(sceneEl);
    containerRef.current.appendChild(previewHint);

    const attachMirrorPreview = async () => {
      const videoCandidates = [
        ...document.querySelectorAll("video.arjs-video"),
        ...document.querySelectorAll("video"),
      ];

      const sourceVideo = videoCandidates.find(
        (v) => v !== previewVideo && v.srcObject,
      );

      if (!sourceVideo || !sourceVideo.srcObject) {
        return;
      }

      if (previewVideo.srcObject !== sourceVideo.srcObject) {
        previewVideo.srcObject = sourceVideo.srcObject;
      }

      try {
        await previewVideo.play();
        previewHint.style.display = "none";
      } catch {
        previewHint.textContent = "Tap to enable camera preview";
      }
    };

    const previewInterval = window.setInterval(() => {
      void attachMirrorPreview();
    }, 250);
    void attachMirrorPreview();

    // Cleanup: Remove the scene when this component unmounts
    return () => {
      window.clearInterval(previewInterval);
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }

      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = null;
      }
    };
  }, []); // Only run once on mount

  return (
    <div className="ar-viewport">
      <div ref={containerRef} className="ar-frame" />
    </div>
  );
});

export default ARScene;
