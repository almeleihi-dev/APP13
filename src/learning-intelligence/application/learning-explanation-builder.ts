import type { LearningExplanation } from "../domain/learning-context.js";
import type {
  LearningInsight,
  KnowledgeGap,
  AdaptationRecommendation,
  ContinuousImprovementCycle,
  LearningPattern,
  PerformanceImprovementOpportunity,
} from "../domain/learning-context.js";

export class LearningExplanationBuilder {
  build(input: {
    outputId: string;
    goal: string;
    insights: LearningInsight[];
    gaps: KnowledgeGap[];
    adaptations: AdaptationRecommendation[];
    cycles: ContinuousImprovementCycle[];
    patterns: LearningPattern[];
    improvements: PerformanceImprovementOpportunity[];
    learningConfidenceScore: number;
  }): LearningExplanation {
    return {
      explanationId: `explanation-${input.outputId}`,
      headline: `Learning and adaptation intelligence for "${input.goal}"`,
      summary: `${input.insights.length} learning insights, ${input.gaps.length} knowledge gaps (confidence ${input.learningConfidenceScore}/100) — read-only learning intelligence from the complete C1–C13 chain.`,
      learningSummary: `Key themes: ${input.insights.map((i) => i.title).join(", ")}.`,
      adaptationSummary: `${input.adaptations.length} adaptation recommendations from contingency and what-if signals.`,
      improvementSummary: `${input.cycles.length}-phase continuous improvement cycle; ${input.improvements.length} performance opportunities.`,
      patternSummary: `${input.patterns.length} learning patterns recognized for future action cycles.`,
    };
  }
}

export function createLearningExplanationBuilder(): LearningExplanationBuilder {
  return new LearningExplanationBuilder();
}
