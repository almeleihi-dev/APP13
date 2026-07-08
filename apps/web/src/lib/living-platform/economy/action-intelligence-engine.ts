import type { ActionIntelligenceProfile, ContractEconomySignal, LivingPlatformState } from "../types.js";
import { ACTION_CATEGORY_RULES, resolveActionCategory } from "./action-category.js";

function profileSummary(
  category: string,
  count: number,
  avgValue: number,
  avgDays: number,
  successRate: number,
  shortage: boolean,
): string {
  const demandNote = shortage ? "High demand area" : "Balanced market";
  return `${category}: ${count.toLocaleString()} contracts · avg $${Math.round(avgValue)} · ${avgDays} days · ${successRate}% success · ${demandNote}`;
}

export function buildActionIntelligenceProfiles(
  state: LivingPlatformState,
  signals: ContractEconomySignal[],
): ActionIntelligenceProfile[] {
  const supplyByCategory = new Map<string, number>();
  for (const action of state.publishedActions) {
    const category = resolveActionCategory(action.blueprint.name.trim()).category;
    supplyByCategory.set(category, (supplyByCategory.get(category) ?? 0) + 1);
  }

  return ACTION_CATEGORY_RULES.map((rule) => {
    const categorySignals = signals.filter((signal) => signal.actionCategory === rule.category);
    const liveCount = categorySignals.length;
    const contractCount = liveCount + Math.round(rule.seedDemand / 100);
    const demand = rule.seedDemand + liveCount * 12 + state.requests.length * 2;
    const supply = (supplyByCategory.get(rule.category) ?? 0) + rule.seedSupply + liveCount;

    const avgValue =
      liveCount > 0
        ? categorySignals.reduce((sum, signal) => sum + signal.contractValue, 0) / liveCount
        : rule.baseValue;
    const avgDays =
      liveCount > 0
        ? Math.round(categorySignals.reduce((sum, signal) => sum + signal.executionDays, 0) / liveCount)
        : rule.baseDays;
    const successCount = categorySignals.filter((signal) => signal.reliabilityScore >= 80).length;
    const successRate =
      liveCount > 0 ? Math.round((successCount / liveCount) * 100) : liveCount === 0 ? 96 : 90;
    const reliability =
      liveCount > 0
        ? Math.round(categorySignals.reduce((sum, signal) => sum + signal.reliabilityScore, 0) / liveCount)
        : 88;
    const shortageSignal = demand / Math.max(supply, 1) > 2.2;

    return {
      category: rule.category,
      demand,
      supply,
      averageMarketValue: Math.round(avgValue),
      averageDeliveryDays: avgDays,
      reliability,
      successRate,
      shortageSignal,
      contractCount,
      summary: profileSummary(rule.category, contractCount, avgValue, avgDays, successRate, shortageSignal),
    };
  }).sort((a, b) => b.demand - a.demand);
}

export function trendingActionProfiles(profiles: ActionIntelligenceProfile[]): ActionIntelligenceProfile[] {
  return [...profiles]
    .filter((profile) => profile.shortageSignal || profile.demand > 700)
    .slice(0, 5);
}
