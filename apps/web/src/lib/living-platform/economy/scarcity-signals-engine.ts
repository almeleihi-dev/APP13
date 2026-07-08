import type { ActionIntelligenceProfile, RareActionSignal } from "../types.js";

export function detectRareActionSignals(profiles: ActionIntelligenceProfile[]): RareActionSignal[] {
  return profiles
    .filter((profile) => {
      const demandSupplyRatio = profile.demand / Math.max(profile.supply, 1);
      return demandSupplyRatio > 2.5 || (profile.shortageSignal && profile.supply < 120);
    })
    .map((profile) => ({
      category: profile.category,
      label: profile.category,
      demandTrend: profile.shortageSignal ? ("up" as const) : ("stable" as const),
      supplyTrend: profile.supply < profile.demand * 0.4 ? ("down" as const) : ("up" as const),
      trustRequirement: profile.reliability >= 85 ? ("elevated" as const) : ("standard" as const),
      valueTrend: profile.averageMarketValue > 500 ? ("up" as const) : ("stable" as const),
      rationale: `Demand ↑ · Supply ↓ · Trust requirement ↑ · Value ↑ — ${profile.summary}`,
    }))
    .slice(0, 5);
}
