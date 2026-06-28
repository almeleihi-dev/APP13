import type { AuthContext } from "../../../shared/auth/index.js";
import type { RuntimeExecutiveLaunchAuthorityService } from "../../runtime-executive-launch-authority/application/runtime-executive-launch-authority-service.js";
import {
  CH3_RUNTIME_MODULE_IDS,
  CH3_RUNTIME_MODULE_REGISTRY,
  buildRuntimeCompletionOverview,
  type Ch3RuntimeModuleEntry,
} from "../domain/runtime-completion-report.js";
import { CH3_RUNTIME_CHECK_IDS, type RuntimeCompletionCheck } from "../domain/runtime-completion-checks.js";
import { buildRuntimeCertification } from "../domain/runtime-certification.js";
import { buildRuntimeStatistics } from "../domain/runtime-statistics.js";
import { buildRuntimeArchitectureSummary } from "../domain/runtime-architecture-summary.js";
import { buildRuntimeExecutiveSummary } from "../domain/runtime-executive-summary.js";
import { buildRuntimeCompletionReport } from "../domain/runtime-completion-report-builder.js";
import type { RuntimeCompletionReport } from "../domain/runtime-completion-report-builder.js";
import type { RuntimeCertification } from "../domain/runtime-certification.js";
import type { RuntimeStatistics } from "../domain/runtime-statistics.js";
import type { RuntimeArchitectureSummary } from "../domain/runtime-architecture-summary.js";
import type { RuntimeExecutiveSummary } from "../domain/runtime-executive-summary.js";
import { collectRuntimeCompletionDependencyValidation } from "./runtime-completion-validator.js";

export interface RuntimeCompletionAggregation {
  report: RuntimeCompletionReport;
  certification: RuntimeCertification;
  statistics: RuntimeStatistics;
  architecture: RuntimeArchitectureSummary;
  executiveSummary: RuntimeExecutiveSummary;
  checks: RuntimeCompletionCheck[];
}

export interface RuntimeCompletionAggregatorDeps {
  runtimeExecutiveLaunchAuthority: RuntimeExecutiveLaunchAuthorityService;
}

const CHECK_META: Record<
  (typeof CH3_RUNTIME_CHECK_IDS)[number],
  { label: string; chapterCode: string; depKey: string }
> = {
  "need-experience": { label: "Need Experience", chapterCode: "CH3-X5", depKey: "need" },
  "action-experience": { label: "Action Experience", chapterCode: "CH3-X6", depKey: "action" },
  "contract-experience": { label: "Contract Experience", chapterCode: "CH3-X7", depKey: "contract" },
  "chat-experience": { label: "Chat Experience", chapterCode: "CH3-X8", depKey: "chat" },
  "timeline-experience": { label: "Timeline Experience", chapterCode: "CH3-X9", depKey: "timeline" },
  "notification-experience": { label: "Notification Experience", chapterCode: "CH3-X10", depKey: "notification" },
  "profile-experience": { label: "Profile Experience", chapterCode: "CH3-X11", depKey: "profile" },
  "runtime-journey": { label: "Runtime Journey", chapterCode: "CH3-X12", depKey: "journey" },
  "runtime-state": { label: "Runtime State", chapterCode: "CH3-X13", depKey: "state" },
  "runtime-registry": { label: "Runtime Registry", chapterCode: "CH3-X14", depKey: "registry" },
  "runtime-coordinator": { label: "Runtime Coordinator", chapterCode: "CH3-X15", depKey: "coordinator" },
  "runtime-health": { label: "Runtime Health", chapterCode: "CH3-X16", depKey: "health" },
  "runtime-demo": { label: "Runtime Demo", chapterCode: "CH3-X17", depKey: "demo" },
  "runtime-preview": { label: "Runtime Preview", chapterCode: "CH3-X18", depKey: "preview" },
  "runtime-launcher": { label: "Runtime Launcher", chapterCode: "CH3-X19", depKey: "launcher" },
  "runtime-release": { label: "Runtime Release", chapterCode: "CH3-X20", depKey: "release" },
  "runtime-operations": { label: "Runtime Operations", chapterCode: "CH3-X21", depKey: "operations" },
  "runtime-executive": { label: "Runtime Executive", chapterCode: "CH3-X22", depKey: "executive" },
  "runtime-readiness": { label: "Runtime Readiness", chapterCode: "CH3-X23", depKey: "readiness" },
  "runtime-certification": { label: "Runtime Certification", chapterCode: "CH3-X24", depKey: "certification" },
  "runtime-final-readiness": { label: "Runtime Final Readiness", chapterCode: "CH3-X25", depKey: "finalReadiness" },
  "runtime-production-approval": { label: "Production Approval", chapterCode: "CH3-X26", depKey: "productionApproval" },
  "runtime-operations-center": { label: "Operations Center", chapterCode: "CH3-X27", depKey: "operationsCenter" },
  "runtime-launch-control": { label: "Launch Control", chapterCode: "CH3-X28", depKey: "launchControl" },
  "runtime-launch-readiness-authority": { label: "Launch Readiness Authority", chapterCode: "CH3-X29", depKey: "launchReadinessAuthority" },
  "runtime-executive-launch-authority": { label: "Executive Launch Authority", chapterCode: "CH3-X30", depKey: "executiveLaunchAuthority" },
};

