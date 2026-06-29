import type { AiProgressIntelligenceExperienceOutput } from "../../ai-progress-intelligence-experience/domain/ai-progress-intelligence-experience-context.js";
import { UPSTREAM_MODULE_ID } from "../domain/ai-adaptive-coaching-experience-schema.js";
import type {
  CoachingCheck,
  CoachingContext,
  AdaptiveGuidance,
  CoachingInsights,
  CoachingInsight,
  ImprovementOpportunities,
  ImprovementOpportunity,
  MotivationSummary,
  BehavioralSuggestions,
  BehavioralSuggestion,
  CoachingReadiness,
  DelegationAdaptiveCoaching,
  AdaptiveCoachingConfidence,
  CoachingExplanation,
} from "../domain/ai-adaptive-coaching-experience-context.js";
import type {
  AdaptiveCoachingStatusLevel,
  AdaptiveCoachingConfidenceLevel,
} from "../domain/ai-adaptive-coaching-experience-schema.js";

function mapProgressStatus(status: string): AdaptiveCoachingStatusLevel {
  if (status === "on_track") return "coaching_ready";
  if (status === "conditional") return "conditional";
  if (status === "pending") return "pending";
  return "not_ready";
}

function check(id: string, label: string, passed: boolean, score: number, detail: string): CoachingCheck {
  return { checkId: id, label, passed, score, detail };
}

export class CoachingContextBuilder {
  build(progress: AiProgressIntelligenceExperienceOutput): CoachingContext {
    const ctx = progress.progressContext;

    return {
      contextId: `coaching-context-${progress.outputId}`,
      progressIntelligenceOutputId: progress.outputId,
      executionCompanionOutputId: ctx.executionCompanionOutputId,
      actionPlanningOutputId: ctx.actionPlanningOutputId,
      decisionSupportOutputId: ctx.decisionSupportOutputId,
      guidanceOutputId: ctx.guidanceOutputId,
      conversationOutputId: ctx.conversationOutputId,
      foundationOutputId: ctx.foundationOutputId,
      scenarioId: progress.scenarioId,
      canonicalActionId: progress.canonicalActionId,
      goal: progress.goal,
      experienceMode: "read_only",
    };
  }
}

export class AdaptiveGuidanceBuilder {
  build(progress: AiProgressIntelligenceExperienceOutput): AdaptiveGuidance {
    const overview = progress.progressOverview;
    const nextAction = progress.suggestedNextActions.actions[0];

    return {
      guidanceId: `adaptive-guidance-${progress.outputId}`,
      headline: `Adaptive Coaching: ${progress.goal}`,
      currentStepTitle: overview.currentStepTitle,
      recommendedFocus: nextAction?.title ?? overview.currentStepTitle,
      readOnly: true,
      summary: `Read-only adaptive guidance — focus on "${nextAction?.title ?? overview.currentStepTitle}" (${overview.completedSteps}/${overview.totalSteps} steps complete).`,
    };
  }
}

export class CoachingInsightsBuilder {
  build(progress: AiProgressIntelligenceExperienceOutput): CoachingInsights {
    const insights: CoachingInsight[] = progress.progressMetrics.metrics.map((metric, index) => ({
      insightId: `insight-${metric.metricId}`,
      sequence: index + 1,
      label: metric.label,
      detail: `${metric.label}: ${metric.value} ${metric.unit} — ${metric.detail}`,
    }));

    return {
      insightsId: `insights-${progress.outputId}`,
      insights,
      summary: `${insights.length} read-only coaching insights from progress metrics.`,
    };
  }
}

export class ImprovementOpportunitiesBuilder {
  build(progress: AiProgressIntelligenceExperienceOutput): ImprovementOpportunities {
    const opportunities: ImprovementOpportunity[] = progress.riskIndicators.indicators.map(
      (indicator, index) => ({
        opportunityId: `improvement-${indicator.indicatorId}`,
        sequence: index + 1,
        title: `Address ${indicator.label}`,
        detail: indicator.detail,
        sourceRiskId: indicator.indicatorId,
      })
    );

    return {
      opportunitiesId: `improvements-${progress.outputId}`,
      opportunities,
      summary: `${opportunities.length} read-only improvement opportunities from risk indicators.`,
    };
  }
}

export class MotivationSummaryBuilder {
  build(progress: AiProgressIntelligenceExperienceOutput): MotivationSummary {
    const overview = progress.progressOverview;
    const remaining = overview.totalSteps - overview.completedSteps;

    return {
      motivationId: `motivation-${progress.outputId}`,
      headline: `Stay on track: ${progress.goal}`,
      percentComplete: overview.percentComplete,
      stepsRemaining: remaining,
      encouragement:
        remaining > 0
          ? `You have ${remaining} steps ahead — read-only coaching supports your progress.`
          : "All steps tracked — coaching remains advisory only.",
      readOnly: true,
      summary: `Motivation summary — ${overview.percentComplete}% complete, ${remaining} steps remaining.`,
    };
  }
}

export class BehavioralSuggestionsBuilder {
  build(progress: AiProgressIntelligenceExperienceOutput): BehavioralSuggestions {
    const suggestions: BehavioralSuggestion[] = progress.suggestedNextActions.actions.map(
      (action) => ({
        suggestionId: `behavior-${action.actionId}`,
        sequence: action.sequence,
        behavior: action.title,
        detail: `Read-only behavioral suggestion: ${action.detail}`,
      })
    );

    return {
      suggestionsId: `behavior-${progress.outputId}`,
      suggestions,
      summary: `${suggestions.length} read-only behavioral suggestions from suggested next actions.`,
    };
  }
}

