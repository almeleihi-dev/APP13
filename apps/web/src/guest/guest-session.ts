import type { SupportedLocale } from "../i18n/locale-types.js";
import { readLocale } from "../i18n/locale-store.js";
import type { ActionInventoryItem, LivingPlatformState } from "../lib/living-platform/types.js";
import type { GoalActionBreakdown } from "../lib/living-platform/intelligence/goal-action-breakdown.js";
import type { LaunchInputIntent } from "../launch/navigation.js";

export const GUEST_SESSION_KEY = "an-act-guest-session-v1";
export const GUEST_SESSION_UPDATED_EVENT = "an-act-guest-session-updated";
export const GUEST_PENDING_CONVERSION_KEY = "an-act-guest-pending-conversion";

export interface GuestSession {
  active: boolean;
  professionText: string | null;
  goalText: string | null;
  inputIntent: LaunchInputIntent | null;
  inventory: ActionInventoryItem[];
  goalBreakdown: GoalActionBreakdown | null;
  locale: SupportedLocale;
  updatedAt: string;
}

function emptyGuestSession(): GuestSession {
  return {
    active: false,
    professionText: null,
    goalText: null,
    inputIntent: null,
    inventory: [],
    goalBreakdown: null,
    locale: readLocale(),
    updatedAt: new Date().toISOString(),
  };
}

export function notifyGuestSessionUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(GUEST_SESSION_UPDATED_EVENT));
}

export function readGuestSession(): GuestSession {
  if (typeof window === "undefined") return emptyGuestSession();
  try {
    const raw = sessionStorage.getItem(GUEST_SESSION_KEY);
    if (!raw) return emptyGuestSession();
    return { ...emptyGuestSession(), ...(JSON.parse(raw) as GuestSession) };
  } catch {
    return emptyGuestSession();
  }
}

export function writeGuestSession(session: GuestSession): void {
  sessionStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session));
  notifyGuestSessionUpdated();
}

export function patchGuestSession(patch: Partial<GuestSession>): GuestSession {
  const next = { ...readGuestSession(), ...patch, updatedAt: new Date().toISOString() };
  writeGuestSession(next);
  return next;
}

export function enableGuestMode(): GuestSession {
  return patchGuestSession({ active: true });
}

export function isGuestMode(): boolean {
  return readGuestSession().active;
}

export function clearGuestMode(): void {
  writeGuestSession(emptyGuestSession());
}

export function guestInventoryState(session: GuestSession): LivingPlatformState {
  return {
    version: 6,
    publishedActions: [],
    drafts: [],
    requests: [],
    contracts: [],
    passportHistory: {},
    teams: [],
    projects: [],
    economySignals: [],
    actionInventory: session.inventory,
    passportGrowthEvents: [],
    opportunityAlerts: [],
    activity: [],
  };
}

export function setGuestPendingConversion(pending: boolean): void {
  try {
    if (pending) sessionStorage.setItem(GUEST_PENDING_CONVERSION_KEY, "true");
    else sessionStorage.removeItem(GUEST_PENDING_CONVERSION_KEY);
  } catch {
    /* ignore */
  }
}

export function isGuestPendingConversion(): boolean {
  try {
    return sessionStorage.getItem(GUEST_PENDING_CONVERSION_KEY) === "true";
  } catch {
    return false;
  }
}
