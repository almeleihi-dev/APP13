import type { PredictionIntelligenceOutput } from "../../prediction-intelligence/domain/prediction-context.js";
import type { InsightIntelligenceOutput } from "../../insight-intelligence/domain/insight-context.js";
import type { RecommendationIntelligenceOutput } from "../../recommendation-intelligence/domain/recommendation-context.js";
import type { ExecutionIntelligenceGuidance } from "../../execution-intelligence/domain/execution-context.js";
import type {
  StrategicObjective,
  StrategicOption,
  ExecutionStrategy,
  LongTermRoadmap,
  ResourceAllocationStrategy,
  PriorityOptimization,
  ContingencyStrategy,
  ScenarioPlan,
  StrategicRiskMitigation,
  StrategicOpportunityMatrixEntry,
  StrategicConfidence,
} from "../domain/strategy-context.js";
import type { StrategyConfidenceLevel } from "../domain/strategy-intelligence-schema.js";
import { STRATEGY_INTELLIGENCE_FIXED_TIMESTAMP } from "../domain/strategy-intelligence-schema.js";

const ROADMAP_HORIZON_DAYS = 90;

export class StrategicObjectivesBuilder {
  build(prediction: PredictionIntelligenceOutput, goal: string): StrategicObjective[] {
    const successTarget = prediction.successProbabilityProjection.projectedScore;
    return [
      {
        objectiveId: "obj.primary_goal",
        title: "Achieve primary goal",
        description: `Deliver "${goal}" with projected ${successTarget}% success probability.`,
        priority: "critical",
        horizonDays: 30,
        successMetric: `${successTarget}% success probability`,
      },
      {
        objectiveId: "obj.trust_trajectory",
        title: "Maintain trust trajectory",
        description: prediction.trustEvolutionForecast.summary,
        priority: prediction.trustEvolutionForecast.trajectory === "declining" ? "high" : "medium",
        horizonDays: 30,
        successMetric: prediction.trustEvolutionForecast.projectedTrustBand,
      },
      {
        objectiveId: "obj.timeline_adherence",
        title: "Adhere to timeline forecast",
        description: prediction.timelineForecast.summary,
        priority: prediction.timelineForecast.delayRiskPercent >= 20 ? "high" : "medium",
        horizonDays: Math.ceil(prediction.timelineForecast.maxHours / 8),
        successMetric: `${prediction.timelineForecast.maxHours}h max window`,
      },
    ];
  }
}

export class StrategicOptionsBuilder {
  build(prediction: PredictionIntelligenceOutput): StrategicOption[] {
    return prediction.scenarioComparisons.map((scenario) => ({
      optionId: scenario.comparisonId,
      label: scenario.scenarioLabel,
      description: `${scenario.successProbability}% success, ${scenario.timelineHours}h timeline, ${scenario.riskLevel} risk.`,
      successProbability: scenario.successProbability,
      recommended: scenario.recommended,
      tradeoffs: scenario.recommended
        ? ["Primary path aligned with current decision intelligence."]
        : ["Alternative path — evaluate trade-offs before adoption."],
    }));
  }
}

export class ExecutionStrategiesBuilder {
  build(
    _prediction: PredictionIntelligenceOutput,
    execution: ExecutionIntelligenceGuidance
  ): ExecutionStrategy[] {
    return execution.executionRoadmap.phases.map((phase, index) => ({
      strategyId: `exec.${phase.phaseId}`,
      title: phase.title,
      description: phase.description,
      phaseCount: 1,
      estimatedHours: Math.round((phase.estimatedMinMinutes + phase.estimatedMaxMinutes) / 120),
      priority: index === 0 ? "critical" : index < 3 ? "high" : "medium",
    }));
  }
}

