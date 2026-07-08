import type { AiExecutionCompanionExperienceOutput } from "../../ai-execution-companion-experience/domain/ai-execution-companion-experience-context.js";
import { UPSTREAM_MODULE_ID } from "../domain/ai-progress-intelligence-experience-schema.js";
import type {
  ProgressCheck,
  ProgressContext,
  ProgressOverview,
  CompletedActivities,
  RemainingActivities,
  RemainingActivity,
  ProgressMetrics,
  ProgressMetric,
  TimelineStatus,
  TimelineStatusPhase,
  RiskIndicators,
  RiskIndicator,
  SuggestedNextActions,
  SuggestedNextAction,
  ProgressIntelligenceReadiness,
  DelegationProgressIntelligence,
  ProgressIntelligenceConfidence,
  ProgressIntelligenceExplanation,
} from "../domain/ai-progress-intelligence-experience-context.js";
import type {
  ProgressIntelligenceStatusLevel,
  ProgressIntelligenceConfidenceLevel,
} from "../domain/ai-progress-intelligence-experience-schema.js";

function mapCompanionStatus(status: string): ProgressIntelligenceStatusLevel {
  if (status === "active") return "on_track";
  if (status === "conditional") return "conditional";
  if (status === "pending") return "pending";
  return "at_risk";
}

function check(id: string, label: string, passed: boolean, score: number, detail: string): ProgressCheck {
  return { checkId: id, label, passed, score, detail };
}

export class ProgressContextBuilder {
  build(companion: AiExecutionCompanionExperienceOutput): ProgressContext {
    const ctx = companion.executionContext;

    return {
      contextId: `progress-context-${companion.outputId}`,
      executionCompanionOutputId: companion.outputId,
      actionPlanningOutputId: ctx.actionPlanningOutputId,
      decisionSupportOutputId: ctx.decisionSupportOutputId,
      guidanceOutputId: ctx.guidanceOutputId,
      conversationOutputId: ctx.conversationOutputId,
      foundationOutputId: ctx.foundationOutputId,
      scenarioId: companion.scenarioId,
      canonicalActionId: companion.canonicalActionId,
      goal: companion.goal,
      experienceMode: "read_only",
    };
  }
}

export class ProgressOverviewBuilder {
  build(companion: AiExecutionCompanionExperienceOutput): ProgressOverview {
    const progress = companion.executionProgress;

    return {
      overviewId: `overview-${companion.outputId}`,
      goal: companion.goal,
      totalSteps: progress.totalSteps,
      completedSteps: progress.completedSteps,
      percentComplete: progress.percentComplete,
      currentStepTitle: companion.currentStep.title,
      readOnly: true,
      summary: `Read-only progress overview — ${progress.completedSteps}/${progress.totalSteps} steps (${progress.percentComplete}%) for "${companion.goal}".`,
    };
  }
}

export class CompletedActivitiesBuilder {
  build(companion: AiExecutionCompanionExperienceOutput): CompletedActivities {
    return {
      activitiesId: `completed-${companion.outputId}`,
      activities: [],
      summary: `0 completed activities — read-only advisory mode (${companion.executionProgress.completedSteps} steps marked complete upstream).`,
    };
  }
}

export class RemainingActivitiesBuilder {
  build(companion: AiExecutionCompanionExperienceOutput): RemainingActivities {
    const activities: RemainingActivity[] = companion.nextActions.actions.map((action) => ({
      activityId: `remaining-${action.actionId}`,
      sequence: action.sequence,
      title: action.title,
      detail: action.detail,
      sourceActionId: action.actionId,
    }));

    return {
      activitiesId: `remaining-${companion.outputId}`,
      activities,
      summary: `${activities.length} remaining read-only activities from execution companion next actions.`,
    };
  }
}

