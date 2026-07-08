import type { CanonicalAction } from "../../action-ontology/domain/canonical-action.js";
import type { ContractIntelligenceRecommendation } from "../../contract-intelligence/domain/contract-context.js";
import type { ExecutionIntelligenceGuidance } from "../../execution-intelligence/domain/execution-context.js";
import type { OutcomeIntelligenceEvaluation } from "../../outcome-intelligence/domain/outcome-context.js";
import type {
  TrustReadiness,
  TrustScoreRecommendation,
  VerificationConfidence,
  ReputationProjection,
  RiskConfidence,
  EvidenceCompleteness,
  ReliabilityProjection,
  PlatformTrustRecommendation,
} from "../domain/trust-context.js";
import type { TrustConfidenceLevel, TrustReadinessLevel } from "../domain/trust-intelligence-schema.js";

export class TrustReadinessBuilder {
  build(evaluation: OutcomeIntelligenceEvaluation, execution: ExecutionIntelligenceGuidance): TrustReadiness {
    const gatesTotal =
      execution.verificationCheckpoints.length +
      execution.qualityCheckpoints.length +
      evaluation.successCriteriaEvaluations.length;
    const gatesPassed =
      evaluation.successCriteriaEvaluations.filter((e) => e.status !== "projected_fail").length +
      execution.verificationCheckpoints.filter((c) => c.mandatory).length;

    const score = Math.min(
      100,
      Math.round(
        evaluation.completionOutcomeModel.projectedCompletionPercent * 0.4 +
          evaluation.qualityAssessment.score * 0.3 +
          (gatesTotal > 0 ? (gatesPassed / gatesTotal) * 30 : 15)
      )
    );

    let level: TrustReadinessLevel;
    if (score >= 85) level = "strong";
    else if (score >= 70) level = "ready";
    else if (score >= 50) level = "conditional";
    else level = "not_ready";

    return {
      readinessId: `readiness-${evaluation.evaluationId}`,
      level,
      score,
      gatesPassed,
      gatesTotal,
      summary: `Trust readiness ${level} (${score}/100) — ${gatesPassed}/${gatesTotal} projected gates satisfied.`,
    };
  }
}

export class TrustScoreBuilder {
  build(input: {
    evaluation: OutcomeIntelligenceEvaluation;
    execution: ExecutionIntelligenceGuidance;
    contract: ContractIntelligenceRecommendation;
    readiness: TrustReadiness;
  }): TrustScoreRecommendation {
    const factors = [
      {
        factorId: "factor.outcome_quality",
        label: "Outcome quality",
        weight: 0.25,
        contribution: input.evaluation.qualityAssessment.score * 0.25,
        trace: `Quality level ${input.evaluation.qualityAssessment.level}`,
      },
      {
        factorId: "factor.evidence",
        label: "Evidence completeness",
        weight: 0.2,
        contribution: Math.min(100, input.execution.stageEvidence.length * 15) * 0.2,
        trace: `${input.execution.stageEvidence.length} stage evidence mappings`,
      },
      {
        factorId: "factor.checkpoints",
        label: "Checkpoint coverage",
        weight: 0.2,
        contribution:
          (input.execution.verificationCheckpoints.length + input.execution.qualityCheckpoints.length) * 4,
        trace: "Verification and quality checkpoint density",
      },
      {
        factorId: "factor.achievement",
        label: "Goal achievement",
        weight: 0.2,
        contribution: input.evaluation.goalAchievementAnalysis.achievementScore * 0.2,
        trace: `${input.evaluation.goalAchievementAnalysis.achievementScore}% projected achievement`,
      },
      {
        factorId: "factor.readiness",
        label: "Trust readiness",
        weight: 0.15,
        contribution: input.readiness.score * 0.15,
        trace: `Readiness level ${input.readiness.level}`,
      },
    ];

    const recommendedScore = Math.min(
      100,
      Math.round(factors.reduce((sum, f) => sum + f.contribution, 0))
    );

    const scoreBand: TrustScoreRecommendation["scoreBand"] =
      recommendedScore >= 85 ? "excellent" : recommendedScore >= 70 ? "good" : recommendedScore >= 50 ? "moderate" : "low";

    return {
      scoreId: `score-${input.evaluation.evaluationId}`,
      recommendedScore,
      scoreBand,
      currency: "trust_points",
      factors,
      readOnlyNote: "Trust score recommendation only — no trust mutations or reputation writes.",
    };
  }
}

