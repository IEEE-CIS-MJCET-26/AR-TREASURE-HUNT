import { useState } from "react";
import styles from "./SplashScreen.module.css";
import adsophosLogo from "../assets/logos/adsophos.png";
import whiteLogo from "../assets/logos/white-logo.png";

export default function SplashScreen({
  routes,
  onLaunch,
  permissionState,
  requestPermission,
}) {
  const [selectedRoute, setSelectedRoute] = useState("");
  const [lockedRoute, setLockedRoute] = useState("");

  const handleStart = async () => {
    if (!lockedRoute) return;

    if (permissionState === "unknown") {
      await requestPermission();
    }
    onLaunch(lockedRoute);
  };

  const handleLockRoute = () => {
    if (!selectedRoute) return;
    setLockedRoute(selectedRoute);
  };

  return (
    <div className={styles.screen}>
      <div className={styles.logoHeader}>
        <img
          src={adsophosLogo}
          alt="Adsophos"
          className={`${styles.headerLogo} ${styles.adsophosLogo}`}
        />
        <img
          src={whiteLogo}
          alt="IEEE CIS Logo"
          className={styles.headerLogo}
        />
      </div>
      <div className={styles.card}>
        <p className={styles.kicker}>AR TREASURE HUNT</p>
        <h1 className={styles.title}>Route Assignment</h1>
        <p className={styles.subtitle}>
          Select one of the 5 routes and lock it before starting the game.
        </p>

        <div className={styles.routeAssignBox}>
          <label htmlFor="route-select" className={styles.routeLabel}>
            Choose route
          </label>
          <select
            id="route-select"
            className={styles.routeSelect}
            value={selectedRoute}
            disabled={Boolean(lockedRoute)}
            onChange={(event) => setSelectedRoute(event.target.value)}
          >
            <option value="">Select a route</option>
            {routes.map((route) => (
              <option key={route.id} value={route.id}>
                {route.label}
              </option>
            ))}
          </select>

          {!lockedRoute ? (
            <button
              className={styles.secondaryButton}
              onClick={handleLockRoute}
              disabled={!selectedRoute}
            >
              Lock Route
            </button>
          ) : (
            <div className={styles.lockedState}>Route locked</div>
          )}
        </div>

        <button
          className={styles.button}
          onClick={handleStart}
          disabled={!lockedRoute}
        >
          Start AR TREASURE HUNT
        </button>

        <p className={styles.note}>
          Camera and motion sensor permissions are required.
        </p>
      </div>
      <p className={styles.copyright}>
        © 2026 IEEE CIS MJCET. All rights reserved.
      </p>
    </div>
  );
}
