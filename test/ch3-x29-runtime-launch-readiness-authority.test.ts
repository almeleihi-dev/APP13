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
  createAnActRuntimeLaunchControlCenterModule,
  createRuntimeLaunchControlRepository,
} from "../src/runtime-experience/runtime-launch-control/module.js";
import {
  RUNTIME_LAUNCH_READINESS_AUTHORITY_VERSION,
  LAUNCH_READINESS_AUTHORITY_FIXED_TIMESTAMP,
  LAUNCH_READINESS_MODULE_IDS,
  LAUNCH_READINESS_CHECK_IDS,
  buildRuntimeLaunchReadinessAuthorityDefinition,
  buildLaunchReadinessOverview,
  buildLaunchReadinessDecision,
  buildLaunchReadinessSummary,
  calculateReadinessPercentage,
  createAnActRuntimeLaunchReadinessAuthorityModule,
  createRuntimeLaunchReadinessAuthorityRepository,
  validateRuntimeLaunchReadinessAuthority,
  collectLaunchReadinessDependencyValidation,
  validateLaunchReadinessModuleCoverage,
  validateLaunchReadinessCheckCompleteness,
  buildLaunchReadinessHome,
} from "../src/runtime-experience/runtime-launch-readiness-authority/module.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../src/navigation-framework/validation/navigation-validator.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-runtime-launch-readiness-authority-001",
  sessionId: "session-runtime-launch-readiness-authority-001",
  roles: ["customer"],
  scopes: [],
  authenticated: true,
};

function createLaunchReadinessAuthorityModule() {
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
  const { runtimeLaunchControl } = createAnActRuntimeLaunchControlCenterModule({
    runtimeOperationsCenter,
    runtimeProductionApproval,
    runtimeLauncher,
    runtimeOperations,
    repository: createRuntimeLaunchControlRepository(),
  });
  return createAnActRuntimeLaunchReadinessAuthorityModule({
    runtimeLaunchControl,
    runtimeOperationsCenter,
    runtimeProductionApproval,
    runtimeLauncher,
    repository: createRuntimeLaunchReadinessAuthorityRepository(),
  });
}

