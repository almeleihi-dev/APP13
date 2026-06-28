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
  createAnActRuntimeLaunchReadinessAuthorityModule,
  createRuntimeLaunchReadinessAuthorityRepository,
} from "../src/runtime-experience/runtime-launch-readiness-authority/module.js";
import {
  RUNTIME_EXECUTIVE_LAUNCH_AUTHORITY_VERSION,
  EXECUTIVE_LAUNCH_AUTHORITY_FIXED_TIMESTAMP,
  EXECUTIVE_LAUNCH_MODULE_IDS,
  EXECUTIVE_LAUNCH_CHECK_IDS,
  buildRuntimeExecutiveLaunchAuthorityDefinition,
  buildExecutiveLaunchOverview,
  buildExecutiveLaunchReadiness,
  buildExecutiveLaunchDecision,
  buildExecutiveLaunchSummary,
  calculateAuthorizationPercentage,
  createAnActRuntimeExecutiveLaunchAuthorityModule,
  createRuntimeExecutiveLaunchAuthorityRepository,
  validateRuntimeExecutiveLaunchAuthority,
  collectExecutiveLaunchDependencyValidation,
  validateExecutiveLaunchModuleCoverage,
  validateExecutiveLaunchCheckCompleteness,
  buildExecutiveLaunchHome,
} from "../src/runtime-experience/runtime-executive-launch-authority/module.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../src/navigation-framework/validation/navigation-validator.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-runtime-executive-launch-authority-001",
  sessionId: "session-runtime-executive-launch-authority-001",
  roles: ["customer"],
  scopes: [],
  authenticated: true,
};

function createExecutiveLaunchAuthorityModule() {
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
  const { runtimeLaunchReadinessAuthority } = createAnActRuntimeLaunchReadinessAuthorityModule({
    runtimeLaunchControl,
    runtimeOperationsCenter,
    runtimeProductionApproval,
    runtimeLauncher,
    repository: createRuntimeLaunchReadinessAuthorityRepository(),
  });
  return createAnActRuntimeExecutiveLaunchAuthorityModule({
    runtimeLaunchReadinessAuthority,
    runtimeLaunchControl,
    runtimeOperationsCenter,
    runtimeProductionApproval,
    runtimeExecutive,
    repository: createRuntimeExecutiveLaunchAuthorityRepository(),
  });
}

