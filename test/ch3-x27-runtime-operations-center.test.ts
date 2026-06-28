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
  RUNTIME_OPERATIONS_CENTER_VERSION,
  OPERATIONS_CENTER_FIXED_TIMESTAMP,
  OPERATIONS_CENTER_MODULE_IDS,
  buildRuntimeOperationsCenterDefinition,
  buildOperationsCenterOverview,
  buildOperationsCenterHealth,
  buildOperationsCenterAlerts,
  calculateOperationalPercentage,
  createAnActRuntimeOperationsCenterModule,
  createRuntimeOperationsCenterRepository,
  validateRuntimeOperationsCenter,
  collectOperationsCenterDependencyValidation,
  validateOperationsCenterModuleCoverage,
  buildOperationsCenterHome,
} from "../src/runtime-experience/runtime-operations-center/module.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../src/navigation-framework/validation/navigation-validator.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-runtime-operations-center-001",
  sessionId: "session-runtime-operations-center-001",
  roles: ["customer"],
  scopes: [],
  authenticated: true,
};

function createOperationsCenterModule() {
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
  return createAnActRuntimeOperationsCenterModule({
    runtimeProductionApproval,
    runtimeOperations,
    runtimeExecutive,
    runtimeFinalReadiness,
    repository: createRuntimeOperationsCenterRepository(),
  });
}

