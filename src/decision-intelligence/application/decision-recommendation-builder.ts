import type { TrustIntelligenceRecommendation } from "../../trust-intelligence/domain/trust-context.js";
import type { OutcomeIntelligenceEvaluation } from "../../outcome-intelligence/domain/outcome-context.js";
import type { ExecutionIntelligenceGuidance } from "../../execution-intelligence/domain/execution-context.js";
import type { ContractIntelligenceRecommendation } from "../../contract-intelligence/domain/contract-context.js";
import type {
  DecisionReadiness,
  DecisionFactor,
  RequiredApproval,
  AlternativeOption,
  MitigationRecommendation,
  ExpectedImpactAnalysis,
} from "../domain/decision-context.js";
import type { DecisionType, DecisionReadinessLevel } from "../domain/decision-intelligence-schema.js";

export class DecisionReadinessBuilder {
  build(trust: TrustIntelligenceRecommendation, evaluation: OutcomeIntelligenceEvaluation): DecisionReadiness {
    const score = Math.min(
      100,
      Math.round(
        trust.trustReadiness.score * 0.4 +
          evaluation.qualityAssessment.score * 0.3 +
          evaluation.goalAchievementAnalysis.achievementScore * 0.2 +
          trust.evidenceCompleteness.score * 0.1
      )
    );

    let level: DecisionReadinessLevel;
    if (score >= 85) level = "strong";
    else if (score >= 70) level = "ready";
    else if (score >= 50) level = "conditional";
    else level = "not_ready";

    return {
      readinessId: `decision-readiness-${trust.recommendationId}`,
      level,
      score,
      trustReadinessScore: trust.trustReadiness.score,
      outcomeQualityScore: evaluation.qualityAssessment.score,
      summary: `Decision readiness ${level} (${score}/100) from trust, outcome quality, and achievement signals.`,
    };
  }
}

export class DecisionTypeResolver {
  resolve(input: {
    readiness: DecisionReadiness;
    trust: TrustIntelligenceRecommendation;
    evaluation: OutcomeIntelligenceEvaluation;
    blockingCount: number;
  }): { decision: DecisionType; rationale: string } {
    const { readiness, trust, evaluation, blockingCount } = input;

    if (readiness.level === "not_ready" || trust.trustReadiness.level === "not_ready") {
      return {
        decision: "postpone",
        rationale: "Trust or decision readiness below minimum threshold — postpone until gaps are addressed.",
      };
    }

    if (
      blockingCount >= 3 ||
      trust.evidenceCompleteness.gaps.length >= 2 ||
      evaluation.goalAchievementAnalysis.gapCount >= 2
    ) {
      return {
        decision: "review",
        rationale: "Multiple blocking factors or achievement gaps require human review before proceeding.",
      };
    }

    if (
      readiness.level === "conditional" ||
      trust.trustReadiness.level === "conditional" ||
      blockingCount >= 1
    ) {
      return {
        decision: "proceed_with_conditions",
        rationale: "Structural readiness supports conditional proceed with enhanced verification and approvals.",
      };
    }

    return {
      decision: "proceed",
      rationale: "Trust, outcome, and evidence signals support proceeding with standard platform safeguards.",
    };
  }
}

