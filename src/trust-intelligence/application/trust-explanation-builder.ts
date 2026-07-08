import type { TrustConfidence, TrustExplanation } from "../domain/trust-context.js";
import type { TrustConfidenceLevel } from "../domain/trust-intelligence-schema.js";
import type {
  TrustReadiness,
  TrustScoreRecommendation,
  VerificationConfidence,
  ReputationProjection,
  RiskConfidence,
  EvidenceCompleteness,
} from "../domain/trust-context.js";
import type { OutcomeIntelligenceEvaluation } from "../../outcome-intelligence/domain/outcome-context.js";

export class TrustConfidenceBuilder {
  build(input: {
    evaluation: OutcomeIntelligenceEvaluation;
    readiness: TrustReadiness;
    trustScore: TrustScoreRecommendation;
    verificationConfidence: VerificationConfidence;
  }): TrustConfidence {
    let score = 45;
    score += Math.min(input.evaluation.confidence.score * 0.2, 18);
    score += Math.min(input.readiness.score * 0.2, 18);
    score += Math.min(input.trustScore.recommendedScore * 0.15, 14);
    score += Math.min(input.verificationConfidence.score * 0.15, 12);
    score = Math.min(95, Math.max(40, Math.round(score)));

    const level: TrustConfidenceLevel = score >= 80 ? "high" : score >= 60 ? "medium" : "low";
    const structuralTrustScore = Math.min(
      100,
      input.readiness.score + input.verificationConfidence.score * 0.3
    );

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "Strong outcome evaluation and verification mapping support confident trust recommendations."
          : level === "medium"
            ? "Trust recommendation viable based on structural readiness projections."
            : "Limited upstream completeness — treat trust intelligence as indicative only.",
      outcomeConfidenceScore: input.evaluation.confidence.score,
      structuralTrustScore: Math.round(structuralTrustScore),
    };
  }
}

export class TrustExplanationBuilder {
  build(input: {
    recommendationId: string;
    goal: string;
    readiness: TrustReadiness;
    trustScore: TrustScoreRecommendation;
    reputation: ReputationProjection;
    riskConfidence: RiskConfidence;
    evidenceCompleteness: EvidenceCompleteness;
    platformAction: string;
  }): TrustExplanation {
    return {
      explanationId: `explanation-${input.recommendationId}`,
      headline: `Trust intelligence for "${input.goal}"`,
      summary: `Read-only trust recommendation: readiness ${input.readiness.level}, score ${input.trustScore.recommendedScore}/100, reputation ${input.reputation.projectedTier} — no trust mutations performed.`,
      readinessRationale: input.readiness.summary,
      scoreRationale: `${input.trustScore.factors.length} weighted factors produce ${input.trustScore.scoreBand} trust band (${input.trustScore.recommendedScore} trust points).`,
      reputationRationale: input.reputation.summary,
      riskRationale: input.riskConfidence.rationale,
      evidenceRationale: input.evidenceCompleteness.summary,
    };
  }
}

export function createTrustConfidenceBuilder(): TrustConfidenceBuilder {
  return new TrustConfidenceBuilder();
}
export function createTrustExplanationBuilder(): TrustExplanationBuilder {
  return new TrustExplanationBuilder();
}