describe("CH3-X27 AN ACT Runtime Operations Center", () => {
  describe("domain", () => {
    it("defines twenty-two operations center modules", () => {
      assert.equal(OPERATIONS_CENTER_MODULE_IDS.length, 22);
      assert.ok(OPERATIONS_CENTER_MODULE_IDS.includes("runtime-production-approval"));
    });

    it("builds read-only operations center definition", () => {
      const def = buildRuntimeOperationsCenterDefinition();
      assert.equal(def.version, RUNTIME_OPERATIONS_CENTER_VERSION);
      assert.equal(def.readOnly, true);
      assert.equal(def.noDeployment, true);
      assert.equal(def.noRuntimeExecution, true);
      assert.equal(def.noBubbleIntegration, true);
    });

    it("uses deterministic fixed timestamp", () => {
      assert.equal(OPERATIONS_CENTER_FIXED_TIMESTAMP, "2026-06-22T03:00:00.000Z");
    });

    it("calculates operational percentage", () => {
      assert.equal(calculateOperationalPercentage(22, 22), 100);
      assert.equal(calculateOperationalPercentage(11, 22), 50);
    });

    it("builds operations center overview", () => {
      const overview = buildOperationsCenterOverview([
        { id: "need", label: "Need", delegateModule: "CH3-X5", status: "operational", healthy: true },
      ]);
      assert.equal(overview.operationalCount, 1);
      assert.equal(overview.overallStatus, "operational");
    });

    it("builds operations center health", () => {
      const health = buildOperationsCenterHealth({
        healthStatus: "ready",
        readinessPercentage: 100,
        qualityScore: 100,
        approvalPercentage: 100,
        productionApproved: true,
        operationalPercentage: 100,
      });
      assert.equal(health.productionApproved, true);
      assert.equal(health.approvalPercentage, 100);
    });

    it("builds info alert when production approved", () => {
      const alerts = buildOperationsCenterAlerts({
        operationsAlerts: [],
        productionApproved: true,
      });
      assert.equal(alerts.length, 1);
      assert.equal(alerts[0]!.severity, "info");
    });
  });

  describe("operations center home", () => {
    it("returns operations center overview with read-only guarantees", () => {
      const { runtimeOperationsCenter } = createOperationsCenterModule();
      const view = runtimeOperationsCenter.getOperationsCenter(USER_AUTH);
      assert.equal(view.version, RUNTIME_OPERATIONS_CENTER_VERSION);
      assert.equal(view.read_only, true);
      assert.equal(view.delegates_only, true);
      assert.equal(view.no_runtime_execution, true);
      assert.equal(view.module_count, 22);
    });

    it("builds read-only operations center home screen", () => {
      const home = buildOperationsCenterHome(22, 22, true);
      assert.equal(home.readOnly, true);
      assert.equal(home.screenId, "operations-center-home");
    });
  });

  describe("operations center dashboard", () => {
    it("returns operations center dashboard", () => {
      const { runtimeOperationsCenter } = createOperationsCenterModule();
      const dashboard = runtimeOperationsCenter.getDashboard(USER_AUTH);
      assert.equal(dashboard.dashboard.moduleCount, 22);
      assert.equal(dashboard.dashboard.operationalCount, 22);
      assert.equal(dashboard.screen.readOnly, true);
    });

    it("reports overall operational status", () => {
      const { runtimeOperationsCenter } = createOperationsCenterModule();
      const dashboard = runtimeOperationsCenter.getDashboard(USER_AUTH);
      assert.equal(dashboard.dashboard.overallStatus, "operational");
      assert.equal(dashboard.dashboard.operationalPercentage, 100);
    });
  });

  describe("operations center health", () => {
    it("returns operations center health aggregation", () => {
      const { runtimeOperationsCenter } = createOperationsCenterModule();
      const health = runtimeOperationsCenter.getHealth(USER_AUTH);
      assert.equal(health.health.productionApproved, true);
      assert.equal(health.health.approvalPercentage, 100);
    });

    it("marks health screen read-only", () => {
      const { runtimeOperationsCenter } = createOperationsCenterModule();
      const health = runtimeOperationsCenter.getHealth(USER_AUTH);
      assert.equal(health.screen.readOnly, true);
      assert.equal(health.screen.screenId, "operations-center-health-screen");
    });
  });

  describe("operations center alerts", () => {
    it("returns info alert when all modules operational", () => {
      const { runtimeOperationsCenter } = createOperationsCenterModule();
      const alerts = runtimeOperationsCenter.getAlerts(USER_AUTH);
      assert.ok(alerts.count >= 1);
      assert.ok(alerts.alerts.some((a) => a.severity === "info"));
    });

    it("marks alerts screen read-only", () => {
      const { runtimeOperationsCenter } = createOperationsCenterModule();
      const alerts = runtimeOperationsCenter.getAlerts(USER_AUTH);
      assert.equal(alerts.screen.readOnly, true);
      assert.equal(alerts.screen.screenId, "operations-center-alerts-screen");
    });
  });

  describe("operations center summary", () => {
    it("returns operations center summary", () => {
      const { runtimeOperationsCenter } = createOperationsCenterModule();
      const summary = runtimeOperationsCenter.getSummary(USER_AUTH);
      assert.equal(summary.summary.readOnly, true);
      assert.equal(summary.summary.delegated, true);
      assert.equal(summary.summary.overview.operationalCount, 22);
      assert.equal(summary.summary.productionApproved, true);
    });

    it("marks summary screen read-only", () => {
      const { runtimeOperationsCenter } = createOperationsCenterModule();
      const summary = runtimeOperationsCenter.getSummary(USER_AUTH);
      assert.equal(summary.screen.readOnly, true);
      assert.equal(summary.screen.screenId, "operations-center-summary-screen");
    });
  });

  describe("operations center status board", () => {
    it("returns status board including command cards", () => {
      const { runtimeOperationsCenter } = createOperationsCenterModule();
      const status = runtimeOperationsCenter.getStatus(USER_AUTH);
      assert.ok(status.count >= 22);
      assert.ok(status.statusBoard.some((c) => c.id === "operations-center"));
      assert.ok(status.statusBoard.some((c) => c.id === "production-approval"));
    });

    it("marks status board screen read-only", () => {
      const { runtimeOperationsCenter } = createOperationsCenterModule();
      const status = runtimeOperationsCenter.getStatus(USER_AUTH);
      assert.equal(status.screen.readOnly, true);
      assert.equal(status.screen.screenId, "operations-center-status-board");
    });
  });

  describe("refresh", () => {
    it("refreshes operations center view without runtime execution", () => {
      const { runtimeOperationsCenter } = createOperationsCenterModule();
      const refreshed = runtimeOperationsCenter.refresh(USER_AUTH) as {
        ok: boolean;
        read_only: boolean;
        no_runtime_execution: boolean;
        aggregation: { overview: { operationalCount: number } };
      };
      assert.equal(refreshed.ok, true);
      assert.equal(refreshed.read_only, true);
      assert.equal(refreshed.no_runtime_execution, true);
      assert.equal(refreshed.aggregation.overview.operationalCount, 22);
    });
  });

  describe("runtime integration", () => {
    it("integrates production approval via CH3-X26", () => {
      const deps = collectOperationsCenterDependencyValidation();
      assert.equal(deps.productionApproval, true);
    });

    it("integrates runtime final readiness via CH3-X25", () => {
      const deps = collectOperationsCenterDependencyValidation();
      assert.equal(deps.finalReadiness, true);
    });

    it("integrates runtime operations via CH3-X21", () => {
      const deps = collectOperationsCenterDependencyValidation();
      assert.equal(deps.operations, true);
    });

    it("integrates runtime executive via CH3-X22", () => {
      const deps = collectOperationsCenterDependencyValidation();
      assert.equal(deps.executive, true);
    });

    it("integrates need experience via CH3-X5", () => {
      const deps = collectOperationsCenterDependencyValidation();
      assert.equal(deps.need, true);
    });
  });

  describe("validation", () => {
    it("passes full runtime operations center validation", () => {
      const result = validateRuntimeOperationsCenter();
      assert.equal(result.valid, true);
      assert.equal(result.checked.moduleCount, 22);
      assert.equal(result.checked.readOnlyGuarantees, true);
      assert.equal(result.checked.noDuplicatedRuntimeLogic, true);
    });

    it("validates operations center module coverage", () => {
      assert.equal(validateOperationsCenterModuleCoverage(), true);
    });

    it("module factory exposes validate and service", () => {
      const mod = createOperationsCenterModule();
      assert.equal(mod.version, RUNTIME_OPERATIONS_CENTER_VERSION);
      assert.ok(mod.runtimeOperationsCenter);
      assert.equal(mod.validate().valid, true);
    });
  });

  describe("accessibility", () => {
    it("meets accessibility in operations center view", () => {
      const { runtimeOperationsCenter } = createOperationsCenterModule();
      const view = runtimeOperationsCenter.getOperationsCenter(USER_AUTH);
      assert.ok(view.accessibility.compliant);
      assert.ok(view.accessibility.minimumTouchTargetPx >= NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx);
    });
  });

  describe("read-only guarantees", () => {
    it("does not execute runtime on refresh", () => {
      const { runtimeOperationsCenter } = createOperationsCenterModule();
      const refreshed = runtimeOperationsCenter.refresh(USER_AUTH) as { delegated: boolean; no_runtime_execution: boolean };
      assert.equal(refreshed.delegated, true);
      assert.equal(refreshed.no_runtime_execution, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH3-X27", async () => {
      const pkg = JSON.parse(await readFile(path.join(ROOT_DIR, "package.json"), "utf8"));
      assert.ok(pkg.scripts["verify:ch3-x27"]);
      assert.ok(pkg.scripts["test:ch3-x27-runtime-operations-center"]);
    });

    it("registers runtime operations center routes module", async () => {
      const routes = await readFile(path.join(ROOT_DIR, "src/api/routes/runtime-operations-center.ts"), "utf8");
      assert.match(routes, /registerRuntimeOperationsCenterRoutes/);
      assert.match(routes, /\/runtime-operations-center\/validate/);
      assert.match(routes, /\/runtime-operations-center\/refresh/);
    });

    it("wires runtime operations center in server and index", async () => {
      const server = await readFile(path.join(ROOT_DIR, "src/api/server.ts"), "utf8");
      const index = await readFile(path.join(ROOT_DIR, "src/index.ts"), "utf8");
      assert.match(server, /registerRuntimeOperationsCenterRoutes/);
      assert.match(server, /runtimeOperationsCenter/);
      assert.match(index, /createAnActRuntimeOperationsCenterModule/);
      assert.match(index, /runtimeOperationsCenter/);
    });
  });
});
