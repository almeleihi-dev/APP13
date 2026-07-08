import type { DecisionIntelligenceRecommendation } from "../../decision-intelligence/domain/decision-context.js";
import type { ExecutionIntelligenceGuidance } from "../../execution-intelligence/domain/execution-context.js";
import type { OutcomeIntelligenceEvaluation } from "../../outcome-intelligence/domain/outcome-context.js";
import type {
  PrioritizedRecommendation,
  ImplementationRoadmap,
  Prerequisite,
  ExpectedBenefit,
  ExpectedTradeOff,
  SuccessProbability,
  FallbackRecommendation,
  OptimizationOpportunity,
  RecommendationConfidence,
} from "../domain/recommendation-context.js";
import type { ActionPriorityLevel } from "../domain/recommendation-intelligence-schema.js";

const DECISION_PRIORITY: Record<string, ActionPriorityLevel> = {
  proceed: "high",
  proceed_with_conditions: "high",
  review: "critical",
  postpone: "critical",
};

const DECISION_SCORE: Record<string, number> = {
  proceed: 90,
  proceed_with_conditions: 75,
  review: 55,
  postpone: 30,
};

export class PrioritizedRecommendationsBuilder {
  build(decision: DecisionIntelligenceRecommendation): PrioritizedRecommendation[] {
    const items: PrioritizedRecommendation[] = [];

    items.push({
      itemId: "rec.primary_decision",
      rank: 0,
      title: `Execute decision: ${decision.recommendedDecision.replace(/_/g, " ")}`,
      description: decision.decisionRationale,
      recommendationScore: DECISION_SCORE[decision.recommendedDecision] ?? 50,
      actionPriority: DECISION_PRIORITY[decision.recommendedDecision] ?? "medium",
      category: "decision",
    });

    for (const mitigation of decision.mitigationRecommendations) {
      items.push({
        itemId: mitigation.mitigationId,
        rank: 0,
        title: mitigation.title,
        description: mitigation.description,
        recommendationScore:
          mitigation.priority === "high" ? 85 : mitigation.priority === "medium" ? 65 : 45,
        actionPriority: mitigation.priority === "high" ? "high" : mitigation.priority === "medium" ? "medium" : "low",
        category: "mitigation",
      });
    }

    for (const approval of decision.requiredApprovals) {
      items.push({
        itemId: approval.approvalId,
        rank: 0,
        title: approval.label,
        description: `${approval.requiredParty} approval required (${approval.gateType})`,
        recommendationScore: approval.mandatory ? 80 : 55,
        actionPriority: approval.mandatory ? "high" : "medium",
        category: "approval",
      });
    }

    return items
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .map((item, index) => ({ ...item, rank: index + 1 }));
  }
}

export class RecommendationScoreBuilder {
  build(
    prioritized: PrioritizedRecommendation[],
    decision: DecisionIntelligenceRecommendation
  ): number {
    if (prioritized.length === 0) return decision.decisionConfidence.score;
    const topScores = prioritized.slice(0, 3).map((item) => item.recommendationScore);
    const avgTop = topScores.reduce((sum, score) => sum + score, 0) / topScores.length;
    return Math.round(avgTop * 0.6 + decision.decisionConfidence.score * 0.4);
  }
}

export class ActionPriorityResolver {
  resolve(decision: DecisionIntelligenceRecommendation): ActionPriorityLevel {
    return DECISION_PRIORITY[decision.recommendedDecision] ?? "medium";
  }
}

export class ImplementationRoadmapBuilder {
  build(
    decision: DecisionIntelligenceRecommendation,
    execution: ExecutionIntelligenceGuidance
  ): ImplementationRoadmap {
    const phases: ImplementationRoadmap["phases"] = execution.executionRoadmap.phases.map(
      (phase) => ({
        phaseId: phase.phaseId,
        order: phase.order,
        title: phase.title,
        description: phase.description,
        estimatedHoursMin: Math.round(phase.estimatedMinMinutes / 60),
        estimatedHoursMax: Math.round(phase.estimatedMaxMinutes / 60),
      })
    );

    if (decision.recommendedDecision === "proceed_with_conditions") {
      phases.unshift({
        phaseId: "phase.pre_verification",
        order: 0,
        title: "Enhanced verification gate",
        description: "Complete conditional verification before execution start.",
        estimatedHoursMin: 1,
        estimatedHoursMax: 4,
      });
      phases.forEach((phase, index) => {
        phase.order = index + 1;
      });
    }

    return {
      roadmapId: `roadmap-${decision.recommendationId}`,
      totalPhases: phases.length,
      phases,
      summary: `${phases.length}-phase implementation roadmap for "${decision.goal}" aligned with decision ${decision.recommendedDecision.replace(/_/g, " ")}.`,
    };
  }
}

