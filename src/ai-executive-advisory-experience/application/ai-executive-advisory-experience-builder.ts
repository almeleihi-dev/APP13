import type { AiPredictiveForecastExperienceOutput } from "../../ai-predictive-forecast-experience/domain/ai-predictive-forecast-experience-context.js";
import { UPSTREAM_MODULE_ID } from "../domain/ai-executive-advisory-experience-schema.js";
import type {
  AdvisoryCheck,
  AdvisoryContext,
  AdvisoryDashboard,
  ExecutiveBriefing,
  AdvisoryRecommendations,
  AdvisoryRecommendation,
  ActionPlan,
  ActionPlanItem,
  PriorityActions,
  PriorityAction,
  RiskAdvisory,
  RiskAdvisoryItem,
  OpportunityAdvisory,
  OpportunityAdvisoryItem,
  AdvisoryConfidence,
  DelegationExecutiveAdvisory,
  AdvisoryExplanation,
} from "../domain/ai-executive-advisory-experience-context.js";
import type { ExecutiveAdvisoryConfidenceLevel } from "../domain/ai-executive-advisory-experience-schema.js";

function check(
  id: string,
  label: string,
  passed: boolean,
  score: number,
  detail: string
): AdvisoryCheck {
  return { checkId: id, label, passed, score, detail };
}

export class AdvisoryContextBuilder {
  build(forecast: AiPredictiveForecastExperienceOutput): AdvisoryContext {
    const ctx = forecast.predictiveForecastContext;

    return {
      contextId: `advisory-context-${forecast.outputId}`,
      predictiveForecastOutputId: forecast.outputId,
      strategicIntelligenceOutputId: ctx.strategicIntelligenceOutputId,
      decisionIntelligenceOutputId: ctx.decisionIntelligenceOutputId,
      foundationOutputId: ctx.foundationOutputId,
      scenarioId: forecast.scenarioId,
      canonicalActionId: forecast.canonicalActionId,
      goal: forecast.goal,
      experienceMode: "read_only",
    };
  }
}

export class AdvisoryDashboardBuilder {
  build(forecast: AiPredictiveForecastExperienceOutput): AdvisoryDashboard {
    const dash = forecast.predictionDashboard;

    return {
      dashboardId: `advisory-dashboard-${forecast.outputId}`,
      headline: `Advisory Dashboard — ${forecast.goal}`,
      goal: forecast.goal,
      healthScore: dash.healthScore,
      probabilityScore: dash.probabilityScore,
      recommendationCount: forecast.futureScenarios.scenarios.length,
      actionCount: forecast.forecast.steps.length,
      readOnly: true,
      summary: `Read-only advisory dashboard — ${forecast.futureScenarios.scenarios.length} recommendations, ${forecast.forecast.steps.length} action items, probability ${dash.probabilityScore}/100.`,
    };
  }
}

export class ExecutiveBriefingBuilder {
  build(forecast: AiPredictiveForecastExperienceOutput): ExecutiveBriefing {
    return {
      briefingId: `executive-briefing-${forecast.outputId}`,
      headline: forecast.predictiveExplanation.headline,
      narrative: forecast.predictiveExplanation.summary,
      scenarioCount: forecast.futureScenarios.scenarios.length,
      successProbability: forecast.probabilityModel.successProbability,
      readOnly: true,
      summary: `Executive briefing — ${forecast.futureScenarios.scenarios.length} scenarios, success probability ${forecast.probabilityModel.successProbability}/100, confidence ${forecast.predictiveConfidence.score}/100.`,
    };
  }
}

export class AdvisoryRecommendationsBuilder {
  build(forecast: AiPredictiveForecastExperienceOutput): AdvisoryRecommendations {
    const recommendations: AdvisoryRecommendation[] = forecast.futureScenarios.scenarios.map(
      (s) => ({
        recommendationId: `advisory-rec-${s.scenarioId}`,
        sequence: s.sequence,
        title: s.title,
        detail: `Advisory recommendation: ${s.detail}`,
      })
    );

    return {
      recommendationsId: `advisory-recommendations-${forecast.outputId}`,
      recommendations,
      summary: `${recommendations.length} read-only advisory recommendations from future scenarios.`,
    };
  }
}

export class ActionPlanBuilder {
  build(forecast: AiPredictiveForecastExperienceOutput): ActionPlan {
    const items: ActionPlanItem[] = forecast.forecast.steps.map((step) => ({
      itemId: `plan-${step.stepId}`,
      sequence: step.sequence,
      title: step.title,
      detail: step.detail,
    }));

    return {
      planId: `action-plan-${forecast.outputId}`,
      items,
      summary: `${items.length} read-only action plan items from forecast steps.`,
    };
  }
}

export class PriorityActionsBuilder {
  build(forecast: AiPredictiveForecastExperienceOutput): PriorityActions {
    const actions: PriorityAction[] = forecast.trendAnalysis.trends.map((trend, index) => ({
      actionId: `priority-${trend.trendId}`,
      sequence: trend.sequence,
      label: trend.label,
      detail: trend.detail,
      priority:
        index === 0 ? ("high" as const) : index === 1 ? ("medium" as const) : ("low" as const),
    }));

    return {
      actionsId: `priority-actions-${forecast.outputId}`,
      actions,
      summary: `${actions.length} read-only priority actions from trend analysis.`,
    };
  }
}

