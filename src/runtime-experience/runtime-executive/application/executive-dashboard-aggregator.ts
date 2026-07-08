import type { AuthContext } from "../../../shared/auth/index.js";
import type { RuntimeOperationsService } from "../../runtime-operations/application/runtime-operations-service.js";
import type { RuntimeReleaseService } from "../../runtime-release/application/runtime-release-service.js";
import type { RuntimeLauncherService } from "../../runtime-launcher/application/runtime-launcher-service.js";
import type { RuntimeHealthService } from "../../runtime-health/application/runtime-health-service.js";
import { EXECUTIVE_FIXED_TIMESTAMP } from "../domain/runtime-executive-dashboard.js";
import {
  EXECUTIVE_MODULE_IDS,
  EXECUTIVE_MODULE_META,
  buildExecutiveOverview,
  type ExecutiveModuleStatus,
} from "../domain/executive-overview.js";
import { buildExecutiveKpis } from "../domain/executive-kpis.js";
import { buildExecutiveInsights, type ExecutiveInsight } from "../domain/executive-insights.js";
import { buildExecutiveSummary, type ExecutiveSummary } from "../domain/executive-summary.js";
import { collectExecutiveDependencyValidation } from "./executive-dashboard-validator.js";

export interface ExecutiveAggregation {
  overview: ReturnType<typeof buildExecutiveOverview>;
  kpis: ReturnType<typeof buildExecutiveKpis>;
  insights: ExecutiveInsight[];
  summary: ExecutiveSummary;
  commandBoard: Array<{ id: string; label: string; status: string; delegateModule: string; priority: string }>;
}

export interface ExecutiveDashboardAggregatorDeps {
  runtimeOperations: RuntimeOperationsService;
  runtimeRelease: RuntimeReleaseService;
  runtimeLauncher: RuntimeLauncherService;
  runtimeHealth: RuntimeHealthService;
}

export class ExecutiveDashboardAggregator {
  constructor(private readonly deps: ExecutiveDashboardAggregatorDeps) {}

  aggregate(authContext: AuthContext): ExecutiveAggregation {
    const generatedAt = EXECUTIVE_FIXED_TIMESTAMP;
    const input = { generated_at: generatedAt };

    this.deps.runtimeOperations.refresh(authContext);
    const opsDashboard = this.deps.runtimeOperations.getDashboard(authContext);
    const opsHealth = this.deps.runtimeOperations.getHealth(authContext);
    const opsAlerts = this.deps.runtimeOperations.getAlerts(authContext);
    const releaseCert = this.deps.runtimeRelease.getCertification(authContext);
    const launcherHandoff = this.deps.runtimeLauncher.getHandoff(authContext);
    this.deps.runtimeHealth.getHealth(authContext, input);

    const deps = collectExecutiveDependencyValidation();
    const modules = this.buildModuleStatus(deps);
    const overview = buildExecutiveOverview(modules);
    const kpis = buildExecutiveKpis({
      mvpReadinessPercentage: opsHealth.health.mvpReadinessPercentage,
      releaseQualityScore: opsHealth.health.qualityScore,
      operationalModuleCount: overview.onTrackCount,
      totalModuleCount: overview.moduleCount,
      certificationStatus: releaseCert.certification.decision,
      overallHealthStatus: opsHealth.health.healthStatus,
    });
    const insights = buildExecutiveInsights({
      alerts: opsAlerts.alerts,
      recommendations: releaseCert.certification.recommendations,
      overallStatus: overview.overallStatus,
      certified: releaseCert.certification.certified,
    });
    const summary = buildExecutiveSummary({ overview, kpis, insights });
    const commandBoard = [
      { id: "experiences", label: "User Experiences", status: overview.onTrackCount >= 7 ? "on-track" : "attention", delegateModule: "CH3-X5", priority: "high" },
      { id: "runtime-stack", label: "Runtime Stack", status: overview.onTrackCount >= 12 ? "on-track" : "attention", delegateModule: "CH3-X12", priority: "high" },
      { id: "certification", label: "Release Certification", status: releaseCert.certification.certified ? "on-track" : "attention", delegateModule: "CH3-X20", priority: "high" },
      { id: "operations", label: "Operations Center", status: opsDashboard.dashboard.overallStatus === "operational" ? "on-track" : "attention", delegateModule: "CH3-X21", priority: "medium" },
      { id: "handoff", label: "MVP Handoff", status: launcherHandoff.handoff.ready ? "on-track" : "attention", delegateModule: "CH3-X19", priority: "medium" },
      { id: "executive", label: "Executive Readiness", status: kpis.executiveReadinessScore >= 90 ? "on-track" : "attention", delegateModule: "CH3-X22", priority: "high" },
    ];

    return { overview, kpis, insights, summary, commandBoard };
  }

  private buildModuleStatus(deps: ReturnType<typeof collectExecutiveDependencyValidation>): ExecutiveModuleStatus[] {
    const depMap: Record<string, boolean> = {
      need: deps.need,
      action: deps.action,
      contract: deps.contract,
      chat: deps.chat,
      timeline: deps.timeline,
      notification: deps.notification,
      profile: deps.profile,
      journey: deps.journey,
      state: deps.state,
      registry: deps.registry,
      coordinator: deps.coordinator,
      health: deps.health,
      demo: deps.demo,
      preview: deps.preview,
      launcher: deps.launcher,
      release: deps.release,
      operations: deps.operations,
    };

    return EXECUTIVE_MODULE_IDS.map((id) => {
      const meta = EXECUTIVE_MODULE_META[id];
      const healthy = depMap[meta.depKey] ?? false;
      return {
        id,
        label: meta.label,
        delegateModule: meta.delegateModule,
        status: healthy ? ("on-track" as const) : ("at-risk" as const),
        healthy,
      };
    });
  }
}

export function createExecutiveDashboardAggregator(deps: ExecutiveDashboardAggregatorDeps): ExecutiveDashboardAggregator {
  return new ExecutiveDashboardAggregator(deps);
}
