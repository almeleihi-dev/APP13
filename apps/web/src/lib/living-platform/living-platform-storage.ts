import type { LivingPlatformActivity, LivingPlatformState } from "./types.js";
import { LIVING_PLATFORM_STORAGE_KEY, LIVING_PLATFORM_UPDATED_EVENT } from "./types.js";
import { migrateLivingPlatformToV6 } from "./location-foundation.js";

function emptyState(): LivingPlatformState {
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
    actionInventory: [],
    passportGrowthEvents: [],
    opportunityAlerts: [],
    activity: [],
  };
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function createLivingId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function notifyLivingPlatformUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(LIVING_PLATFORM_UPDATED_EVENT));
}

function migrateState(raw: unknown): LivingPlatformState {
  const parsed = (raw ?? {}) as Record<string, unknown>;
  const version = typeof parsed.version === "number" ? parsed.version : 1;
  const base = {
    publishedActions: (parsed.publishedActions as LivingPlatformState["publishedActions"]) ?? [],
    drafts: (parsed.drafts as LivingPlatformState["drafts"]) ?? [],
    requests: (parsed.requests as LivingPlatformState["requests"]) ?? [],
    contracts: (parsed.contracts as LivingPlatformState["contracts"]) ?? [],
    passportHistory: (parsed.passportHistory as LivingPlatformState["passportHistory"]) ?? {},
    activity: (parsed.activity as LivingPlatformState["activity"]) ?? [],
  };

  if (version === 5) {
    return migrateLivingPlatformToV6({
      version: 5,
      ...base,
      teams: (parsed.teams as LivingPlatformState["teams"]) ?? [],
      projects: (parsed.projects as LivingPlatformState["projects"]) ?? [],
      economySignals: (parsed.economySignals as LivingPlatformState["economySignals"]) ?? [],
      actionInventory: (parsed.actionInventory as LivingPlatformState["actionInventory"]) ?? [],
      passportGrowthEvents: (parsed.passportGrowthEvents as LivingPlatformState["passportGrowthEvents"]) ?? [],
      opportunityAlerts: (parsed.opportunityAlerts as LivingPlatformState["opportunityAlerts"]) ?? [],
    });
  }

  if (version === 6) {
    return migrateLivingPlatformToV6({
      version: 6,
      ...base,
      teams: (parsed.teams as LivingPlatformState["teams"]) ?? [],
      projects: (parsed.projects as LivingPlatformState["projects"]) ?? [],
      economySignals: (parsed.economySignals as LivingPlatformState["economySignals"]) ?? [],
      actionInventory: (parsed.actionInventory as LivingPlatformState["actionInventory"]) ?? [],
      passportGrowthEvents: (parsed.passportGrowthEvents as LivingPlatformState["passportGrowthEvents"]) ?? [],
      opportunityAlerts: (parsed.opportunityAlerts as LivingPlatformState["opportunityAlerts"]) ?? [],
    });
  }

  if (version === 4) {
    return migrateLivingPlatformToV6({
      version: 5,
      ...base,
      teams: (parsed.teams as LivingPlatformState["teams"]) ?? [],
      projects: (parsed.projects as LivingPlatformState["projects"]) ?? [],
      economySignals: (parsed.economySignals as LivingPlatformState["economySignals"]) ?? [],
      actionInventory: [],
      passportGrowthEvents: [],
      opportunityAlerts: [],
    });
  }

  if (version === 3) {
    return migrateLivingPlatformToV6({
      version: 5,
      ...base,
      teams: (parsed.teams as LivingPlatformState["teams"]) ?? [],
      projects: (parsed.projects as LivingPlatformState["projects"]) ?? [],
      economySignals: [],
      actionInventory: [],
      passportGrowthEvents: [],
      opportunityAlerts: [],
    });
  }

  if (version === 2) {
    return migrateLivingPlatformToV6({
      version: 5,
      ...base,
      teams: [],
      projects: [],
      economySignals: [],
      actionInventory: [],
      passportGrowthEvents: [],
      opportunityAlerts: [],
    });
  }

  return migrateLivingPlatformToV6({
    version: 5,
    ...base,
    contracts: [],
    passportHistory: {},
    teams: [],
    projects: [],
    economySignals: [],
    actionInventory: [],
    passportGrowthEvents: [],
    opportunityAlerts: [],
  });
}

export function readLivingPlatformState(): LivingPlatformState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = localStorage.getItem(LIVING_PLATFORM_STORAGE_KEY);
    if (!raw) return emptyState();
    return migrateState(JSON.parse(raw) as LivingPlatformState);
  } catch {
    return emptyState();
  }
}

export function writeLivingPlatformState(state: LivingPlatformState): void {
  localStorage.setItem(LIVING_PLATFORM_STORAGE_KEY, JSON.stringify(state));
  notifyLivingPlatformUpdated();
}

export function patchLivingPlatformState(
  patch: (state: LivingPlatformState) => LivingPlatformState,
): LivingPlatformState {
  const next = patch(readLivingPlatformState());
  writeLivingPlatformState(next);
  return next;
}

export function appendLivingActivity(
  state: LivingPlatformState,
  activity: Omit<LivingPlatformActivity, "id" | "timestamp">,
): LivingPlatformState {
  return {
    ...state,
    activity: [
      {
        id: createLivingId("act"),
        timestamp: nowIso(),
        ...activity,
      },
      ...state.activity,
    ].slice(0, 50),
  };
}
