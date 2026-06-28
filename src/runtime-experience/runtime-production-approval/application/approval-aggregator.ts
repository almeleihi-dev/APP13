import type { AuthContext } from "../../../shared/auth/index.js";
import type { RuntimeFinalReadinessService } from "../../runtime-final-readiness/application/runtime-final-readiness-service.js";
import type { RuntimeCertificationService } from "../../runtime-certification/application/runtime-certification-service.js";
import type { RuntimeExecutiveDashboardService } from "../../runtime-executive/application/runtime-executive-dashboard-service.js";
import type { RuntimeOperationsService } from "../../runtime-operations/application/runtime-operations-service.js";
import {
  APPROVAL_MODULE_IDS,
  APPROVAL_MODULE_META,
  buildApprovalOverview,
  type ApprovalModuleOverview,
} from "../domain/approval-overview.js";
import { APPROVAL_CHECK_IDS, type ApprovalCheck } from "../domain/approval-checks.js";
import { buildApprovalDecision, type ApprovalDecision } from "../domain/approval-decision.js";
import { buildApprovalSummary, type ApprovalSummary } from "../domain/approval-summary.js";
import { collectApprovalDependencyValidation } from "./approval-validator.js";

export interface ApprovalAggregation {
  overview: ReturnType<typeof buildApprovalOverview>;
  checks: ApprovalCheck[];
  decision: ApprovalDecision;
  summary: ApprovalSummary;
  board: Array<{ id: string; label: string; status: string; delegateModule: string }>;
}

export interface ApprovalAggregatorDeps {
  runtimeFinalReadiness: RuntimeFinalReadinessService;
  runtimeCertification: RuntimeCertificationService;
  runtimeExecutive: RuntimeExecutiveDashboardService;
  runtimeOperations: RuntimeOperationsService;
}

const CHECK_META: Record<
  (typeof APPROVAL_CHECK_IDS)[number],
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
  "runtime-final-readiness": { label: "Runtime Final Readiness", delegateModule: "CH3-X25", depKey: "finalReadiness" },
};

export class ApprovalAggregator {
  constructor(private readonly deps: ApprovalAggregatorDeps) {}

  aggregate(authContext: AuthContext): ApprovalAggregation {
    const finalReadiness = this.deps.runtimeFinalReadiness.getFinalReadiness(authContext);
    const certification = this.deps.runtimeCertification.getCertification(authContext);

    const deps = collectApprovalDependencyValidation();
    const checks = this.buildChecks(deps);
    const modules = this.buildModuleOverview(deps);
    const overview = buildApprovalOverview(modules);
    const finalReadinessComplete = finalReadiness.summary.readyForProduction;
    const certificationApproved = certification.status.readyForProductionApproval;
    const decision = buildApprovalDecision({
      overview,
      checks,
      finalReadinessComplete,
      certificationApproved,
    });
    const summary = buildApprovalSummary({ overview, decision, checks });
    const board = [
      { id: "approval", label: "Production Approval Authority", status: decision.decision, delegateModule: "CH3-X26" },
      { id: "experiences", label: "Experience Approval", status: overview.modules.slice(0, 7).every((m) => m.approved) ? "approved" : "conditional", delegateModule: "CH3-X5" },
      { id: "runtime-stack", label: "Runtime Stack Approval", status: overview.modules.slice(7, 11).every((m) => m.approved) ? "approved" : "conditional", delegateModule: "CH3-X12" },
      { id: "certification", label: "Certification Approval", status: certificationApproved ? "approved" : "conditional", delegateModule: "CH3-X24" },
      { id: "final-readiness", label: "Final Readiness Approval", status: finalReadinessComplete ? "approved" : "conditional", delegateModule: "CH3-X25" },
      { id: "operations", label: "Operations Approval", status: deps.operations ? "approved" : "denied", delegateModule: "CH3-X21" },
      { id: "executive", label: "Executive Approval", status: deps.executive ? "approved" : "denied", delegateModule: "CH3-X22" },
      { id: "handoff", label: "Production Handoff", status: decision.officiallyApprovedForProduction ? "approved" : "pending", delegateModule: "CH3-X26" },
    ];

    return { overview, checks, decision, summary, board };
  }

  private buildChecks(deps: ReturnType<typeof collectApprovalDependencyValidation>): ApprovalCheck[] {
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
    };

    return APPROVAL_CHECK_IDS.map((id) => {
      const meta = CHECK_META[id];
      const passed = depMap[meta.depKey] ?? false;
      return {
        id,
        label: meta.label,
        delegateModule: meta.delegateModule,
        status: passed ? ("passed" as const) : ("failed" as const),
        message: passed ? "Approval check passed" : "Approval check failed",
        required: true,
      };
    });
  }

  private buildModuleOverview(deps: ReturnType<typeof collectApprovalDependencyValidation>): ApprovalModuleOverview[] {
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
    };

    return APPROVAL_MODULE_IDS.map((id) => {
      const meta = APPROVAL_MODULE_META[id];
      const passed = depMap[meta.depKey] ?? false;
      return {
        id,
        label: meta.label,
        delegateModule: meta.delegateModule,
        status: passed ? ("approved" as const) : ("denied" as const),
        approved: passed,
      };
    });
  }
}

export function createApprovalAggregator(deps: ApprovalAggregatorDeps): ApprovalAggregator {
  return new ApprovalAggregator(deps);
}
