import type { ActivePersonalIdentity } from "../../../passport/personal-identity.js";
import type { EconomyDashboardPresentation } from "../types.js";
import { readLivingPlatformState } from "../living-platform-storage.js";
import { buildActionIntelligenceProfiles, trendingActionProfiles } from "./action-intelligence-engine.js";
import { buildValueRecommendations } from "./action-value-engine.js";
import {
  buildContractEconomyLedger,
  mergeSignalsWithContracts,
} from "./contract-economy-ledger.js";
import { buildInsuranceReadinessProfile } from "./insurance-readiness-engine.js";
import { buildPlatformRevenueMetrics } from "./revenue-engine.js";
import { detectRareActionSignals } from "./scarcity-signals-engine.js";

export function buildEconomyDashboardPresentation(
  identity?: ActivePersonalIdentity | null,
): EconomyDashboardPresentation {
  const state = readLivingPlatformState();
  const signals = mergeSignalsWithContracts(state);
  const ledger = buildContractEconomyLedger({ ...state, economySignals: signals });
  const actionProfiles = buildActionIntelligenceProfiles(state, signals);
  const trendingActions = trendingActionProfiles(actionProfiles);
  const rareActions = detectRareActionSignals(actionProfiles);
  const valueRecommendations = buildValueRecommendations(actionProfiles, signals);
  const revenue = buildPlatformRevenueMetrics(signals, ledger.totalCreated);
  const insurance = buildInsuranceReadinessProfile(state, signals);

  const providerStats = new Map<string, { name: string; reliability: number; contracts: number }>();
  for (const signal of signals) {
    const current = providerStats.get(signal.providerPassportKey) ?? {
      name: signal.providerPassportKey,
      reliability: 0,
      contracts: 0,
    };
    current.contracts += 1;
    current.reliability += signal.reliabilityScore;
    providerStats.set(signal.providerPassportKey, current);
  }

  const trustedHumans = [...providerStats.values()]
    .map((entry) => ({
      name: entry.name,
      reliability: Math.round(entry.reliability / entry.contracts),
      contracts: entry.contracts,
    }))
    .sort((a, b) => b.reliability - a.reliability)
    .slice(0, 5);

  const trustedTeams = state.teams
    .map((team) => ({
      name: team.name,
      trustScore: team.trustScore,
      completedActions: team.completedActions,
    }))
    .sort((a, b) => b.trustScore - a.trustScore)
    .slice(0, 5);

  const trustedProjects = state.projects
    .map((project) => ({
      name: project.name,
      trustLevel: project.trustLevel,
      progressPercent: project.progressPercent,
    }))
    .sort((a, b) => b.trustLevel - a.trustLevel)
    .slice(0, 5);

  const growth =
    revenue.economyGrowthIndex > 100
      ? "Accelerating"
      : revenue.economyGrowthIndex > 40
        ? "Growing"
        : "Emerging";
  const reliability =
    ledger.completionRate >= 85 ? "Strong" : ledger.completionRate >= 60 ? "Stable" : "Building";
  const risk =
    insurance.riskLevel === "low" ? "Low" : insurance.riskLevel === "elevated" ? "Elevated" : "Moderate";

  void identity;

  return {
    ledger,
    actionProfiles,
    trendingActions,
    rareActions,
    valueRecommendations,
    revenue,
    insurance,
    trustedHumans,
    trustedTeams,
    trustedProjects,
    platformHealth: { growth, reliability, risk },
  };
}
