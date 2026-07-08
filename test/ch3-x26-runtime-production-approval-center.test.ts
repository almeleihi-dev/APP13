import { describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import type { AuthContext } from "../src/shared/auth/index.js";
import { createAnActNeedExperienceModule } from "../src/runtime-experience/need/module.js";
import { createAnActActionExperienceModule } from "../src/runtime-experience/action/module.js";
import { createAnActContractExperienceModule } from "../src/runtime-experience/contract/module.js";
import { createAnActChatExperienceModule } from "../src/runtime-experience/chat/module.js";
import { createAnActTimelineExperienceModule } from "../src/runtime-experience/timeline/module.js";
import { createAnActNotificationExperienceModule } from "../src/runtime-experience/notification/module.js";
import { createAnActProfileExperienceModule } from "../src/runtime-experience/profile/module.js";
import {
  createAnActRuntimeJourneyModule,
  createRuntimeJourneyRepository,
} from "../src/runtime-experience/runtime-journey/module.js";
import {
  createAnActRuntimeStateModule,
  createRuntimeStateRepository,
} from "../src/runtime-experience/runtime-state/module.js";
import {
  createAnActRuntimeRegistryModule,
  createRuntimeRegistryRepository,
} from "../src/runtime-experience/runtime-registry/module.js";
import {
  createAnActRuntimeCoordinatorModule,
  createRuntimeCoordinatorRepository,
} from "../src/runtime-experience/runtime-coordinator/module.js";
import {
  createAnActRuntimeHealthModule,
  createRuntimeHealthRepository,
} from "../src/runtime-experience/runtime-health/module.js";
import {
  createAnActRuntimeDemoModule,
  createRuntimeDemoRepository,
} from "../src/runtime-experience/runtime-demo/module.js";
import {
  createAnActRuntimePreviewModule,
  createRuntimePreviewRepository,
} from "../src/runtime-experience/runtime-preview/module.js";
import {
  createAnActRuntimeLauncherModule,
  createRuntimeLauncherRepository,
} from "../src/runtime-experience/runtime-launcher/module.js";
import {
  createAnActRuntimeReleaseModule,
  createRuntimeReleaseRepository,
} from "../src/runtime-experience/runtime-release/module.js";
import {
  createAnActRuntimeOperationsModule,
  createRuntimeOperationsRepository,
} from "../src/runtime-experience/runtime-operations/module.js";
import {
  createAnActRuntimeExecutiveDashboardModule,
  createRuntimeExecutiveDashboardRepository,
} from "../src/runtime-experience/runtime-executive/module.js";
import {
  createAnActRuntimeReadinessConsoleModule,
  createRuntimeReadinessConsoleRepository,
} from "../src/runtime-experience/runtime-readiness/module.js";
import {
  createAnActRuntimeCertificationCenterModule,
  createRuntimeCertificationRepository,
} from "../src/runtime-experience/runtime-certification/module.js";
import {
  createAnActRuntimeFinalReadinessReviewModule,
  createRuntimeFinalReadinessRepository,
} from "../src/runtime-experience/runtime-final-readiness/module.js";
import {
  RUNTIME_PRODUCTION_APPROVAL_VERSION,
  APPROVAL_FIXED_TIMESTAMP,
  APPROVAL_MODULE_IDS,
  APPROVAL_CHECK_IDS,
  buildRuntimeProductionApprovalDefinition,
  buildApprovalOverview,
  buildApprovalDecision,
  buildApprovalSummary,
  calculateApprovalPercentage,
  createAnActRuntimeProductionApprovalCenterModule,
  createRuntimeProductionApprovalRepository,
  validateRuntimeProductionApproval,
  collectApprovalDependencyValidation,
  validateApprovalCheckCompleteness,
  validateApprovalModuleCoverage,
  buildApprovalHome,
} from "../src/runtime-experience/runtime-production-approval/module.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../src/navigation-framework/validation/navigation-validator.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-runtime-production-approval-001",
  sessionId: "session-runtime-production-approval-001",
  roles: ["customer"],
  scopes: [],
  authenticated: true,
};