export class RiskAdvisoryBuilder {
  build(forecast: AiPredictiveForecastExperienceOutput): RiskAdvisory {
    const items: RiskAdvisoryItem[] = forecast.riskForecast.items.map((item) => ({
      itemId: `risk-advisory-${item.itemId}`,
      sequence: item.sequence,
      label: item.label,
      detail: item.detail,
      level: item.level,
    }));

    return {
      advisoryId: `risk-advisory-${forecast.outputId}`,
      items,
      riskScore: forecast.riskForecast.riskScore,
      summary: `${items.length} read-only risk advisory items from risk forecast.`,
    };
  }
}

export class OpportunityAdvisoryBuilder {
  build(forecast: AiPredictiveForecastExperienceOutput): OpportunityAdvisory {
    const opportunities: OpportunityAdvisoryItem[] = forecast.opportunityForecast.opportunities.map(
      (opp) => ({
        itemId: `opp-advisory-${opp.itemId}`,
        sequence: opp.sequence,
        title: opp.title,
        detail: opp.detail,
      })
    );

    return {
      advisoryId: `opportunity-advisory-${forecast.outputId}`,
      opportunities,
      opportunityScore: forecast.opportunityForecast.opportunityScore,
      summary: `${opportunities.length} read-only opportunity advisory items from opportunity forecast.`,
    };
  }
}

export class AdvisoryConfidenceBuilder {
  build(forecast: AiPredictiveForecastExperienceOutput): AdvisoryConfidence {
    let score = 36;
    score += Math.min(forecast.predictiveConfidence.score * 0.36, 34);
    score += Math.min(forecast.predictionDashboard.healthScore * 0.1, 10);
    score = Math.min(98, Math.max(40, Math.round(score)));

    const level: ExecutiveAdvisoryConfidenceLevel =
      score >= 80 ? "high" : score >= 60 ? "medium" : "low";

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "AI Executive Advisory Experience meets high-confidence criteria from predictive forecast."
          : level === "medium"
            ? "Executive advisory viable with conditional predictive forecast requiring review."
            : "Limited executive advisory confidence — treat outputs as advisory only.",
      predictiveConfidenceScore: forecast.predictiveConfidence.score,
    };
  }
}

export class DelegationExecutiveAdvisoryBuilder {
  build(forecast: AiPredictiveForecastExperienceOutput): DelegationExecutiveAdvisory {
    const checks: AdvisoryCheck[] = [
      check(
        "del.upstream",
        "Sole upstream delegation",
        !!forecast.outputId,
        forecast.outputId ? 100 : 0,
        `Delegates exclusively to ${UPSTREAM_MODULE_ID} AI Predictive Forecast Experience.`
      ),
      check(
        "del.trace",
        "Predictive forecast traceability",
        !!forecast.strategicIntelligenceOutputId,
        forecast.strategicIntelligenceOutputId ? 95 : 0,
        `Predictive forecast ${forecast.outputId} → strategic intelligence ${forecast.strategicIntelligenceOutputId}.`
      ),
      check(
        "del.nodup",
        "No duplicated business logic",
        true,
        100,
        "Executive advisory builders format predictive forecast output only."
      ),
    ];

    return {
      delegationId: "executive-advisory.delegation",
      soleUpstream: "CH5-X16 AI Predictive Forecast Experience",
      noDuplicatedLogic: true,
      predictiveForecastOutputId: forecast.outputId,
      checks,
      summary: "Delegation executive advisory — sole upstream X16, no duplicated logic.",
    };
  }
}

export class AdvisoryExplanationBuilder {
  build(input: {
    outputId: string;
    goal: string;
    dashboard: AdvisoryDashboard;
    briefing: ExecutiveBriefing;
    actionPlan: ActionPlan;
    advisoryConfidenceScore: number;
  }): AdvisoryExplanation {
    return {
      explanationId: `advisory-explanation-${input.outputId}`,
      headline: `AI Executive Advisory for "${input.goal}"`,
      summary: `Read-only executive advisory (confidence ${input.advisoryConfidenceScore}/100) — ${input.dashboard.recommendationCount} recommendations, ${input.dashboard.actionCount} action items, probability ${input.dashboard.probabilityScore}/100.`,
      dashboardSummary: input.dashboard.summary,
      briefingSummary: input.briefing.summary,
      actionPlanSummary: input.actionPlan.summary,
    };
  }
}

export function createAdvisoryContextBuilder(): AdvisoryContextBuilder {
  return new AdvisoryContextBuilder();
}
export function createAdvisoryDashboardBuilder(): AdvisoryDashboardBuilder {
  return new AdvisoryDashboardBuilder();
}
export function createExecutiveBriefingBuilder(): ExecutiveBriefingBuilder {
  return new ExecutiveBriefingBuilder();
}
export function createAdvisoryRecommendationsBuilder(): AdvisoryRecommendationsBuilder {
  return new AdvisoryRecommendationsBuilder();
}
export function createActionPlanBuilder(): ActionPlanBuilder {
  return new ActionPlanBuilder();
}
export function createPriorityActionsBuilder(): PriorityActionsBuilder {
  return new PriorityActionsBuilder();
}
export function createRiskAdvisoryBuilder(): RiskAdvisoryBuilder {
  return new RiskAdvisoryBuilder();
}
export function createOpportunityAdvisoryBuilder(): OpportunityAdvisoryBuilder {
  return new OpportunityAdvisoryBuilder();
}
export function createAdvisoryConfidenceBuilder(): AdvisoryConfidenceBuilder {
  return new AdvisoryConfidenceBuilder();
}
export function createDelegationExecutiveAdvisoryBuilder(): DelegationExecutiveAdvisoryBuilder {
  return new DelegationExecutiveAdvisoryBuilder();
}
export function createAdvisoryExplanationBuilder(): AdvisoryExplanationBuilder {
  return new AdvisoryExplanationBuilder();
}
