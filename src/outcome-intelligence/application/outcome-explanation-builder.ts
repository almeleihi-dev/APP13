import type {
  OutcomeConfidence,
  OutcomeExplanation,
} from "../domain/outcome-context.js";
import type { OutcomeConfidenceLevel } from "../domain/outcome-intelligence-schema.js";
import type { ExecutionIntelligenceGuidance } from "../../execution-intelligence/domain/execution-context.js";
import type {
  OutcomeQualityAssessment,
  VarianceAnalysis,
  GoalAchievementAnalysis,
} from "../domain/outcome-context.js";

export class OutcomeConfidenceBuilder {
  build(input: {
    execution: ExecutionIntelligenceGuidance;
    qualityAssessment: OutcomeQualityAssessment;
    expectedOutcomeCount: number;
  }): OutcomeConfidence {
    let score = 45;
    score += Math.min(input.execution.confidence.score * 0.25, 20);
    score += Math.min(input.qualityAssessment.score * 0.2, 18);
    score += Math.min(input.expectedOutcomeCount * 3, 12);
    score += input.execution.taskSequencing.length >= 5 ? 5 : 0;
    score = Math.min(95, Math.max(40, Math.round(score)));

    const level: OutcomeConfidenceLevel = score >= 80 ? "high" : score >= 60 ? "medium" : "low";
    const structuralCompleteness = Math.min(
      100,
      input.expectedOutcomeCount * 10 + input.execution.orderedMilestones.length * 8
    );

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "Strong upstream execution guidance and outcome mapping support confident outcome evaluation."
          : level === "medium"
            ? "Outcome evaluation viable; projections based on structural readiness model."
            : "Limited structural data — treat outcome evaluation as indicative only.",
      executionConfidenceScore: input.execution.confidence.score,
      structuralCompletenessScore: structuralCompleteness,
    };
  }
}

export class OutcomeExplanationBuilder {
  build(input: {
    evaluationId: string;
    goal: string;
    qualityAssessment: OutcomeQualityAssessment;
    varianceAnalysis: VarianceAnalysis;
    goalAchievement: GoalAchievementAnalysis;
    improvementCount: number;
    lessonCount: number;
    optimizationCount: number;
  }): OutcomeExplanation {
    return {
      explanationId: `explanation-${input.evaluationId}`,
      headline: `Outcome evaluation for "${input.goal}"`,
      summary: `Read-only outcome intelligence projecting ${input.qualityAssessment.score}/100 quality with ${input.goalAchievement.achievementScore}% goal achievement — closes the AN ACT intelligence loop without mutating execution state.`,
      qualityRationale: input.qualityAssessment.summary,
      varianceRationale: input.varianceAnalysis.summary,
      achievementRationale: input.goalAchievement.summary,
      improvementSummary: `${input.improvementCount} improvement recommendations derived from quality, variance, and gap analysis.`,
      lessonsSummary: `${input.lessonCount} lessons learned and ${input.optimizationCount} future optimization suggestions for recurring engagements.`,
    };
  }
}

export function createOutcomeConfidenceBuilder(): OutcomeConfidenceBuilder {
  return new OutcomeConfidenceBuilder();
}
export function createOutcomeExplanationBuilder(): OutcomeExplanationBuilder {
  return new OutcomeExplanationBuilder();
}