function createApprovalModule() {
  const { needExperience } = createAnActNeedExperienceModule();
  const { actionExperience } = createAnActActionExperienceModule();
  const { contractExperience } = createAnActContractExperienceModule();
  const { chatExperience } = createAnActChatExperienceModule();
  const { timelineExperience } = createAnActTimelineExperienceModule();
  const { notificationExperience } = createAnActNotificationExperienceModule();
  const { profileExperience } = createAnActProfileExperienceModule();
  const { runtimeJourney } = createAnActRuntimeJourneyModule({
    needExperience,
    actionExperience,
    contractExperience,
    chatExperience,
    timelineExperience,
    notificationExperience,
    profileExperience,
    repository: createRuntimeJourneyRepository(),
  });
  const { runtimeState } = createAnActRuntimeStateModule({
    runtimeJourney,
    repository: createRuntimeStateRepository(),
  });
  const { runtimeRegistry } = createAnActRuntimeRegistryModule({
    repository: createRuntimeRegistryRepository(),
  });
  const { runtimeCoordinator } = createAnActRuntimeCoordinatorModule({
    runtimeJourney,
    runtimeState,
    runtimeRegistry,
    repository: createRuntimeCoordinatorRepository(),
  });
  const { runtimeHealth } = createAnActRuntimeHealthModule({
    runtimeRegistry,
    repository: createRuntimeHealthRepository(),
  });
  const { runtimeDemo } = createAnActRuntimeDemoModule({
    runtimeState,
    runtimeCoordinator,
    runtimeRegistry,
    runtimeHealth,
    repository: createRuntimeDemoRepository(),
  });
  const { runtimePreview } = createAnActRuntimePreviewModule({
    needExperience,
    actionExperience,
    contractExperience,
    chatExperience,
    timelineExperience,
    notificationExperience,
    profileExperience,
    runtimeJourney,
    runtimeState,
    runtimeRegistry,
    runtimeCoordinator,
    runtimeHealth,
    runtimeDemo,
    repository: createRuntimePreviewRepository(),
  });
  const { runtimeLauncher } = createAnActRuntimeLauncherModule({
    needExperience,
    actionExperience,
    contractExperience,
    chatExperience,
    timelineExperience,
    notificationExperience,
    profileExperience,
    runtimeJourney,
    runtimeState,
    runtimeRegistry,
    runtimeCoordinator,
    runtimeHealth,
    runtimeDemo,
    runtimePreview,
    repository: createRuntimeLauncherRepository(),
  });
  const { runtimeRelease } = createAnActRuntimeReleaseModule({
    needExperience,
    actionExperience,
    contractExperience,
    chatExperience,
    timelineExperience,
    notificationExperience,
    profileExperience,
    runtimeJourney,
    runtimeState,
    runtimeRegistry,
    runtimeCoordinator,
    runtimeHealth,
    runtimeDemo,
    runtimePreview,
    runtimeLauncher,
    repository: createRuntimeReleaseRepository(),
  });
  const { runtimeOperations } = createAnActRuntimeOperationsModule({
    needExperience,
    actionExperience,
    contractExperience,
    chatExperience,
    timelineExperience,
    notificationExperience,
    profileExperience,
    runtimeJourney,
    runtimeState,
    runtimeRegistry,
    runtimeCoordinator,
    runtimeHealth,
    runtimeDemo,
    runtimePreview,
    runtimeLauncher,
    runtimeRelease,
    repository: createRuntimeOperationsRepository(),
  });
  const { runtimeExecutive } = createAnActRuntimeExecutiveDashboardModule({
    runtimeOperations,
    runtimeRelease,
    runtimeLauncher,
    runtimeHealth,
    repository: createRuntimeExecutiveDashboardRepository(),
  });
  const { runtimeReadiness } = createAnActRuntimeReadinessConsoleModule({
    runtimeExecutive,
    runtimeOperations,
    runtimeRelease,
    runtimeLauncher,
    repository: createRuntimeReadinessConsoleRepository(),
  });
  const { runtimeCertification } = createAnActRuntimeCertificationCenterModule({
    runtimeReadiness,
    runtimeExecutive,
    runtimeOperations,
    runtimeRelease,
    repository: createRuntimeCertificationRepository(),
  });
  const { runtimeFinalReadiness } = createAnActRuntimeFinalReadinessReviewModule({
    runtimeCertification,
    runtimeReadiness,
    runtimeExecutive,
    runtimeOperations,
    repository: createRuntimeFinalReadinessRepository(),
  });
  return createAnActRuntimeProductionApprovalCenterModule({
    runtimeFinalReadiness,
    runtimeCertification,
    runtimeExecutive,
    runtimeOperations,
    repository: createRuntimeProductionApprovalRepository(),
  });
}

