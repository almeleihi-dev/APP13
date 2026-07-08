import {
  RETURNING_SPLASH_MAX_MS,
  RETURNING_SPLASH_MIN_MS,
  RETURNING_SPLASH_REDUCED_MS,
} from "./launch-gm.js";
import { prefersReducedMotion } from "./launch-motion.js";
import { LAUNCH_ACT_DRAFT_KEY } from "./navigation.js";

export const LAUNCH_COMPLETE_KEY = "an-act-launch-v1-complete";
export const LAUNCH_REPLAY_SESSION_KEY = "an-act-launch-replay-session";
export const LAUNCH_FORCE_ONBOARDING_KEY = "an-act-launch-force-onboarding";
export const AUTH_TOKENS_STORAGE_KEY = "an-act-auth-tokens";

export function hasCompletedLaunch(): boolean {
  try {
    return localStorage.getItem(LAUNCH_COMPLETE_KEY) === "true";
  } catch {
    return false;
  }
}

export function markLaunchComplete(): void {
  try {
    localStorage.setItem(LAUNCH_COMPLETE_KEY, "true");
    sessionStorage.removeItem(LAUNCH_FORCE_ONBOARDING_KEY);
  } catch {
    /* presentation-only — ignore quota errors */
  }
}

export function clearLaunchCompletion(): void {
  try {
    localStorage.removeItem(LAUNCH_COMPLETE_KEY);
  } catch {
    /* ignore */
  }
}

export function launchQueryParam(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("launch");
}

export function isResetLaunchUrl(): boolean {
  return launchQueryParam() === "reset";
}

export function isReplayLaunchUrl(): boolean {
  return launchQueryParam() === "replay";
}

export function isForceOnboarding(): boolean {
  try {
    return sessionStorage.getItem(LAUNCH_FORCE_ONBOARDING_KEY) === "active";
  } catch {
    return false;
  }
}

export function activateForceOnboarding(): void {
  try {
    sessionStorage.setItem(LAUNCH_FORCE_ONBOARDING_KEY, "active");
  } catch {
    /* ignore */
  }
}

export function clearForceOnboarding(): void {
  try {
    sessionStorage.removeItem(LAUNCH_FORCE_ONBOARDING_KEY);
  } catch {
    /* ignore */
  }
}

export function activateReplayLaunch(): void {
  try {
    clearLaunchCompletion();
    clearForceOnboarding();
    sessionStorage.setItem(LAUNCH_REPLAY_SESSION_KEY, "active");
  } catch {
    /* ignore */
  }
}

export function clearReplayLaunch(): void {
  try {
    sessionStorage.removeItem(LAUNCH_REPLAY_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function shouldReplayLaunch(): boolean {
  if (typeof window === "undefined") return false;
  if (isReplayLaunchUrl()) return true;
  try {
    return sessionStorage.getItem(LAUNCH_REPLAY_SESSION_KEY) === "active";
  } catch {
    return false;
  }
}

export function hasStoredSession(): boolean {
  try {
    const raw = localStorage.getItem(AUTH_TOKENS_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { access_token?: string };
    return Boolean(parsed.access_token);
  } catch {
    return false;
  }
}

/** Full onboarding: first-time, replay, or debug reset — never auto-skip to platform. */
export function isLaunchOnboardingActive(): boolean {
  if (typeof window === "undefined") return false;
  if (shouldReplayLaunch()) return true;
  if (isForceOnboarding()) return true;
  if (hasCompletedLaunch()) return false;
  if (hasStoredSession()) return false;
  return true;
}

/** Returning visitors and signed-in users see the splash identity moment, then platform. */
export function shouldAutoContinueFromSplash(): boolean {
  if (typeof window === "undefined") return false;
  if (isLaunchOnboardingActive()) return false;
  return hasCompletedLaunch() || hasStoredSession();
}

/** Discreet skip control — returning visitors only. */
export function shouldShowSkipIntro(): boolean {
  if (typeof window === "undefined") return false;
  if (isLaunchOnboardingActive()) return false;
  return hasCompletedLaunch();
}

export function isOnboardingPath(pathname: string): boolean {
  return pathname === "/start" || pathname === "/preview";
}

/** Duration for returning / signed-in splash identity moment (800–1200ms). */
export function returningSplashDurationMs(): number {
  if (prefersReducedMotion()) return RETURNING_SPLASH_REDUCED_MS;
  const span = RETURNING_SPLASH_MAX_MS - RETURNING_SPLASH_MIN_MS + 1;
  return RETURNING_SPLASH_MIN_MS + Math.floor(Math.random() * span);
}

/** Local debug: wipe launch state and force first-time onboarding. */
export function resetAllLaunchState(): void {
  clearLaunchCompletion();
  clearReplayLaunch();
  clearForceOnboarding();
  try {
    sessionStorage.removeItem(LAUNCH_ACT_DRAFT_KEY);
    activateForceOnboarding();
  } catch {
    /* ignore */
  }
}

export function replayLaunchExperience(): void {
  activateReplayLaunch();
  window.location.assign("/?launch=replay");
}

export function resetLaunchExperience(): void {
  window.location.assign("/?launch=reset");
}

/** Read-only snapshot for local verification. */
export function readLaunchDebugState(): Record<string, string | boolean | null> {
  return {
    pathname: typeof window !== "undefined" ? window.location.pathname : null,
    search: typeof window !== "undefined" ? window.location.search : null,
    completed: hasCompletedLaunch(),
    replaySession:
      typeof window !== "undefined"
        ? sessionStorage.getItem(LAUNCH_REPLAY_SESSION_KEY)
        : null,
    forceOnboarding: isForceOnboarding(),
    hasSession: hasStoredSession(),
    onboardingActive: isLaunchOnboardingActive(),
    autoContinue: shouldAutoContinueFromSplash(),
  };
}