export class PrerequisitesBuilder {
  build(decision: DecisionIntelligenceRecommendation): Prerequisite[] {
    const prerequisites: Prerequisite[] = [];

    for (const approval of decision.requiredApprovals) {
      prerequisites.push({
        prerequisiteId: `prereq.${approval.approvalId}`,
        label: approval.label,
        mandatory: approval.mandatory,
        category: "approval",
        description: `${approval.requiredParty} must complete ${approval.gateType} gate.`,
      });
    }

    for (const block of decision.blockingFactors) {
      prerequisites.push({
        prerequisiteId: `prereq.${block.factorId}`,
        label: block.label,
        mandatory: block.impact === "blocking",
        category: block.category === "trust" ? "trust" : block.category === "evidence" ? "evidence" : "readiness",
        description: block.description,
      });
    }

    if (decision.decisionReadiness.level === "not_ready" || decision.decisionReadiness.level === "conditional") {
      prerequisites.push({
        prerequisiteId: "prereq.decision_readiness",
        label: "Decision readiness threshold",
        mandatory: true,
        category: "readiness",
        description: decision.decisionReadiness.summary,
      });
    }

    return prerequisites;
  }
}

export class ExpectedBenefitsBuilder {
  build(
    decision: DecisionIntelligenceRecommendation,
    evaluation: OutcomeIntelligenceEvaluation
  ): ExpectedBenefit[] {
    const benefits: ExpectedBenefit[] = [];

    for (const factor of decision.supportingFactors) {
      benefits.push({
        benefitId: `benefit.${factor.factorId}`,
        title: factor.label,
        description: factor.description,
        impactWeight: factor.weight,
      });
    }

    benefits.push({
      benefitId: "benefit.goal_achievement",
      title: "Goal achievement projection",
      description: evaluation.goalAchievementAnalysis.summary,
      impactWeight: 0.25,
    });

    benefits.push({
      benefitId: "benefit.impact",
      title: "Expected impact",
      description: decision.expectedImpactAnalysis.summary,
      impactWeight: 0.2,
    });

    return benefits;
  }
}

export class ExpectedTradeOffsBuilder {
  build(decision: DecisionIntelligenceRecommendation): ExpectedTradeOff[] {
    const tradeOffs: ExpectedTradeOff[] = [];

    for (const block of decision.blockingFactors) {
      tradeOffs.push({
        tradeOffId: `tradeoff.${block.factorId}`,
        title: block.label,
        description: block.description,
        severity: block.weight >= 0.2 ? "high" : block.weight >= 0.15 ? "medium" : "low",
      });
    }

    const primaryAlt = decision.alternativeOptions.find(
      (opt) => opt.decisionType === decision.recommendedDecision
    );
    if (primaryAlt) {
      for (const tradeoff of primaryAlt.tradeoffs) {
        tradeOffs.push({
          tradeOffId: `tradeoff.alt.${primaryAlt.optionId}`,
          title: primaryAlt.label,
          description: tradeoff,
          severity: "medium",
        });
      }
    }

    return tradeOffs;
  }
}

export class SuccessProbabilityBuilder {
  build(
    decision: DecisionIntelligenceRecommendation,
    evaluation: OutcomeIntelligenceEvaluation
  ): SuccessProbability {
    const achievement = evaluation.goalAchievementAnalysis.achievementScore;
    const decisionConf = decision.decisionConfidence.score;
    const score = Math.round(achievement * 0.45 + decisionConf * 0.55);
    const level = score >= 75 ? "high" : score >= 55 ? "medium" : "low";

    return {
      probabilityId: `success-${decision.recommendationId}`,
      score,
      level,
      rationale: `Success probability ${level} (${score}%) from decision confidence and goal achievement signals — advisory only.`,
      decisionConfidenceContribution: decisionConf,
      outcomeAchievementContribution: achievement,
    };
  }
}

