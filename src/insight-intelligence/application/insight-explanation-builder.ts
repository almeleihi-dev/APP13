import type { InsightExplanation } from "../domain/insight-context.js";
import type {
  StrategicInsight,
  OperationalInsight,
  RiskInsight,
  OpportunityInsight,
  PatternRecognition,
  BottleneckDetection,
  RecommendationConsistencyAnalysis,
} from "../domain/insight-context.js";

export class InsightExplanationBuilder {
  build(input: {
    outputId: string;
    goal: string;
    strategic: StrategicInsight[];
    operational: OperationalInsight[];
    risks: RiskInsight[];
    opportunities: OpportunityInsight[];
    patterns: PatternRecognition[];
    bottlenecks: BottleneckDetection[];
    consistency: RecommendationConsistencyAnalysis;
    insightConfidenceScore: number;
  }): InsightExplanation {
    return {
      explanationId: `explanation-${input.outputId}`,
      headline: `Strategic and operational insights for "${input.goal}"`,
      summary: `${input.strategic.length} strategic, ${input.operational.length} operational insights (confidence ${input.insightConfidenceScore}/100) — read-only insight intelligence from the complete C1–C10 chain.`,
      strategicSummary:
        input.strategic.length > 0
          ? `Key strategic themes: ${input.strategic.map((s) => s.title).join(", ")}.`
          : "No strategic insights generated.",
      operationalSummary:
        input.operational.length > 0
          ? `${input.operational.length} operational focus areas across roadmap and priorities.`
          : "Limited operational insight coverage.",
      riskSummary:
        input.risks.length > 0
          ? `${input.risks.length} risk signals; ${input.bottlenecks.length} bottlenecks detected.`
          : "No significant risk signals identified.",
      opportunitySummary:
        input.opportunities.length > 0
          ? `${input.opportunities.length} optimization and opportunity insights available.`
          : "No opportunity insights identified.",
      patternSummary:
        input.patterns.length > 0
          ? `${input.patterns.length} patterns recognized; consistency score ${input.consistency.score}/100.`
          : "Insufficient data for pattern recognition.",
    };
  }
}

export function createInsightExplanationBuilder(): InsightExplanationBuilder {
  return new InsightExplanationBuilder();
}