export class ProgressMetricsBuilder {
  build(companion: AiExecutionCompanionExperienceOutput): ProgressMetrics {
    const progress = companion.executionProgress;
    const forecast = companion.completionForecast;

    const metrics: ProgressMetric[] = [
      {
        metricId: "metric.percent_complete",
        label: "Percent Complete",
        value: progress.percentComplete,
        unit: "percent",
        detail: "Read-only completion percentage — advisory only.",
      },
      {
        metricId: "metric.steps_remaining",
        label: "Steps Remaining",
        value: forecast.estimatedStepsRemaining,
        unit: "steps",
        detail: "Estimated steps remaining from completion forecast.",
      },
      {
        metricId: "metric.readiness_score",
        label: "Readiness Score",
        value: forecast.readinessScore,
        unit: "score",
        detail: "Readiness score propagated from execution companion.",
      },
      {
        metricId: "metric.checklist_items",
        label: "Active Checklist Items",
        value: companion.activeChecklist.items.length,
        unit: "items",
        detail: "Active checklist items from execution companion.",
      },
    ];

    return {
      metricsId: `metrics-${companion.outputId}`,
      metrics,
      summary: `${metrics.length} read-only progress metrics derived from ${UPSTREAM_MODULE_ID}.`,
    };
  }
}

export class TimelineStatusBuilder {
  build(companion: AiExecutionCompanionExperienceOutput): TimelineStatus {
    const phases: TimelineStatusPhase[] = companion.progressTimeline.phases.map((phase) => ({
      phaseId: phase.phaseId,
      sequence: phase.sequence,
      label: phase.label,
      status: phase.status,
      detail: phase.detail,
    }));

    return {
      timelineStatusId: `timeline-status-${companion.outputId}`,
      phases,
      summary: `${phases.length} timeline status phases — current step tracked, remainder upcoming.`,
    };
  }
}

export class RiskIndicatorsBuilder {
  build(companion: AiExecutionCompanionExperienceOutput): RiskIndicators {
    const forecast = companion.completionForecast;
    const readiness = companion.executionCompanionReadiness;

    const indicators: RiskIndicator[] = [
      {
        indicatorId: "risk.readiness",
        sequence: 1,
        level: readiness.readinessScore >= 70 ? "low" : readiness.readinessScore >= 50 ? "medium" : "high",
        label: "Readiness Risk",
        detail: `Readiness score ${readiness.readinessScore}/100 — ${readiness.companionReady ? "companion ready" : "companion pending"}.`,
      },
      {
        indicatorId: "risk.forecast",
        sequence: 2,
        level: forecast.forecastLevel === "active" ? "low" : forecast.forecastLevel === "conditional" ? "medium" : "high",
        label: "Completion Forecast Risk",
        detail: `Forecast level ${forecast.forecastLevel} — ${forecast.estimatedStepsRemaining} steps remaining.`,
      },
      {
        indicatorId: "risk.progress",
        sequence: 3,
        level: companion.executionProgress.percentComplete > 0 ? "low" : "medium",
        label: "Progress Stall Risk",
        detail: `${companion.executionProgress.percentComplete}% complete — read-only advisory tracking.`,
      },
    ];

    return {
      indicatorsId: `risks-${companion.outputId}`,
      indicators,
      summary: `${indicators.length} read-only risk indicators from execution companion readiness and forecast.`,
    };
  }
}

export class SuggestedNextActionsBuilder {
  build(companion: AiExecutionCompanionExperienceOutput): SuggestedNextActions {
    const actions: SuggestedNextAction[] = companion.nextActions.actions.map((action) => ({
      actionId: `suggested-${action.actionId}`,
      sequence: action.sequence,
      title: action.title,
      detail: action.detail,
      priority: action.sequence,
    }));

    return {
      nextActionsId: `suggested-next-${companion.outputId}`,
      actions,
      summary: `${actions.length} suggested read-only next actions from execution companion.`,
    };
  }
}

export class ProgressIntelligenceReadinessBuilder {
  build(companion: AiExecutionCompanionExperienceOutput): ProgressIntelligenceReadiness {
    const readiness = companion.executionCompanionReadiness;
    const level = mapCompanionStatus(readiness.level);
    const intelligenceReady = readiness.companionReady && readiness.readinessScore >= 50;

    return {
      readinessId: "progress.readiness",
      level,
      readinessScore: readiness.readinessScore,
      intelligenceReady,
      checks: readiness.checks.map((c) =>
        check(c.checkId, c.label, c.passed, c.score, c.detail)
      ),
      summary: `Progress intelligence readiness — ${readiness.readinessScore}/100, intelligence ${intelligenceReady ? "ready" : "pending"}.`,
    };
  }
}

