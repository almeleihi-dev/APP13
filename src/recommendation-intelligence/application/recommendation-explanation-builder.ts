import type { RecommendationExplanation } from "../domain/recommendation-context.js";
import type {
  PrioritizedRecommendation,
  ImplementationRoadmap,
  ExpectedBenefit,
  ExpectedTradeOff,
  FallbackRecommendation,
  OptimizationOpportunity,
} from "../domain/recommendation-context.js";
import type { DecisionIntelligenceRecommendation } from "../../decision-intelligence/domain/decision-context.js";

export class RecommendationExplanationBuilder {
  build(input: {
    outputId: string;
    goal: string;
    decision: DecisionIntelligenceRecommendation;
    prioritized: PrioritizedRecommendation[];
    roadmap: ImplementationRoadmap;
    benefits: ExpectedBenefit[];
    tradeOffs: ExpectedTradeOff[];
    fallbacks: FallbackRecommendation[];
    optimizations: OptimizationOpportunity[];
    recommendationScore: number;
  }): RecommendationExplanation {
    const topThree = input.prioritized.slice(0, 3).map((item) => item.title);

    return {
      explanationId: `explanation-${input.outputId}`,
      headline: `Actionable recommendations for "${input.goal}"`,
      summary: `${input.prioritized.length} ranked recommendations (score ${input.recommendationScore}/100) derived from decision "${input.decision.recommendedDecision.replace(/_/g, " ")}" — read-only recommendation intelligence from the complete C1–C9 chain.`,
      prioritySummary:
        topThree.length > 0
          ? `Top priorities: ${topThree.join("; ")}.`
          : "No prioritized recommendations generated.",
      roadmapSummary: input.roadmap.summary,
      benefitSummary:
        input.benefits.length > 0
          ? `${input.benefits.length} expected benefits including ${input.benefits[0]?.title ?? "goal achievement"}.`
          : "Limited expected benefits identified.",
      tradeOffSummary:
        input.tradeOffs.length > 0
          ? `${input.tradeOffs.length} trade-offs to consider before action.`
          : "No significant trade-offs identified.",
      fallbackSummary: `${input.fallbacks.length} fallback options and ${input.optimizations.length} optimization opportunities available.`,
    };
  }
}

export function createRecommendationExplanationBuilder(): RecommendationExplanationBuilder {
  return new RecommendationExplanationBuilder();
}
