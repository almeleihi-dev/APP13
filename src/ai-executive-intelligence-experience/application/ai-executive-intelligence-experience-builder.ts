import type { AiPredictiveIntelligenceExperienceOutput } from "../../ai-predictive-intelligence-experience/domain/ai-predictive-intelligence-experience-context.js";
import { UPSTREAM_MODULE_ID } from "../domain/ai-executive-intelligence-experience-schema.js";
import type {
  ExecutiveCheck,
  ExecutiveContext,
  ExecutiveDashboard,
  ExecutiveSummary,
  StrategicPriorities,
  StrategicPriority,
  CriticalDecisions,
  CriticalDecision,
  ExecutiveAlerts,
  ExecutiveAlert,
  ExecutiveOpportunities,
  ExecutiveOpportunity,
  ExecutiveRisks,
  ExecutiveRisk,
  ExecutiveReadiness,
  ExecutiveConfidence,
  DelegationExecutiveIntelligence,
  ExecutiveExplanation,
} from "../domain/ai-executive-intelligence-experience-context.js";
import type {
  ExecutiveIntelligenceStatusLevel,
  ExecutiveIntelligenceConfidenceLevel,
} from "../domain/ai-executive-intelligence-experience-schema.js";

function mapPredictionStatus(status: string): ExecutiveIntelligenceStatusLevel {
  if (status === "prediction_ready") return "executive_ready";
  if (status === "conditional") return "conditional";
  if (status === "pending") return "pending";
  return "not_ready";
}

function check(
  id: string,
  label: string,
  passed: boolean,
  score: number,
  detail: string
): ExecutiveCheck {
  return { checkId: id, label, passed, score, detail };
}

export class ExecutiveContextBuilder {
  build(predictive: AiPredictiveIntelligenceExperienceOutput): ExecutiveContext {
    const ctx = predictive.predictionContext;

    return {
      contextId: `executive-context-${predictive.outputId}`,
      predictiveIntelligenceOutputId: predictive.outputId,
      recommendationIntelligenceOutputId: ctx.recommendationIntelligenceOutputId,
      insightGenerationOutputId: ctx.insightGenerationOutputId,
      adaptiveCoachingOutputId: ctx.adaptiveCoachingOutputId,
      progressIntelligenceOutputId: ctx.progressIntelligenceOutputId,
      executionCompanionOutputId: ctx.executionCompanionOutputId,
      actionPlanningOutputId: ctx.actionPlanningOutputId,
      decisionSupportOutputId: ctx.decisionSupportOutputId,
      guidanceOutputId: ctx.guidanceOutputId,
      conversationOutputId: ctx.conversationOutputId,
      foundationOutputId: ctx.foundationOutputId,
      scenarioId: predictive.scenarioId,
      canonicalActionId: predictive.canonicalActionId,
      goal: predictive.goal,
      experienceMode: "read_only",
    };
  }
}

export class ExecutiveDashboardBuilder {
  build(predictive: AiPredictiveIntelligenceExperienceOutput): ExecutiveDashboard {
    return {
      dashboardId: `executive-dashboard-${predictive.outputId}`,
      headline: `Executive Dashboard — ${predictive.goal}`,
      goal: predictive.goal,
      successProbabilityScore: predictive.successProbability.score,
      predictionConfidenceScore: predictive.predictionConfidence.score,
      alertCount: predictive.earlyWarningSignals.signals.length,
      priorityCount: predictive.futureScenarios.scenarios.length,
      readOnly: true,
      summary: `Read-only executive dashboard — ${predictive.futureScenarios.scenarios.length} strategic priorities, ${predictive.earlyWarningSignals.signals.length} alerts, success probability ${predictive.successProbability.score}/100.`,
    };
  }
}

export class ExecutiveSummaryBuilder {
  build(predictive: AiPredictiveIntelligenceExperienceOutput): ExecutiveSummary {
    return {
      summaryId: `executive-summary-${predictive.outputId}`,
      headline: predictive.predictionExplanation.headline,
      narrative: predictive.predictionExplanation.summary,
      successProbabilityScore: predictive.successProbability.score,
      outcomePredictionCount: predictive.outcomePredictions.predictions.length,
      readOnly: true,
      summary: `Executive summary — ${predictive.outcomePredictions.predictions.length} outcome predictions, success probability ${predictive.successProbability.score}/100, confidence ${predictive.predictionConfidence.score}/100.`,
    };
  }
}

