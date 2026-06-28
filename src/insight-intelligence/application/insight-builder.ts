import type { RecommendationIntelligenceOutput } from "../../recommendation-intelligence/domain/recommendation-context.js";
import type { DecisionIntelligenceRecommendation } from "../../decision-intelligence/domain/decision-context.js";
import type { OutcomeIntelligenceEvaluation } from "../../outcome-intelligence/domain/outcome-context.js";
import type { ExecutionIntelligenceGuidance } from "../../execution-intelligence/domain/execution-context.js";
import type {
  StrategicInsight,
  OperationalInsight,
  RiskInsight,
  OpportunityInsight,
  BottleneckDetection,
  PatternRecognition,
  RootCauseObservation,
  HiddenDependency,
  RecommendationConsistencyAnalysis,
  InsightConfidence,
} from "../domain/insight-context.js";
import type { InsightConfidenceLevel } from "../domain/insight-intelligence-schema.js";

export class StrategicInsightsBuilder {
  build(
    recommendation: RecommendationIntelligenceOutput,
    decision: DecisionIntelligenceRecommendation,
    evaluation: OutcomeIntelligenceEvaluation
  ): StrategicInsight[] {
    const insights: StrategicInsight[] = [
      {
        insightId: "strategic.goal_alignment",
        title: "Goal alignment",
        description: `Primary goal "${evaluation.goal}" aligns with decision "${decision.recommendedDecision.replace(/_/g, " ")}" and recommendation score ${recommendation.recommendationScore}/100.`,
        impactWeight: 0.3,
        category: "goal",
      },
      {
        insightId: "strategic.decision_posture",
        title: "Decision posture",
        description: decision.decisionRationale,
        impactWeight: 0.25,
        category: "decision",
      },
      {
        insightId: "strategic.trust_band",
        title: "Trust trajectory",
        description: decision.expectedImpactAnalysis.trustImpact,
        impactWeight: 0.2,
        category: "trust",
      },
    ];

    if (recommendation.successProbability.level === "high") {
      insights.push({
        insightId: "strategic.success_outlook",
        title: "Strong success outlook",
        description: recommendation.successProbability.rationale,
        impactWeight: 0.15,
        category: "market",
      });
    }

    return insights;
  }
}

export class OperationalInsightsBuilder {
  build(recommendation: RecommendationIntelligenceOutput): OperationalInsight[] {
    const insights: OperationalInsight[] = [];

    for (const phase of recommendation.implementationRoadmap.phases.slice(0, 3)) {
      insights.push({
        insightId: `operational.${phase.phaseId}`,
        title: phase.title,
        description: phase.description,
        phaseRef: phase.phaseId,
        priority: phase.order === 1 ? "high" : "medium",
      });
    }

    for (const item of recommendation.prioritizedRecommendations.slice(0, 2)) {
      insights.push({
        insightId: `operational.${item.itemId}`,
        title: item.title,
        description: item.description,
        phaseRef: null,
        priority: item.actionPriority,
      });
    }

    return insights;
  }
}

export class RiskInsightsBuilder {
  build(
    recommendation: RecommendationIntelligenceOutput,
    decision: DecisionIntelligenceRecommendation
  ): RiskInsight[] {
    const risks: RiskInsight[] = [];

    for (const tradeOff of recommendation.expectedTradeOffs) {
      risks.push({
        riskId: `risk.${tradeOff.tradeOffId}`,
        title: tradeOff.title,
        description: tradeOff.description,
        severity: tradeOff.severity === "high" ? "high" : tradeOff.severity === "medium" ? "medium" : "low",
        sourceCategory: "decision",
      });
    }

    if (decision.decisionConfidence.level === "low") {
      risks.push({
        riskId: "risk.low_decision_confidence",
        title: "Low decision confidence",
        description: decision.decisionConfidence.rationale,
        severity: "high",
        sourceCategory: "trust",
      });
    }

    if (recommendation.successProbability.level === "low") {
      risks.push({
        riskId: "risk.low_success_probability",
        title: "Low success probability",
        description: recommendation.successProbability.rationale,
        severity: "medium",
        sourceCategory: "outcome",
      });
    }

    return risks;
  }
}

export class OpportunityInsightsBuilder {
  build(recommendation: RecommendationIntelligenceOutput): OpportunityInsight[] {
    return recommendation.optimizationOpportunities.map((opt) => ({
      opportunityId: opt.opportunityId,
      title: opt.title,
      description: opt.description,
      potentialGain: opt.potentialGain,
      priority: opt.priority,
    }));
  }
}

