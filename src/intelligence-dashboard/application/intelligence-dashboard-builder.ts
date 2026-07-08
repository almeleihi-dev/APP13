import type { ActionIntelligenceExperienceOutput } from "../../action-intelligence-experience/domain/action-intelligence-experience-context.js";
import { INTELLIGENCE_DASHBOARD_FIXED_TIMESTAMP } from "../domain/intelligence-dashboard-schema.js";
import {
  DASHBOARD_LAYER_KEYS,
  type DashboardOverviewKey,
} from "../domain/intelligence-dashboard-schema.js";
import type {
  ExecutiveOverview,
  IntelligenceHealth,
  JourneyProgress,
  ConfidenceMetrics,
  ReadinessMetrics,
  LayerOverview,
  TimelineEvent,
  DashboardConfidence,
  ExecutiveSummary,
} from "../domain/intelligence-dashboard-context.js";
import type {
  DashboardConfidenceLevel,
  DashboardHealthStatus,
} from "../domain/intelligence-dashboard-schema.js";

const OVERVIEW_TITLES: Record<DashboardOverviewKey, string> = {
  trust: "Trust Overview",
  decision: "Decision Overview",
  recommendation: "Recommendation Overview",
  prediction: "Prediction Overview",
  strategy: "Strategy Overview",
  learning: "Learning Overview",
  optimization: "Optimization Overview",
  evolution: "Evolution Overview",
};

function averageConfidence(steps: ActionIntelligenceExperienceOutput["journeySteps"]): number {
  if (steps.length === 0) return 0;
  return Math.round(
    steps.reduce((sum, s) => sum + s.confidenceScore, 0) / steps.length
  );
}

function healthStatusFromScore(score: number, linkedCount: number): DashboardHealthStatus {
  if (score >= 80 && linkedCount === 0) return "healthy";
  if (score >= 65) return "stable";
  if (score >= 50) return "attention";
  return "critical";
}

export class ExecutiveOverviewBuilder {
  build(experience: ActionIntelligenceExperienceOutput, health: IntelligenceHealth): ExecutiveOverview {
    const activeLayers = experience.journeySteps.filter((s) => s.status === "active").length;
    return {
      overviewId: "exec.overview",
      headline: "Executive Intelligence Overview",
      goal: experience.goal,
      scenarioId: experience.scenarioId,
      journeyStepCount: experience.journeySteps.length,
      activeLayerCount: activeLayers,
      overallConfidenceScore: experience.experienceConfidence.score,
      healthStatus: health.status,
      summary: `Unified C1–C18 intelligence dashboard for "${experience.goal}" — ${activeLayers}/${experience.journeySteps.length} active layers, ${experience.experienceConfidence.score}/100 confidence.`,
    };
  }
}

export class IntelligenceHealthBuilder {
  build(experience: ActionIntelligenceExperienceOutput): IntelligenceHealth {
    const activeLayers = experience.journeySteps.filter((s) => s.status === "active").length;
    const linkedLayers = experience.journeySteps.filter((s) => s.status === "linked").length;
    const totalLayers = experience.journeySteps.length;
    const avgConfidence = averageConfidence(experience.journeySteps);
    const score = Math.round((activeLayers / totalLayers) * 50 + avgConfidence * 0.5);
    const status = healthStatusFromScore(score, linkedLayers);

    const warnings: string[] = [];
    if (linkedLayers > 0) warnings.push(`${linkedLayers} layer(s) in linked status.`);
    if (avgConfidence < 65) warnings.push("Average layer confidence below optimal threshold.");

    return {
      healthId: "health.intelligence",
      status,
      score,
      activeLayers,
      linkedLayers,
      totalLayers,
      warnings,
      summary:
        warnings.length === 0
          ? `Intelligence health ${status} — all ${totalLayers} layers operational.`
          : `Intelligence health ${status} — ${warnings.length} advisory warning(s).`,
    };
  }
}

export class JourneyProgressBuilder {
  build(experience: ActionIntelligenceExperienceOutput): JourneyProgress {
    const activeSteps = experience.journeySteps.filter((s) => s.status === "active").length;
    const totalSteps = experience.journeySteps.length;
    const lastStep = experience.journeySteps[experience.journeySteps.length - 1];

    return {
      progressId: "progress.journey",
      completedSteps: activeSteps,
      totalSteps,
      progressPercent: Math.round((activeSteps / totalSteps) * 100),
      currentLayer: lastStep?.layerKey ?? "unknown",
      summary: `Journey progress ${activeSteps}/${totalSteps} layers active through ${lastStep?.layerKey ?? "chain"}.`,
    };
  }
}

export class ConfidenceMetricsBuilder {
  build(experience: ActionIntelligenceExperienceOutput): ConfidenceMetrics {
    const ec = experience.experienceConfidence;
    return {
      metricsId: "metrics.confidence",
      experienceConfidenceScore: ec.score,
      experienceConfidenceLevel: ec.level,
      orchestrationConfidenceScore: ec.orchestrationConfidenceScore,
      journeyCompletenessScore: ec.journeyCompletenessScore,
      averageLayerConfidence: averageConfidence(experience.journeySteps),
      rationale: ec.rationale,
    };
  }
}

