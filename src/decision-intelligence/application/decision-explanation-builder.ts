import type { DecisionConfidence, DecisionExplanation } from "../domain/decision-context.js";
import type { DecisionConfidenceLevel, DecisionType } from "../domain/decision-intelligence-schema.js";
import type {
  DecisionReadiness,
  DecisionFactor,
  ExpectedImpactAnalysis,
  AlternativeOption,
  MitigationRecommendation,
} from "../domain/decision-context.js";
import type { TrustIntelligenceRecommendation } from "../../trust-intelligence/domain/trust-context.js";

export class DecisionConfidenceBuilder {
  build(input: {
    trust: TrustIntelligenceRecommendation;
    readiness: DecisionReadiness;
    blockingCount: number;
    supportingCount: number;
  }): DecisionConfidence {
    let score = 45;
    score += Math.min(input.trust.trustConfidence.score * 0.25, 22);
    score += Math.min(input.readiness.score * 0.2, 18);
    score += Math.min(input.supportingCount * 5, 15);
    score -= Math.min(input.blockingCount * 8, 24);
    score = Math.min(95, Math.max(35, Math.round(score)));

    const level: DecisionConfidenceLevel = score >= 80 ? "high" : score >= 60 ? "medium" : "low";
    const structuralDecisionScore = Math.min(
      100,
      input.readiness.score + input.supportingCount * 8 - input.blockingCount * 10
    );

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "Strong trust and readiness signals support confident decision recommendation."
          : level === "medium"
            ? "Decision recommendation viable; blocking factors may require conditions."
            : "Limited confidence — treat decision recommendation as advisory only.",
      trustConfidenceScore: input.trust.trustConfidence.score,
      structuralDecisionScore: Math.max(0, structuralDecisionScore),
    };
  }
}

export class DecisionExplanationBuilder {
  build(input: {
    recommendationId: string;
    goal: string;
    decision: DecisionType;
    rationale: string;
    readiness: DecisionReadiness;
    blocking: DecisionFactor[];
    supporting: DecisionFactor[];
    impact: ExpectedImpactAnalysis;
    alternatives: AlternativeOption[];
    mitigations: MitigationRecommendation[];
  }): DecisionExplanation {
    return {
      explanationId: `explanation-${input.recommendationId}`,
      headline: `Decision intelligence for "${input.goal}"`,
      summary: `Recommends "${input.decision.replace(/_/g, " ")}" with ${input.readiness.level} readiness — read-only decision intelligence from the complete C1–C8 chain.`,
      rationaleSummary: input.rationale,
      blockingSummary:
        input.blocking.length > 0
          ? `${input.blocking.length} blocking factors: ${input.blocking.map((f) => f.label).join(", ")}.`
          : "No blocking factors identified.",
      supportingSummary:
        input.supporting.length > 0
          ? `${input.supporting.length} supporting factors: ${input.supporting.map((f) => f.label).join(", ")}.`
          : "Limited supporting factors — review recommended.",
      impactSummary: input.impact.summary,
      alternativeSummary: `${input.alternatives.length} alternative options and ${input.mitigations.length} mitigation recommendations available.`,
    };
  }
}

export function createDecisionConfidenceBuilder(): DecisionConfidenceBuilder {
  return new DecisionConfidenceBuilder();
}
export function createDecisionExplanationBuilder(): DecisionExplanationBuilder {
  return new DecisionExplanationBuilder();
}
