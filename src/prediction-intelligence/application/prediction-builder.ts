import type { InsightIntelligenceOutput } from "../../insight-intelligence/domain/insight-context.js";
import type { RecommendationIntelligenceOutput } from "../../recommendation-intelligence/domain/recommendation-context.js";
import type { DecisionIntelligenceRecommendation } from "../../decision-intelligence/domain/decision-context.js";
import type { OutcomeIntelligenceEvaluation } from "../../outcome-intelligence/domain/outcome-context.js";
import type { ExecutionIntelligenceGuidance } from "../../execution-intelligence/domain/execution-context.js";
import type {
  SuccessProbabilityProjection,
  TimelineForecast,
  RiskEvolutionForecast,
  TrustEvolutionForecast,
  CostProjection,
  OutcomeProjection,
  OpportunityForecast,
  ScenarioComparison,
  WhatIfAnalysis,
  PredictionConfidence,
} from "../domain/prediction-context.js";
import type {
  PredictionConfidenceLevel,
  PredictionTrajectoryLevel,
} from "../domain/prediction-intelligence-schema.js";
import { PREDICTION_INTELLIGENCE_FIXED_TIMESTAMP } from "../domain/prediction-intelligence-schema.js";

const HORIZON_DAYS = 30;

function trajectoryFromDelta(delta: number): PredictionTrajectoryLevel {
  if (delta >= 5) return "improving";
  if (delta <= -5) return "declining";
  return "stable";
}

export class SuccessProbabilityProjectionBuilder {
  build(
    insight: InsightIntelligenceOutput,
    recommendation: RecommendationIntelligenceOutput
  ): SuccessProbabilityProjection {
    const baseline = recommendation.successProbability.score;
    const insightBoost = Math.round(insight.insightConfidence.score * 0.08);
    const bottleneckPenalty = insight.bottleneckDetections.length * 3;
    const projected = Math.max(20, Math.min(95, baseline + insightBoost - bottleneckPenalty));
    const delta = projected - baseline;

    return {
      projectionId: `success-proj-${insight.outputId}`,
      baselineScore: baseline,
      projectedScore: projected,
      horizonDays: HORIZON_DAYS,
      trajectory: trajectoryFromDelta(delta),
      rationale: `Projected success ${projected}% over ${HORIZON_DAYS} days from insight confidence and bottleneck signals — advisory only.`,
    };
  }
}

export class TimelineForecastBuilder {
  build(
    insight: InsightIntelligenceOutput,
    execution: ExecutionIntelligenceGuidance
  ): TimelineForecast {
    const minHours = execution.executionRoadmap.totalMinHours;
    const maxHours = execution.executionRoadmap.totalMaxHours;
    const delayRisk = Math.min(40, insight.bottleneckDetections.length * 8 + insight.hiddenDependencies.length * 2);
    const projectedDate = new Date(PREDICTION_INTELLIGENCE_FIXED_TIMESTAMP);
    projectedDate.setDate(projectedDate.getDate() + Math.ceil(maxHours / 8));

    return {
      forecastId: `timeline-${insight.outputId}`,
      minHours,
      maxHours,
      projectedCompletionDate: projectedDate.toISOString(),
      delayRiskPercent: delayRisk,
      summary: `${minHours}–${maxHours} hour window; ${delayRisk}% delay risk from ${insight.bottleneckDetections.length} bottlenecks.`,
    };
  }
}

export class RiskEvolutionForecastBuilder {
  build(insight: InsightIntelligenceOutput): RiskEvolutionForecast {
    const highRisks = insight.riskInsights.filter((r) => r.severity === "high" || r.severity === "critical").length;
    const current: "low" | "medium" | "high" =
      highRisks >= 2 ? "high" : highRisks >= 1 ? "medium" : "low";
    const projected: "low" | "medium" | "high" =
      insight.bottleneckDetections.length >= 3
        ? "high"
        : insight.bottleneckDetections.length >= 1
          ? "medium"
          : current;
    const delta =
      projected === "high" && current !== "high" ? -10 : projected === "low" && current !== "low" ? 10 : 0;

    return {
      forecastId: `risk-evo-${insight.outputId}`,
      currentRiskLevel: current,
      projectedRiskLevel: projected,
      horizonDays: HORIZON_DAYS,
      trajectory: trajectoryFromDelta(delta),
      summary: `Risk evolution from ${current} to ${projected} over ${HORIZON_DAYS} days based on ${insight.riskInsights.length} risk signals.`,
    };
  }
}

