import type {
  ActionIntelligenceProfile,
  ActionValueGuidance,
  ActionValueRecommendation,
  ContractEconomySignal,
} from "../types.js";
import { resolveActionCategory } from "./action-category.js";

function guidanceFromScore(score: number): ActionValueGuidance {
  if (score >= 72) return "premium";
  if (score >= 45) return "fair";
  return "low";
}

export function buildActionValueRecommendation(
  actionName: string,
  profile: ActionIntelligenceProfile,
  signals: ContractEconomySignal[],
  urgency = false,
): ActionValueRecommendation {
  const category = resolveActionCategory(actionName);
  const categorySignals = signals.filter((signal) => signal.actionCategory === category.category);
  const avgEvidence =
    categorySignals.length > 0
      ? categorySignals.reduce((sum, signal) => sum + signal.evidenceQuality, 0) / categorySignals.length
      : 65;

  const factors: string[] = [];
  let score = 50;

  if (profile.shortageSignal) {
    score += 18;
    factors.push("High market demand");
  }
  if (profile.supply / Math.max(profile.demand, 1) < 0.35) {
    score += 12;
    factors.push("Limited supply");
  }
  if (profile.reliability >= 85) {
    score += 10;
    factors.push("Strong completion history");
  }
  if (avgEvidence >= 75) {
    score += 8;
    factors.push("High evidence quality");
  }
  if (urgency) {
    score += 6;
    factors.push("Urgency premium");
  }
  if (profile.averageMarketValue > category.baseValue * 1.15) {
    score += 5;
    factors.push("Market value trending up");
  }

  const fair = profile.averageMarketValue || category.baseValue;
  const guidance = guidanceFromScore(score);

  return {
    actionName,
    category: category.category,
    guidance,
    suggestedLow: Math.round(fair * 0.78),
    suggestedFair: Math.round(fair),
    suggestedPremium: Math.round(fair * 1.32),
    factors: factors.length > 0 ? factors : ["Baseline market guidance"],
  };
}

export function buildValueRecommendations(
  profiles: ActionIntelligenceProfile[],
  signals: ContractEconomySignal[],
): ActionValueRecommendation[] {
  return profiles.slice(0, 6).map((profile) =>
    buildActionValueRecommendation(profile.category, profile, signals),
  );
}
