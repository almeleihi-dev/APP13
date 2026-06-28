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
  createAnActRuntimeProductionApprovalCenterModule,
  createRuntimeProductionApprovalRepository,
} from "../src/runtime-experience/runtime-production-approval/module.js";
import {
  createAnActRuntimeOperationsCenterModule,
  createRuntimeOperationsCenterRepository,
} from "../src/runtime-experience/runtime-operations-center/module.js";
import {
  RUNTIME_LAUNCH_CONTROL_VERSION,
  LAUNCH_CONTROL_FIXED_TIMESTAMP,
  LAUNCH_CONTROL_MODULE_IDS,
  LAUNCH_CONTROL_CHECK_IDS,
  buildRuntimeLaunchControlDefinition,
  buildLaunchControlOverview,
  buildLaunchControlReadiness,
  buildLaunchControlSummary,
  calculateLaunchClearancePercentage,
  createAnActRuntimeLaunchControlCenterModule,
  createRuntimeLaunchControlRepository,
  validateRuntimeLaunchControl,
  collectLaunchControlDependencyValidation,
  validateLaunchControlModuleCoverage,
  validateLaunchControlCheckCompleteness,
  buildLaunchControlHome,
} from "../src/runtime-experience/runtime-launch-control/module.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../src/navigation-framework/validation/navigation-validator.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-runtime-launch-control-001",
  sessionId: "session-runtime-launch-control-001",
  roles: ["customer"],
  scopes: [],
  authenticated: true,
};

function createLaunchControlModule() {
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
  const { runtimeProductionApproval } = createAnActRuntimeProductionApprovalCenterModule({
    runtimeFinalReadiness,
    runtimeCertification,
    runtimeExecutive,
    runtimeOperations,
    repository: createRuntimeProductionApprovalRepository(),
  });
  const { runtimeOperationsCenter } = createAnActRuntimeOperationsCenterModule({
    runtimeProductionApproval,
    runtimeOperations,
    runtimeExecutive,
    runtimeFinalReadiness,
    repository: createRuntimeOperationsCenterRepository(),
  });
  return createAnActRuntimeLaunchControlCenterModule({
    runtimeOperationsCenter,
    runtimeProductionApproval,
    runtimeLauncher,
    runtimeOperations,
    repository: createRuntimeLaunchControlRepository(),
  });
}