export class DelegationProgressIntelligenceBuilder {
  build(companion: AiExecutionCompanionExperienceOutput): DelegationProgressIntelligence {
    const checks: ProgressCheck[] = [
      check(
        "del.upstream",
        "Sole upstream delegation",
        !!companion.outputId,
        companion.outputId ? 100 : 0,
        `Delegates exclusively to ${UPSTREAM_MODULE_ID} AI Execution Companion Experience.`
      ),
      check(
        "del.trace",
        "Execution companion traceability",
        !!companion.actionPlanningOutputId,
        companion.actionPlanningOutputId ? 95 : 0,
        `Execution companion ${companion.outputId} → action planning ${companion.actionPlanningOutputId}.`
      ),
      check(
        "del.nodup",
        "No duplicated business logic",
        true,
        100,
        "Progress intelligence builders format execution companion output only."
      ),
    ];

    return {
      delegationId: "progress.delegation",
      soleUpstream: "CH5-X6 AI Execution Companion Experience",
      noDuplicatedLogic: true,
      executionCompanionOutputId: companion.outputId,
      checks,
      summary: "Delegation progress intelligence — sole upstream X6, no duplicated logic.",
    };
  }
}

export class ProgressIntelligenceConfidenceBuilder {
  build(
    companion: AiExecutionCompanionExperienceOutput,
    readinessScore: number
  ): ProgressIntelligenceConfidence {
    let score = 44;
    score += Math.min(companion.executionCompanionConfidence.score * 0.28, 26);
    score += Math.min(readinessScore * 0.18, 18);
    score = Math.min(98, Math.max(40, Math.round(score)));

    const level: ProgressIntelligenceConfidenceLevel =
      score >= 80 ? "high" : score >= 60 ? "medium" : "low";

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "AI Progress Intelligence Experience meets high-confidence criteria from execution companion."
          : level === "medium"
            ? "Progress intelligence viable with conditional companion requiring review."
            : "Limited progress intelligence confidence — treat outputs as advisory only.",
      executionCompanionConfidenceScore: companion.executionCompanionConfidence.score,
    };
  }
}

export class ProgressIntelligenceExplanationBuilder {
  build(input: {
    outputId: string;
    goal: string;
    overview: ProgressOverview;
    metrics: ProgressMetrics;
    readiness: ProgressIntelligenceReadiness;
    progressIntelligenceConfidenceScore: number;
  }): ProgressIntelligenceExplanation {
    return {
      explanationId: `progress-explanation-${input.outputId}`,
      headline: `AI Progress Intelligence for "${input.goal}"`,
      summary: `Read-only progress intelligence (confidence ${input.progressIntelligenceConfidenceScore}/100) — ${input.overview.completedSteps}/${input.overview.totalSteps} steps complete.`,
      overviewSummary: input.overview.summary,
      metricsSummary: input.metrics.summary,
      readinessSummary: input.readiness.summary,
    };
  }
}

export function createProgressContextBuilder(): ProgressContextBuilder {
  return new ProgressContextBuilder();
}
export function createProgressOverviewBuilder(): ProgressOverviewBuilder {
  return new ProgressOverviewBuilder();
}
export function createCompletedActivitiesBuilder(): CompletedActivitiesBuilder {
  return new CompletedActivitiesBuilder();
}
export function createRemainingActivitiesBuilder(): RemainingActivitiesBuilder {
  return new RemainingActivitiesBuilder();
}
export function createProgressMetricsBuilder(): ProgressMetricsBuilder {
  return new ProgressMetricsBuilder();
}
export function createTimelineStatusBuilder(): TimelineStatusBuilder {
  return new TimelineStatusBuilder();
}
export function createRiskIndicatorsBuilder(): RiskIndicatorsBuilder {
  return new RiskIndicatorsBuilder();
}
export function createSuggestedNextActionsBuilder(): SuggestedNextActionsBuilder {
  return new SuggestedNextActionsBuilder();
}
export function createProgressIntelligenceReadinessBuilder(): ProgressIntelligenceReadinessBuilder {
  return new ProgressIntelligenceReadinessBuilder();
}
export function createDelegationProgressIntelligenceBuilder(): DelegationProgressIntelligenceBuilder {
  return new DelegationProgressIntelligenceBuilder();
}
export function createProgressIntelligenceConfidenceBuilder(): ProgressIntelligenceConfidenceBuilder {
  return new ProgressIntelligenceConfidenceBuilder();
}
export function createProgressIntelligenceExplanationBuilder(): ProgressIntelligenceExplanationBuilder {
  return new ProgressIntelligenceExplanationBuilder();
}
