import type { AuthContext } from "../../../shared/auth/index.js";
import type { RuntimeReadinessConsoleService } from "../../runtime-readiness/application/runtime-readiness-console-service.js";
import type { RuntimeExecutiveDashboardService } from "../../runtime-executive/application/runtime-executive-dashboard-service.js";
import type { RuntimeOperationsService } from "../../runtime-operations/application/runtime-operations-service.js";
import type { RuntimeReleaseService } from "../../runtime-release/application/runtime-release-service.js";
import {
  CERTIFICATION_MODULE_IDS,
  CERTIFICATION_MODULE_META,
  buildCertificationOverview,
  type CertificationModuleOverview,
} from "../domain/certification-overview.js";
import { CERTIFICATION_CHECK_IDS, type CertificationCheck } from "../domain/certification-checks.js";
import { buildCertificationStatus, type CertificationStatus } from "../domain/certification-status.js";
import { buildCertificationSummary, type CertificationSummary } from "../domain/certification-summary.js";
import { collectCertificationDependencyValidation } from "./certification-validator.js";

export interface CertificationAggregation {
  overview: ReturnType<typeof buildCertificationOverview>;
  checks: CertificationCheck[];
  status: CertificationStatus;
  summary: CertificationSummary;
  board: Array<{ id: string; label: string; status: string; delegateModule: string }>;
}

export interface CertificationAggregatorDeps {
  runtimeReadiness: RuntimeReadinessConsoleService;
  runtimeExecutive: RuntimeExecutiveDashboardService;
  runtimeOperations: RuntimeOperationsService;
  runtimeRelease: RuntimeReleaseService;
}

const CHECK_META: Record<
  (typeof CERTIFICATION_CHECK_IDS)[number],
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
};

export class CertificationAggregator {
  constructor(private readonly deps: CertificationAggregatorDeps) {}

  aggregate(authContext: AuthContext): CertificationAggregation {
    this.deps.runtimeReadiness.refresh(authContext);
    const readiness = this.deps.runtimeReadiness.getReadiness(authContext);
    this.deps.runtimeReadiness.getSummary(authContext);
    this.deps.runtimeReadiness.getCommandBoard(authContext);
    this.deps.runtimeExecutive.refresh(authContext);
    this.deps.runtimeExecutive.getExecutive(authContext);
    this.deps.runtimeExecutive.getKpis(authContext);
    this.deps.runtimeOperations.refresh(authContext);
    this.deps.runtimeOperations.getDashboard(authContext);
    const releaseCertification = this.deps.runtimeRelease.getCertification(authContext);

    const deps = collectCertificationDependencyValidation();
    const checks = this.buildChecks(deps);
    const modules = this.buildModuleOverview(deps);
    const overview = buildCertificationOverview(modules);
    const releaseCertified = releaseCertification.certification.certified;
    const readinessComplete = readiness.summary.readyForHandoff;
    const status = buildCertificationStatus({
      overview,
      checks,
      releaseCertified,
      readinessComplete,
    });
    const summary = buildCertificationSummary({ overview, status, checks });
    const board = [
      { id: "certification", label: "Certification Authority", status: status.authorityStatus, delegateModule: "CH3-X24" },
      { id: "experiences", label: "Experience Certification", status: overview.modules.slice(0, 7).every((m) => m.certified) ? "certified" : "conditional", delegateModule: "CH3-X5" },
      { id: "runtime-stack", label: "Runtime Stack Certification", status: overview.modules.slice(7, 11).every((m) => m.certified) ? "certified" : "conditional", delegateModule: "CH3-X12" },
      { id: "release", label: "Release Certification", status: releaseCertified ? "certified" : "conditional", delegateModule: "CH3-X20" },
      { id: "operations", label: "Operations Certification", status: deps.operations ? "certified" : "rejected", delegateModule: "CH3-X21" },
      { id: "executive", label: "Executive Certification", status: deps.executive ? "certified" : "rejected", delegateModule: "CH3-X22" },
      { id: "readiness", label: "Readiness Certification", status: readinessComplete ? "certified" : "conditional", delegateModule: "CH3-X23" },
      { id: "approval", label: "Production Approval", status: status.readyForProductionApproval ? "certified" : "pending", delegateModule: "CH3-X24" },
    ];

    return { overview, checks, status, summary, board };
  }

  private buildChecks(deps: ReturnType<typeof collectCertificationDependencyValidation>): CertificationCheck[] {
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
    };

    return CERTIFICATION_CHECK_IDS.map((id) => {
      const meta = CHECK_META[id];
      const passed = depMap[meta.depKey] ?? false;
      return {
        id,
        label: meta.label,
        delegateModule: meta.delegateModule,
        status: passed ? ("passed" as const) : ("failed" as const),
        message: passed ? "Certification check passed" : "Certification check failed",
        required: true,
      };
    });
  }

  private buildModuleOverview(
    deps: ReturnType<typeof collectCertificationDependencyValidation>
  ): CertificationModuleOverview[] {
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
    };

    return CERTIFICATION_MODULE_IDS.map((id) => {
      const meta = CERTIFICATION_MODULE_META[id];
      const passed = depMap[meta.depKey] ?? false;
      return {
        id,
        label: meta.label,
        delegateModule: meta.delegateModule,
        status: passed ? ("certified" as const) : ("rejected" as const),
        certified: passed,
      };
    });
  }
}

export function createCertificationAggregator(deps: CertificationAggregatorDeps): CertificationAggregator {
  return new CertificationAggregator(deps);
}