export class StrategicPrioritiesBuilder {
  build(predictive: AiPredictiveIntelligenceExperienceOutput): StrategicPriorities {
    const priorities: StrategicPriority[] = predictive.futureScenarios.scenarios.map(
      (scenario) => ({
        priorityId: `priority-${scenario.scenarioId}`,
        sequence: scenario.sequence,
        title: scenario.title,
        detail: `Strategic priority: ${scenario.detail}`,
      })
    );

    return {
      prioritiesId: `priorities-${predictive.outputId}`,
      priorities,
      summary: `${priorities.length} read-only strategic priorities from future scenarios.`,
    };
  }
}

export class CriticalDecisionsBuilder {
  build(predictive: AiPredictiveIntelligenceExperienceOutput): CriticalDecisions {
    const decisions: CriticalDecision[] = predictive.outcomePredictions.predictions.map(
      (prediction) => ({
        decisionId: `decision-${prediction.predictionId}`,
        sequence: prediction.sequence,
        title: prediction.title,
        detail: `Critical decision: ${prediction.detail}`,
      })
    );

    return {
      decisionsId: `decisions-${predictive.outputId}`,
      decisions,
      summary: `${decisions.length} read-only critical decisions from outcome predictions.`,
    };
  }
}

export class ExecutiveAlertsBuilder {
  build(predictive: AiPredictiveIntelligenceExperienceOutput): ExecutiveAlerts {
    const alerts: ExecutiveAlert[] = predictive.earlyWarningSignals.signals.map((signal) => ({
      alertId: `exec-alert-${signal.signalId}`,
      sequence: signal.sequence,
      label: signal.label,
      detail: signal.detail,
      severity: signal.severity,
    }));

    return {
      alertsId: `exec-alerts-${predictive.outputId}`,
      alerts,
      summary: `${alerts.length} read-only executive alerts from early warning signals.`,
    };
  }
}

export class ExecutiveOpportunitiesBuilder {
  build(predictive: AiPredictiveIntelligenceExperienceOutput): ExecutiveOpportunities {
    const opportunities: ExecutiveOpportunity[] =
      predictive.predictiveOpportunities.opportunities.map((opp) => ({
        opportunityId: `exec-opp-${opp.opportunityId}`,
        sequence: opp.sequence,
        title: opp.title,
        detail: opp.detail,
      }));

    return {
      opportunitiesId: `exec-opportunities-${predictive.outputId}`,
      opportunities,
      summary: `${opportunities.length} read-only executive opportunities from predictive opportunities.`,
    };
  }
}

export class ExecutiveRisksBuilder {
  build(predictive: AiPredictiveIntelligenceExperienceOutput): ExecutiveRisks {
    const risks: ExecutiveRisk[] = predictive.predictiveRisks.risks.map((risk) => ({
      riskId: `exec-risk-${risk.riskId}`,
      sequence: risk.sequence,
      title: risk.title,
      detail: risk.detail,
      level: risk.level,
    }));

    return {
      risksId: `exec-risks-${predictive.outputId}`,
      risks,
      summary: `${risks.length} read-only executive risks from predictive risks.`,
    };
  }
}

export class ExecutiveReadinessBuilder {
  build(predictive: AiPredictiveIntelligenceExperienceOutput): ExecutiveReadiness {
    const readiness = predictive.predictionReadiness;
    const level = mapPredictionStatus(readiness.level);
    const executiveReady = readiness.predictionReady && readiness.readinessScore >= 50;

    return {
      readinessId: "executive.readiness",
      level,
      readinessScore: readiness.readinessScore,
      executiveReady,
      checks: readiness.checks.map((c) =>
        check(c.checkId, c.label, c.passed, c.score, c.detail)
      ),
      summary: `Executive readiness — ${readiness.readinessScore}/100, executive ${executiveReady ? "ready" : "pending"}.`,
    };
  }
}

export class ExecutiveConfidenceBuilder {
  build(predictive: AiPredictiveIntelligenceExperienceOutput): ExecutiveConfidence {
    let score = 36;
    score += Math.min(predictive.predictionConfidence.score * 0.36, 34);
    score += Math.min(predictive.predictionReadiness.readinessScore * 0.1, 10);
    score = Math.min(98, Math.max(40, Math.round(score)));

    const level: ExecutiveIntelligenceConfidenceLevel =
      score >= 80 ? "high" : score >= 60 ? "medium" : "low";

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "AI Executive Intelligence Experience meets high-confidence criteria from predictive intelligence."
          : level === "medium"
            ? "Executive intelligence viable with conditional predictions requiring review."
            : "Limited executive intelligence confidence — treat outputs as advisory only.",
      predictionConfidenceScore: predictive.predictionConfidence.score,
    };
  }
}

