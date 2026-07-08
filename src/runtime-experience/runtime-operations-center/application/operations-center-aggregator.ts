import type { AuthContext } from "../../../shared/auth/index.js";
import type { RuntimeProductionApprovalService } from "../../runtime-production-approval/application/runtime-production-approval-service.js";
import type { RuntimeOperationsService } from "../../runtime-operations/application/runtime-operations-service.js";
import type { RuntimeExecutiveDashboardService } from "../../runtime-executive/application/runtime-executive-dashboard-service.js";
import type { RuntimeFinalReadinessService } from "../../runtime-final-readiness/application/runtime-final-readiness-service.js";
import {
  OPERATIONS_CENTER_MODULE_IDS,
  OPERATIONS_CENTER_MODULE_META,
  buildOperationsCenterOverview,
  type OperationsCenterModuleOverview,
} from "../domain/operations-center-overview.js";
import { buildOperationsCenterHealth } from "../domain/operations-center-health.js";
import { buildOperationsCenterAlerts } from "../domain/operations-center-alerts.js";
import { buildOperationsCenterSummary, type OperationsCenterSummary } from "../domain/operations-center-summary.js";
import { collectOperationsCenterDependencyValidation } from "./operations-center-validator.js";

export interface OperationsCenterAggregation {
  overview: ReturnType<typeof buildOperationsCenterOverview>;
  health: ReturnType<typeof buildOperationsCenterHealth>;
  alerts: ReturnType<typeof buildOperationsCenterAlerts>;
  summary: OperationsCenterSummary;
  statusBoard: Array<{ id: string; label: string; status: string; delegateModule: string }>;
}

export interface OperationsCenterAggregatorDeps {
  runtimeProductionApproval: RuntimeProductionApprovalService;
  runtimeOperations: RuntimeOperationsService;
  runtimeExecutive: RuntimeExecutiveDashboardService;
  runtimeFinalReadiness: RuntimeFinalReadinessService;
}

export class OperationsCenterAggregator {
  constructor(private readonly deps: OperationsCenterAggregatorDeps) {}

  aggregate(authContext: AuthContext): OperationsCenterAggregation {
    const productionApproval = this.deps.runtimeProductionApproval.getApproval(authContext);
    const operationsSummary = this.deps.runtimeOperations.getSummary(authContext);
    const operationsAlerts = this.deps.runtimeOperations.getAlerts(authContext);

    const deps = collectOperationsCenterDependencyValidation();
    const modules = this.buildModuleOverview(deps);
    const overview = buildOperationsCenterOverview(modules);
    const productionApproved = productionApproval.decision.officiallyApprovedForProduction;

    const health = buildOperationsCenterHealth({
      healthStatus: operationsSummary.summary.health.healthStatus,
      readinessPercentage: operationsSummary.summary.health.readinessPercentage,
      qualityScore: operationsSummary.summary.health.qualityScore,
      approvalPercentage: productionApproval.overview.approvalPercentage,
      productionApproved,
      operationalPercentage: overview.operationalPercentage,
    });

    const alerts = buildOperationsCenterAlerts({
      operationsAlerts: operationsAlerts.alerts.map((a) => ({
        id: a.id,
        severity: a.severity,
        message: a.message,
        delegateModule: a.delegateModule,
      })),
      productionApproved,
    });

    const summary = buildOperationsCenterSummary({
      overview,
      health,
      alerts,
      productionApproved,
    });

    const statusBoard = [
      {
        id: "operations-center",
        label: "Runtime Operations Command",
        status: overview.overallStatus,
        delegateModule: "CH3-X27",
      },
      {
        id: "production-approval",
        label: "Production Approval Status",
        status: productionApproved ? "operational" : "degraded",
        delegateModule: "CH3-X26",
      },
      {
        id: "experiences",
        label: "Experience Operations",
        status: overview.modules.slice(0, 7).every((m) => m.healthy) ? "operational" : "degraded",
        delegateModule: "CH3-X5",
      },
      {
        id: "runtime-stack",
        label: "Runtime Stack Operations",
        status: overview.modules.slice(7, 16).every((m) => m.healthy) ? "operational" : "degraded",
        delegateModule: "CH3-X12",
      },
      {
        id: "governance",
        label: "Governance Operations",
        status: overview.modules.slice(16, 21).every((m) => m.healthy) ? "operational" : "degraded",
        delegateModule: "CH3-X21",
      },
      {
        id: "approval-layer",
        label: "Approval Layer Operations",
        status: deps.productionApproval ? "operational" : "offline",
        delegateModule: "CH3-X26",
      },
      ...overview.modules.map((m) => ({
        id: m.id,
        label: m.label,
        status: m.status,
        delegateModule: m.delegateModule,
      })),
    ];

    return { overview, health, alerts, summary, statusBoard };
  }

  private buildModuleOverview(
    deps: ReturnType<typeof collectOperationsCenterDependencyValidation>
  ): OperationsCenterModuleOverview[] {
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
      executive: deps.executive,
      readiness: deps.readiness,
      certification: deps.certification,
      finalReadiness: deps.finalReadiness,
      productionApproval: deps.productionApproval,
    };

    return OPERATIONS_CENTER_MODULE_IDS.map((id) => {
      const meta = OPERATIONS_CENTER_MODULE_META[id];
      const healthy = depMap[meta.depKey] ?? false;
      return {
        id,
        label: meta.label,
        delegateModule: meta.delegateModule,
        status: healthy ? ("operational" as const) : ("offline" as const),
        healthy,
      };
    });
  }
}

export function createOperationsCenterAggregator(deps: OperationsCenterAggregatorDeps): OperationsCenterAggregator {
  return new OperationsCenterAggregator(deps);
}
