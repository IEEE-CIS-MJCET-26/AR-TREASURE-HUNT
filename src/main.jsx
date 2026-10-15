import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import Leaderboard from "./components/Leaderboard.jsx";

// AR.js runs its marker detection in WebAssembly. With no real camera feed
// (desktop browsers) it can throw "memory access out of bounds". Keep it
// out of the way, but still visible in the console.
const isWasmCameraCrash = (message) =>
  typeof message === "string" && message.includes("memory access out of bounds");

window.addEventListener("unhandledrejection", (event) => {
  if (isWasmCameraCrash(event.reason?.message)) {
    event.preventDefault();
    console.warn("AR.js:", event.reason.message);
  }
});

window.addEventListener("error", (event) => {
  if (isWasmCameraCrash(event.message)) {
    event.preventDefault();
    console.warn("AR.js:", event.message);
  }
});

const isLeaderboard = window.location.pathname.replace(/\/+$/, "") === "/leaderboard";

createRoot(document.getElementById("root")).render(
  isLeaderboard ? <Leaderboard /> : <App />,
);