export class TrustEvolutionForecastBuilder {
  build(
    insight: InsightIntelligenceOutput,
    decision: DecisionIntelligenceRecommendation
  ): TrustEvolutionForecast {
    const currentScore = decision.decisionConfidence.trustConfidenceScore;
    const projected = Math.max(
      30,
      Math.min(
        95,
        currentScore +
          (insight.recommendationConsistencyAnalysis.consistent ? 8 : -5) -
          insight.rootCauseObservations.length * 2
      )
    );
    const delta = projected - currentScore;
    const band = (score: number) =>
      score >= 80 ? "strong" : score >= 65 ? "established" : score >= 50 ? "developing" : "emerging";

    return {
      forecastId: `trust-evo-${insight.outputId}`,
      currentTrustBand: band(currentScore),
      projectedTrustBand: band(projected),
      projectedScore: projected,
      horizonDays: HORIZON_DAYS,
      trajectory: trajectoryFromDelta(delta),
      summary: `Trust band projected ${band(currentScore)} → ${band(projected)} (${projected} points) over ${HORIZON_DAYS} days.`,
    };
  }
}

export class CostProjectionBuilder {
  build(decision: DecisionIntelligenceRecommendation): CostProjection {
    const impact = decision.expectedImpactAnalysis.financialImpact;
    const match = impact.match(/(\d+)–(\d+)\s+(\w+)/);
    const minAmount = match ? Number(match[1]) : 0;
    const maxAmount = match ? Number(match[2]) : 0;
    const currency = match ? match[3] : "SAR";
    const variance = decision.blockingFactors.length >= 2 ? 15 : decision.blockingFactors.length >= 1 ? 8 : 4;

    return {
      projectionId: `cost-${decision.recommendationId}`,
      minAmount,
      maxAmount,
      currency,
      variancePercent: variance,
      summary: `Cost range ${minAmount}–${maxAmount} ${currency} with ±${variance}% variance from blocking factor exposure — recommendation only.`,
    };
  }
}

export class OutcomeProjectionBuilder {
  build(evaluation: OutcomeIntelligenceEvaluation): OutcomeProjection {
    return {
      projectionId: `outcome-${evaluation.evaluationId}`,
      achievementPercent: evaluation.goalAchievementAnalysis.achievementScore,
      qualityScore: evaluation.qualityAssessment.score,
      completionPercent: evaluation.completionOutcomeModel.projectedCompletionPercent,
      summary: evaluation.goalAchievementAnalysis.summary,
    };
  }
}

export class OpportunityForecastBuilder {
  build(insight: InsightIntelligenceOutput): OpportunityForecast[] {
    return insight.opportunityInsights.slice(0, 4).map((opp, index) => ({
      forecastId: `opp-forecast.${opp.opportunityId}`,
      title: opp.title,
      projectedGain: opp.potentialGain,
      probabilityPercent: Math.max(40, 75 - index * 10 - insight.riskInsights.length * 3),
      horizonDays: HORIZON_DAYS,
    }));
  }
}

export class ScenarioComparisonBuilder {
  build(input: {
    successProjection: SuccessProbabilityProjection;
    timeline: TimelineForecast;
    riskForecast: RiskEvolutionForecast;
    decision: DecisionIntelligenceRecommendation;
  }): ScenarioComparison[] {
    const base = input.successProjection.projectedScore;
    return [
      {
        comparisonId: "scenario.primary",
        scenarioLabel: "Primary path (current decision)",
        successProbability: base,
        timelineHours: input.timeline.maxHours,
        riskLevel: input.riskForecast.projectedRiskLevel,
        recommended: true,
      },
      {
        comparisonId: "scenario.accelerated",
        scenarioLabel: "Accelerated execution",
        successProbability: Math.max(30, base - 8),
        timelineHours: Math.round(input.timeline.minHours * 0.85),
        riskLevel: "medium",
        recommended: false,
      },
      {
        comparisonId: "scenario.cautious",
        scenarioLabel: "Cautious with enhanced gates",
        successProbability: Math.min(95, base + 10),
        timelineHours: Math.round(input.timeline.maxHours * 1.2),
        riskLevel: "low",
        recommended: input.decision.recommendedDecision === "proceed_with_conditions",
      },
      {
        comparisonId: "scenario.deferred",
        scenarioLabel: "Deferred start",
        successProbability: Math.max(25, base - 15),
        timelineHours: input.timeline.maxHours + 24,
        riskLevel: "low",
        recommended: input.decision.recommendedDecision === "postpone",
      },
    ];
  }
}

