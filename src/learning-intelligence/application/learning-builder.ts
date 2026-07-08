import type { StrategyIntelligenceOutput } from "../../strategy-intelligence/domain/strategy-context.js";
import type { PredictionIntelligenceOutput } from "../../prediction-intelligence/domain/prediction-context.js";
import type { InsightIntelligenceOutput } from "../../insight-intelligence/domain/insight-context.js";
import type { OutcomeIntelligenceEvaluation } from "../../outcome-intelligence/domain/outcome-context.js";
import type {
  LearningInsight,
  KnowledgeGap,
  LessonLearned,
  AdaptationRecommendation,
  StrategyAdjustment,
  ContinuousImprovementCycle,
  FeedbackLoop,
  LearningPattern,
  SkillDevelopmentRecommendation,
  PerformanceImprovementOpportunity,
  LearningConfidence,
} from "../domain/learning-context.js";
import type { LearningConfidenceLevel } from "../domain/learning-intelligence-schema.js";

export class LearningInsightsBuilder {
  build(strategy: StrategyIntelligenceOutput, prediction: PredictionIntelligenceOutput): LearningInsight[] {
    const insights: LearningInsight[] = [
      {
        insightId: "learn.strategy_objectives",
        title: "Strategic objective alignment",
        description: `${strategy.strategicObjectives.length} objectives mapped to ${prediction.successProbabilityProjection.projectedScore}% projected success.`,
        category: "strategy",
        impactWeight: 0.3,
      },
      {
        insightId: "learn.prediction_trajectory",
        title: "Success trajectory",
        description: prediction.successProbabilityProjection.rationale,
        category: "outcome",
        impactWeight: 0.25,
      },
    ];

    if (strategy.contingencyStrategies.length > 0) {
      insights.push({
        insightId: "learn.contingency_preparedness",
        title: "Contingency preparedness",
        description: `${strategy.contingencyStrategies.length} contingency strategies inform adaptive learning.`,
        category: "adaptation",
        impactWeight: 0.2,
      });
    }

    return insights;
  }
}

export class KnowledgeGapsBuilder {
  build(insight: InsightIntelligenceOutput, evaluation: OutcomeIntelligenceEvaluation): KnowledgeGap[] {
    const gaps: KnowledgeGap[] = [];

    for (const root of insight.rootCauseObservations.slice(0, 3)) {
      gaps.push({
        gapId: `gap.${root.observationId}`,
        label: root.label,
        description: root.description,
        severity: root.category === "evidence" ? "high" : "medium",
        category:
          root.category === "evidence"
            ? "evidence"
            : root.category === "approval"
              ? "process"
              : "trust",
      });
    }

    if (evaluation.goalAchievementAnalysis.gapCount >= 1) {
      gaps.push({
        gapId: "gap.achievement",
        label: "Goal achievement gap",
        description: evaluation.goalAchievementAnalysis.summary,
        severity: evaluation.goalAchievementAnalysis.gapCount >= 2 ? "high" : "medium",
        category: "skill",
      });
    }

    return gaps;
  }
}

export class LessonsLearnedBuilder {
  build(strategy: StrategyIntelligenceOutput, evaluation: OutcomeIntelligenceEvaluation): LessonLearned[] {
    const lessons: LessonLearned[] = [];

    for (const phase of strategy.longTermRoadmap.phases.slice(0, 3)) {
      lessons.push({
        lessonId: `lesson.${phase.phaseId}`,
        title: phase.title,
        description: phase.description,
        sourcePhase: phase.phaseId,
        applicability: `Apply to future ${phase.horizonDays}-day horizon cycles.`,
      });
    }

    for (const improvement of evaluation.improvementRecommendations.slice(0, 2)) {
      lessons.push({
        lessonId: `lesson.${improvement.recommendationId}`,
        title: improvement.title,
        description: improvement.description,
        sourcePhase: "outcome_evaluation",
        applicability: `${improvement.category} improvement for subsequent actions.`,
      });
    }

    return lessons;
  }
}

