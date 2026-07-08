import type { IntelligenceDashboardOutput } from "../../intelligence-dashboard/domain/intelligence-dashboard-context.js";
import type {
  ExecutiveCommandOverview,
  PlatformHealthStatus,
  StrategicStatus,
  OperationalStatus,
  IntelligenceOverview,
  ReadinessStatus,
  OrchestrationSummary,
  ExecutiveReport,
  ExecutiveConfidence,
  ExecutiveExplanation,
} from "../domain/executive-intelligence-center-context.js";
import type {
  ExecutiveConfidenceLevel,
  ExecutiveStatusLevel,
} from "../domain/executive-intelligence-center-schema.js";

function toExecutiveStatus(healthStatus: string, score: number): ExecutiveStatusLevel {
  if (healthStatus === "healthy" && score >= 80) return "optimal";
  if (score >= 65) return "stable";
  if (score >= 50) return "monitoring";
  return "critical";
}

export class ExecutiveCommandOverviewBuilder {
  build(dashboard: IntelligenceDashboardOutput): ExecutiveCommandOverview {
    const platformStatus = toExecutiveStatus(
      dashboard.intelligenceHealth.status,
      dashboard.intelligenceHealth.score
    );
    return {
      overviewId: "cmd.overview",
      headline: "Executive Command Center Overview",
      goal: dashboard.goal,
      scenarioId: dashboard.scenarioId,
      platformStatus,
      intelligenceConfidenceScore: dashboard.dashboardConfidence.score,
      journeyProgressPercent: dashboard.journeyProgress.progressPercent,
      ecosystemLayerCount: dashboard.timeline.length,
      summary: `Executive command center for "${dashboard.goal}" — ${platformStatus} platform status, ${dashboard.journeyProgress.progressPercent}% journey progress across C1–C19 ecosystem.`,
    };
  }
}

export class PlatformHealthStatusBuilder {
  build(dashboard: IntelligenceDashboardOutput): PlatformHealthStatus {
    const level = toExecutiveStatus(
      dashboard.intelligenceHealth.status,
      dashboard.intelligenceHealth.score
    );
    return {
      statusId: "platform.health",
      level,
      score: dashboard.intelligenceHealth.score,
      healthStatus: dashboard.intelligenceHealth.status,
      activeLayers: dashboard.intelligenceHealth.activeLayers,
      totalLayers: dashboard.intelligenceHealth.totalLayers,
      warnings: dashboard.intelligenceHealth.warnings,
      summary: dashboard.intelligenceHealth.summary,
    };
  }
}

export class StrategicStatusBuilder {
  build(dashboard: IntelligenceDashboardOutput): StrategicStatus {
    const strategyScore = dashboard.strategyOverview.confidenceScore;
    const evolutionScore = dashboard.evolutionOverview.confidenceScore;
    const avgScore = Math.round((strategyScore + evolutionScore) / 2);
    return {
      statusId: "status.strategic",
      level: toExecutiveStatus("stable", avgScore),
      strategyConfidence: strategyScore,
      evolutionConfidence: evolutionScore,
      headline: dashboard.strategyOverview.headline,
      summary: `${dashboard.strategyOverview.summary} ${dashboard.evolutionOverview.summary}`,
    };
  }
}

export class OperationalStatusBuilder {
  build(dashboard: IntelligenceDashboardOutput): OperationalStatus {
    const level = toExecutiveStatus(
      dashboard.intelligenceHealth.status,
      dashboard.journeyProgress.progressPercent
    );
    return {
      statusId: "status.operational",
      level,
      journeyProgressPercent: dashboard.journeyProgress.progressPercent,
      readinessScore: dashboard.readinessMetrics.readinessScore,
      currentLayer: dashboard.journeyProgress.currentLayer,
      summary: dashboard.journeyProgress.summary,
    };
  }
}

export class IntelligenceOverviewBuilder {
  build(dashboard: IntelligenceDashboardOutput): IntelligenceOverview {
    return {
      overviewId: "intel.overview",
      predictionConfidence: dashboard.predictionOverview.confidenceScore,
      strategyConfidence: dashboard.strategyOverview.confidenceScore,
      learningConfidence: dashboard.learningOverview.confidenceScore,
      optimizationConfidence: dashboard.optimizationOverview.confidenceScore,
      evolutionConfidence: dashboard.evolutionOverview.confidenceScore,
      summary: `Intelligence ecosystem: prediction ${dashboard.predictionOverview.confidenceScore}/100, strategy ${dashboard.strategyOverview.confidenceScore}/100, learning ${dashboard.learningOverview.confidenceScore}/100.`,
    };
  }
}

export class ReadinessStatusBuilder {
  build(dashboard: IntelligenceDashboardOutput): ReadinessStatus {
    return {
      statusId: "status.readiness",
      readinessScore: dashboard.readinessMetrics.readinessScore,
      layerCoveragePercent: dashboard.readinessMetrics.layerCoveragePercent,
      orchestrationConfidence: dashboard.confidenceMetrics.orchestrationConfidenceScore,
      summary: dashboard.readinessMetrics.summary,
    };
  }
}

