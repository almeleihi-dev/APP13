import { LAUNCH_SPLASH_EXIT_MS } from "./launch-gm.js";
import { navigate } from "./navigation.js";

/** Survives React StrictMode remounts — prevents double navigation and unmount timer cancel. */
let splashNavLock = false;
let splashNavTimer: number | null = null;

export function resetSplashNavigateLock(): void {
  splashNavLock = false;
  if (splashNavTimer !== null) {
    window.clearTimeout(splashNavTimer);
    splashNavTimer = null;
  }
}

export function scheduleSplashNavigate(path: string, delayMs = LAUNCH_SPLASH_EXIT_MS): boolean {
  if (splashNavLock) return false;
  splashNavLock = true;
  if (splashNavTimer !== null) {
    window.clearTimeout(splashNavTimer);
  }
  splashNavTimer = window.setTimeout(() => {
    splashNavTimer = null;
    navigate(path);
  }, delayMs);
  return true;
}

export function isSplashNavigateLocked(): boolean {
  return splashNavLock;
}
