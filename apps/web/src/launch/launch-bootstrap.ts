import {
  activateReplayLaunch,
  isResetLaunchUrl,
  isReplayLaunchUrl,
  resetAllLaunchState,
} from "./launch-persistence.js";
import { resetSplashNavigateLock } from "./launch-navigate.js";
import { clearPersonalPassport } from "../passport/personal-passport-persistence.js";

/**
 * Synchronous launch bootstrap — runs before React mounts.
 * Returns true when a full-page redirect is in progress (caller must skip render).
 */
export function runLaunchBootstrap(): boolean {
  if (typeof window === "undefined") return false;

  resetSplashNavigateLock();

  if (isResetLaunchUrl()) {
    resetAllLaunchState();
    clearPersonalPassport();
    window.location.replace("/");
    return true;
  }

  if (isReplayLaunchUrl()) {
    activateReplayLaunch();
  }

  return false;
}