export class DecisionFactorsBuilder {
  build(
    trust: TrustIntelligenceRecommendation,
    evaluation: OutcomeIntelligenceEvaluation,
    execution: ExecutionIntelligenceGuidance
  ): { blocking: DecisionFactor[]; supporting: DecisionFactor[] } {
    const blocking: DecisionFactor[] = [];
    const supporting: DecisionFactor[] = [];

    if (trust.trustReadiness.level === "not_ready" || trust.trustReadiness.level === "conditional") {
      blocking.push({
        factorId: "block.trust_readiness",
        label: "Trust readiness",
        category: "trust",
        weight: 0.25,
        impact: "blocking",
        description: trust.trustReadiness.summary,
      });
    } else {
      supporting.push({
        factorId: "support.trust_readiness",
        label: "Trust readiness",
        category: "trust",
        weight: 0.25,
        impact: "supporting",
        description: trust.trustReadiness.summary,
      });
    }

    if (evaluation.varianceAnalysis.varianceDirection === "under") {
      blocking.push({
        factorId: "block.variance",
        label: "Outcome variance",
        category: "outcome",
        weight: 0.15,
        impact: "blocking",
        description: evaluation.varianceAnalysis.summary,
      });
    }

    if (trust.evidenceCompleteness.gaps.length > 0) {
      blocking.push({
        factorId: "block.evidence_gaps",
        label: "Evidence gaps",
        category: "evidence",
        weight: 0.2,
        impact: "blocking",
        description: trust.evidenceCompleteness.gaps.join("; "),
      });
    } else {
      supporting.push({
        factorId: "support.evidence",
        label: "Evidence completeness",
        category: "evidence",
        weight: 0.15,
        impact: "supporting",
        description: trust.evidenceCompleteness.summary,
      });
    }

    if (trust.riskConfidence.level === "low") {
      blocking.push({
        factorId: "block.risk",
        label: "Risk confidence",
        category: "risk",
        weight: 0.15,
        impact: "blocking",
        description: trust.riskConfidence.rationale,
      });
    } else {
      supporting.push({
        factorId: "support.risk",
        label: "Risk mitigation",
        category: "risk",
        weight: 0.1,
        impact: "supporting",
        description: trust.riskConfidence.rationale,
      });
    }

    if (evaluation.goalAchievementAnalysis.achievementScore >= 70) {
      supporting.push({
        factorId: "support.achievement",
        label: "Goal achievement",
        category: "outcome",
        weight: 0.2,
        impact: "supporting",
        description: evaluation.goalAchievementAnalysis.summary,
      });
    }

    if (execution.verificationCheckpoints.length >= 2) {
      supporting.push({
        factorId: "support.checkpoints",
        label: "Execution checkpoints",
        category: "execution",
        weight: 0.1,
        impact: "supporting",
        description: `${execution.verificationCheckpoints.length} verification checkpoints mapped.`,
      });
    }

    return { blocking, supporting };
  }
}

export class RequiredApprovalsBuilder {
  build(contract: ContractIntelligenceRecommendation): RequiredApproval[] {
    return contract.requiredApprovals.map((approval) => ({
      approvalId: approval.approvalId,
      label: approval.label,
      requiredParty: approval.requiredParty,
      mandatory: approval.mandatory,
      gateType: approval.gateType,
    }));
  }
}

export class AlternativeOptionsBuilder {
  build(_decision: DecisionType, goal: string): AlternativeOption[] {
    const options: AlternativeOption[] = [
      {
        optionId: "alt.proceed_standard",
        label: "Proceed with standard safeguards",
        decisionType: "proceed",
        description: `Execute "${goal}" with platform trust safeguards and milestone acceptance.`,
        tradeoffs: ["Requires all mandatory approvals before execution start."],
      },
      {
        optionId: "alt.proceed_conditional",
        label: "Proceed with enhanced verification",
        decisionType: "proceed_with_conditions",
        description: "Add extra evidence gates and platform verification before escrow release.",
        tradeoffs: ["Longer acceptance cycle", "Higher confidence in outcome quality"],
      },
      {
        optionId: "alt.review",
        label: "Human review before commitment",
        decisionType: "review",
        description: "Escalate to platform mediator for scope and trust gap review.",
        tradeoffs: ["Delays start", "Resolves ambiguous blocking factors"],
      },
      {
        optionId: "alt.postpone",
        label: "Postpone until readiness improves",
        decisionType: "postpone",
        description: "Defer decision until evidence, trust, or scope gaps are resolved.",
        tradeoffs: ["No execution start", "Avoids premature commitment"],
      },
    ];

    return options;
  }
}

