import type { PredictionExplanation } from "../domain/prediction-context.js";
import type {
  SuccessProbabilityProjection,
  TimelineForecast,
  RiskEvolutionForecast,
  TrustEvolutionForecast,
  ScenarioComparison,
  WhatIfAnalysis,
} from "../domain/prediction-context.js";

export class PredictionExplanationBuilder {
  build(input: {
    outputId: string;
    goal: string;
    success: SuccessProbabilityProjection;
    timeline: TimelineForecast;
    risk: RiskEvolutionForecast;
    trust: TrustEvolutionForecast;
    scenarios: ScenarioComparison[];
    whatIf: WhatIfAnalysis[];
    predictionConfidenceScore: number;
  }): PredictionExplanation {
    const recommended = input.scenarios.find((s) => s.recommended);

    return {
      explanationId: `explanation-${input.outputId}`,
      headline: `Future projections for "${input.goal}"`,
      summary: `Success projected at ${input.success.projectedScore}% over ${input.success.horizonDays} days (confidence ${input.predictionConfidenceScore}/100) — read-only prediction intelligence from the complete C1–C11 chain.`,
      successSummary: input.success.rationale,
      timelineSummary: input.timeline.summary,
      riskSummary: input.risk.summary,
      trustSummary: input.trust.summary,
      scenarioSummary: `${input.scenarios.length} scenarios compared; primary recommendation: ${recommended?.scenarioLabel ?? "primary path"}. ${input.whatIf.length} what-if variants analyzed.`,
    };
  }
}

export function createPredictionExplanationBuilder(): PredictionExplanationBuilder {
  return new PredictionExplanationBuilder();
}