export class OrchestrationSummaryBuilder {
  build(dashboard: IntelligenceDashboardOutput): OrchestrationSummary {
    return {
      summaryId: "orch.summary",
      orchestrationOutputId: dashboard.orchestrationOutputId,
      chainLayerCount: dashboard.timeline.length,
      coordinationReady: dashboard.confidenceMetrics.orchestrationConfidenceScore >= 65,
      headline: "Orchestration Summary",
      summary: dashboard.executiveSummary.orchestrationSummary,
    };
  }
}

export class ExecutiveReportsBuilder {
  build(dashboard: IntelligenceDashboardOutput): ExecutiveReport[] {
    const reports: ExecutiveReport[] = [
      {
        reportId: "report.platform",
        title: "Platform Health Report",
        category: "platform",
        summary: dashboard.intelligenceHealth.summary,
        priority: dashboard.intelligenceHealth.warnings.length > 0 ? "high" : "medium",
      },
      {
        reportId: "report.strategic",
        title: "Strategic Intelligence Report",
        category: "strategic",
        summary: dashboard.executiveSummary.experienceSummary,
        priority: dashboard.strategyOverview.confidenceScore >= 75 ? "medium" : "high",
      },
      {
        reportId: "report.operational",
        title: "Operational Progress Report",
        category: "operational",
        summary: dashboard.journeyProgress.summary,
        priority: dashboard.journeyProgress.progressPercent >= 80 ? "low" : "medium",
      },
      {
        reportId: "report.intelligence",
        title: "Intelligence Ecosystem Report",
        category: "intelligence",
        summary: dashboard.executiveSummary.journeySummary,
        priority: dashboard.dashboardConfidence.level === "high" ? "low" : "medium",
      },
    ];

    if (dashboard.intelligenceHealth.warnings.length >= 2) {
      reports.push({
        reportId: "report.attention",
        title: "Executive Attention Required",
        category: "platform",
        summary: `${dashboard.intelligenceHealth.warnings.length} platform warnings require executive review.`,
        priority: "critical",
      });
    }

    return reports;
  }
}

export class ExecutiveConfidenceBuilder {
  build(dashboard: IntelligenceDashboardOutput, platformScore: number): ExecutiveConfidence {
    let score = 52;
    score += Math.min(dashboard.dashboardConfidence.score * 0.22, 20);
    score += Math.min(platformScore * 0.2, 18);
    score = Math.min(95, Math.max(35, Math.round(score)));

    const level: ExecutiveConfidenceLevel = score >= 80 ? "high" : score >= 60 ? "medium" : "low";

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "Executive command center reflects high-confidence unified Action Intelligence platform."
          : level === "medium"
            ? "Executive view viable; some ecosystem layers may require attention."
            : "Limited executive confidence — treat command center outputs as advisory only.",
      dashboardConfidenceScore: dashboard.dashboardConfidence.score,
      platformHealthScore: platformScore,
    };
  }
}

export class ExecutiveExplanationBuilder {
  build(input: {
    outputId: string;
    goal: string;
    dashboard: IntelligenceDashboardOutput;
    overview: ExecutiveCommandOverview;
    platform: PlatformHealthStatus;
    strategic: StrategicStatus;
    operational: OperationalStatus;
    reports: ExecutiveReport[];
    executiveConfidenceScore: number;
  }): ExecutiveExplanation {
    return {
      explanationId: `explanation-${input.outputId}`,
      headline: `Executive intelligence center for "${input.goal}"`,
      summary: `C1–C19 Action Intelligence ecosystem at executive level (confidence ${input.executiveConfidenceScore}/100) — ${input.reports.length} executive reports, ${input.overview.ecosystemLayerCount} intelligence layers.`,
      platformSummary: input.platform.summary,
      strategicSummary: input.strategic.summary,
      operationalSummary: input.operational.summary,
      ecosystemSummary: input.dashboard.executiveSummary.journeySummary,
    };
  }
}

export function createExecutiveCommandOverviewBuilder(): ExecutiveCommandOverviewBuilder {
  return new ExecutiveCommandOverviewBuilder();
}
export function createPlatformHealthStatusBuilder(): PlatformHealthStatusBuilder {
  return new PlatformHealthStatusBuilder();
}
export function createStrategicStatusBuilder(): StrategicStatusBuilder {
  return new StrategicStatusBuilder();
}
export function createOperationalStatusBuilder(): OperationalStatusBuilder {
  return new OperationalStatusBuilder();
}
export function createIntelligenceOverviewBuilder(): IntelligenceOverviewBuilder {
  return new IntelligenceOverviewBuilder();
}
export function createReadinessStatusBuilder(): ReadinessStatusBuilder {
  return new ReadinessStatusBuilder();
}
export function createOrchestrationSummaryBuilder(): OrchestrationSummaryBuilder {
  return new OrchestrationSummaryBuilder();
}
export function createExecutiveReportsBuilder(): ExecutiveReportsBuilder {
  return new ExecutiveReportsBuilder();
}
export function createExecutiveConfidenceBuilder(): ExecutiveConfidenceBuilder {
  return new ExecutiveConfidenceBuilder();
}
export function createExecutiveExplanationBuilder(): ExecutiveExplanationBuilder {
  return new ExecutiveExplanationBuilder();
}