export class LongTermRoadmapBuilder {
  build(
    prediction: PredictionIntelligenceOutput,
    execution: ExecutionIntelligenceGuidance
  ): LongTermRoadmap {
    const phases: LongTermRoadmap["phases"] = [
      {
        phaseId: "lt.phase.near_term",
        order: 1,
        title: "Near-term execution",
        description: "Complete primary execution phases from prediction timeline forecast.",
        horizonDays: 30,
        milestone: `Success target ${prediction.successProbabilityProjection.projectedScore}%`,
      },
      {
        phaseId: "lt.phase.mid_term",
        order: 2,
        title: "Mid-term stabilization",
        description: "Address risk evolution and trust trajectory from prediction forecasts.",
        horizonDays: 60,
        milestone: `Trust band ${prediction.trustEvolutionForecast.projectedTrustBand}`,
      },
      {
        phaseId: "lt.phase.long_term",
        order: 3,
        title: "Long-term optimization",
        description: "Capture opportunity forecasts and strategic improvements.",
        horizonDays: ROADMAP_HORIZON_DAYS,
        milestone: `Outcome ${prediction.outcomeProjection.achievementPercent}% achievement`,
      },
    ];

    for (const milestone of execution.orderedMilestones.slice(0, 2)) {
      phases.push({
        phaseId: `lt.milestone.${milestone.milestoneId}`,
        order: phases.length + 1,
        title: milestone.title,
        description: `Milestone gate: ${milestone.gateType}`,
        horizonDays: Math.min(ROADMAP_HORIZON_DAYS, 30 + milestone.order * 15),
        milestone: milestone.title,
      });
    }

    return {
      roadmapId: `lt-roadmap-${prediction.outputId}`,
      totalPhases: phases.length,
      horizonDays: ROADMAP_HORIZON_DAYS,
      phases,
      summary: `${phases.length}-phase long-term roadmap over ${ROADMAP_HORIZON_DAYS} days anchored to ${STRATEGY_INTELLIGENCE_FIXED_TIMESTAMP}.`,
    };
  }
}

export class ResourceAllocationStrategyBuilder {
  build(
    prediction: PredictionIntelligenceOutput,
    recommendation: RecommendationIntelligenceOutput
  ): ResourceAllocationStrategy {
    const mandatoryApprovals = recommendation.prerequisites.filter((p) => p.mandatory).length;
    const customerShare = Math.min(45, 25 + mandatoryApprovals * 5);
    const providerShare = Math.min(50, 35 + recommendation.prioritizedRecommendations.length * 2);
    const platformShare = 100 - customerShare - providerShare;

    return {
      allocationId: `alloc-${prediction.outputId}`,
      customerSharePercent: customerShare,
      providerSharePercent: providerShare,
      platformSharePercent: platformShare,
      costRangeSummary: prediction.costProjection.summary,
      summary: `Resource allocation: customer ${customerShare}%, provider ${providerShare}%, platform ${platformShare}% — advisory only.`,
    };
  }
}

export class PriorityOptimizationBuilder {
  build(recommendation: RecommendationIntelligenceOutput): PriorityOptimization[] {
    return recommendation.prioritizedRecommendations.slice(0, 5).map((item, index) => ({
      optimizationId: `priority.${item.itemId}`,
      title: item.title,
      description: item.description,
      rank: index + 1,
      impactScore: item.recommendationScore,
    }));
  }
}

export class ContingencyStrategiesBuilder {
  build(prediction: PredictionIntelligenceOutput): ContingencyStrategy[] {
    const contingencies: ContingencyStrategy[] = prediction.whatIfAnalysis.map((whatIf) => ({
      contingencyId: whatIf.analysisId,
      trigger: whatIf.variant,
      response: whatIf.description,
      priority:
        whatIf.successDelta >= 10 ? "high" : whatIf.successDelta >= 0 ? "medium" : "critical",
    }));

    if (prediction.riskEvolutionForecast.projectedRiskLevel === "high") {
      contingencies.push({
        contingencyId: "contingency.risk_escalation",
        trigger: "Risk evolution reaches high level",
        response: "Activate enhanced verification and defer non-critical milestones.",
        priority: "critical",
      });
    }

    return contingencies;
  }
}

export class ScenarioPlanningBuilder {
  build(prediction: PredictionIntelligenceOutput): ScenarioPlan[] {
    return prediction.scenarioComparisons.map((scenario) => ({
      planId: scenario.comparisonId,
      scenarioLabel: scenario.scenarioLabel,
      successProbability: scenario.successProbability,
      timelineHours: scenario.timelineHours,
      riskLevel: scenario.riskLevel,
      strategicFit: scenario.recommended
        ? "primary"
        : scenario.riskLevel === "low"
          ? "alternative"
          : "fallback",
    }));
  }
}

