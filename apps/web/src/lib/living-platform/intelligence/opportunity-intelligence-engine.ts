import type { ActivePersonalIdentity } from "../../../passport/personal-identity.js";
import type { LivingPlatformState, OpportunityAlert } from "../types.js";
import { buildActionIntelligenceProfiles } from "../economy/action-intelligence-engine.js";
import { resolveActionCategory } from "../economy/action-category.js";
import { createLivingId, nowIso } from "../living-platform-storage.js";
import { listActiveInventory } from "./action-inventory-store.js";

function demandChangePercent(profileDemand: number, baseline: number): number {
  if (baseline <= 0) return 0;
  return Math.round(((profileDemand - baseline) / baseline) * 100);
}

export function buildOpportunityAlerts(
  identity: ActivePersonalIdentity,
  state: LivingPlatformState,
): OpportunityAlert[] {
  const profiles = buildActionIntelligenceProfiles(state, state.economySignals);
  const activeInventory = listActiveInventory(state);
  const visibleInventory = state.actionInventory.filter(
    (item) => item.status !== "removed" && (item.bucket === "ready_now" || item.status === "active"),
  );

  const qualifyingItems =
    activeInventory.length > 0
      ? activeInventory
      : visibleInventory.filter((item) => item.bucket === "ready_now");

  const alerts: OpportunityAlert[] = [];

  for (const item of qualifyingItems) {
    const category = resolveActionCategory(item.title);
    const profile = profiles.find((entry) => entry.category === category.category);
    if (!profile || !profile.shortageSignal) continue;

    const change = Math.max(12, demandChangePercent(profile.demand, category.seedDemand));
    const recommendations: string[] = [];
    if (item.status !== "active") recommendations.push("Publish this action");
    recommendations.push("Increase availability");
    if (item.bucket === "needs_verification") recommendations.push("Improve certification");

    alerts.push({
      alertId: createLivingId("opp"),
      actionTitle: item.title,
      category: category.category,
      demandChangePercent: change,
      qualifies: true,
      recommendations,
    });
  }

  return alerts
    .sort((a, b) => b.demandChangePercent - a.demandChangePercent)
    .slice(0, 6);
}

export function formatOpportunityHeadline(alert: OpportunityAlert): string {
  return `Demand is increasing for an action you can perform — ${alert.category} requests +${alert.demandChangePercent}%`;
}

export function latestGrowthSummary(state: LivingPlatformState): string | null {
  const latest = state.passportGrowthEvents?.[0];
  if (!latest) return null;
  return latest.label;
}
