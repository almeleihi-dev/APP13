import type { ExecutionIntelligenceGuidance } from "../../execution-intelligence/domain/execution-context.js";
import type {
  OutcomeQualityAssessment,
  VarianceAnalysis,
  ImprovementRecommendation,
  LessonLearned,
  FutureOptimization,
  CompletionOutcomeModel,
  GoalAchievementAnalysis,
} from "../domain/outcome-context.js";
import type { OutcomeQualityLevel } from "../domain/outcome-intelligence-schema.js";
import { LESSON_TEMPLATES, OPTIMIZATION_TEMPLATES } from "../domain/outcome-reference-values.js";
import type { OutcomeScenarioId } from "../domain/outcome-intelligence-schema.js";

export class OutcomeQualityAssessor {
  build(input: {
    completionModel: CompletionOutcomeModel;
    goalAchievement: GoalAchievementAnalysis;
    execution: ExecutionIntelligenceGuidance;
  }): OutcomeQualityAssessment {
    const completenessScore = input.completionModel.projectedCompletionPercent;
    const achievementScore = input.goalAchievement.achievementScore;
    const checkpointCoverage = Math.min(
      100,
      (input.execution.verificationCheckpoints.length +
        input.execution.qualityCheckpoints.length) *
        8
    );

    const score = Math.round(
      completenessScore * 0.4 + achievementScore * 0.4 + checkpointCoverage * 0.2
    );

    const level: OutcomeQualityLevel =
      score >= 85 ? "excellent" : score >= 70 ? "strong" : score >= 55 ? "acceptable" : "needs_improvement";

    return {
      assessmentId: `quality-${input.completionModel.modelId}`,
      level,
      score,
      dimensions: [
        {
          dimension: "structural_completeness",
          score: completenessScore,
          note: "Based on plan, checkpoint, and criteria mapping completeness.",
        },
        {
          dimension: "goal_alignment",
          score: achievementScore,
          note: "Based on projected success criteria pass rate.",
        },
        {
          dimension: "checkpoint_coverage",
          score: checkpointCoverage,
          note: "Verification and quality gate density from execution guidance.",
        },
      ],
      summary: `Outcome quality assessed as ${level} (${score}/100) — read-only projection, not live execution results.`,
    };
  }
}

export class VarianceAnalyzer {
  build(input: {
    planId: string;
    completionModel: CompletionOutcomeModel;
    execution: ExecutionIntelligenceGuidance;
  }): VarianceAnalysis {
    const expectedCompletionPercent = 100;
    const actualReadyPercent = input.completionModel.projectedCompletionPercent;
    const variancePercent = actualReadyPercent - expectedCompletionPercent;

    let varianceDirection: VarianceAnalysis["varianceDirection"];
    if (Math.abs(variancePercent) <= 5) varianceDirection = "on_target";
    else if (variancePercent < 0) varianceDirection = "under";
    else varianceDirection = "over";

    const factors = [
      {
        factorId: "factor.milestones",
        label: "Milestone coverage",
        expectedContribution: 100,
        actualReadyContribution: Math.min(
          100,
          input.execution.orderedMilestones.length * (100 / Math.max(input.execution.orderedMilestones.length, 1))
        ),
      },
      {
        factorId: "factor.tasks",
        label: "Task sequencing completeness",
        expectedContribution: 100,
        actualReadyContribution: Math.min(
          100,
          (input.execution.taskSequencing.length / Math.max(input.execution.progressModel.totalTasks, 1)) * 100
        ),
      },
      {
        factorId: "factor.evidence",
        label: "Evidence gate readiness",
        expectedContribution: 100,
        actualReadyContribution: Math.min(
          100,
          input.execution.stageEvidence.reduce((sum, s) => sum + s.evidenceItems.length, 0) * 10
        ),
      },
      {
        factorId: "factor.checkpoints",
        label: "Checkpoint satisfaction",
        expectedContribution: 100,
        actualReadyContribution: Math.min(
          100,
          (input.execution.verificationCheckpoints.length +
            input.execution.qualityCheckpoints.length) *
            12
        ),
      },
    ].map((f) => ({
      ...f,
      variance: Math.round((f.actualReadyContribution - f.expectedContribution) * 10) / 10,
    }));

    return {
      analysisId: `variance-${input.planId}`,
      expectedCompletionPercent,
      actualReadyPercent,
      variancePercent: Math.round(variancePercent * 10) / 10,
      varianceDirection,
      factors,
      summary: `Expected 100% structural completion vs ${actualReadyPercent}% actual-ready projection (${varianceDirection} target by ${Math.abs(variancePercent).toFixed(1)} points).`,
    };
  }
}

