import type { PricingConfidence } from "../domain/pricing-context.js";
import type { ConfidenceLevel } from "../domain/dynamic-pricing-schema.js";
import type { ActionPlan } from "../../action-planning/domain/action-plan.js";

export class PricingConfidenceBuilder {
  build(input: {
    plan: ActionPlan;
    factorCount: number;
    hasScenarioAnchor: boolean;
    complexityScore: number;
  }): PricingConfidence {
    const { plan, factorCount, hasScenarioAnchor, complexityScore } = input;

    let score = 55;
    score += Math.min(plan.tasks.length * 2, 12);
    score += Math.min(plan.stages.length * 2, 10);
    score += plan.requiredSkills.length >= 1 ? 5 : 0;
    score += plan.requiredResources.length >= 1 ? 5 : 0;
    score += plan.dependencies.length >= 1 ? 4 : 0;
    score += hasScenarioAnchor ? 8 : 0;
    score -= complexityScore > 70 ? 5 : 0;
    score = Math.min(95, Math.max(40, score));

    const level: ConfidenceLevel = score >= 80 ? "high" : score >= 60 ? "medium" : "low";
    const dataCompleteness = Math.min(
      100,
      Math.round(
        (factorCount / 14) * 40 +
          (plan.tasks.length > 0 ? 15 : 0) +
          (plan.timeline.maxHours > 0 ? 15 : 0) +
          (plan.requiredSkills.length > 0 ? 15 : 0) +
          (hasScenarioAnchor ? 15 : 0)
      )
    );

    const rationale =
      level === "high"
        ? "Full action plan with skills, resources, timeline, and market anchor available."
        : level === "medium"
          ? "Action plan available; some market variance expected for this category."
          : "Limited planning data — treat range as indicative until scope is confirmed.";

    return {
      level,
      score,
      rationale,
      dataCompleteness,
    };
  }
}

export function createPricingConfidenceBuilder(): PricingConfidenceBuilder {
  return new PricingConfidenceBuilder();
}