export class StrategicRiskMitigationBuilder {
  build(insight: InsightIntelligenceOutput): StrategicRiskMitigation[] {
    return insight.riskInsights.slice(0, 4).map((risk) => ({
      mitigationId: `strat-mitigate.${risk.riskId}`,
      title: risk.title,
      description: risk.description,
      addressesRisk: risk.riskId,
      priority:
        risk.severity === "high" || risk.severity === "critical" ? "critical" : "medium",
    }));
  }
}

export class StrategicOpportunityMatrixBuilder {
  build(
    prediction: PredictionIntelligenceOutput,
    insight: InsightIntelligenceOutput
  ): StrategicOpportunityMatrixEntry[] {
    const entries: StrategicOpportunityMatrixEntry[] = [];

    for (const forecast of prediction.opportunityForecasts) {
      const impact: "high" | "medium" | "low" =
        forecast.probabilityPercent >= 70 ? "high" : forecast.probabilityPercent >= 50 ? "medium" : "low";
      const effort: "high" | "medium" | "low" =
        insight.bottleneckDetections.length >= 2 ? "high" : "medium";
      const quadrant: StrategicOpportunityMatrixEntry["quadrant"] =
        impact === "high" && effort !== "high"
          ? "pursue"
          : impact === "high" && effort === "high"
            ? "evaluate"
            : impact === "low"
              ? "monitor"
              : "defer";

      entries.push({
        entryId: forecast.forecastId,
        title: forecast.title,
        description: forecast.projectedGain,
        impact,
        effort,
        quadrant,
      });
    }

    for (const opp of insight.opportunityInsights.slice(0, 2)) {
      entries.push({
        entryId: `matrix.${opp.opportunityId}`,
        title: opp.title,
        description: opp.description,
        impact: opp.priority === "high" ? "high" : "medium",
        effort: "medium",
        quadrant: opp.priority === "high" ? "pursue" : "evaluate",
      });
    }

    return entries;
  }
}

export class StrategicConfidenceBuilder {
  build(input: {
    prediction: PredictionIntelligenceOutput;
    objectiveCount: number;
    scenarioCount: number;
  }): StrategicConfidence {
    let score = 40;
    score += Math.min(input.prediction.predictionConfidence.score * 0.3, 26);
    score += Math.min(input.prediction.successProbabilityProjection.projectedScore * 0.15, 14);
    score += Math.min(input.objectiveCount * 4, 10);
    score = Math.min(95, Math.max(35, Math.round(score)));

    const level: StrategyConfidenceLevel = score >= 80 ? "high" : score >= 60 ? "medium" : "low";

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "Strong prediction signals support confident strategic planning."
          : level === "medium"
            ? "Strategy viable; risk evolution or timeline variance may require adjustment."
            : "Limited strategic confidence — treat plan as advisory only.",
      predictionConfidenceScore: input.prediction.predictionConfidence.score,
      structuralStrategyScore: Math.min(100, score + input.scenarioCount * 3),
    };
  }
}

export function createStrategicObjectivesBuilder(): StrategicObjectivesBuilder {
  return new StrategicObjectivesBuilder();
}
export function createStrategicOptionsBuilder(): StrategicOptionsBuilder {
  return new StrategicOptionsBuilder();
}
export function createExecutionStrategiesBuilder(): ExecutionStrategiesBuilder {
  return new ExecutionStrategiesBuilder();
}
export function createLongTermRoadmapBuilder(): LongTermRoadmapBuilder {
  return new LongTermRoadmapBuilder();
}
export function createResourceAllocationStrategyBuilder(): ResourceAllocationStrategyBuilder {
  return new ResourceAllocationStrategyBuilder();
}
export function createPriorityOptimizationBuilder(): PriorityOptimizationBuilder {
  return new PriorityOptimizationBuilder();
}
export function createContingencyStrategiesBuilder(): ContingencyStrategiesBuilder {
  return new ContingencyStrategiesBuilder();
}
export function createScenarioPlanningBuilder(): ScenarioPlanningBuilder {
  return new ScenarioPlanningBuilder();
}
export function createStrategicRiskMitigationBuilder(): StrategicRiskMitigationBuilder {
  return new StrategicRiskMitigationBuilder();
}
export function createStrategicOpportunityMatrixBuilder(): StrategicOpportunityMatrixBuilder {
  return new StrategicOpportunityMatrixBuilder();
}
export function createStrategicConfidenceBuilder(): StrategicConfidenceBuilder {
  return new StrategicConfidenceBuilder();
}