export class ReadinessMetricsBuilder {
  build(experience: ActionIntelligenceExperienceOutput): ReadinessMetrics {
    const layerCoverage = experience.experienceConfidence.journeyCompletenessScore;
    const readinessScore = Math.round(
      (layerCoverage + experience.experienceConfidence.orchestrationConfidenceScore) / 2
    );

    return {
      metricsId: "metrics.readiness",
      readinessScore,
      layerCoveragePercent: layerCoverage,
      summary: experience.explanation.readinessSummary,
    };
  }
}

export class LayerOverviewBuilder {
  build(experience: ActionIntelligenceExperienceOutput, layerKey: string, title: string): LayerOverview {
    const layer =
      experience.layerPresentations.find((p) => p.layerKey === layerKey) ??
      experience.journeySteps.find((s) => s.layerKey === layerKey);

    if (layer && "screenTitle" in layer) {
      return {
        overviewId: `overview.${layerKey}`,
        layerKey,
        title,
        headline: layer.headline,
        summary: layer.summary,
        outputRef: layer.outputRef,
        confidenceScore: layer.confidenceScore,
        status: layer.status,
      };
    }

    const step = experience.journeySteps.find((s) => s.layerKey === layerKey);
    return {
      overviewId: `overview.${layerKey}`,
      layerKey,
      title,
      headline: step?.headline ?? title,
      summary: step?.summary ?? "Layer data unavailable.",
      outputRef: step?.outputRef ?? "unknown",
      confidenceScore: step?.confidenceScore ?? 0,
      status: step?.status ?? "pending",
    };
  }

  buildAll(experience: ActionIntelligenceExperienceOutput): Record<DashboardOverviewKey, LayerOverview> {
    const result = {} as Record<DashboardOverviewKey, LayerOverview>;
    for (const [key, layerKey] of Object.entries(DASHBOARD_LAYER_KEYS) as Array<
      [DashboardOverviewKey, string]
    >) {
      result[key] = this.build(experience, layerKey, OVERVIEW_TITLES[key]);
    }
    return result;
  }
}

export class TimelineBuilder {
  build(experience: ActionIntelligenceExperienceOutput): TimelineEvent[] {
    return experience.journeySteps.map((step) => ({
      eventId: `timeline.${step.layerKey}`,
      step: step.step,
      layerKey: step.layerKey,
      title: step.title,
      summary: step.summary,
      confidenceScore: step.confidenceScore,
      timestamp: INTELLIGENCE_DASHBOARD_FIXED_TIMESTAMP,
    }));
  }
}

export class DashboardConfidenceBuilder {
  build(experience: ActionIntelligenceExperienceOutput, healthScore: number): DashboardConfidence {
    let score = 50;
    score += Math.min(experience.experienceConfidence.score * 0.25, 22);
    score += Math.min(healthScore * 0.2, 18);
    score = Math.min(95, Math.max(35, Math.round(score)));

    const level: DashboardConfidenceLevel = score >= 80 ? "high" : score >= 60 ? "medium" : "low";

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "Executive dashboard reflects high-confidence unified intelligence across C1–C18."
          : level === "medium"
            ? "Dashboard viable; some intelligence layers may require attention."
            : "Limited dashboard confidence — treat executive metrics as advisory only.",
      experienceConfidenceScore: experience.experienceConfidence.score,
    };
  }
}

export class ExecutiveSummaryBuilder {
  build(experience: ActionIntelligenceExperienceOutput, overview: ExecutiveOverview): ExecutiveSummary {
    return {
      summaryId: "summary.executive",
      headline: `Executive Summary: ${experience.goal}`,
      goal: experience.goal,
      experienceSummary: experience.explanation.summary,
      orchestrationSummary: experience.explanation.orchestrationSummary,
      readinessSummary: experience.explanation.readinessSummary,
      journeySummary: `${overview.journeyStepCount}-step intelligence journey at ${overview.overallConfidenceScore}/100 confidence — ${overview.healthStatus} health.`,
    };
  }
}

export function createExecutiveOverviewBuilder(): ExecutiveOverviewBuilder {
  return new ExecutiveOverviewBuilder();
}
export function createIntelligenceHealthBuilder(): IntelligenceHealthBuilder {
  return new IntelligenceHealthBuilder();
}
export function createJourneyProgressBuilder(): JourneyProgressBuilder {
  return new JourneyProgressBuilder();
}
export function createConfidenceMetricsBuilder(): ConfidenceMetricsBuilder {
  return new ConfidenceMetricsBuilder();
}
export function createReadinessMetricsBuilder(): ReadinessMetricsBuilder {
  return new ReadinessMetricsBuilder();
}
export function createLayerOverviewBuilder(): LayerOverviewBuilder {
  return new LayerOverviewBuilder();
}
export function createTimelineBuilder(): TimelineBuilder {
  return new TimelineBuilder();
}
export function createDashboardConfidenceBuilder(): DashboardConfidenceBuilder {
  return new DashboardConfidenceBuilder();
}
export function createExecutiveSummaryBuilder(): ExecutiveSummaryBuilder {
  return new ExecutiveSummaryBuilder();
}