export class BottleneckDetectionBuilder {
  build(
    recommendation: RecommendationIntelligenceOutput,
    decision: DecisionIntelligenceRecommendation,
    execution: ExecutionIntelligenceGuidance
  ): BottleneckDetection[] {
    const bottlenecks: BottleneckDetection[] = [];

    for (const prereq of recommendation.prerequisites.filter((p) => p.mandatory)) {
      bottlenecks.push({
        bottleneckId: `bottleneck.${prereq.prerequisiteId}`,
        label: prereq.label,
        description: prereq.description,
        severity: prereq.mandatory ? "high" : "medium",
        affectedPhaseId: recommendation.implementationRoadmap.phases[0]?.phaseId ?? null,
      });
    }

    if (decision.blockingFactors.length >= 2) {
      bottlenecks.push({
        bottleneckId: "bottleneck.blocking_cluster",
        label: "Blocking factor cluster",
        description: `${decision.blockingFactors.length} blocking factors may delay execution start.`,
        severity: decision.blockingFactors.length >= 3 ? "critical" : "high",
        affectedPhaseId: null,
      });
    }

    if (execution.verificationCheckpoints.length >= 4) {
      bottlenecks.push({
        bottleneckId: "bottleneck.verification_density",
        label: "Verification checkpoint density",
        description: `${execution.verificationCheckpoints.length} checkpoints increase acceptance cycle time.`,
        severity: "medium",
        affectedPhaseId: execution.executionRoadmap.phases.at(-1)?.phaseId ?? null,
      });
    }

    return bottlenecks;
  }
}

export class PatternRecognitionBuilder {
  build(
    recommendation: RecommendationIntelligenceOutput,
    decision: DecisionIntelligenceRecommendation,
    evaluation: OutcomeIntelligenceEvaluation
  ): PatternRecognition[] {
    const patterns: PatternRecognition[] = [];

    patterns.push({
      patternId: "pattern.readiness_decision",
      label: "Readiness-decision alignment",
      description: `Decision readiness "${decision.decisionReadiness.level}" correlates with recommended "${decision.recommendedDecision.replace(/_/g, " ")}".`,
      patternType: "readiness",
      confidence: decision.decisionReadiness.score,
    });

    if (recommendation.prioritizedRecommendations.length >= 3) {
      patterns.push({
        patternId: "pattern.priority_stack",
        label: "Multi-tier priority stack",
        description: `${recommendation.prioritizedRecommendations.length} ranked recommendations form a layered action stack.`,
        patternType: "consistency",
        confidence: recommendation.recommendationScore,
      });
    }

    if (evaluation.goalAchievementAnalysis.achievementScore >= 70) {
      patterns.push({
        patternId: "pattern.achievement_signal",
        label: "Strong achievement signal",
        description: evaluation.goalAchievementAnalysis.summary,
        patternType: "outcome",
        confidence: evaluation.goalAchievementAnalysis.achievementScore,
      });
    }

    if (decision.supportingFactors.length > decision.blockingFactors.length) {
      patterns.push({
        patternId: "pattern.trust_support",
        label: "Supporting factor dominance",
        description: "Supporting factors outweigh blocking factors — favorable trust posture.",
        patternType: "trust",
        confidence: Math.min(95, decision.decisionConfidence.score + 10),
      });
    }

    return patterns;
  }
}

export class RootCauseObservationsBuilder {
  build(decision: DecisionIntelligenceRecommendation): RootCauseObservation[] {
    return decision.blockingFactors.map((factor) => ({
      observationId: `root.${factor.factorId}`,
      label: factor.label,
      description: factor.description,
      linkedFactorId: factor.factorId,
      category:
        factor.category === "evidence"
          ? "evidence"
          : factor.category === "outcome"
            ? "variance"
            : factor.category === "contract"
              ? "approval"
              : "blocking",
    }));
  }
}

export class HiddenDependenciesBuilder {
  build(
    recommendation: RecommendationIntelligenceOutput,
    execution: ExecutionIntelligenceGuidance
  ): HiddenDependency[] {
    const dependencies: HiddenDependency[] = [];

    for (const prereq of recommendation.prerequisites) {
      dependencies.push({
        dependencyId: `dep.${prereq.prerequisiteId}`,
        label: prereq.label,
        description: prereq.description,
        dependsOn: prereq.category,
        category:
          prereq.category === "approval"
            ? "approval"
            : prereq.category === "evidence"
              ? "evidence"
              : prereq.category === "trust"
                ? "trust"
                : "milestone",
      });
    }

    for (const milestone of execution.orderedMilestones.slice(0, 2)) {
      dependencies.push({
        dependencyId: `dep.milestone.${milestone.milestoneId}`,
        label: milestone.title,
        description: `Milestone gate "${milestone.gateType}" linked to stage ${milestone.linkedStageId}.`,
        dependsOn: milestone.linkedStageId,
        category: "milestone",
      });
    }

    return dependencies;
  }
}