export class RuntimeCompletionAggregator {
  constructor(private readonly deps: RuntimeCompletionAggregatorDeps) {}

  aggregate(authContext: AuthContext): RuntimeCompletionAggregation {
    const executiveLaunch = this.deps.runtimeExecutiveLaunchAuthority.getExecutiveLaunchAuthority(authContext);
    const deps = collectRuntimeCompletionDependencyValidation();
    const checks = this.buildChecks(deps);
    const modules = this.buildModuleEntries(deps);
    const overview = buildRuntimeCompletionOverview(modules);
    const officialExecutiveLaunchApproval = executiveLaunch.decision.officialExecutiveLaunchApproval;
    void executiveLaunch;

    const certification = buildRuntimeCertification({
      validatedModuleCount: overview.validatedCount,
      totalModuleCount: overview.moduleCount,
      passedCheckCount: checks.filter((c) => c.status === "passed").length,
      totalCheckCount: checks.length,
      officialExecutiveLaunchApproval,
    });
    const statistics = buildRuntimeStatistics();
    const architecture = buildRuntimeArchitectureSummary(overview.moduleCount);
    const executiveSummary = buildRuntimeExecutiveSummary({ overview, certification, statistics });
    const report = buildRuntimeCompletionReport({
      overview,
      certification,
      statistics,
      architecture,
      executiveSummary,
      checks,
    });

    return { report, certification, statistics, architecture, executiveSummary, checks };
  }

  private buildChecks(deps: ReturnType<typeof collectRuntimeCompletionDependencyValidation>): RuntimeCompletionCheck[] {
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
      operationsCenter: deps.operationsCenter,
      launchControl: deps.launchControl,
      launchReadinessAuthority: deps.launchReadinessAuthority,
      executiveLaunchAuthority: deps.executiveLaunchAuthority,
    };

    return CH3_RUNTIME_CHECK_IDS.map((id) => {
      const meta = CHECK_META[id];
      const passed = depMap[meta.depKey] ?? false;
      return {
        id,
        label: meta.label,
        chapterCode: meta.chapterCode,
        status: passed ? ("passed" as const) : ("failed" as const),
        message: passed ? "Chapter 3 runtime module validated" : "Chapter 3 runtime module validation failed",
        required: true,
      };
    });
  }

  private buildModuleEntries(
    deps: ReturnType<typeof collectRuntimeCompletionDependencyValidation>
  ): Ch3RuntimeModuleEntry[] {
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
      operationsCenter: deps.operationsCenter,
      launchControl: deps.launchControl,
      launchReadinessAuthority: deps.launchReadinessAuthority,
      executiveLaunchAuthority: deps.executiveLaunchAuthority,
    };

    return CH3_RUNTIME_MODULE_IDS.map((id) => {
      const meta = CH3_RUNTIME_MODULE_REGISTRY[id];
      const passed = depMap[meta.depKey] ?? false;
      return {
        id,
        label: meta.label,
        chapterCode: meta.chapterCode,
        depKey: meta.depKey,
        routePrefix: meta.routePrefix,
        apiEndpointCount: meta.apiEndpointCount,
        status: passed ? ("validated" as const) : ("failed" as const),
        validated: passed,
      };
    });
  }
}

export function createRuntimeCompletionAggregator(
  deps: RuntimeCompletionAggregatorDeps
): RuntimeCompletionAggregator {
  return new RuntimeCompletionAggregator(deps);
}