describe("CH3-X30 AN ACT Runtime Executive Launch Authority", () => {
  describe("domain", () => {
    it("defines twenty-five executive launch modules", () => {
      assert.equal(EXECUTIVE_LAUNCH_MODULE_IDS.length, 25);
      assert.ok(EXECUTIVE_LAUNCH_MODULE_IDS.includes("runtime-launch-readiness-authority"));
    });

    it("defines twenty-five executive launch checks", () => {
      assert.equal(EXECUTIVE_LAUNCH_CHECK_IDS.length, 25);
      assert.ok(EXECUTIVE_LAUNCH_CHECK_IDS.includes("runtime-launch-readiness-authority"));
    });

    it("builds read-only executive launch authority definition", () => {
      const def = buildRuntimeExecutiveLaunchAuthorityDefinition();
      assert.equal(def.version, RUNTIME_EXECUTIVE_LAUNCH_AUTHORITY_VERSION);
      assert.equal(def.readOnly, true);
      assert.equal(def.noDeployment, true);
      assert.equal(def.noRuntimeExecution, true);
      assert.equal(def.noExternalIntegration, true);
      assert.equal(def.noBubbleIntegration, true);
    });

    it("uses deterministic fixed timestamp", () => {
      assert.equal(EXECUTIVE_LAUNCH_AUTHORITY_FIXED_TIMESTAMP, "2026-06-22T06:00:00.000Z");
    });

    it("calculates authorization percentage", () => {
      assert.equal(calculateAuthorizationPercentage(25, 25), 100);
      assert.equal(calculateAuthorizationPercentage(12, 25), 48);
    });

    it("builds executive launch overview", () => {
      const overview = buildExecutiveLaunchOverview([
        { id: "need", label: "Need", delegateModule: "CH3-X5", status: "authorized", authorized: true },
      ]);
      assert.equal(overview.authorizedCount, 1);
      assert.equal(overview.overallStatus, "authorized");
    });

    it("builds executive launch readiness", () => {
      const overview = buildExecutiveLaunchOverview([
        { id: "need", label: "Need", delegateModule: "CH3-X5", status: "authorized", authorized: true },
      ]);
      const readiness = buildExecutiveLaunchReadiness({
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
        officiallyReadyForLaunch: true,
        launchControlCleared: true,
        productionApproved: true,
        operationsCenterOperational: true,
      });
      assert.equal(readiness.authorized, true);
    });

    it("builds executive launch decision", () => {
      const overview = buildExecutiveLaunchOverview([
        { id: "need", label: "Need", delegateModule: "CH3-X5", status: "authorized", authorized: true },
      ]);
      const checks = [
        {
          id: "need-experience",
          label: "Need",
          delegateModule: "CH3-X5",
          status: "passed" as const,
          message: "ok",
          required: true,
        },
      ];
      const readiness = buildExecutiveLaunchReadiness({
        overview,
        checks,
        officiallyReadyForLaunch: true,
        launchControlCleared: true,
        productionApproved: true,
        operationsCenterOperational: true,
      });
      const decision = buildExecutiveLaunchDecision({
        overview,
        checks,
        readiness,
        launchReadinessReady: true,
        launchControlCleared: true,
        productionApproved: true,
        operationsCenterOperational: true,
      });
      assert.equal(decision.officialExecutiveLaunchApproval, true);
    });

    it("builds executive launch summary", () => {
      const overview = buildExecutiveLaunchOverview([
        { id: "need", label: "Need", delegateModule: "CH3-X5", status: "authorized", authorized: true },
      ]);
      const checks = [
        {
          id: "need-experience",
          label: "Need",
          delegateModule: "CH3-X5",
          status: "passed" as const,
          message: "ok",
          required: true,
        },
      ];
      const readiness = buildExecutiveLaunchReadiness({
        overview,
        checks,
        officiallyReadyForLaunch: true,
        launchControlCleared: true,
        productionApproved: true,
        operationsCenterOperational: true,
      });
      const decision = buildExecutiveLaunchDecision({
        overview,
        checks,
        readiness,
        launchReadinessReady: true,
        launchControlCleared: true,
        productionApproved: true,
        operationsCenterOperational: true,
      });
      const summary = buildExecutiveLaunchSummary({ overview, decision, checks });
      assert.equal(summary.readOnly, true);
      assert.equal(summary.delegated, true);
      assert.equal(summary.officialExecutiveLaunchApproval, true);
    });
  });

  describe("executive launch home", () => {
    it("returns executive launch authority overview with read-only guarantees", () => {
      const { runtimeExecutiveLaunchAuthority } = createExecutiveLaunchAuthorityModule();
      const view = runtimeExecutiveLaunchAuthority.getExecutiveLaunchAuthority(USER_AUTH);
      assert.equal(view.version, RUNTIME_EXECUTIVE_LAUNCH_AUTHORITY_VERSION);
      assert.equal(view.read_only, true);
      assert.equal(view.delegates_only, true);
      assert.equal(view.no_runtime_execution, true);
      assert.equal(view.module_count, 25);
    });

    it("builds read-only executive launch home screen", () => {
      const home = buildExecutiveLaunchHome(100, true);
      assert.equal(home.readOnly, true);
      assert.equal(home.screenId, "executive-launch-home");
    });
  });

  describe("executive launch dashboard", () => {
    it("returns executive launch dashboard", () => {
      const { runtimeExecutiveLaunchAuthority } = createExecutiveLaunchAuthorityModule();
      const dashboard = runtimeExecutiveLaunchAuthority.getDashboard(USER_AUTH);
      assert.equal(dashboard.dashboard.moduleCount, 25);
      assert.equal(dashboard.dashboard.authorizedCount, 25);
      assert.equal(dashboard.screen.readOnly, true);
    });

    it("reports authorized overall status", () => {
      const { runtimeExecutiveLaunchAuthority } = createExecutiveLaunchAuthorityModule();
      const dashboard = runtimeExecutiveLaunchAuthority.getDashboard(USER_AUTH);
      assert.equal(dashboard.dashboard.overallStatus, "authorized");
      assert.equal(dashboard.dashboard.authorizationPercentage, 100);
    });
  });

  describe("executive launch readiness", () => {
    it("returns executive launch readiness", () => {
      const { runtimeExecutiveLaunchAuthority } = createExecutiveLaunchAuthorityModule();
      const result = runtimeExecutiveLaunchAuthority.getReadiness(USER_AUTH);
      assert.equal(result.readiness.authorized, true);
      assert.equal(result.readiness.officiallyReadyForLaunch, true);
    });

    it("marks readiness screen read-only", () => {
      const { runtimeExecutiveLaunchAuthority } = createExecutiveLaunchAuthorityModule();
      const result = runtimeExecutiveLaunchAuthority.getReadiness(USER_AUTH);
      assert.equal(result.screen.readOnly, true);
      assert.equal(result.screen.screenId, "executive-launch-readiness-screen");
    });
  });

  describe("executive launch decision", () => {
    it("returns official executive launch approval", () => {
      const { runtimeExecutiveLaunchAuthority } = createExecutiveLaunchAuthorityModule();
      const result = runtimeExecutiveLaunchAuthority.getDecision(USER_AUTH);
      assert.equal(result.decision.authorized, true);
      assert.equal(result.decision.officialExecutiveLaunchApproval, true);
    });

    it("marks decision screen read-only", () => {
      const { runtimeExecutiveLaunchAuthority } = createExecutiveLaunchAuthorityModule();
      const result = runtimeExecutiveLaunchAuthority.getDecision(USER_AUTH);
      assert.equal(result.screen.readOnly, true);
      assert.equal(result.screen.screenId, "executive-launch-decision-screen");
    });
  });

  describe("executive launch summary", () => {
    it("returns executive launch summary", () => {
      const { runtimeExecutiveLaunchAuthority } = createExecutiveLaunchAuthorityModule();
      const summary = runtimeExecutiveLaunchAuthority.getSummary(USER_AUTH);
      assert.equal(summary.summary.readOnly, true);
      assert.equal(summary.summary.delegated, true);
      assert.equal(summary.summary.overview.authorizedCount, 25);
      assert.equal(summary.summary.officialExecutiveLaunchApproval, true);
    });

    it("marks summary screen read-only", () => {
      const { runtimeExecutiveLaunchAuthority } = createExecutiveLaunchAuthorityModule();
      const summary = runtimeExecutiveLaunchAuthority.getSummary(USER_AUTH);
      assert.equal(summary.screen.readOnly, true);
      assert.equal(summary.screen.screenId, "executive-launch-summary-screen");
    });
  });

  describe("executive launch board", () => {
    it("returns executive launch status board", () => {
      const { runtimeExecutiveLaunchAuthority } = createExecutiveLaunchAuthorityModule();
      const board = runtimeExecutiveLaunchAuthority.getBoard(USER_AUTH);
      assert.equal(board.count, 8);
      assert.ok(board.board.some((c) => c.id === "executive-launch-authority"));
      assert.ok(board.board.some((c) => c.id === "executive-launch"));
    });

    it("marks executive launch board screen read-only", () => {
      const { runtimeExecutiveLaunchAuthority } = createExecutiveLaunchAuthorityModule();
      const board = runtimeExecutiveLaunchAuthority.getBoard(USER_AUTH);
      assert.equal(board.screen.readOnly, true);
      assert.equal(board.screen.screenId, "executive-launch-board");
    });
  });

  describe("refresh", () => {
    it("refreshes executive launch view without runtime execution", () => {
      const { runtimeExecutiveLaunchAuthority } = createExecutiveLaunchAuthorityModule();
      const refreshed = runtimeExecutiveLaunchAuthority.refresh(USER_AUTH) as {
        ok: boolean;
        read_only: boolean;
        no_runtime_execution: boolean;
        aggregation: { overview: { authorizedCount: number } };
      };
      assert.equal(refreshed.ok, true);
      assert.equal(refreshed.read_only, true);
      assert.equal(refreshed.no_runtime_execution, true);
      assert.equal(refreshed.aggregation.overview.authorizedCount, 25);
    });
  });

  describe("runtime integration", () => {
    it("integrates launch readiness authority via CH3-X29", () => {
      const deps = collectExecutiveLaunchDependencyValidation();
      assert.equal(deps.launchReadinessAuthority, true);
    });

    it("integrates launch control via CH3-X28", () => {
      const deps = collectExecutiveLaunchDependencyValidation();
      assert.equal(deps.launchControl, true);
    });

    it("integrates operations center via CH3-X27", () => {
      const deps = collectExecutiveLaunchDependencyValidation();
      assert.equal(deps.operationsCenter, true);
    });

    it("integrates production approval via CH3-X26", () => {
      const deps = collectExecutiveLaunchDependencyValidation();
      assert.equal(deps.productionApproval, true);
    });

    it("integrates runtime executive via CH3-X22", () => {
      const deps = collectExecutiveLaunchDependencyValidation();
      assert.equal(deps.executive, true);
    });
  });

  describe("validation", () => {
    it("passes full runtime executive launch authority validation", () => {
      const result = validateRuntimeExecutiveLaunchAuthority();
      assert.equal(result.valid, true);
      assert.equal(result.checked.moduleCount, 25);
      assert.equal(result.checked.checkCount, 25);
      assert.equal(result.checked.readOnlyGuarantees, true);
      assert.equal(result.checked.noDuplicatedRuntimeLogic, true);
    });

    it("validates executive launch module coverage", () => {
      assert.equal(validateExecutiveLaunchModuleCoverage(), true);
    });

    it("validates executive launch check completeness", () => {
      assert.equal(validateExecutiveLaunchCheckCompleteness(), true);
    });

    it("module factory exposes validate and service", () => {
      const mod = createExecutiveLaunchAuthorityModule();
      assert.equal(mod.version, RUNTIME_EXECUTIVE_LAUNCH_AUTHORITY_VERSION);
      assert.ok(mod.runtimeExecutiveLaunchAuthority);
      assert.equal(mod.validate().valid, true);
    });
  });

  describe("accessibility", () => {
    it("meets accessibility in executive launch authority view", () => {
      const { runtimeExecutiveLaunchAuthority } = createExecutiveLaunchAuthorityModule();
      const view = runtimeExecutiveLaunchAuthority.getExecutiveLaunchAuthority(USER_AUTH);
      assert.ok(view.accessibility.compliant);
      assert.ok(view.accessibility.minimumTouchTargetPx >= NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx);
    });
  });

  describe("read-only guarantees", () => {
    it("does not execute runtime on refresh", () => {
      const { runtimeExecutiveLaunchAuthority } = createExecutiveLaunchAuthorityModule();
      const refreshed = runtimeExecutiveLaunchAuthority.refresh(USER_AUTH) as {
        delegated: boolean;
        no_runtime_execution: boolean;
      };
      assert.equal(refreshed.delegated, true);
      assert.equal(refreshed.no_runtime_execution, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH3-X30", async () => {
      const pkg = JSON.parse(await readFile(path.join(ROOT_DIR, "package.json"), "utf8"));
      assert.ok(pkg.scripts["verify:ch3-x30"]);
      assert.ok(pkg.scripts["test:ch3-x30-runtime-executive-launch-authority"]);
    });

    it("registers runtime executive launch authority routes module", async () => {
      const routes = await readFile(
        path.join(ROOT_DIR, "src/api/routes/runtime-executive-launch-authority.ts"),
        "utf8"
      );
      assert.match(routes, /registerRuntimeExecutiveLaunchAuthorityRoutes/);
      assert.match(routes, /\/runtime-executive-launch-authority\/validate/);
      assert.match(routes, /\/runtime-executive-launch-authority\/refresh/);
    });

    it("wires runtime executive launch authority in server and index", async () => {
      const server = await readFile(path.join(ROOT_DIR, "src/api/server.ts"), "utf8");
      const index = await readFile(path.join(ROOT_DIR, "src/index.ts"), "utf8");
      assert.match(server, /registerRuntimeExecutiveLaunchAuthorityRoutes/);
      assert.match(server, /runtimeExecutiveLaunchAuthority/);
      assert.match(index, /createAnActRuntimeExecutiveLaunchAuthorityModule/);
      assert.match(index, /runtimeExecutiveLaunchAuthority/);
    });
  });
});
