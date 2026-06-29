import type { AiStrategicIntelligenceExperienceOutput } from "../../ai-strategic-intelligence-experience/domain/ai-strategic-intelligence-experience-context.js";
import { UPSTREAM_MODULE_ID } from "../domain/ai-predictive-forecast-experience-schema.js";
import type {
  PredictiveForecastCheck,
  PredictiveForecastContext,
  PredictionDashboard,
  FutureScenarios,
  FutureScenario,
  TrendAnalysis,
  TrendItem,
  Forecast,
  ForecastStep,
  RiskForecast,
  RiskForecastItem,
  OpportunityForecast,
  OpportunityForecastItem,
  ProbabilityModel,
  PredictiveConfidence,
  DelegationPredictiveForecast,
  PredictiveExplanation,
} from "../domain/ai-predictive-forecast-experience-context.js";
import type { PredictiveForecastConfidenceLevel } from "../domain/ai-predictive-forecast-experience-schema.js";

function check(
  id: string,
  label: string,
  passed: boolean,
  score: number,
  detail: string
): PredictiveForecastCheck {
  return { checkId: id, label, passed, score, detail };
}

export class PredictiveForecastContextBuilder {
  build(strategic: AiStrategicIntelligenceExperienceOutput): PredictiveForecastContext {
    const ctx = strategic.strategicContext;

    return {
      contextId: `predictive-forecast-context-${strategic.outputId}`,
      strategicIntelligenceOutputId: strategic.outputId,
      decisionIntelligenceOutputId: ctx.decisionIntelligenceOutputId,
      orchestrationOutputId: ctx.orchestrationOutputId,
      foundationOutputId: ctx.foundationOutputId,
      scenarioId: strategic.scenarioId,
      canonicalActionId: strategic.canonicalActionId,
      goal: strategic.goal,
      experienceMode: "read_only",
    };
  }
}

export class PredictionDashboardBuilder {
  build(strategic: AiStrategicIntelligenceExperienceOutput): PredictionDashboard {
    const dash = strategic.strategyDashboard;
    const probabilityScore = Math.min(
      98,
      Math.max(
        40,
        Math.round(
          strategic.strategicConfidence.score * 0.6 + dash.healthScore * 0.25 + dash.scenarioCount * 3
        )
      )
    );

    return {
      dashboardId: `prediction-dashboard-${strategic.outputId}`,
      headline: `Prediction Dashboard — ${strategic.goal}`,
      goal: strategic.goal,
      healthScore: dash.healthScore,
      scenarioCount: dash.scenarioCount,
      forecastStepCount: dash.roadmapStepCount,
      probabilityScore,
      readOnly: true,
      summary: `Read-only prediction dashboard — ${dash.scenarioCount} scenarios, ${dash.roadmapStepCount} forecast steps, probability ${probabilityScore}/100.`,
    };
  }
}

export class FutureScenariosBuilder {
  build(strategic: AiStrategicIntelligenceExperienceOutput): FutureScenarios {
    const scenarios: FutureScenario[] = strategic.strategicScenarios.scenarios.map((s) => ({
      scenarioId: `future-${s.scenarioId}`,
      sequence: s.sequence,
      title: s.title,
      detail: `Predicted future: ${s.detail}`,
    }));

    return {
      scenariosId: `future-scenarios-${strategic.outputId}`,
      scenarios,
      summary: `${scenarios.length} read-only future scenarios from strategic scenarios.`,
    };
  }
}

export class TrendAnalysisBuilder {
  build(strategic: AiStrategicIntelligenceExperienceOutput): TrendAnalysis {
    const trends: TrendItem[] = strategic.strategicPriorities.priorities.map((p, index) => ({
      trendId: `trend-${p.priorityId}`,
      sequence: p.sequence,
      label: p.title,
      detail: `Trend impact ${p.impactScore}/100, urgency ${p.urgencyScore}/100 (${p.quadrant}).`,
      direction: index === 0 ? ("up" as const) : index === 1 ? ("stable" as const) : ("down" as const),
    }));

    return {
      analysisId: `trend-analysis-${strategic.outputId}`,
      trends,
      summary: `${trends.length} read-only trend items from strategic priorities.`,
    };
  }
}

export class ForecastBuilder {
  build(strategic: AiStrategicIntelligenceExperienceOutput): Forecast {
    const steps: ForecastStep[] = strategic.executionRoadmap.steps.map((step) => ({
      stepId: `forecast-${step.stepId}`,
      sequence: step.sequence,
      title: step.title,
      detail: `Forecast step: ${step.detail}`,
    }));

    return {
      forecastId: `forecast-${strategic.outputId}`,
      steps,
      summary: `${steps.length} read-only forecast steps from execution roadmap.`,
    };
  }
}

export class RiskForecastBuilder {
  build(strategic: AiStrategicIntelligenceExperienceOutput): RiskForecast {
    const items: RiskForecastItem[] = strategic.riskLandscape.items.map((item) => ({
      itemId: `risk-forecast-${item.itemId}`,
      sequence: item.sequence,
      label: item.label,
      detail: item.detail,
      level: item.level,
    }));

    return {
      forecastId: `risk-forecast-${strategic.outputId}`,
      items,
      riskScore: strategic.riskLandscape.riskScore,
      summary: `${items.length} read-only risk forecast items from risk landscape.`,
    };
  }
}

