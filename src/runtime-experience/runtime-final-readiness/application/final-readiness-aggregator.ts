import type { AuthContext } from "../../../shared/auth/index.js";
import type { RuntimeCertificationService } from "../../runtime-certification/application/runtime-certification-service.js";
import type { RuntimeReadinessConsoleService } from "../../runtime-readiness/application/runtime-readiness-console-service.js";
import type { RuntimeExecutiveDashboardService } from "../../runtime-executive/application/runtime-executive-dashboard-service.js";
import type { RuntimeOperationsService } from "../../runtime-operations/application/runtime-operations-service.js";
import {
  FINAL_READINESS_MODULE_IDS,
  FINAL_READINESS_MODULE_META,
  buildFinalReadinessOverview,
  type FinalReadinessModuleOverview,
} from "../domain/final-readiness-overview.js";
import { FINAL_READINESS_CHECK_IDS, type FinalReadinessCheck } from "../domain/final-readiness-checks.js";
import { buildFinalReadinessRisks, type FinalReadinessRisk } from "../domain/final-readiness-risks.js";
import { buildFinalReadinessSummary, type FinalReadinessSummary } from "../domain/final-readiness-summary.js";
import { collectFinalReadinessDependencyValidation } from "./final-readiness-validator.js";

export interface FinalReadinessAggregation {
  overview: ReturnType<typeof buildFinalReadinessOverview>;
  checks: FinalReadinessCheck[];
  risks: FinalReadinessRisk[];
  summary: FinalReadinessSummary;
  board: Array<{ id: string; label: string; status: string; delegateModule: string }>;
}

export interface FinalReadinessAggregatorDeps {
  runtimeCertification: RuntimeCertificationService;
  runtimeReadiness: RuntimeReadinessConsoleService;
  runtimeExecutive: RuntimeExecutiveDashboardService;
  runtimeOperations: RuntimeOperationsService;
}

const CHECK_META: Record<
  (typeof FINAL_READINESS_CHECK_IDS)[number],
  { label: string; delegateModule: string; depKey: string }
> = {
  "need-experience": { label: "Need Experience", delegateModule: "CH3-X5", depKey: "need" },
  "action-experience": { label: "Action Experience", delegateModule: "CH3-X6", depKey: "action" },
  "contract-experience": { label: "Contract Experience", delegateModule: "CH3-X7", depKey: "contract" },
  "chat-experience": { label: "Chat Experience", delegateModule: "CH3-X8", depKey: "chat" },
  "timeline-experience": { label: "Timeline Experience", delegateModule: "CH3-X9", depKey: "timeline" },
  "notification-experience": { label: "Notification Experience", delegateModule: "CH3-X10", depKey: "notification" },
  "profile-experience": { label: "Profile Experience", delegateModule: "CH3-X11", depKey: "profile" },
  "runtime-journey": { label: "Runtime Journey", delegateModule: "CH3-X12", depKey: "journey" },
  "runtime-state": { label: "Runtime State", delegateModule: "CH3-X13", depKey: "state" },
  "runtime-registry": { label: "Runtime Registry", delegateModule: "CH3-X14", depKey: "registry" },
  "runtime-coordinator": { label: "Runtime Coordinator", delegateModule: "CH3-X15", depKey: "coordinator" },
  "runtime-health": { label: "Runtime Health", delegateModule: "CH3-X16", depKey: "health" },
  "runtime-demo": { label: "Runtime Demo", delegateModule: "CH3-X17", depKey: "demo" },
  "runtime-preview": { label: "Runtime Preview", delegateModule: "CH3-X18", depKey: "preview" },
  "runtime-launcher": { label: "Runtime Launcher", delegateModule: "CH3-X19", depKey: "launcher" },
  "runtime-release": { label: "Runtime Release", delegateModule: "CH3-X20", depKey: "release" },
  "runtime-operations": { label: "Runtime Operations", delegateModule: "CH3-X21", depKey: "operations" },
  "runtime-executive": { label: "Runtime Executive", delegateModule: "CH3-X22", depKey: "executive" },
  "runtime-readiness": { label: "Runtime Readiness", delegateModule: "CH3-X23", depKey: "readiness" },
  "runtime-certification": { label: "Runtime Certification", delegateModule: "CH3-X24", depKey: "certification" },
};