export class RecommendationConsistencyBuilder {
  build(
    recommendation: RecommendationIntelligenceOutput,
    decision: DecisionIntelligenceRecommendation
  ): RecommendationConsistencyAnalysis {
    const alignmentNotes: string[] = [];
    const divergenceNotes: string[] = [];

    const topRec = recommendation.prioritizedRecommendations[0];
    if (topRec?.category === "decision") {
      alignmentNotes.push("Top prioritized item aligns with primary decision recommendation.");
    } else {
      divergenceNotes.push("Top prioritized item is not the primary decision action.");
    }

    const fallbackMatches = recommendation.fallbackRecommendations.filter(
      (fb) => fb.recommendationScore >= recommendation.recommendationScore - 15
    );
    if (fallbackMatches.length > 0) {
      divergenceNotes.push(`${fallbackMatches.length} fallback options within scoring range of primary path.`);
    } else {
      alignmentNotes.push("Fallback options clearly separated from primary recommendation score.");
    }

    if (decision.recommendedDecision === "postpone" && recommendation.actionPriority !== "critical") {
      divergenceNotes.push("Postpone decision with non-critical action priority — review alignment.");
    } else {
      alignmentNotes.push("Action priority consistent with decision type.");
    }

    const score = Math.max(
      0,
      Math.min(100, 100 - divergenceNotes.length * 12 + alignmentNotes.length * 8)
    );
    const consistent = divergenceNotes.length === 0;

    return {
      analysisId: `consistency-${recommendation.outputId}`,
      consistent,
      score,
      summary: consistent
        ? "Recommendation stack is internally consistent with decision intelligence."
        : "Minor inconsistencies detected between decision and recommendation layers — advisory review suggested.",
      alignmentNotes,
      divergenceNotes,
    };
  }
}

export class InsightConfidenceBuilder {
  build(input: {
    recommendation: RecommendationIntelligenceOutput;
    consistency: RecommendationConsistencyAnalysis;
    patternCount: number;
  }): InsightConfidence {
    let score = 38;
    score += Math.min(input.recommendation.recommendationConfidence.score * 0.28, 25);
    score += Math.min(input.consistency.score * 0.22, 20);
    score += Math.min(input.patternCount * 4, 12);
    score = Math.min(95, Math.max(35, Math.round(score)));

    const level: InsightConfidenceLevel = score >= 80 ? "high" : score >= 60 ? "medium" : "low";

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "Strong recommendation and consistency signals support confident strategic insights."
          : level === "medium"
            ? "Insights viable; consistency or confidence gaps may require validation."
            : "Limited insight confidence — treat as advisory intelligence only.",
      recommendationConfidenceScore: input.recommendation.recommendationConfidence.score,
      structuralInsightScore: Math.min(100, input.consistency.score + input.patternCount * 5),
    };
  }
}

export function createStrategicInsightsBuilder(): StrategicInsightsBuilder {
  return new StrategicInsightsBuilder();
}
export function createOperationalInsightsBuilder(): OperationalInsightsBuilder {
  return new OperationalInsightsBuilder();
}
export function createRiskInsightsBuilder(): RiskInsightsBuilder {
  return new RiskInsightsBuilder();
}
export function createOpportunityInsightsBuilder(): OpportunityInsightsBuilder {
  return new OpportunityInsightsBuilder();
}
export function createBottleneckDetectionBuilder(): BottleneckDetectionBuilder {
  return new BottleneckDetectionBuilder();
}
export function createPatternRecognitionBuilder(): PatternRecognitionBuilder {
  return new PatternRecognitionBuilder();
}
export function createRootCauseObservationsBuilder(): RootCauseObservationsBuilder {
  return new RootCauseObservationsBuilder();
}
export function createHiddenDependenciesBuilder(): HiddenDependenciesBuilder {
  return new HiddenDependenciesBuilder();
}
export function createRecommendationConsistencyBuilder(): RecommendationConsistencyBuilder {
  return new RecommendationConsistencyBuilder();
}
export function createInsightConfidenceBuilder(): InsightConfidenceBuilder {
  return new InsightConfidenceBuilder();
}