export class OpportunityForecastBuilder {
  build(strategic: AiStrategicIntelligenceExperienceOutput): OpportunityForecast {
    const opportunities: OpportunityForecastItem[] =
      strategic.opportunityLandscape.opportunities.map((opp) => ({
        itemId: `opp-forecast-${opp.itemId}`,
        sequence: opp.sequence,
        title: opp.title,
        detail: opp.detail,
      }));

    return {
      forecastId: `opportunity-forecast-${strategic.outputId}`,
      opportunities,
      opportunityScore: strategic.opportunityLandscape.opportunityScore,
      summary: `${opportunities.length} read-only opportunity forecast items from opportunity landscape.`,
    };
  }
}

export class ProbabilityModelBuilder {
  build(strategic: AiStrategicIntelligenceExperienceOutput): ProbabilityModel {
    let score = 40;
    score += Math.min(strategic.strategicConfidence.score * 0.35, 35);
    score += Math.min(strategic.strategyDashboard.healthScore * 0.15, 15);
    score = Math.min(98, Math.max(40, Math.round(score)));

    const level: PredictiveForecastConfidenceLevel =
      score >= 80 ? "high" : score >= 60 ? "medium" : "low";

    const successProbability = Math.min(
      98,
      Math.max(40, Math.round(score * 0.85 + strategic.opportunityLandscape.opportunityScore * 0.1))
    );

    return {
      modelId: `probability-model-${strategic.outputId}`,
      score,
      level,
      successProbability,
      summary: `Read-only probability model — ${score}/100 (${level}), success probability ${successProbability}/100.`,
    };
  }
}

export class PredictiveConfidenceBuilder {
  build(strategic: AiStrategicIntelligenceExperienceOutput): PredictiveConfidence {
    let score = 36;
    score += Math.min(strategic.strategicConfidence.score * 0.36, 34);
    score += Math.min(strategic.strategyDashboard.healthScore * 0.1, 10);
    score = Math.min(98, Math.max(40, Math.round(score)));

    const level: PredictiveForecastConfidenceLevel =
      score >= 80 ? "high" : score >= 60 ? "medium" : "low";

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "AI Predictive Forecast Experience meets high-confidence criteria from strategic intelligence."
          : level === "medium"
            ? "Predictive forecast viable with conditional strategic intelligence requiring review."
            : "Limited predictive forecast confidence — treat outputs as advisory only.",
      strategicConfidenceScore: strategic.strategicConfidence.score,
    };
  }
}

export class DelegationPredictiveForecastBuilder {
  build(strategic: AiStrategicIntelligenceExperienceOutput): DelegationPredictiveForecast {
    const checks: PredictiveForecastCheck[] = [
      check(
        "del.upstream",
        "Sole upstream delegation",
        !!strategic.outputId,
        strategic.outputId ? 100 : 0,
        `Delegates exclusively to ${UPSTREAM_MODULE_ID} AI Strategic Intelligence Experience.`
      ),
      check(
        "del.trace",
        "Strategic intelligence traceability",
        !!strategic.decisionIntelligenceOutputId,
        strategic.decisionIntelligenceOutputId ? 95 : 0,
        `Strategic intelligence ${strategic.outputId} → decision intelligence ${strategic.decisionIntelligenceOutputId}.`
      ),
      check(
        "del.nodup",
        "No duplicated business logic",
        true,
        100,
        "Predictive forecast builders format strategic intelligence output only."
      ),
    ];

    return {
      delegationId: "predictive-forecast.delegation",
      soleUpstream: "CH5-X15 AI Strategic Intelligence Experience",
      noDuplicatedLogic: true,
      strategicIntelligenceOutputId: strategic.outputId,
      checks,
      summary: "Delegation predictive forecast — sole upstream X15, no duplicated logic.",
    };
  }
}

export class PredictiveExplanationBuilder {
  build(input: {
    outputId: string;
    goal: string;
    dashboard: PredictionDashboard;
    scenarios: FutureScenarios;
    forecast: Forecast;
    predictiveConfidenceScore: number;
  }): PredictiveExplanation {
    return {
      explanationId: `predictive-explanation-${input.outputId}`,
      headline: `AI Predictive Forecast for "${input.goal}"`,
      summary: `Read-only predictive forecast (confidence ${input.predictiveConfidenceScore}/100) — ${input.scenarios.scenarios.length} future scenarios, ${input.forecast.steps.length} forecast steps, probability ${input.dashboard.probabilityScore}/100.`,
      dashboardSummary: input.dashboard.summary,
      scenariosSummary: input.scenarios.summary,
      forecastSummary: input.forecast.summary,
    };
  }
}

export function createPredictiveForecastContextBuilder(): PredictiveForecastContextBuilder {
  return new PredictiveForecastContextBuilder();
}
export function createPredictionDashboardBuilder(): PredictionDashboardBuilder {
  return new PredictionDashboardBuilder();
}
export function createFutureScenariosBuilder(): FutureScenariosBuilder {
  return new FutureScenariosBuilder();
}
export function createTrendAnalysisBuilder(): TrendAnalysisBuilder {
  return new TrendAnalysisBuilder();
}
export function createForecastBuilder(): ForecastBuilder {
  return new ForecastBuilder();
}
export function createRiskForecastBuilder(): RiskForecastBuilder {
  return new RiskForecastBuilder();
}
export function createOpportunityForecastBuilder(): OpportunityForecastBuilder {
  return new OpportunityForecastBuilder();
}
export function createProbabilityModelBuilder(): ProbabilityModelBuilder {
  return new ProbabilityModelBuilder();
}
export function createPredictiveConfidenceBuilder(): PredictiveConfidenceBuilder {
  return new PredictiveConfidenceBuilder();
}
export function createDelegationPredictiveForecastBuilder(): DelegationPredictiveForecastBuilder {
  return new DelegationPredictiveForecastBuilder();
}
export function createPredictiveExplanationBuilder(): PredictiveExplanationBuilder {
  return new PredictiveExplanationBuilder();
}