describe("CH3-X29 AN ACT Runtime Launch Readiness Authority", () => {
  describe("domain", () => {
    it("defines twenty-four launch readiness modules", () => {
      assert.equal(LAUNCH_READINESS_MODULE_IDS.length, 24);
      assert.ok(LAUNCH_READINESS_MODULE_IDS.includes("runtime-launch-control"));
    });

    it("defines twenty-four launch readiness checks", () => {
      assert.equal(LAUNCH_READINESS_CHECK_IDS.length, 24);
      assert.ok(LAUNCH_READINESS_CHECK_IDS.includes("runtime-launch-control"));
    });

    it("builds read-only launch readiness authority definition", () => {
      const def = buildRuntimeLaunchReadinessAuthorityDefinition();
      assert.equal(def.version, RUNTIME_LAUNCH_READINESS_AUTHORITY_VERSION);
      assert.equal(def.readOnly, true);
      assert.equal(def.noDeployment, true);
      assert.equal(def.noRuntimeExecution, true);
      assert.equal(def.noBubbleIntegration, true);
    });

    it("uses deterministic fixed timestamp", () => {
      assert.equal(LAUNCH_READINESS_AUTHORITY_FIXED_TIMESTAMP, "2026-06-22T05:00:00.000Z");
    });

    it("calculates readiness percentage", () => {
      assert.equal(calculateReadinessPercentage(24, 24), 100);
      assert.equal(calculateReadinessPercentage(12, 24), 50);
    });

    it("builds launch readiness overview", () => {
      const overview = buildLaunchReadinessOverview([
        { id: "need", label: "Need", delegateModule: "CH3-X5", status: "ready", ready: true },
      ]);
      assert.equal(overview.readyCount, 1);
      assert.equal(overview.overallStatus, "ready");
    });

    it("builds launch readiness decision", () => {
      const overview = buildLaunchReadinessOverview([
        { id: "need", label: "Need", delegateModule: "CH3-X5", status: "ready", ready: true },
      ]);
      const decision = buildLaunchReadinessDecision({
        overview,
        checks: [
          {
            id: "need-experience",
            label: "Need",
            delegateModule: "CH3-X5",
            status: "passed",
            message: "ok",
            required: true,
          },
        ],
        launchControlCleared: true,
        productionApproved: true,
        operationsCenterOperational: true,
      });
      assert.equal(decision.officiallyReadyForLaunch, true);
    });

    it("builds launch readiness summary", () => {
      const overview = buildLaunchReadinessOverview([
        { id: "need", label: "Need", delegateModule: "CH3-X5", status: "ready", ready: true },
      ]);
      const decision = buildLaunchReadinessDecision({
        overview,
        checks: [
          {
            id: "need-experience",
            label: "Need",
            delegateModule: "CH3-X5",
            status: "passed",
            message: "ok",
            required: true,
          },
        ],
        launchControlCleared: true,
        productionApproved: true,
        operationsCenterOperational: true,
      });
      const summary = buildLaunchReadinessSummary({
        overview,
        decision,
        checks: [
          {
            id: "need-experience",
            label: "Need",
            delegateModule: "CH3-X5",
            status: "passed",
            message: "ok",
            required: true,
          },
        ],
      });
      assert.equal(summary.readOnly, true);
      assert.equal(summary.delegated, true);
    });
  });

  describe("launch readiness home", () => {
    it("returns launch readiness authority overview with read-only guarantees", () => {
      const { runtimeLaunchReadinessAuthority } = createLaunchReadinessAuthorityModule();
      const view = runtimeLaunchReadinessAuthority.getLaunchReadinessAuthority(USER_AUTH);
      assert.equal(view.version, RUNTIME_LAUNCH_READINESS_AUTHORITY_VERSION);
      assert.equal(view.read_only, true);
      assert.equal(view.delegates_only, true);
      assert.equal(view.no_runtime_execution, true);
      assert.equal(view.module_count, 24);
    });

    it("builds read-only launch readiness home screen", () => {
      const home = buildLaunchReadinessHome(100, true);
      assert.equal(home.readOnly, true);
      assert.equal(home.screenId, "launch-readiness-home");
    });
  });

  describe("launch readiness dashboard", () => {
    it("returns launch readiness dashboard", () => {
      const { runtimeLaunchReadinessAuthority } = createLaunchReadinessAuthorityModule();
      const dashboard = runtimeLaunchReadinessAuthority.getDashboard(USER_AUTH);
      assert.equal(dashboard.dashboard.moduleCount, 24);
      assert.equal(dashboard.dashboard.readyCount, 24);
      assert.equal(dashboard.screen.readOnly, true);
    });

    it("reports ready overall status", () => {
      const { runtimeLaunchReadinessAuthority } = createLaunchReadinessAuthorityModule();
      const dashboard = runtimeLaunchReadinessAuthority.getDashboard(USER_AUTH);
      assert.equal(dashboard.dashboard.overallStatus, "ready");
      assert.equal(dashboard.dashboard.readinessPercentage, 100);
    });
  });

  describe("launch readiness checks", () => {
    it("returns launch readiness checks", () => {
      const { runtimeLaunchReadinessAuthority } = createLaunchReadinessAuthorityModule();
      const checks = runtimeLaunchReadinessAuthority.getChecks(USER_AUTH);
      assert.equal(checks.count, 24);
      assert.equal(checks.passed, 24);
    });

    it("marks checklist screen read-only", () => {
      const { runtimeLaunchReadinessAuthority } = createLaunchReadinessAuthorityModule();
      const checks = runtimeLaunchReadinessAuthority.getChecks(USER_AUTH);
      assert.equal(checks.screen.readOnly, true);
      assert.equal(checks.screen.screenId, "launch-readiness-checklist");
    });
  });

  describe("launch readiness decision", () => {
    it("returns official launch readiness decision", () => {
      const { runtimeLaunchReadinessAuthority } = createLaunchReadinessAuthorityModule();
      const result = runtimeLaunchReadinessAuthority.getDecision(USER_AUTH);
      assert.equal(result.decision.ready, true);
      assert.equal(result.decision.officiallyReadyForLaunch, true);
    });

    it("marks decision screen read-only", () => {
      const { runtimeLaunchReadinessAuthority } = createLaunchReadinessAuthorityModule();
      const result = runtimeLaunchReadinessAuthority.getDecision(USER_AUTH);
      assert.equal(result.screen.readOnly, true);
      assert.equal(result.screen.screenId, "launch-readiness-decision-screen");
    });
  });

  describe("launch readiness summary", () => {
    it("returns launch readiness summary", () => {
      const { runtimeLaunchReadinessAuthority } = createLaunchReadinessAuthorityModule();
      const summary = runtimeLaunchReadinessAuthority.getSummary(USER_AUTH);
      assert.equal(summary.summary.readOnly, true);
      assert.equal(summary.summary.delegated, true);
      assert.equal(summary.summary.overview.readyCount, 24);
      assert.equal(summary.summary.officiallyReadyForLaunch, true);
    });

    it("marks summary screen read-only", () => {
      const { runtimeLaunchReadinessAuthority } = createLaunchReadinessAuthorityModule();
      const summary = runtimeLaunchReadinessAuthority.getSummary(USER_AUTH);
      assert.equal(summary.screen.readOnly, true);
      assert.equal(summary.screen.screenId, "launch-readiness-summary-screen");
    });
  });

  describe("launch readiness board", () => {
    it("returns launch readiness board", () => {
      const { runtimeLaunchReadinessAuthority } = createLaunchReadinessAuthorityModule();
      const board = runtimeLaunchReadinessAuthority.getBoard(USER_AUTH);
      assert.equal(board.count, 8);
      assert.ok(board.board.some((c) => c.id === "readiness-authority"));
      assert.ok(board.board.some((c) => c.id === "launch"));
    });

    it("marks launch readiness board screen read-only", () => {
      const { runtimeLaunchReadinessAuthority } = createLaunchReadinessAuthorityModule();
      const board = runtimeLaunchReadinessAuthority.getBoard(USER_AUTH);
      assert.equal(board.screen.readOnly, true);
      assert.equal(board.screen.screenId, "launch-readiness-board");
    });
  });

  describe("refresh", () => {
    it("refreshes launch readiness view without runtime execution", () => {
      const { runtimeLaunchReadinessAuthority } = createLaunchReadinessAuthorityModule();
      const refreshed = runtimeLaunchReadinessAuthority.refresh(USER_AUTH) as {
        ok: boolean;
        read_only: boolean;
        no_runtime_execution: boolean;
        aggregation: { overview: { readyCount: number } };
      };
      assert.equal(refreshed.ok, true);
      assert.equal(refreshed.read_only, true);
      assert.equal(refreshed.no_runtime_execution, true);
      assert.equal(refreshed.aggregation.overview.readyCount, 24);
    });
  });

  describe("runtime integration", () => {
    it("integrates launch control via CH3-X28", () => {
      const deps = collectLaunchReadinessDependencyValidation();
      assert.equal(deps.launchControl, true);
    });

    it("integrates operations center via CH3-X27", () => {
      const deps = collectLaunchReadinessDependencyValidation();
      assert.equal(deps.operationsCenter, true);
    });

    it("integrates production approval via CH3-X26", () => {
      const deps = collectLaunchReadinessDependencyValidation();
      assert.equal(deps.productionApproval, true);
    });

    it("integrates runtime launcher via CH3-X19", () => {
      const deps = collectLaunchReadinessDependencyValidation();
      assert.equal(deps.launcher, true);
    });

    it("integrates need experience via CH3-X5", () => {
      const deps = collectLaunchReadinessDependencyValidation();
      assert.equal(deps.need, true);
    });
  });

  describe("validation", () => {
    it("passes full runtime launch readiness authority validation", () => {
      const result = validateRuntimeLaunchReadinessAuthority();
      assert.equal(result.valid, true);
      assert.equal(result.checked.moduleCount, 24);
      assert.equal(result.checked.checkCount, 24);
      assert.equal(result.checked.readOnlyGuarantees, true);
      assert.equal(result.checked.noDuplicatedRuntimeLogic, true);
    });

    it("validates launch readiness module coverage", () => {
      assert.equal(validateLaunchReadinessModuleCoverage(), true);
    });

    it("validates launch readiness check completeness", () => {
      assert.equal(validateLaunchReadinessCheckCompleteness(), true);
    });

    it("module factory exposes validate and service", () => {
      const mod = createLaunchReadinessAuthorityModule();
      assert.equal(mod.version, RUNTIME_LAUNCH_READINESS_AUTHORITY_VERSION);
      assert.ok(mod.runtimeLaunchReadinessAuthority);
      assert.equal(mod.validate().valid, true);
    });
  });

  describe("accessibility", () => {
    it("meets accessibility in launch readiness authority view", () => {
      const { runtimeLaunchReadinessAuthority } = createLaunchReadinessAuthorityModule();
      const view = runtimeLaunchReadinessAuthority.getLaunchReadinessAuthority(USER_AUTH);
      assert.ok(view.accessibility.compliant);
      assert.ok(view.accessibility.minimumTouchTargetPx >= NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx);
    });
  });

  describe("read-only guarantees", () => {
    it("does not execute runtime on refresh", () => {
      const { runtimeLaunchReadinessAuthority } = createLaunchReadinessAuthorityModule();
      const refreshed = runtimeLaunchReadinessAuthority.refresh(USER_AUTH) as {
        delegated: boolean;
        no_runtime_execution: boolean;
      };
      assert.equal(refreshed.delegated, true);
      assert.equal(refreshed.no_runtime_execution, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH3-X29", async () => {
      const pkg = JSON.parse(await readFile(path.join(ROOT_DIR, "package.json"), "utf8"));
      assert.ok(pkg.scripts["verify:ch3-x29"]);
      assert.ok(pkg.scripts["test:ch3-x29-runtime-launch-readiness-authority"]);
    });

    it("registers runtime launch readiness authority routes module", async () => {
      const routes = await readFile(
        path.join(ROOT_DIR, "src/api/routes/runtime-launch-readiness-authority.ts"),
        "utf8"
      );
      assert.match(routes, /registerRuntimeLaunchReadinessAuthorityRoutes/);
      assert.match(routes, /\/runtime-launch-readiness-authority\/validate/);
      assert.match(routes, /\/runtime-launch-readiness-authority\/refresh/);
    });

    it("wires runtime launch readiness authority in server and index", async () => {
      const server = await readFile(path.join(ROOT_DIR, "src/api/server.ts"), "utf8");
      const index = await readFile(path.join(ROOT_DIR, "src/index.ts"), "utf8");
      assert.match(server, /registerRuntimeLaunchReadinessAuthorityRoutes/);
      assert.match(server, /runtimeLaunchReadinessAuthority/);
      assert.match(index, /createAnActRuntimeLaunchReadinessAuthorityModule/);
      assert.match(index, /runtimeLaunchReadinessAuthority/);
    });
  });
});