export class VerificationConfidenceBuilder {
  build(execution: ExecutionIntelligenceGuidance): VerificationConfidence {
    const checkpointCoverage =
      execution.verificationCheckpoints.length + execution.qualityCheckpoints.length;
    const evidenceGateCount = execution.stageEvidence.reduce(
      (sum, stage) => sum + stage.evidenceItems.length,
      0
    );
    const score = Math.min(95, Math.round(checkpointCoverage * 8 + evidenceGateCount * 3 + 20));
    const level: TrustConfidenceLevel = score >= 80 ? "high" : score >= 60 ? "medium" : "low";

    return {
      confidenceId: `verify-${execution.guidanceId}`,
      level,
      score,
      checkpointCoverage,
      evidenceGateCount,
      rationale: `${checkpointCoverage} checkpoints and ${evidenceGateCount} evidence gates mapped from execution guidance.`,
    };
  }
}

export class ReputationProjectionBuilder {
  build(evaluation: OutcomeIntelligenceEvaluation, trustScore: TrustScoreRecommendation): ReputationProjection {
    const projectedScore = Math.round(
      trustScore.recommendedScore * 0.6 + evaluation.goalAchievementAnalysis.achievementScore * 0.4
    );

    const projectedTier =
      projectedScore >= 85 ? "premier" : projectedScore >= 70 ? "trusted" : projectedScore >= 55 ? "established" : "emerging";

    const trajectory =
      evaluation.varianceAnalysis.varianceDirection === "under"
        ? "at_risk"
        : evaluation.varianceAnalysis.varianceDirection === "over"
          ? "rising"
          : "stable";

    return {
      projectionId: `reputation-${evaluation.evaluationId}`,
      projectedTier,
      projectedScore,
      trajectory,
      summary: `Projected ${projectedTier} reputation (${projectedScore}/100) with ${trajectory} trajectory — read-only projection.`,
    };
  }
}

export class RiskConfidenceBuilder {
  build(
    canonicalAction: CanonicalAction,
    contract: ContractIntelligenceRecommendation
  ): RiskConfidence {
    const highRisk = canonicalAction.riskSignals.filter((s) => s.severity === "high").length;
    const mitigatedClauses = contract.riskClauses.length;
    const score = Math.max(
      30,
      Math.min(95, 80 - highRisk * 12 + mitigatedClauses * 5)
    );
    const level: TrustConfidenceLevel = score >= 75 ? "high" : score >= 55 ? "medium" : "low";

    return {
      confidenceId: `risk-${contract.recommendationId}`,
      level,
      score,
      highRiskSignals: highRisk,
      mitigatedClauses,
      rationale: `${highRisk} high-severity risk signals offset by ${mitigatedClauses} contract risk clauses.`,
    };
  }
}

export class EvidenceCompletenessBuilder {
  build(evaluation: OutcomeIntelligenceEvaluation): EvidenceCompleteness {
    const requiredEvidenceCount = evaluation.expectedOutcomes.filter(
      (o) => o.mandatory && o.source !== "goal"
    ).length;
    const projectedVerifiedCount = evaluation.deliverableVerificationSummaries.filter(
      (d) => d.verificationStatus === "projected_verified"
    ).length;
    const score =
      requiredEvidenceCount > 0
        ? Math.round((projectedVerifiedCount / requiredEvidenceCount) * 100)
        : Math.min(100, evaluation.completionOutcomeModel.projectedCompletionPercent);

    const gaps = evaluation.deliverableVerificationSummaries
      .filter((d) => d.verificationStatus === "at_risk")
      .map((d) => `At-risk deliverable: ${d.title}`);

    return {
      completenessId: `evidence-${evaluation.evaluationId}`,
      score,
      requiredEvidenceCount,
      projectedVerifiedCount,
      gaps,
      summary: `${projectedVerifiedCount}/${requiredEvidenceCount} deliverables projected verified (${score}% completeness).`,
    };
  }
}