export class AdaptationRecommendationsBuilder {
  build(strategy: StrategyIntelligenceOutput, prediction: PredictionIntelligenceOutput): AdaptationRecommendation[] {
    return strategy.contingencyStrategies.map((contingency) => ({
      recommendationId: contingency.contingencyId,
      title: contingency.trigger,
      description: contingency.response,
      trigger: contingency.trigger,
      priority: contingency.priority,
    })).concat(
      prediction.whatIfAnalysis.slice(0, 2).map((whatIf) => ({
        recommendationId: whatIf.analysisId,
        title: whatIf.variant,
        description: whatIf.description,
        trigger: `What-if: ${whatIf.variant}`,
        priority: (whatIf.successDelta >= 8 ? "high" : "medium") as AdaptationRecommendation["priority"],
      }))
    );
  }
}

export class StrategyAdjustmentsBuilder {
  build(strategy: StrategyIntelligenceOutput): StrategyAdjustment[] {
    return strategy.priorityOptimizations.slice(0, 4).map((opt) => ({
      adjustmentId: `adjust.${opt.optimizationId}`,
      title: opt.title,
      description: opt.description,
      adjustsObjectiveId: strategy.strategicObjectives[0]?.objectiveId ?? null,
      expectedBenefit: `Impact score ${opt.impactScore}/100 from priority re-ranking.`,
    }));
  }
}

export class ContinuousImprovementCyclesBuilder {
  build(): ContinuousImprovementCycle[] {
    return [
      {
        cycleId: "cic.observe",
        phase: "observe",
        title: "Observe execution signals",
        description: "Collect outcome, trust, and milestone feedback from upstream intelligence chain.",
        order: 1,
      },
      {
        cycleId: "cic.analyze",
        phase: "analyze",
        title: "Analyze patterns and gaps",
        description: "Identify knowledge gaps, root causes, and learning patterns.",
        order: 2,
      },
      {
        cycleId: "cic.adapt",
        phase: "adapt",
        title: "Adapt strategy and priorities",
        description: "Apply adaptation recommendations and strategy adjustments.",
        order: 3,
      },
      {
        cycleId: "cic.validate",
        phase: "validate",
        title: "Validate improvement",
        description: "Measure against success probability and achievement projections.",
        order: 4,
      },
    ];
  }
}

export class FeedbackLoopsBuilder {
  build(strategy: StrategyIntelligenceOutput): FeedbackLoop[] {
    return [
      {
        loopId: "loop.milestone",
        label: "Milestone feedback",
        description: "Capture completion and quality signals at each roadmap milestone.",
        frequency: "per_milestone",
        metric: "Phase completion rate",
      },
      {
        loopId: "loop.risk",
        label: "Risk evolution feedback",
        description: "Monitor risk level changes against contingency triggers.",
        frequency: "per_phase",
        metric: "Risk trajectory",
      },
      {
        loopId: "loop.learning",
        label: "Continuous learning feedback",
        description: "Integrate lessons learned into priority optimization cycle.",
        frequency: "continuous",
        metric: `${strategy.priorityOptimizations.length} active priorities`,
      },
    ];
  }
}

export class LearningPatternsBuilder {
  build(insight: InsightIntelligenceOutput, prediction: PredictionIntelligenceOutput): LearningPattern[] {
    const mapped = insight.patternRecognitions.map((pattern): LearningPattern => ({
      patternId: pattern.patternId,
      label: pattern.label,
      description: pattern.description,
      patternType:
        pattern.patternType === "outcome"
          ? "success"
          : pattern.patternType === "trust"
            ? "risk"
            : pattern.patternType === "consistency"
              ? "efficiency"
              : "adaptation",
      confidence: pattern.confidence,
    }));
    return mapped.concat([
      {
        patternId: "pattern.success_projection",
        label: "Success projection pattern",
        description: prediction.successProbabilityProjection.rationale,
        patternType: "success" as const,
        confidence: prediction.successProbabilityProjection.projectedScore,
      },
    ]);
  }
}