export class WhatIfAnalysisBuilder {
  build(input: {
    insight: InsightIntelligenceOutput;
    successProjection: SuccessProbabilityProjection;
    timeline: TimelineForecast;
    riskForecast: RiskEvolutionForecast;
  }): WhatIfAnalysis[] {
    const blockerCount = input.insight.rootCauseObservations.length;
    return [
      {
        analysisId: "whatif.resolve_blockers",
        variant: "Resolve all blocking factors",
        description: "Assume mandatory prerequisites and blocking factors are cleared before start.",
        successDelta: Math.min(20, blockerCount * 5 + 10),
        timelineDeltaHours: -Math.round(input.timeline.maxHours * 0.1),
        riskDelta: "medium → low",
      },
      {
        analysisId: "whatif.add_verification",
        variant: "Add enhanced verification gates",
        description: "Insert additional evidence checkpoints from insight bottleneck signals.",
        successDelta: 8,
        timelineDeltaHours: Math.round(input.timeline.maxHours * 0.15),
        riskDelta: `${input.riskForecast.projectedRiskLevel} → low`,
      },
      {
        analysisId: "whatif.delay_start",
        variant: "Delay start by 7 days",
        description: "Postpone execution to allow readiness improvement.",
        successDelta: -5,
        timelineDeltaHours: 56,
        riskDelta: `${input.riskForecast.projectedRiskLevel} → low`,
      },
    ];
  }
}

export class PredictionConfidenceBuilder {
  build(input: {
    insight: InsightIntelligenceOutput;
    successProjection: SuccessProbabilityProjection;
    scenarioCount: number;
  }): PredictionConfidence {
    let score = 38;
    score += Math.min(input.insight.insightConfidence.score * 0.28, 24);
    score += Math.min(input.successProjection.projectedScore * 0.2, 18);
    score += Math.min(input.scenarioCount * 3, 9);
    score = Math.min(95, Math.max(35, Math.round(score)));

    const level: PredictionConfidenceLevel = score >= 80 ? "high" : score >= 60 ? "medium" : "low";

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "Strong insight signals support confident future projections."
          : level === "medium"
            ? "Projections viable; bottleneck or risk evolution may shift outcomes."
            : "Limited prediction confidence — treat projections as advisory only.",
      insightConfidenceScore: input.insight.insightConfidence.score,
      structuralPredictionScore: Math.min(100, input.successProjection.projectedScore + input.scenarioCount * 4),
    };
  }
}

export function createSuccessProbabilityProjectionBuilder(): SuccessProbabilityProjectionBuilder {
  return new SuccessProbabilityProjectionBuilder();
}
export function createTimelineForecastBuilder(): TimelineForecastBuilder {
  return new TimelineForecastBuilder();
}
export function createRiskEvolutionForecastBuilder(): RiskEvolutionForecastBuilder {
  return new RiskEvolutionForecastBuilder();
}
export function createTrustEvolutionForecastBuilder(): TrustEvolutionForecastBuilder {
  return new TrustEvolutionForecastBuilder();
}
export function createCostProjectionBuilder(): CostProjectionBuilder {
  return new CostProjectionBuilder();
}
export function createOutcomeProjectionBuilder(): OutcomeProjectionBuilder {
  return new OutcomeProjectionBuilder();
}
export function createOpportunityForecastBuilder(): OpportunityForecastBuilder {
  return new OpportunityForecastBuilder();
}
export function createScenarioComparisonBuilder(): ScenarioComparisonBuilder {
  return new ScenarioComparisonBuilder();
}
export function createWhatIfAnalysisBuilder(): WhatIfAnalysisBuilder {
  return new WhatIfAnalysisBuilder();
}
export function createPredictionConfidenceBuilder(): PredictionConfidenceBuilder {
  return new PredictionConfidenceBuilder();
}