export class FinalReadinessAggregator {
  constructor(private readonly deps: FinalReadinessAggregatorDeps) {}

  aggregate(authContext: AuthContext): FinalReadinessAggregation {
    this.deps.runtimeCertification.refresh(authContext);
    const certification = this.deps.runtimeCertification.getCertification(authContext);
    this.deps.runtimeCertification.getBoard(authContext);
    this.deps.runtimeReadiness.refresh(authContext);
    this.deps.runtimeReadiness.getSummary(authContext);
    this.deps.runtimeExecutive.refresh(authContext);
    this.deps.runtimeExecutive.getExecutive(authContext);
    this.deps.runtimeOperations.refresh(authContext);
    this.deps.runtimeOperations.getDashboard(authContext);

    const deps = collectFinalReadinessDependencyValidation();
    const checks = this.buildChecks(deps);
    const modules = this.buildModuleOverview(deps);
    const overview = buildFinalReadinessOverview(modules);
    const risks = buildFinalReadinessRisks(checks, overview);
    const certificationApproved = certification.status.readyForProductionApproval;
    const summary = buildFinalReadinessSummary({
      overview,
      risks,
      checks,
      certificationApproved,
    });
    const board = [
      { id: "final-review", label: "Final Readiness Review", status: overview.overallStatus, delegateModule: "CH3-X25" },
      { id: "experiences", label: "Experience Review", status: overview.modules.slice(0, 7).every((m) => m.approved) ? "approved" : "conditional", delegateModule: "CH3-X5" },
      { id: "runtime-stack", label: "Runtime Stack Review", status: overview.modules.slice(7, 11).every((m) => m.approved) ? "approved" : "conditional", delegateModule: "CH3-X12" },
      { id: "certification", label: "Certification Review", status: certificationApproved ? "approved" : "conditional", delegateModule: "CH3-X24" },
      { id: "operations", label: "Operations Review", status: deps.operations ? "approved" : "blocked", delegateModule: "CH3-X21" },
      { id: "executive", label: "Executive Review", status: deps.executive ? "approved" : "blocked", delegateModule: "CH3-X22" },
      { id: "readiness", label: "Readiness Review", status: deps.readiness ? "approved" : "conditional", delegateModule: "CH3-X23" },
      { id: "risks", label: "Risk Mitigation", status: risks.every((r) => r.mitigated) ? "approved" : "conditional", delegateModule: "CH3-X25" },
      { id: "production", label: "Production Readiness", status: summary.readyForProduction ? "approved" : "pending", delegateModule: "CH3-X25" },
    ];

    return { overview, checks, risks, summary, board };
  }

  private buildChecks(deps: ReturnType<typeof collectFinalReadinessDependencyValidation>): FinalReadinessCheck[] {
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
    };

    return FINAL_READINESS_CHECK_IDS.map((id) => {
      const meta = CHECK_META[id];
      const passed = depMap[meta.depKey] ?? false;
      return {
        id,
        label: meta.label,
        delegateModule: meta.delegateModule,
        status: passed ? ("passed" as const) : ("failed" as const),
        message: passed ? "Final review check passed" : "Final review check failed",
        required: true,
      };
    });
  }

  private buildModuleOverview(
    deps: ReturnType<typeof collectFinalReadinessDependencyValidation>
  ): FinalReadinessModuleOverview[] {
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
    };

    return FINAL_READINESS_MODULE_IDS.map((id) => {
      const meta = FINAL_READINESS_MODULE_META[id];
      const passed = depMap[meta.depKey] ?? false;
      return {
        id,
        label: meta.label,
        delegateModule: meta.delegateModule,
        status: passed ? ("approved" as const) : ("blocked" as const),
        approved: passed,
      };
    });
  }
}

export function createFinalReadinessAggregator(deps: FinalReadinessAggregatorDeps): FinalReadinessAggregator {
  return new FinalReadinessAggregator(deps);
}