export class ReliabilityProjectionBuilder {
  build(input: {
    evaluation: OutcomeIntelligenceEvaluation;
    execution: ExecutionIntelligenceGuidance;
    trustScore: TrustScoreRecommendation;
  }): { provider: ReliabilityProjection; customer: ReliabilityProjection } {
    const providerTasks = input.execution.responsibilityMatrix.entries.find(
      (e) => e.party === "provider"
    );
    const customerTasks = input.execution.responsibilityMatrix.entries.find(
      (e) => e.party === "customer"
    );

    const providerScore = Math.min(
      100,
      Math.round(
        input.trustScore.recommendedScore * 0.5 +
          (providerTasks?.taskIds.length ?? 0) * 4 +
          input.evaluation.qualityAssessment.score * 0.2
      )
    );
    const customerScore = Math.min(
      100,
      Math.round(
        input.trustScore.recommendedScore * 0.35 +
          (customerTasks?.taskIds.length ?? 0) * 5 +
          input.evaluation.goalAchievementAnalysis.achievementScore * 0.15
      )
    );

    const toBand = (score: number): ReliabilityProjection["reliabilityBand"] =>
      score >= 75 ? "high" : score >= 50 ? "moderate" : "low";

    return {
      provider: {
        projectionId: `reliability.provider.${input.evaluation.evaluationId}`,
        party: "provider",
        projectedReliability: providerScore,
        reliabilityBand: toBand(providerScore),
        factors: [
          `${providerTasks?.taskIds.length ?? 0} provider-assigned tasks`,
          `Quality assessment ${input.evaluation.qualityAssessment.level}`,
        ],
      },
      customer: {
        projectionId: `reliability.customer.${input.evaluation.evaluationId}`,
        party: "customer",
        projectedReliability: customerScore,
        reliabilityBand: toBand(customerScore),
        factors: [
          `${customerTasks?.taskIds.length ?? 0} customer-assigned tasks`,
          `${input.execution.acceptanceWorkflow.length} acceptance steps`,
        ],
      },
    };
  }
}

export class PlatformTrustRecommendationBuilder {
  build(input: {
    contract: ContractIntelligenceRecommendation;
    execution: ExecutionIntelligenceGuidance;
    readiness: TrustReadiness;
    canonicalAction: CanonicalAction;
  }): PlatformTrustRecommendation {
    return {
      recommendationId: `platform-trust-${input.contract.recommendationId}`,
      action:
        input.readiness.level === "strong" || input.readiness.level === "ready"
          ? "Proceed with standard platform trust safeguards and evidence verification."
          : "Apply enhanced verification gates before releasing escrow or completing acceptance.",
      safeguards: input.canonicalAction.trustSignals.slice(0, 3),
      escrowAlignment: input.contract.escrowRecommendation.rationale,
      disputeReadiness: `${input.execution.exceptionHandling.length} exception guides and ${input.contract.riskClauses.length} risk clauses mapped for dispute mediation.`,
      readOnlyNote: "Platform trust recommendation only — no trust score mutations or reputation writes.",
    };
  }
}

export function createTrustReadinessBuilder(): TrustReadinessBuilder {
  return new TrustReadinessBuilder();
}
export function createTrustScoreBuilder(): TrustScoreBuilder {
  return new TrustScoreBuilder();
}
export function createVerificationConfidenceBuilder(): VerificationConfidenceBuilder {
  return new VerificationConfidenceBuilder();
}
export function createReputationProjectionBuilder(): ReputationProjectionBuilder {
  return new ReputationProjectionBuilder();
}
export function createRiskConfidenceBuilder(): RiskConfidenceBuilder {
  return new RiskConfidenceBuilder();
}
export function createEvidenceCompletenessBuilder(): EvidenceCompletenessBuilder {
  return new EvidenceCompletenessBuilder();
}
export function createReliabilityProjectionBuilder(): ReliabilityProjectionBuilder {
  return new ReliabilityProjectionBuilder();
}
export function createPlatformTrustRecommendationBuilder(): PlatformTrustRecommendationBuilder {
  return new PlatformTrustRecommendationBuilder();
}
