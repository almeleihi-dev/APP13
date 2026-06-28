import type { ActionPlan } from "../../action-planning/domain/action-plan.js";
import type {
  PricingBreakdown,
  PricingFactor,
  PricingRange,
} from "../domain/pricing-context.js";
import type { DistanceBand, UrgencyLevel } from "../domain/dynamic-pricing-schema.js";
import { PRICING_CURRENCY } from "../domain/dynamic-pricing-schema.js";
import {
  difficultyMultiplier,
  getCategoryBaseRate,
  resolveDifficultyLevel,
} from "../domain/pricing-reference-values.js";
import type { PricingAnalysisResult } from "./pricing-factor-analyzer.js";
import { PRICING_REFERENCE_VALUES } from "../domain/pricing-reference-values.js";

export interface PricingCalculationInput {
  plan: ActionPlan;
  analysis: PricingAnalysisResult;
  factors: PricingFactor[];
  urgency: UrgencyLevel;
  distanceBand: DistanceBand;
  scenarioAnchor?: { min: number; max: number };
}

export interface PricingCalculationResult {
  range: PricingRange;
  breakdown: PricingBreakdown;
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function sumContributions(factors: PricingFactor[], side: "Min" | "Max"): number {
  return factors.reduce((total, factor) => {
    if (factor.unit === "multiplier" || factor.unit === "category" || factor.unit === "score") {
      return total;
    }
    const key = side === "Min" ? "contributionMin" : "contributionMax";
    return total + factor[key];
  }, 0);
}

export class PricingCalculator {
  calculate(input: PricingCalculationInput): PricingCalculationResult {
    const { plan, analysis, factors, urgency, distanceBand, scenarioAnchor } = input;
    const refs = PRICING_REFERENCE_VALUES;
    const baseRate = getCategoryBaseRate(plan.category);

    const baseMin = baseRate.baseMin;
    const baseMax = baseRate.baseMax;

    const timelineFactor = factors.find((f) => f.factorId === "factor.timeline");
    const timelineMin =
      timelineFactor && plan.category !== "professional_service_request"
        ? plan.timeline.minHours * baseRate.hourlyRate
        : 0;
    const timelineMax =
      timelineFactor && plan.category !== "professional_service_request"
        ? plan.timeline.maxHours * baseRate.hourlyRate
        : 0;

    const adjustedFactors = factors.map((factor) => {
      if (factor.factorId !== "factor.timeline") return factor;
      return {
        ...factor,
        contributionMin: timelineMin,
        contributionMax: timelineMax,
      };
    });

    const difficultyLevel = resolveDifficultyLevel(analysis.complexityScore);
    const diffMult = difficultyMultiplier(difficultyLevel);

    let subtotalMin =
      baseMin +
      sumContributions(
        adjustedFactors.filter((f) => f.factorId !== "factor.timeline"),
        "Min"
      ) +
      timelineMin;
    let subtotalMax =
      baseMax +
      sumContributions(
        adjustedFactors.filter((f) => f.factorId !== "factor.timeline"),
        "Max"
      ) +
      timelineMax;

    const urgencyMult = refs.urgencyMultipliers[urgency] ?? 1;
    const distanceMult = refs.distanceMultipliers[distanceBand] ?? 1;
    const combinedMult = urgencyMult * distanceMult * diffMult;

    subtotalMin *= combinedMult;
    subtotalMax *= combinedMult;

    if (analysis.parallelOpportunityCount > 0) {
      const discount = Math.pow(refs.parallelDiscount, analysis.parallelOpportunityCount);
      subtotalMin *= discount;
      subtotalMax *= discount;
    }

    if (scenarioAnchor && scenarioAnchor.max > 0) {
      subtotalMin = Math.max(subtotalMin, scenarioAnchor.min);
      subtotalMax = Math.min(Math.max(subtotalMax, subtotalMin + 10), scenarioAnchor.max);
    }

    subtotalMin = roundCurrency(Math.max(subtotalMin, 0));
    subtotalMax = roundCurrency(Math.max(subtotalMax, subtotalMin));

    const range: PricingRange = {
      min: subtotalMin,
      max: subtotalMax,
      currency: PRICING_CURRENCY,
      midpoint: roundCurrency((subtotalMin + subtotalMax) / 2),
    };

    const breakdown: PricingBreakdown = {
      breakdownId: `breakdown-${plan.planId}`,
      baseRateMin: baseMin,
      baseRateMax: baseMax,
      factors: adjustedFactors,
      subtotalMin,
      subtotalMax,
      complexityScore: analysis.complexityScore,
      difficultyLevel,
    };

    return { range, breakdown };
  }
}

export function createPricingCalculator(): PricingCalculator {
  return new PricingCalculator();
}