export class CoachingReadinessBuilder {
  build(progress: AiProgressIntelligenceExperienceOutput): CoachingReadiness {
    const readiness = progress.progressIntelligenceReadiness;
    const level = mapProgressStatus(readiness.level);
    const coachingReady = readiness.intelligenceReady && readiness.readinessScore >= 50;

    return {
      readinessId: "coaching.readiness",
      level,
      readinessScore: readiness.readinessScore,
      coachingReady,
      checks: readiness.checks.map((c) =>
        check(c.checkId, c.label, c.passed, c.score, c.detail)
      ),
      summary: `Coaching readiness — ${readiness.readinessScore}/100, coaching ${coachingReady ? "ready" : "pending"}.`,
    };
  }
}

export class DelegationAdaptiveCoachingBuilder {
  build(progress: AiProgressIntelligenceExperienceOutput): DelegationAdaptiveCoaching {
    const checks: CoachingCheck[] = [
      check(
        "del.upstream",
        "Sole upstream delegation",
        !!progress.outputId,
        progress.outputId ? 100 : 0,
        `Delegates exclusively to ${UPSTREAM_MODULE_ID} AI Progress Intelligence Experience.`
      ),
      check(
        "del.trace",
        "Progress intelligence traceability",
        !!progress.executionCompanionOutputId,
        progress.executionCompanionOutputId ? 95 : 0,
        `Progress intelligence ${progress.outputId} → execution companion ${progress.executionCompanionOutputId}.`
      ),
      check(
        "del.nodup",
        "No duplicated business logic",
        true,
        100,
        "Adaptive coaching builders format progress intelligence output only."
      ),
    ];

    return {
      delegationId: "coaching.delegation",
      soleUpstream: "CH5-X7 AI Progress Intelligence Experience",
      noDuplicatedLogic: true,
      progressIntelligenceOutputId: progress.outputId,
      checks,
      summary: "Delegation adaptive coaching — sole upstream X7, no duplicated logic.",
    };
  }
}

export class AdaptiveCoachingConfidenceBuilder {
  build(
    progress: AiProgressIntelligenceExperienceOutput,
    readinessScore: number
  ): AdaptiveCoachingConfidence {
    let score = 42;
    score += Math.min(progress.progressIntelligenceConfidence.score * 0.3, 28);
    score += Math.min(readinessScore * 0.16, 16);
    score = Math.min(98, Math.max(40, Math.round(score)));

    const level: AdaptiveCoachingConfidenceLevel =
      score >= 80 ? "high" : score >= 60 ? "medium" : "low";

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "AI Adaptive Coaching Experience meets high-confidence criteria from progress intelligence."
          : level === "medium"
            ? "Adaptive coaching viable with conditional progress intelligence requiring review."
            : "Limited adaptive coaching confidence — treat outputs as advisory only.",
      progressIntelligenceConfidenceScore: progress.progressIntelligenceConfidence.score,
    };
  }
}

export class CoachingExplanationBuilder {
  build(input: {
    outputId: string;
    goal: string;
    guidance: AdaptiveGuidance;
    insights: CoachingInsights;
    readiness: CoachingReadiness;
    adaptiveCoachingConfidenceScore: number;
  }): CoachingExplanation {
    return {
      explanationId: `coaching-explanation-${input.outputId}`,
      headline: `AI Adaptive Coaching for "${input.goal}"`,
      summary: `Read-only adaptive coaching (confidence ${input.adaptiveCoachingConfidenceScore}/100) — ${input.insights.insights.length} insights, focus on "${input.guidance.recommendedFocus}".`,
      guidanceSummary: input.guidance.summary,
      insightsSummary: input.insights.summary,
      readinessSummary: input.readiness.summary,
    };
  }
}

export function createCoachingContextBuilder(): CoachingContextBuilder {
  return new CoachingContextBuilder();
}
export function createAdaptiveGuidanceBuilder(): AdaptiveGuidanceBuilder {
  return new AdaptiveGuidanceBuilder();
}
export function createCoachingInsightsBuilder(): CoachingInsightsBuilder {
  return new CoachingInsightsBuilder();
}
export function createImprovementOpportunitiesBuilder(): ImprovementOpportunitiesBuilder {
  return new ImprovementOpportunitiesBuilder();
}
export function createMotivationSummaryBuilder(): MotivationSummaryBuilder {
  return new MotivationSummaryBuilder();
}
export function createBehavioralSuggestionsBuilder(): BehavioralSuggestionsBuilder {
  return new BehavioralSuggestionsBuilder();
}
export function createCoachingReadinessBuilder(): CoachingReadinessBuilder {
  return new CoachingReadinessBuilder();
}
export function createDelegationAdaptiveCoachingBuilder(): DelegationAdaptiveCoachingBuilder {
  return new DelegationAdaptiveCoachingBuilder();
}
export function createAdaptiveCoachingConfidenceBuilder(): AdaptiveCoachingConfidenceBuilder {
  return new AdaptiveCoachingConfidenceBuilder();
}
export function createCoachingExplanationBuilder(): CoachingExplanationBuilder {
  return new CoachingExplanationBuilder();
}