describe("CH3-X26 AN ACT Runtime Production Approval Center", () => {
  describe("domain", () => {
    it("defines twenty-one approval modules", () => {
      assert.equal(APPROVAL_MODULE_IDS.length, 21);
      assert.ok(APPROVAL_MODULE_IDS.includes("runtime-final-readiness"));
    });

    it("defines twenty-one approval checks", () => {
      assert.equal(APPROVAL_CHECK_IDS.length, 21);
      assert.ok(APPROVAL_CHECK_IDS.includes("runtime-final-readiness"));
    });

    it("builds read-only production approval definition", () => {
      const def = buildRuntimeProductionApprovalDefinition();
      assert.equal(def.version, RUNTIME_PRODUCTION_APPROVAL_VERSION);
      assert.equal(def.readOnly, true);
      assert.equal(def.noDeployment, true);
      assert.equal(def.noRuntimeExecution, true);
      assert.equal(def.noBubbleIntegration, true);
      assert.equal(def.noBusinessLogicDuplication, true);
    });

    it("uses deterministic fixed timestamp", () => {
      assert.equal(APPROVAL_FIXED_TIMESTAMP, "2026-06-22T02:00:00.000Z");
    });

    it("calculates approval percentage", () => {
      assert.equal(calculateApprovalPercentage(21, 21), 100);
      assert.equal(calculateApprovalPercentage(11, 21), 52);
    });

    it("builds approval overview", () => {
      const overview = buildApprovalOverview([
        { id: "need", label: "Need", delegateModule: "CH3-X5", status: "approved", approved: true },
      ]);
      assert.equal(overview.approvedCount, 1);
      assert.equal(overview.overallStatus, "approved");
    });

    it("builds approval decision", () => {
      const overview = buildApprovalOverview([
        { id: "need", label: "Need", delegateModule: "CH3-X5", status: "approved", approved: true },
      ]);
      const decision = buildApprovalDecision({
        overview,
        checks: [{ id: "need-experience", label: "Need", delegateModule: "CH3-X5", status: "passed", message: "ok", required: true }],
        finalReadinessComplete: true,
        certificationApproved: true,
      });
      assert.equal(decision.approved, true);
      assert.equal(decision.officiallyApprovedForProduction, true);
    });

    it("builds approval summary", () => {
      const overview = buildApprovalOverview([
        { id: "need", label: "Need", delegateModule: "CH3-X5", status: "approved", approved: true },
      ]);
      const decision = buildApprovalDecision({
        overview,
        checks: [{ id: "need-experience", label: "Need", delegateModule: "CH3-X5", status: "passed", message: "ok", required: true }],
        finalReadinessComplete: true,
        certificationApproved: true,
      });
      const summary = buildApprovalSummary({
        overview,
        decision,
        checks: [{ id: "need-experience", label: "Need", delegateModule: "CH3-X5", status: "passed", message: "ok", required: true }],
      });
      assert.equal(summary.readOnly, true);
      assert.equal(summary.delegated, true);
    });
  });

  describe("approval home", () => {
    it("returns production approval overview with read-only guarantees", () => {
      const { runtimeProductionApproval } = createApprovalModule();
      const view = runtimeProductionApproval.getApproval(USER_AUTH);
      assert.equal(view.version, RUNTIME_PRODUCTION_APPROVAL_VERSION);
      assert.equal(view.read_only, true);
      assert.equal(view.delegates_only, true);
      assert.equal(view.no_runtime_execution, true);
      assert.equal(view.module_count, 21);
    });

    it("builds read-only approval home screen", () => {
      const home = buildApprovalHome(100, true);
      assert.equal(home.readOnly, true);
      assert.equal(home.screenId, "approval-home");
    });
  });

  describe("approval dashboard", () => {
    it("returns approval dashboard", () => {
      const { runtimeProductionApproval } = createApprovalModule();
      const dashboard = runtimeProductionApproval.getDashboard(USER_AUTH);
      assert.equal(dashboard.dashboard.moduleCount, 21);
      assert.equal(dashboard.dashboard.approvedCount, 21);
      assert.equal(dashboard.screen.readOnly, true);
    });

    it("reports approved overall status", () => {
      const { runtimeProductionApproval } = createApprovalModule();
      const dashboard = runtimeProductionApproval.getDashboard(USER_AUTH);
      assert.equal(dashboard.dashboard.overallStatus, "approved");
      assert.equal(dashboard.dashboard.approvalPercentage, 100);
    });
  });

  describe("approval checks", () => {
    it("returns approval checks", () => {
      const { runtimeProductionApproval } = createApprovalModule();
      const checks = runtimeProductionApproval.getChecks(USER_AUTH);
      assert.equal(checks.count, 21);
      assert.equal(checks.passed, 21);
    });

    it("marks checklist screen read-only", () => {
      const { runtimeProductionApproval } = createApprovalModule();
      const checks = runtimeProductionApproval.getChecks(USER_AUTH);
      assert.equal(checks.screen.readOnly, true);
      assert.equal(checks.screen.screenId, "approval-checklist");
    });
  });

  describe("approval decision", () => {
    it("returns official production approval decision", () => {
      const { runtimeProductionApproval } = createApprovalModule();
      const decision = runtimeProductionApproval.getDecision(USER_AUTH);
      assert.equal(decision.decision.approved, true);
      assert.equal(decision.decision.officiallyApprovedForProduction, true);
    });

    it("marks decision screen read-only", () => {
      const { runtimeProductionApproval } = createApprovalModule();
      const decision = runtimeProductionApproval.getDecision(USER_AUTH);
      assert.equal(decision.screen.readOnly, true);
      assert.equal(decision.screen.screenId, "approval-decision-screen");
    });
  });

  describe("approval summary", () => {
    it("returns approval summary", () => {
      const { runtimeProductionApproval } = createApprovalModule();
      const summary = runtimeProductionApproval.getSummary(USER_AUTH);
      assert.equal(summary.summary.readOnly, true);
      assert.equal(summary.summary.delegated, true);
      assert.equal(summary.summary.overview.approvedCount, 21);
      assert.equal(summary.summary.officiallyApprovedForProduction, true);
    });

    it("marks summary screen read-only", () => {
      const { runtimeProductionApproval } = createApprovalModule();
      const summary = runtimeProductionApproval.getSummary(USER_AUTH);
      assert.equal(summary.screen.readOnly, true);
      assert.equal(summary.screen.screenId, "approval-summary-screen");
    });
  });

  describe("approval board", () => {
    it("returns approval board", () => {
      const { runtimeProductionApproval } = createApprovalModule();
      const board = runtimeProductionApproval.getBoard(USER_AUTH);
      assert.equal(board.count, 8);
      assert.ok(board.board.some((c) => c.id === "approval"));
      assert.ok(board.board.some((c) => c.id === "handoff"));
    });

    it("marks approval board screen read-only", () => {
      const { runtimeProductionApproval } = createApprovalModule();
      const board = runtimeProductionApproval.getBoard(USER_AUTH);
      assert.equal(board.screen.readOnly, true);
      assert.equal(board.screen.screenId, "approval-board");
    });
  });

  describe("refresh", () => {
    it("refreshes approval view without runtime execution", () => {
      const { runtimeProductionApproval } = createApprovalModule();
      const refreshed = runtimeProductionApproval.refresh(USER_AUTH) as {
        ok: boolean;
        read_only: boolean;
        no_runtime_execution: boolean;
        aggregation: { overview: { approvedCount: number } };
      };
      assert.equal(refreshed.ok, true);
      assert.equal(refreshed.read_only, true);
      assert.equal(refreshed.no_runtime_execution, true);
      assert.equal(refreshed.aggregation.overview.approvedCount, 21);
    });
  });

  describe("runtime integration", () => {
    it("integrates runtime final readiness via CH3-X25", () => {
      const deps = collectApprovalDependencyValidation();
      assert.equal(deps.finalReadiness, true);
    });

    it("integrates runtime certification via CH3-X24", () => {
      const deps = collectApprovalDependencyValidation();
      assert.equal(deps.certification, true);
    });

    it("integrates runtime readiness via CH3-X23", () => {
      const deps = collectApprovalDependencyValidation();
      assert.equal(deps.readiness, true);
    });

    it("integrates runtime executive via CH3-X22", () => {
      const deps = collectApprovalDependencyValidation();
      assert.equal(deps.executive, true);
    });

    it("integrates runtime operations via CH3-X21", () => {
      const deps = collectApprovalDependencyValidation();
      assert.equal(deps.operations, true);
    });

    it("integrates need experience via CH3-X5", () => {
      const deps = collectApprovalDependencyValidation();
      assert.equal(deps.need, true);
    });
  });

  describe("validation", () => {
    it("passes full runtime production approval validation", () => {
      const result = validateRuntimeProductionApproval();
      assert.equal(result.valid, true);
      assert.equal(result.checked.moduleCount, 21);
      assert.equal(result.checked.checkCount, 21);
      assert.equal(result.checked.readOnlyGuarantees, true);
      assert.equal(result.checked.noDuplicatedRuntimeLogic, true);
    });

    it("validates approval module coverage", () => {
      assert.equal(validateApprovalModuleCoverage(), true);
    });

    it("validates approval check completeness", () => {
      assert.equal(validateApprovalCheckCompleteness(), true);
    });

    it("module factory exposes validate and service", () => {
      const mod = createApprovalModule();
      assert.equal(mod.version, RUNTIME_PRODUCTION_APPROVAL_VERSION);
      assert.ok(mod.runtimeProductionApproval);
      assert.equal(mod.validate().valid, true);
    });
  });

  describe("accessibility", () => {
    it("meets accessibility in approval view", () => {
      const { runtimeProductionApproval } = createApprovalModule();
      const view = runtimeProductionApproval.getApproval(USER_AUTH);
      assert.ok(view.accessibility.compliant);
      assert.ok(view.accessibility.minimumTouchTargetPx >= NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx);
    });
  });

  describe("read-only guarantees", () => {
    it("does not execute runtime on refresh", () => {
      const { runtimeProductionApproval } = createApprovalModule();
      const refreshed = runtimeProductionApproval.refresh(USER_AUTH) as { delegated: boolean; no_runtime_execution: boolean };
      assert.equal(refreshed.delegated, true);
      assert.equal(refreshed.no_runtime_execution, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH3-X26", async () => {
      const pkg = JSON.parse(await readFile(path.join(ROOT_DIR, "package.json"), "utf8"));
      assert.ok(pkg.scripts["verify:ch3-x26"]);
      assert.ok(pkg.scripts["test:ch3-x26-runtime-production-approval-center"]);
    });

    it("registers runtime production approval routes module", async () => {
      const routes = await readFile(path.join(ROOT_DIR, "src/api/routes/runtime-production-approval.ts"), "utf8");
      assert.match(routes, /registerRuntimeProductionApprovalRoutes/);
      assert.match(routes, /\/runtime-production-approval\/validate/);
      assert.match(routes, /\/runtime-production-approval\/refresh/);
    });

    it("wires runtime production approval in server and index", async () => {
      const server = await readRouteWiringSource();
      const index = await readModuleWiringSource();
      assert.match(server, /registerRuntimeProductionApprovalRoutes/);
      assert.match(server, /runtimeProductionApproval/);
      assert.match(index, /createAnActRuntimeProductionApprovalCenterModule/);
      assert.match(index, /runtimeProductionApproval/);
    });
  });
});
