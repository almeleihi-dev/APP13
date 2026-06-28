import type { ActionPlan } from "../../action-planning/domain/action-plan.js";
import type { CanonicalAction } from "../../action-ontology/domain/canonical-action.js";
import type { PricingExplanation } from "../domain/pricing-context.js";
import type { PricingBreakdown, PricingRange } from "../domain/pricing-context.js";
import { getCategoryBaseRate } from "../domain/pricing-reference-values.js";

export class PricingExplanationBuilder {
  build(input: {
    plan: ActionPlan;
    canonicalAction: CanonicalAction;
    range: PricingRange;
    breakdown: PricingBreakdown;
  }): PricingExplanation {
    const { plan, canonicalAction, range, breakdown } = input;
    const market = getCategoryBaseRate(plan.category);

    const factorNarratives = breakdown.factors
      .filter((f) => f.unit === "SAR" || f.unit === "score")
      .map(
        (factor) =>
          `${factor.label}: ${factor.trace} (contribution ${factor.contributionMin}–${factor.contributionMax} ${factor.unit === "score" ? "points" : range.currency}).`
      );

    const trustRecommendation =
      canonicalAction.trustSignals[0] ??
      "Apply standard platform trust safeguards before execution.";

    return {
      explanationId: `explanation-${plan.planId}`,
      headline: `Fair price range for "${plan.goal}"`,
      summary: `Based on the ${plan.tasks.length}-task, ${plan.stages.length}-stage execution plan, we recommend ${range.min}–${range.max} ${range.currency} (${breakdown.difficultyLevel} difficulty, complexity ${breakdown.complexityScore}/100).`,
      factorNarratives,
      timelineInfluence: `Estimated ${plan.timeline.minHours}–${plan.timeline.maxHours} hours (${plan.timeline.summary}) adjusts labor cost via category hourly rate (${market.hourlyRate} ${range.currency}/hr).`,
      skillsInfluence: `${plan.requiredSkills.length} required skills (${plan.requiredSkills.map((s) => s.name).join(", ")}) add specialist premium to the base ${market.marketLabel} rate.`,
      resourcesInfluence: `${plan.requiredResources.length} resources (${plan.requiredResources.map((r) => r.name).join(", ")}) contribute equipment and material overhead.`,
      riskInfluence: `${canonicalAction.riskSignals.length} risk signals (${canonicalAction.riskSignals.filter((s) => s.severity === "high").length} high severity) increase contingency buffer.`,
      difficultyInfluence: `Complexity score ${breakdown.complexityScore} maps to ${breakdown.difficultyLevel} difficulty, scaling the subtotal before urgency and distance adjustments.`,
      trustRecommendation,
    };
  }
}

export function createPricingExplanationBuilder(): PricingExplanationBuilder {
  return new PricingExplanationBuilder();
}