export class ImprovementRecommendationsBuilder {
  build(input: {
    qualityAssessment: OutcomeQualityAssessment;
    varianceAnalysis: VarianceAnalysis;
    goalAchievement: GoalAchievementAnalysis;
  }): ImprovementRecommendation[] {
    const recommendations: ImprovementRecommendation[] = [];

    if (input.qualityAssessment.level === "needs_improvement" || input.qualityAssessment.level === "acceptable") {
      recommendations.push({
        recommendationId: "improve.quality",
        category: "quality",
        priority: "high",
        title: "Strengthen acceptance criteria mapping",
        description: "Ensure every mandatory outcome has a linked quality checkpoint and evidence requirement.",
      });
    }

    if (input.varianceAnalysis.varianceDirection === "under") {
      recommendations.push({
        recommendationId: "improve.evidence",
        category: "evidence",
        priority: "medium",
        title: "Increase evidence gate coverage",
        description: "Add stage-level evidence items for milestones with zero mapped evidence.",
      });
    }

    if (input.goalAchievement.gapCount > 0) {
      recommendations.push({
        recommendationId: "improve.risk",
        category: "risk",
        priority: "high",
        title: "Address projected criteria gaps",
        description: input.goalAchievement.gaps.join(" "),
      });
    }

    recommendations.push({
      recommendationId: "improve.efficiency",
      category: "efficiency",
      priority: "low",
      title: "Review parallel task opportunities",
      description: "Identify parallel-capable tasks not grouped in execution sequencing for future optimization.",
    });

    return recommendations;
  }
}

export class LessonsLearnedBuilder {
  build(scenarioId: OutcomeScenarioId | null): LessonLearned[] {
    return LESSON_TEMPLATES.filter(
      (lesson) =>
        !scenarioId ||
        (lesson.applicableScenarios as readonly string[]).includes(scenarioId)
    ).map((lesson, index) => ({
      lessonId: `lesson.${index}`,
      category: lesson.category,
      insight: lesson.insight,
      applicableScenarios: [...lesson.applicableScenarios],
    }));
  }
}

export class FutureOptimizationBuilder {
  build(execution: ExecutionIntelligenceGuidance): FutureOptimization[] {
    const optimizations: FutureOptimization[] = OPTIMIZATION_TEMPLATES.map((opt, index) => ({
      optimizationId: `opt.${index}`,
      area: opt.area,
      suggestion: opt.suggestion,
      expectedBenefit: opt.expectedBenefit,
    }));

    if (execution.orderedMilestones.length > 5) {
      optimizations.push({
        optimizationId: "opt.milestone_consolidation",
        area: "milestone_structure",
        suggestion: "Consider consolidating adjacent milestones with shared evidence requirements.",
        expectedBenefit: "Reduced acceptance overhead while preserving audit trail.",
      });
    }

    return optimizations;
  }
}

export function createOutcomeQualityAssessor(): OutcomeQualityAssessor {
  return new OutcomeQualityAssessor();
}
export function createVarianceAnalyzer(): VarianceAnalyzer {
  return new VarianceAnalyzer();
}
export function createImprovementRecommendationsBuilder(): ImprovementRecommendationsBuilder {
  return new ImprovementRecommendationsBuilder();
}
export function createLessonsLearnedBuilder(): LessonsLearnedBuilder {
  return new LessonsLearnedBuilder();
}
export function createFutureOptimizationBuilder(): FutureOptimizationBuilder {
  return new FutureOptimizationBuilder();
}