export class SkillDevelopmentRecommendationsBuilder {
  build(evaluation: OutcomeIntelligenceEvaluation, gaps: KnowledgeGap[]): SkillDevelopmentRecommendation[] {
    const recommendations: SkillDevelopmentRecommendation[] = [];

    for (const gap of gaps.filter((g) => g.category === "skill" || g.category === "evidence")) {
      recommendations.push({
        skillId: `skill.${gap.gapId}`,
        title: `Develop: ${gap.label}`,
        description: gap.description,
        priority: gap.severity === "high" ? "high" : "medium",
        developmentPath: "Targeted practice through milestone-verified execution.",
      });
    }

    if (evaluation.qualityAssessment.score < 80) {
      recommendations.push({
        skillId: "skill.quality",
        title: "Quality assurance development",
        description: evaluation.qualityAssessment.summary,
        priority: "medium",
        developmentPath: "Enhanced verification checkpoints and evidence collection.",
      });
    }

    return recommendations;
  }
}

export class PerformanceImprovementOpportunitiesBuilder {
  build(
    strategy: StrategyIntelligenceOutput,
    evaluation: OutcomeIntelligenceEvaluation
  ): PerformanceImprovementOpportunity[] {
    const opportunities: PerformanceImprovementOpportunity[] = [];

    for (const entry of strategy.strategicOpportunityMatrix.filter((e) => e.quadrant === "pursue")) {
      opportunities.push({
        opportunityId: entry.entryId,
        title: entry.title,
        description: entry.description,
        projectedGain: `${entry.impact} impact / ${entry.effort} effort`,
        priority: entry.impact === "high" ? "high" : "medium",
      });
    }

    for (const improvement of evaluation.improvementRecommendations.slice(0, 2)) {
      opportunities.push({
        opportunityId: improvement.recommendationId,
        title: improvement.title,
        description: improvement.description,
        projectedGain: `${improvement.priority} priority ${improvement.category} gain`,
        priority: improvement.priority === "high" ? "high" : "medium",
      });
    }

    return opportunities;
  }
}

export class LearningConfidenceBuilder {
  build(input: {
    strategy: StrategyIntelligenceOutput;
    insightCount: number;
    gapCount: number;
  }): LearningConfidence {
    let score = 38;
    score += Math.min(input.strategy.strategicConfidence.score * 0.28, 24);
    score += Math.min(input.insightCount * 5, 15);
    score -= Math.min(input.gapCount * 4, 16);
    score = Math.min(95, Math.max(35, Math.round(score)));

    const level: LearningConfidenceLevel = score >= 80 ? "high" : score >= 60 ? "medium" : "low";

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "Strong strategic signals support confident learning and adaptation intelligence."
          : level === "medium"
            ? "Learning viable; knowledge gaps may require targeted development."
            : "Limited learning confidence — treat recommendations as advisory only.",
      strategicConfidenceScore: input.strategy.strategicConfidence.score,
      structuralLearningScore: Math.min(100, score + input.insightCount * 4 - input.gapCount * 2),
    };
  }
}

export function createLearningInsightsBuilder(): LearningInsightsBuilder {
  return new LearningInsightsBuilder();
}
export function createKnowledgeGapsBuilder(): KnowledgeGapsBuilder {
  return new KnowledgeGapsBuilder();
}
export function createLessonsLearnedBuilder(): LessonsLearnedBuilder {
  return new LessonsLearnedBuilder();
}
export function createAdaptationRecommendationsBuilder(): AdaptationRecommendationsBuilder {
  return new AdaptationRecommendationsBuilder();
}
export function createStrategyAdjustmentsBuilder(): StrategyAdjustmentsBuilder {
  return new StrategyAdjustmentsBuilder();
}
export function createContinuousImprovementCyclesBuilder(): ContinuousImprovementCyclesBuilder {
  return new ContinuousImprovementCyclesBuilder();
}
export function createFeedbackLoopsBuilder(): FeedbackLoopsBuilder {
  return new FeedbackLoopsBuilder();
}
export function createLearningPatternsBuilder(): LearningPatternsBuilder {
  return new LearningPatternsBuilder();
}
export function createSkillDevelopmentRecommendationsBuilder(): SkillDevelopmentRecommendationsBuilder {
  return new SkillDevelopmentRecommendationsBuilder();
}
export function createPerformanceImprovementOpportunitiesBuilder(): PerformanceImprovementOpportunitiesBuilder {
  return new PerformanceImprovementOpportunitiesBuilder();
}
export function createLearningConfidenceBuilder(): LearningConfidenceBuilder {
  return new LearningConfidenceBuilder();
}