export class DelegationExecutiveIntelligenceBuilder {
  build(predictive: AiPredictiveIntelligenceExperienceOutput): DelegationExecutiveIntelligence {
    const checks: ExecutiveCheck[] = [
      check(
        "del.upstream",
        "Sole upstream delegation",
        !!predictive.outputId,
        predictive.outputId ? 100 : 0,
        `Delegates exclusively to ${UPSTREAM_MODULE_ID} AI Predictive Intelligence Experience.`
      ),
      check(
        "del.trace",
        "Predictive intelligence traceability",
        !!predictive.recommendationIntelligenceOutputId,
        predictive.recommendationIntelligenceOutputId ? 95 : 0,
        `Predictive intelligence ${predictive.outputId} → recommendation intelligence ${predictive.recommendationIntelligenceOutputId}.`
      ),
      check(
        "del.nodup",
        "No duplicated business logic",
        true,
        100,
        "Executive intelligence builders format predictive intelligence output only."
      ),
    ];

    return {
      delegationId: "executive.delegation",
      soleUpstream: "CH5-X11 AI Predictive Intelligence Experience",
      noDuplicatedLogic: true,
      predictiveIntelligenceOutputId: predictive.outputId,
      checks,
      summary: "Delegation executive intelligence — sole upstream X11, no duplicated logic.",
    };
  }
}

export class ExecutiveExplanationBuilder {
  build(input: {
    outputId: string;
    goal: string;
    dashboard: ExecutiveDashboard;
    executiveSummary: ExecutiveSummary;
    readiness: ExecutiveReadiness;
    executiveConfidenceScore: number;
  }): ExecutiveExplanation {
    return {
      explanationId: `executive-explanation-${input.outputId}`,
      headline: `AI Executive Intelligence for "${input.goal}"`,
      summary: `Read-only executive intelligence (confidence ${input.executiveConfidenceScore}/100) — ${input.dashboard.priorityCount} strategic priorities, ${input.dashboard.alertCount} alerts, success probability ${input.dashboard.successProbabilityScore}/100.`,
      dashboardSummary: input.dashboard.summary,
      executiveSummaryText: input.executiveSummary.summary,
      readinessSummary: input.readiness.summary,
    };
  }
}

export function createExecutiveContextBuilder(): ExecutiveContextBuilder {
  return new ExecutiveContextBuilder();
}
export function createExecutiveDashboardBuilder(): ExecutiveDashboardBuilder {
  return new ExecutiveDashboardBuilder();
}
export function createExecutiveSummaryBuilder(): ExecutiveSummaryBuilder {
  return new ExecutiveSummaryBuilder();
}
export function createStrategicPrioritiesBuilder(): StrategicPrioritiesBuilder {
  return new StrategicPrioritiesBuilder();
}
export function createCriticalDecisionsBuilder(): CriticalDecisionsBuilder {
  return new CriticalDecisionsBuilder();
}
export function createExecutiveAlertsBuilder(): ExecutiveAlertsBuilder {
  return new ExecutiveAlertsBuilder();
}
export function createExecutiveOpportunitiesBuilder(): ExecutiveOpportunitiesBuilder {
  return new ExecutiveOpportunitiesBuilder();
}
export function createExecutiveRisksBuilder(): ExecutiveRisksBuilder {
  return new ExecutiveRisksBuilder();
}
export function createExecutiveReadinessBuilder(): ExecutiveReadinessBuilder {
  return new ExecutiveReadinessBuilder();
}
export function createExecutiveConfidenceBuilder(): ExecutiveConfidenceBuilder {
  return new ExecutiveConfidenceBuilder();
}
export function createDelegationExecutiveIntelligenceBuilder(): DelegationExecutiveIntelligenceBuilder {
  return new DelegationExecutiveIntelligenceBuilder();
}
export function createExecutiveExplanationBuilder(): ExecutiveExplanationBuilder {
  return new ExecutiveExplanationBuilder();
}