export class MitigationRecommendationsBuilder {
  build(input: {
    trust: TrustIntelligenceRecommendation;
    evaluation: OutcomeIntelligenceEvaluation;
    blocking: DecisionFactor[];
  }): MitigationRecommendation[] {
    const mitigations: MitigationRecommendation[] = [];

    for (const block of input.blocking) {
      mitigations.push({
        mitigationId: `mitigate.${block.factorId}`,
        priority: block.weight >= 0.2 ? "high" : "medium",
        title: `Address ${block.label}`,
        description: block.description,
        addressesFactorId: block.factorId,
      });
    }

    for (const improvement of input.evaluation.improvementRecommendations.slice(0, 2)) {
      mitigations.push({
        mitigationId: `mitigate.${improvement.recommendationId}`,
        priority: improvement.priority,
        title: improvement.title,
        description: improvement.description,
        addressesFactorId: null,
      });
    }

    mitigations.push({
      mitigationId: "mitigate.platform",
      priority: "medium",
      title: "Apply platform trust safeguards",
      description: input.trust.platformTrustRecommendation.action,
      addressesFactorId: null,
    });

    return mitigations;
  }
}

export class ExpectedImpactBuilder {
  build(input: {
    decision: DecisionType;
    trust: TrustIntelligenceRecommendation;
    evaluation: OutcomeIntelligenceEvaluation;
    execution: ExecutionIntelligenceGuidance;
    contract: ContractIntelligenceRecommendation;
  }): ExpectedImpactAnalysis {
    const decisionMultiplier =
      input.decision === "proceed"
        ? 1.0
        : input.decision === "proceed_with_conditions"
          ? 0.85
          : input.decision === "review"
            ? 0.6
            : 0.3;

    const overallImpactScore = Math.round(
      (input.evaluation.goalAchievementAnalysis.achievementScore * 0.4 +
        input.trust.trustScoreRecommendation.recommendedScore * 0.35 +
        input.evaluation.completionOutcomeModel.projectedCompletionPercent * 0.25) *
        decisionMultiplier
    );

    return {
      analysisId: `impact-${input.trust.recommendationId}`,
      goalImpact: `Projected ${input.evaluation.goalAchievementAnalysis.achievementScore}% goal achievement if decision ${input.decision} is enacted.`,
      trustImpact: `Trust score band ${input.trust.trustScoreRecommendation.scoreBand} (${input.trust.trustScoreRecommendation.recommendedScore} points); reputation ${input.trust.reputationProjection.projectedTier}.`,
      timelineImpact: `${input.execution.executionRoadmap.totalMinHours}–${input.execution.executionRoadmap.totalMaxHours} hour execution window from plan.`,
      financialImpact: `${input.contract.paymentRecommendation.recommendedAmountMin}–${input.contract.paymentRecommendation.recommendedAmountMax} ${input.contract.paymentRecommendation.currency} payment range (recommendation only).`,
      overallImpactScore,
      summary: `Overall projected impact score ${overallImpactScore}/100 for "${input.decision}" decision — read-only analysis, no mutations.`,
    };
  }
}

export function createDecisionReadinessBuilder(): DecisionReadinessBuilder {
  return new DecisionReadinessBuilder();
}
export function createDecisionTypeResolver(): DecisionTypeResolver {
  return new DecisionTypeResolver();
}
export function createDecisionFactorsBuilder(): DecisionFactorsBuilder {
  return new DecisionFactorsBuilder();
}
export function createRequiredApprovalsBuilder(): RequiredApprovalsBuilder {
  return new RequiredApprovalsBuilder();
}
export function createAlternativeOptionsBuilder(): AlternativeOptionsBuilder {
  return new AlternativeOptionsBuilder();
}
export function createMitigationRecommendationsBuilder(): MitigationRecommendationsBuilder {
  return new MitigationRecommendationsBuilder();
}
export function createExpectedImpactBuilder(): ExpectedImpactBuilder {
  return new ExpectedImpactBuilder();
}