export class FallbackRecommendationsBuilder {
  build(decision: DecisionIntelligenceRecommendation): FallbackRecommendation[] {
    return decision.alternativeOptions
      .filter((opt) => opt.decisionType !== decision.recommendedDecision)
      .map((opt) => ({
        fallbackId: opt.optionId,
        label: opt.label,
        description: opt.description,
        recommendationScore: DECISION_SCORE[opt.decisionType] ?? 40,
        triggerCondition:
          opt.decisionType === "postpone"
            ? "Primary decision blocked or readiness insufficient"
            : opt.decisionType === "review"
              ? "Blocking factors exceed automated resolution threshold"
              : "Conditional proceed preferred over standard proceed",
      }));
  }
}

export class OptimizationOpportunitiesBuilder {
  build(
    decision: DecisionIntelligenceRecommendation,
    evaluation: OutcomeIntelligenceEvaluation
  ): OptimizationOpportunity[] {
    const opportunities: OptimizationOpportunity[] = [];

    for (const improvement of evaluation.improvementRecommendations) {
      opportunities.push({
        opportunityId: improvement.recommendationId,
        title: improvement.title,
        description: improvement.description,
        potentialGain: `${improvement.priority} priority outcome improvement`,
        priority: improvement.priority === "high" ? "high" : improvement.priority === "medium" ? "medium" : "low",
      });
    }

    const lowMitigations = decision.mitigationRecommendations.filter((m) => m.priority === "low");
    for (const mitigation of lowMitigations.slice(0, 2)) {
      opportunities.push({
        opportunityId: `opt.${mitigation.mitigationId}`,
        title: mitigation.title,
        description: mitigation.description,
        potentialGain: "Incremental readiness improvement",
        priority: "low",
      });
    }

    if (decision.supportingFactors.length >= 3) {
      opportunities.push({
        opportunityId: "opt.accelerate",
        title: "Accelerate execution timeline",
        description: "Strong supporting factors allow parallel milestone execution.",
        potentialGain: "Reduced time-to-completion",
        priority: "medium",
      });
    }

    return opportunities;
  }
}

export class RecommendationConfidenceBuilder {
  build(input: {
    decision: DecisionIntelligenceRecommendation;
    recommendationScore: number;
    prioritizedCount: number;
  }): RecommendationConfidence {
    let score = 40;
    score += Math.min(input.decision.decisionConfidence.score * 0.3, 28);
    score += Math.min(input.recommendationScore * 0.25, 22);
    score += Math.min(input.prioritizedCount * 3, 10);
    score = Math.min(95, Math.max(35, Math.round(score)));

    const level = score >= 80 ? "high" : score >= 60 ? "medium" : "low";
    const structuralRecommendationScore = Math.min(
      100,
      input.recommendationScore + input.prioritizedCount * 5
    );

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "Strong decision signals support confident actionable recommendations."
          : level === "medium"
            ? "Recommendations viable; prerequisites or mitigations may be required first."
            : "Limited confidence — treat recommendations as advisory only.",
      decisionConfidenceScore: input.decision.decisionConfidence.score,
      structuralRecommendationScore: Math.max(0, structuralRecommendationScore),
    };
  }
}

export function createPrioritizedRecommendationsBuilder(): PrioritizedRecommendationsBuilder {
  return new PrioritizedRecommendationsBuilder();
}
export function createRecommendationScoreBuilder(): RecommendationScoreBuilder {
  return new RecommendationScoreBuilder();
}
export function createActionPriorityResolver(): ActionPriorityResolver {
  return new ActionPriorityResolver();
}
export function createImplementationRoadmapBuilder(): ImplementationRoadmapBuilder {
  return new ImplementationRoadmapBuilder();
}
export function createPrerequisitesBuilder(): PrerequisitesBuilder {
  return new PrerequisitesBuilder();
}
export function createExpectedBenefitsBuilder(): ExpectedBenefitsBuilder {
  return new ExpectedBenefitsBuilder();
}
export function createExpectedTradeOffsBuilder(): ExpectedTradeOffsBuilder {
  return new ExpectedTradeOffsBuilder();
}
export function createSuccessProbabilityBuilder(): SuccessProbabilityBuilder {
  return new SuccessProbabilityBuilder();
}
export function createFallbackRecommendationsBuilder(): FallbackRecommendationsBuilder {
  return new FallbackRecommendationsBuilder();
}
export function createOptimizationOpportunitiesBuilder(): OptimizationOpportunitiesBuilder {
  return new OptimizationOpportunitiesBuilder();
}
export function createRecommendationConfidenceBuilder(): RecommendationConfidenceBuilder {
  return new RecommendationConfidenceBuilder();
}
