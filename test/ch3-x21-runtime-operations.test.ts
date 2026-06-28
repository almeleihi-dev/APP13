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
  RUNTIME_OPERATIONS_VERSION,
  OPERATIONS_FIXED_TIMESTAMP,
  OPERATIONS_MODULE_IDS,
  buildRuntimeOperationsDefinition,
  buildOperationsOverview,
  buildOperationsHealth,
  buildOperationsAlerts,
  createAnActRuntimeOperationsModule,
  createRuntimeOperationsRepository,
  validateRuntimeOperations,
  collectOperationsDependencyValidation,
  validateOperationsModuleCoverage,
  buildOperationsHome,
} from "../src/runtime-experience/runtime-operations/module.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../src/navigation-framework/validation/navigation-validator.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-runtime-operations-001",
  sessionId: "session-runtime-operations-001",
  roles: ["customer"],
  scopes: [],
  authenticated: true,
};

function createOperationsModule() {
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
  return createAnActRuntimeOperationsModule({
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
}

describe("CH3-X21 AN ACT Runtime Operations Center", () => {
  describe("domain", () => {
    it("defines sixteen operations modules", () => {
      assert.equal(OPERATIONS_MODULE_IDS.length, 16);
      assert.ok(OPERATIONS_MODULE_IDS.includes("runtime-release"));
    });

    it("builds read-only operations definition", () => {
      const def = buildRuntimeOperationsDefinition();
      assert.equal(def.version, RUNTIME_OPERATIONS_VERSION);
      assert.equal(def.readOnly, true);
      assert.equal(def.noDeployment, true);
      assert.equal(def.noRuntimeExecution, true);
      assert.equal(def.noBubbleIntegration, true);
    });

    it("uses deterministic fixed timestamp", () => {
      assert.equal(OPERATIONS_FIXED_TIMESTAMP, "2026-06-21T21:00:00.000Z");
    });

    it("builds operations overview", () => {
      const overview = buildOperationsOverview([
        { id: "need", label: "Need", delegateModule: "CH3-X5", status: "operational", healthy: true },
      ]);
      assert.equal(overview.operationalCount, 1);
      assert.equal(overview.overallStatus, "operational");
    });

    it("builds operations health", () => {
      const health = buildOperationsHealth({
        healthStatus: "ready",
        readinessPercentage: 100,
        qualityScore: 100,
        releaseCandidateDecision: "certified",
        mvpReadinessPercentage: 100,
        certified: true,
      });
      assert.equal(health.certified, true);
      assert.equal(health.qualityScore, 100);
    });

    it("builds info alert when no blockers", () => {
      const alerts = buildOperationsAlerts({
        blockers: [],
        warnings: [],
        launcherBlockers: [],
        launcherWarnings: [],
      });
      assert.equal(alerts.length, 1);
      assert.equal(alerts[0]!.severity, "info");
    });
  });

  describe("operations home", () => {
    it("returns operations overview with read-only guarantees", () => {
      const { runtimeOperations } = createOperationsModule();
      const view = runtimeOperations.getOperations(USER_AUTH);
      assert.equal(view.version, RUNTIME_OPERATIONS_VERSION);
      assert.equal(view.read_only, true);
      assert.equal(view.delegates_only, true);
      assert.equal(view.no_runtime_execution, true);
      assert.equal(view.module_count, 16);
    });

    it("builds read-only operations home screen", () => {
      const home = buildOperationsHome(16, 16);
      assert.equal(home.readOnly, true);
      assert.equal(home.screenId, "operations-home");
    });
  });

  describe("operations dashboard", () => {
    it("returns operations dashboard", () => {
      const { runtimeOperations } = createOperationsModule();
      const dashboard = runtimeOperations.getDashboard(USER_AUTH);
      assert.equal(dashboard.dashboard.moduleCount, 16);
      assert.equal(dashboard.dashboard.operationalCount, 16);
      assert.equal(dashboard.screen.readOnly, true);
    });

    it("reports overall operational status", () => {
      const { runtimeOperations } = createOperationsModule();
      const dashboard = runtimeOperations.getDashboard(USER_AUTH);
      assert.equal(dashboard.dashboard.overallStatus, "operational");
    });
  });

  describe("operations health", () => {
    it("returns operations health aggregation", () => {
      const { runtimeOperations } = createOperationsModule();
      const health = runtimeOperations.getHealth(USER_AUTH);
      assert.equal(health.health.readinessPercentage, 100);
      assert.equal(health.health.certified, true);
    });

    it("marks health screen read-only", () => {
      const { runtimeOperations } = createOperationsModule();
      const health = runtimeOperations.getHealth(USER_AUTH);
      assert.equal(health.screen.readOnly, true);
    });
  });

  describe("operations alerts", () => {
    it("returns info alert when all modules operational", () => {
      const { runtimeOperations } = createOperationsModule();
      const alerts = runtimeOperations.getAlerts(USER_AUTH);
      assert.ok(alerts.count >= 1);
      assert.ok(alerts.alerts.some((a) => a.severity === "info"));
    });

    it("marks alerts screen read-only", () => {
      const { runtimeOperations } = createOperationsModule();
      const alerts = runtimeOperations.getAlerts(USER_AUTH);
      assert.equal(alerts.screen.readOnly, true);
    });
  });

  describe("operations summary", () => {
    it("returns operations summary", () => {
      const { runtimeOperations } = createOperationsModule();
      const summary = runtimeOperations.getSummary(USER_AUTH);
      assert.equal(summary.summary.readOnly, true);
      assert.equal(summary.summary.delegated, true);
      assert.equal(summary.summary.overview.operationalCount, 16);
    });

    it("marks summary screen read-only", () => {
      const { runtimeOperations } = createOperationsModule();
      const summary = runtimeOperations.getSummary(USER_AUTH);
      assert.equal(summary.screen.readOnly, true);
    });
  });

  describe("operations status board", () => {
    it("returns status board for all modules", () => {
      const { runtimeOperations } = createOperationsModule();
      const status = runtimeOperations.getStatus(USER_AUTH);
      assert.equal(status.count, 16);
      assert.equal(status.overallStatus, "operational");
    });

    it("marks status board screen read-only", () => {
      const { runtimeOperations } = createOperationsModule();
      const status = runtimeOperations.getStatus(USER_AUTH);
      assert.equal(status.screen.readOnly, true);
    });
  });

  describe("refresh", () => {
    it("refreshes operations without runtime execution", () => {
      const { runtimeOperations } = createOperationsModule();
      const refreshed = runtimeOperations.refresh(USER_AUTH) as {
        ok: boolean;
        read_only: boolean;
        no_runtime_execution: boolean;
        aggregation: { overview: { operationalCount: number } };
      };
      assert.equal(refreshed.ok, true);
      assert.equal(refreshed.read_only, true);
      assert.equal(refreshed.no_runtime_execution, true);
      assert.equal(refreshed.aggregation.overview.operationalCount, 16);
    });
  });

  describe("runtime integration", () => {
    it("integrates runtime release via CH3-X20", () => {
      const deps = collectOperationsDependencyValidation();
      assert.equal(deps.release, true);
    });

    it("integrates runtime launcher via CH3-X19", () => {
      const deps = collectOperationsDependencyValidation();
      assert.equal(deps.launcher, true);
    });

    it("integrates runtime preview via CH3-X18", () => {
      const deps = collectOperationsDependencyValidation();
      assert.equal(deps.preview, true);
    });

    it("integrates runtime demo via CH3-X17", () => {
      const deps = collectOperationsDependencyValidation();
      assert.equal(deps.demo, true);
    });

    it("integrates runtime health via CH3-X16", () => {
      const deps = collectOperationsDependencyValidation();
      assert.equal(deps.health, true);
    });

    it("integrates runtime coordinator via CH3-X15", () => {
      const deps = collectOperationsDependencyValidation();
      assert.equal(deps.coordinator, true);
    });

    it("integrates runtime registry via CH3-X14", () => {
      const deps = collectOperationsDependencyValidation();
      assert.equal(deps.registry, true);
    });

    it("integrates runtime state via CH3-X13", () => {
      const deps = collectOperationsDependencyValidation();
      assert.equal(deps.state, true);
    });

    it("integrates runtime journey via CH3-X12", () => {
      const deps = collectOperationsDependencyValidation();
      assert.equal(deps.journey, true);
    });

    it("integrates need experience via CH3-X5", () => {
      const deps = collectOperationsDependencyValidation();
      assert.equal(deps.need, true);
    });
  });

  describe("validation", () => {
    it("passes full runtime operations validation", () => {
      const result = validateRuntimeOperations();
      assert.equal(result.valid, true);
      assert.equal(result.checked.moduleCount, 16);
      assert.equal(result.checked.readOnlyGuarantees, true);
      assert.equal(result.checked.noDuplicatedRuntimeLogic, true);
    });

    it("validates operations module coverage", () => {
      assert.equal(validateOperationsModuleCoverage(), true);
    });

    it("module factory exposes validate and service", () => {
      const mod = createOperationsModule();
      assert.equal(mod.version, RUNTIME_OPERATIONS_VERSION);
      assert.ok(mod.runtimeOperations);
      assert.equal(mod.validate().valid, true);
    });
  });

  describe("accessibility", () => {
    it("meets accessibility in operations view", () => {
      const { runtimeOperations } = createOperationsModule();
      const view = runtimeOperations.getOperations(USER_AUTH);
      assert.ok(view.accessibility.compliant);
      assert.ok(view.accessibility.minimumTouchTargetPx >= NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx);
    });
  });

  describe("read-only guarantees", () => {
    it("does not execute runtime on refresh", () => {
      const { runtimeOperations } = createOperationsModule();
      const refreshed = runtimeOperations.refresh(USER_AUTH) as { delegated: boolean; no_runtime_execution: boolean };
      assert.equal(refreshed.delegated, true);
      assert.equal(refreshed.no_runtime_execution, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH3-X21", async () => {
      const pkg = JSON.parse(await readFile(path.join(ROOT_DIR, "package.json"), "utf8"));
      assert.ok(pkg.scripts["verify:ch3-x21"]);
      assert.ok(pkg.scripts["test:ch3-x21-runtime-operations"]);
    });

    it("registers runtime operations routes module", async () => {
      const routes = await readFile(path.join(ROOT_DIR, "src/api/routes/runtime-operations.ts"), "utf8");
      assert.match(routes, /registerRuntimeOperationsRoutes/);
      assert.match(routes, /\/runtime-operations\/validate/);
      assert.match(routes, /\/runtime-operations\/refresh/);
    });

    it("wires runtime operations in server and index", async () => {
      const server = await readFile(path.join(ROOT_DIR, "src/api/server.ts"), "utf8");
      const index = await readFile(path.join(ROOT_DIR, "src/index.ts"), "utf8");
      assert.match(server, /registerRuntimeOperationsRoutes/);
      assert.match(server, /runtimeOperations/);
      assert.match(index, /createAnActRuntimeOperationsModule/);
      assert.match(index, /runtimeOperations/);
    });
  });
});