describe("CH3-X28 AN ACT Runtime Launch Control Center", () => {
  describe("domain", () => {
    it("defines twenty-three launch control modules", () => {
      assert.equal(LAUNCH_CONTROL_MODULE_IDS.length, 23);
      assert.ok(LAUNCH_CONTROL_MODULE_IDS.includes("runtime-operations-center"));
    });

    it("defines twenty-three launch control checks", () => {
      assert.equal(LAUNCH_CONTROL_CHECK_IDS.length, 23);
      assert.ok(LAUNCH_CONTROL_CHECK_IDS.includes("runtime-operations-center"));
    });

    it("builds read-only launch control definition", () => {
      const def = buildRuntimeLaunchControlDefinition();
      assert.equal(def.version, RUNTIME_LAUNCH_CONTROL_VERSION);
      assert.equal(def.readOnly, true);
      assert.equal(def.noDeployment, true);
      assert.equal(def.noRuntimeExecution, true);
      assert.equal(def.noBubbleIntegration, true);
    });

    it("uses deterministic fixed timestamp", () => {
      assert.equal(LAUNCH_CONTROL_FIXED_TIMESTAMP, "2026-06-22T04:00:00.000Z");
    });

    it("calculates launch clearance percentage", () => {
      assert.equal(calculateLaunchClearancePercentage(23, 23), 100);
      assert.equal(calculateLaunchClearancePercentage(12, 23), 52);
    });

    it("builds launch control overview", () => {
      const overview = buildLaunchControlOverview([
        { id: "need", label: "Need", delegateModule: "CH3-X5", status: "cleared", cleared: true },
      ]);
      assert.equal(overview.clearedCount, 1);
      assert.equal(overview.overallStatus, "cleared");
    });

    it("builds launch control readiness", () => {
      const overview = buildLaunchControlOverview([
        { id: "need", label: "Need", delegateModule: "CH3-X5", status: "cleared", cleared: true },
      ]);
      const readiness = buildLaunchControlReadiness({
        overview,
        checks: [{ id: "need-experience", label: "Need", delegateModule: "CH3-X5", status: "passed", message: "ok", required: true }],
        productionApproved: true,
        operationsCenterOperational: true,
        launcherReady: true,
      });
      assert.equal(readiness.officiallyClearedForLaunch, true);
    });

    it("builds launch control summary", () => {
      const overview = buildLaunchControlOverview([
        { id: "need", label: "Need", delegateModule: "CH3-X5", status: "cleared", cleared: true },
      ]);
      const readiness = buildLaunchControlReadiness({
        overview,
        checks: [{ id: "need-experience", label: "Need", delegateModule: "CH3-X5", status: "passed", message: "ok", required: true }],
        productionApproved: true,
        operationsCenterOperational: true,
        launcherReady: true,
      });
      const summary = buildLaunchControlSummary({
        overview,
        readiness,
        checks: [{ id: "need-experience", label: "Need", delegateModule: "CH3-X5", status: "passed", message: "ok", required: true }],
      });
      assert.equal(summary.readOnly, true);
      assert.equal(summary.delegated, true);
    });
  });

  describe("launch control home", () => {
    it("returns launch control overview with read-only guarantees", () => {
      const { runtimeLaunchControl } = createLaunchControlModule();
      const view = runtimeLaunchControl.getLaunchControl(USER_AUTH);
      assert.equal(view.version, RUNTIME_LAUNCH_CONTROL_VERSION);
      assert.equal(view.read_only, true);
      assert.equal(view.delegates_only, true);
      assert.equal(view.no_runtime_execution, true);
      assert.equal(view.module_count, 23);
    });

    it("builds read-only launch control home screen", () => {
      const home = buildLaunchControlHome(100, true);
      assert.equal(home.readOnly, true);
      assert.equal(home.screenId, "launch-control-home");
    });
  });

  describe("launch control dashboard", () => {
    it("returns launch control dashboard", () => {
      const { runtimeLaunchControl } = createLaunchControlModule();
      const dashboard = runtimeLaunchControl.getDashboard(USER_AUTH);
      assert.equal(dashboard.dashboard.moduleCount, 23);
      assert.equal(dashboard.dashboard.clearedCount, 23);
      assert.equal(dashboard.screen.readOnly, true);
    });

    it("reports cleared overall status", () => {
      const { runtimeLaunchControl } = createLaunchControlModule();
      const dashboard = runtimeLaunchControl.getDashboard(USER_AUTH);
      assert.equal(dashboard.dashboard.overallStatus, "cleared");
      assert.equal(dashboard.dashboard.launchClearancePercentage, 100);
    });
  });

  describe("launch control checks", () => {
    it("returns launch control checks", () => {
      const { runtimeLaunchControl } = createLaunchControlModule();
      const checks = runtimeLaunchControl.getChecks(USER_AUTH);
      assert.equal(checks.count, 23);
      assert.equal(checks.passed, 23);
    });

    it("marks checklist screen read-only", () => {
      const { runtimeLaunchControl } = createLaunchControlModule();
      const checks = runtimeLaunchControl.getChecks(USER_AUTH);
      assert.equal(checks.screen.readOnly, true);
      assert.equal(checks.screen.screenId, "launch-control-checklist");
    });
  });

  describe("launch control readiness", () => {
    it("returns official launch clearance readiness", () => {
      const { runtimeLaunchControl } = createLaunchControlModule();
      const readiness = runtimeLaunchControl.getReadiness(USER_AUTH);
      assert.equal(readiness.readiness.cleared, true);
      assert.equal(readiness.readiness.officiallyClearedForLaunch, true);
    });

    it("marks readiness screen read-only", () => {
      const { runtimeLaunchControl } = createLaunchControlModule();
      const readiness = runtimeLaunchControl.getReadiness(USER_AUTH);
      assert.equal(readiness.screen.readOnly, true);
      assert.equal(readiness.screen.screenId, "launch-control-readiness-screen");
    });
  });

  describe("launch control summary", () => {
    it("returns launch control summary", () => {
      const { runtimeLaunchControl } = createLaunchControlModule();
      const summary = runtimeLaunchControl.getSummary(USER_AUTH);
      assert.equal(summary.summary.readOnly, true);
      assert.equal(summary.summary.delegated, true);
      assert.equal(summary.summary.overview.clearedCount, 23);
      assert.equal(summary.summary.officiallyClearedForLaunch, true);
    });

    it("marks summary screen read-only", () => {
      const { runtimeLaunchControl } = createLaunchControlModule();
      const summary = runtimeLaunchControl.getSummary(USER_AUTH);
      assert.equal(summary.screen.readOnly, true);
      assert.equal(summary.screen.screenId, "launch-control-summary-screen");
    });
  });

  describe("launch control board", () => {
    it("returns launch control board", () => {
      const { runtimeLaunchControl } = createLaunchControlModule();
      const board = runtimeLaunchControl.getBoard(USER_AUTH);
      assert.equal(board.count, 8);
      assert.ok(board.board.some((c) => c.id === "launch-control"));
      assert.ok(board.board.some((c) => c.id === "launch"));
    });

    it("marks launch control board screen read-only", () => {
      const { runtimeLaunchControl } = createLaunchControlModule();
      const board = runtimeLaunchControl.getBoard(USER_AUTH);
      assert.equal(board.screen.readOnly, true);
      assert.equal(board.screen.screenId, "launch-control-board");
    });
  });

  describe("refresh", () => {
    it("refreshes launch control view without runtime execution", () => {
      const { runtimeLaunchControl } = createLaunchControlModule();
      const refreshed = runtimeLaunchControl.refresh(USER_AUTH) as {
        ok: boolean;
        read_only: boolean;
        no_runtime_execution: boolean;
        aggregation: { overview: { clearedCount: number } };
      };
      assert.equal(refreshed.ok, true);
      assert.equal(refreshed.read_only, true);
      assert.equal(refreshed.no_runtime_execution, true);
      assert.equal(refreshed.aggregation.overview.clearedCount, 23);
    });
  });

  describe("runtime integration", () => {
    it("integrates operations center via CH3-X27", () => {
      const deps = collectLaunchControlDependencyValidation();
      assert.equal(deps.operationsCenter, true);
    });

    it("integrates production approval via CH3-X26", () => {
      const deps = collectLaunchControlDependencyValidation();
      assert.equal(deps.productionApproval, true);
    });

    it("integrates runtime launcher via CH3-X19", () => {
      const deps = collectLaunchControlDependencyValidation();
      assert.equal(deps.launcher, true);
    });

    it("integrates runtime operations via CH3-X21", () => {
      const deps = collectLaunchControlDependencyValidation();
      assert.equal(deps.operations, true);
    });

    it("integrates need experience via CH3-X5", () => {
      const deps = collectLaunchControlDependencyValidation();
      assert.equal(deps.need, true);
    });
  });

  describe("validation", () => {
    it("passes full runtime launch control validation", () => {
      const result = validateRuntimeLaunchControl();
      assert.equal(result.valid, true);
      assert.equal(result.checked.moduleCount, 23);
      assert.equal(result.checked.checkCount, 23);
      assert.equal(result.checked.readOnlyGuarantees, true);
      assert.equal(result.checked.noDuplicatedRuntimeLogic, true);
    });

    it("validates launch control module coverage", () => {
      assert.equal(validateLaunchControlModuleCoverage(), true);
    });

    it("validates launch control check completeness", () => {
      assert.equal(validateLaunchControlCheckCompleteness(), true);
    });

    it("module factory exposes validate and service", () => {
      const mod = createLaunchControlModule();
      assert.equal(mod.version, RUNTIME_LAUNCH_CONTROL_VERSION);
      assert.ok(mod.runtimeLaunchControl);
      assert.equal(mod.validate().valid, true);
    });
  });

  describe("accessibility", () => {
    it("meets accessibility in launch control view", () => {
      const { runtimeLaunchControl } = createLaunchControlModule();
      const view = runtimeLaunchControl.getLaunchControl(USER_AUTH);
      assert.ok(view.accessibility.compliant);
      assert.ok(view.accessibility.minimumTouchTargetPx >= NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx);
    });
  });

  describe("read-only guarantees", () => {
    it("does not execute runtime on refresh", () => {
      const { runtimeLaunchControl } = createLaunchControlModule();
      const refreshed = runtimeLaunchControl.refresh(USER_AUTH) as { delegated: boolean; no_runtime_execution: boolean };
      assert.equal(refreshed.delegated, true);
      assert.equal(refreshed.no_runtime_execution, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH3-X28", async () => {
      const pkg = JSON.parse(await readFile(path.join(ROOT_DIR, "package.json"), "utf8"));
      assert.ok(pkg.scripts["verify:ch3-x28"]);
      assert.ok(pkg.scripts["test:ch3-x28-runtime-launch-control-center"]);
    });

    it("registers runtime launch control routes module", async () => {
      const routes = await readFile(path.join(ROOT_DIR, "src/api/routes/runtime-launch-control.ts"), "utf8");
      assert.match(routes, /registerRuntimeLaunchControlRoutes/);
      assert.match(routes, /\/runtime-launch-control\/validate/);
      assert.match(routes, /\/runtime-launch-control\/refresh/);
    });

    it("wires runtime launch control in server and index", async () => {
      const server = await readFile(path.join(ROOT_DIR, "src/api/server.ts"), "utf8");
      const index = await readFile(path.join(ROOT_DIR, "src/index.ts"), "utf8");
      assert.match(server, /registerRuntimeLaunchControlRoutes/);
      assert.match(server, /runtimeLaunchControl/);
      assert.match(index, /createAnActRuntimeLaunchControlCenterModule/);
      assert.match(index, /runtimeLaunchControl/);
    });
  });
});
