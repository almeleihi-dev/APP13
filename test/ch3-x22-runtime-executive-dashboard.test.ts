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
  RUNTIME_EXECUTIVE_VERSION,
  EXECUTIVE_FIXED_TIMESTAMP,
  EXECUTIVE_MODULE_IDS,
  buildRuntimeExecutiveDefinition,
  buildExecutiveOverview,
  buildExecutiveKpis,
  buildExecutiveInsights,
  calculateExecutiveReadinessScore,
  createAnActRuntimeExecutiveDashboardModule,
  createRuntimeExecutiveDashboardRepository,
  validateRuntimeExecutiveDashboard,
  collectExecutiveDependencyValidation,
  validateExecutiveModuleCoverage,
  buildExecutiveDashboardHome,
} from "../src/runtime-experience/runtime-executive/module.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../src/navigation-framework/validation/navigation-validator.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-runtime-executive-001",
  sessionId: "session-runtime-executive-001",
  roles: ["customer"],
  scopes: [],
  authenticated: true,
};

function createExecutiveModule() {
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
  return createAnActRuntimeExecutiveDashboardModule({
    runtimeOperations,
    runtimeRelease,
    runtimeLauncher,
    runtimeHealth,
    repository: createRuntimeExecutiveDashboardRepository(),
  });
}

describe("CH3-X22 AN ACT Runtime Executive Dashboard", () => {
  describe("domain", () => {
    it("defines seventeen executive modules", () => {
      assert.equal(EXECUTIVE_MODULE_IDS.length, 17);
      assert.ok(EXECUTIVE_MODULE_IDS.includes("runtime-operations"));
    });

    it("builds read-only executive definition", () => {
      const def = buildRuntimeExecutiveDefinition();
      assert.equal(def.version, RUNTIME_EXECUTIVE_VERSION);
      assert.equal(def.readOnly, true);
      assert.equal(def.noDeployment, true);
      assert.equal(def.noRuntimeExecution, true);
      assert.equal(def.noBubbleIntegration, true);
    });

    it("uses deterministic fixed timestamp", () => {
      assert.equal(EXECUTIVE_FIXED_TIMESTAMP, "2026-06-21T22:00:00.000Z");
    });

    it("builds executive overview", () => {
      const overview = buildExecutiveOverview([
        { id: "need", label: "Need", delegateModule: "CH3-X5", status: "on-track", healthy: true },
      ]);
      assert.equal(overview.onTrackCount, 1);
      assert.equal(overview.overallStatus, "on-track");
    });

    it("calculates executive readiness score", () => {
      assert.equal(
        calculateExecutiveReadinessScore({
          mvpReadinessPercentage: 100,
          releaseQualityScore: 100,
          operationalRatio: 1,
        }),
        100
      );
    });

    it("builds executive KPIs", () => {
      const kpis = buildExecutiveKpis({
        mvpReadinessPercentage: 100,
        releaseQualityScore: 100,
        operationalModuleCount: 17,
        totalModuleCount: 17,
        certificationStatus: "certified",
        overallHealthStatus: "ready",
      });
      assert.equal(kpis.executiveReadinessScore, 100);
      assert.equal(kpis.kpis.length, 6);
    });

    it("builds certified executive insight", () => {
      const insights = buildExecutiveInsights({
        alerts: [],
        recommendations: [],
        overallStatus: "on-track",
        certified: true,
      });
      assert.ok(insights.some((i) => i.category === "status"));
    });
  });

  describe("executive home", () => {
    it("returns executive overview with read-only guarantees", () => {
      const { runtimeExecutive } = createExecutiveModule();
      const view = runtimeExecutive.getExecutive(USER_AUTH);
      assert.equal(view.version, RUNTIME_EXECUTIVE_VERSION);
      assert.equal(view.read_only, true);
      assert.equal(view.delegates_only, true);
      assert.equal(view.no_runtime_execution, true);
      assert.equal(view.module_count, 17);
    });

    it("builds read-only executive home screen", () => {
      const home = buildExecutiveDashboardHome(100, 17);
      assert.equal(home.readOnly, true);
      assert.equal(home.screenId, "executive-dashboard-home");
    });
  });

  describe("executive dashboard", () => {
    it("returns executive dashboard", () => {
      const { runtimeExecutive } = createExecutiveModule();
      const dashboard = runtimeExecutive.getDashboard(USER_AUTH);
      assert.equal(dashboard.dashboard.moduleCount, 17);
      assert.equal(dashboard.dashboard.onTrackCount, 17);
      assert.equal(dashboard.screen.readOnly, true);
    });

    it("reports on-track overall status", () => {
      const { runtimeExecutive } = createExecutiveModule();
      const dashboard = runtimeExecutive.getDashboard(USER_AUTH);
      assert.equal(dashboard.dashboard.overallStatus, "on-track");
    });
  });

  describe("executive KPIs", () => {
    it("returns executive KPIs", () => {
      const { runtimeExecutive } = createExecutiveModule();
      const kpis = runtimeExecutive.getKpis(USER_AUTH);
      assert.equal(kpis.kpis.executiveReadinessScore, 100);
      assert.equal(kpis.kpis.mvpReadinessPercentage, 100);
    });

    it("marks KPI screen read-only", () => {
      const { runtimeExecutive } = createExecutiveModule();
      const kpis = runtimeExecutive.getKpis(USER_AUTH);
      assert.equal(kpis.screen.readOnly, true);
    });
  });

  describe("executive insights", () => {
    it("returns executive insights", () => {
      const { runtimeExecutive } = createExecutiveModule();
      const insights = runtimeExecutive.getInsights(USER_AUTH);
      assert.ok(insights.count >= 1);
    });

    it("marks insights screen read-only", () => {
      const { runtimeExecutive } = createExecutiveModule();
      const insights = runtimeExecutive.getInsights(USER_AUTH);
      assert.equal(insights.screen.readOnly, true);
    });
  });

  describe("executive summary", () => {
    it("returns executive summary", () => {
      const { runtimeExecutive } = createExecutiveModule();
      const summary = runtimeExecutive.getSummary(USER_AUTH);
      assert.equal(summary.summary.readOnly, true);
      assert.equal(summary.summary.delegated, true);
      assert.equal(summary.summary.overview.onTrackCount, 17);
    });

    it("marks summary screen read-only", () => {
      const { runtimeExecutive } = createExecutiveModule();
      const summary = runtimeExecutive.getSummary(USER_AUTH);
      assert.equal(summary.screen.readOnly, true);
    });
  });

  describe("command board", () => {
    it("returns executive command board", () => {
      const { runtimeExecutive } = createExecutiveModule();
      const board = runtimeExecutive.getCommandBoard(USER_AUTH);
      assert.equal(board.count, 6);
      assert.ok(board.commandBoard.some((c) => c.id === "executive"));
    });

    it("marks command board screen read-only", () => {
      const { runtimeExecutive } = createExecutiveModule();
      const board = runtimeExecutive.getCommandBoard(USER_AUTH);
      assert.equal(board.screen.readOnly, true);
    });
  });

  describe("refresh", () => {
    it("refreshes executive view without runtime execution", () => {
      const { runtimeExecutive } = createExecutiveModule();
      const refreshed = runtimeExecutive.refresh(USER_AUTH) as {
        ok: boolean;
        read_only: boolean;
        no_runtime_execution: boolean;
        aggregation: { overview: { onTrackCount: number } };
      };
      assert.equal(refreshed.ok, true);
      assert.equal(refreshed.read_only, true);
      assert.equal(refreshed.no_runtime_execution, true);
      assert.equal(refreshed.aggregation.overview.onTrackCount, 17);
    });
  });

  describe("runtime integration", () => {
    it("integrates runtime operations via CH3-X21", () => {
      const deps = collectExecutiveDependencyValidation();
      assert.equal(deps.operations, true);
    });

    it("integrates runtime release via CH3-X20", () => {
      const deps = collectExecutiveDependencyValidation();
      assert.equal(deps.release, true);
    });

    it("integrates runtime launcher via CH3-X19", () => {
      const deps = collectExecutiveDependencyValidation();
      assert.equal(deps.launcher, true);
    });

    it("integrates runtime health via CH3-X16", () => {
      const deps = collectExecutiveDependencyValidation();
      assert.equal(deps.health, true);
    });

    it("integrates runtime journey via CH3-X12", () => {
      const deps = collectExecutiveDependencyValidation();
      assert.equal(deps.journey, true);
    });

    it("integrates need experience via CH3-X5", () => {
      const deps = collectExecutiveDependencyValidation();
      assert.equal(deps.need, true);
    });
  });

  describe("validation", () => {
    it("passes full runtime executive validation", () => {
      const result = validateRuntimeExecutiveDashboard();
      assert.equal(result.valid, true);
      assert.equal(result.checked.moduleCount, 17);
      assert.equal(result.checked.readOnlyGuarantees, true);
      assert.equal(result.checked.noDuplicatedRuntimeLogic, true);
    });

    it("validates executive module coverage", () => {
      assert.equal(validateExecutiveModuleCoverage(), true);
    });

    it("module factory exposes validate and service", () => {
      const mod = createExecutiveModule();
      assert.equal(mod.version, RUNTIME_EXECUTIVE_VERSION);
      assert.ok(mod.runtimeExecutive);
      assert.equal(mod.validate().valid, true);
    });
  });

  describe("accessibility", () => {
    it("meets accessibility in executive view", () => {
      const { runtimeExecutive } = createExecutiveModule();
      const view = runtimeExecutive.getExecutive(USER_AUTH);
      assert.ok(view.accessibility.compliant);
      assert.ok(view.accessibility.minimumTouchTargetPx >= NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx);
    });
  });

  describe("read-only guarantees", () => {
    it("does not execute runtime on refresh", () => {
      const { runtimeExecutive } = createExecutiveModule();
      const refreshed = runtimeExecutive.refresh(USER_AUTH) as { delegated: boolean; no_runtime_execution: boolean };
      assert.equal(refreshed.delegated, true);
      assert.equal(refreshed.no_runtime_execution, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH3-X22", async () => {
      const pkg = JSON.parse(await readFile(path.join(ROOT_DIR, "package.json"), "utf8"));
      assert.ok(pkg.scripts["verify:ch3-x22"]);
      assert.ok(pkg.scripts["test:ch3-x22-runtime-executive-dashboard"]);
    });

    it("registers runtime executive routes module", async () => {
      const routes = await readFile(path.join(ROOT_DIR, "src/api/routes/runtime-executive.ts"), "utf8");
      assert.match(routes, /registerRuntimeExecutiveRoutes/);
      assert.match(routes, /\/runtime-executive\/validate/);
      assert.match(routes, /\/runtime-executive\/refresh/);
    });

    it("wires runtime executive in server and index", async () => {
      const server = await readFile(path.join(ROOT_DIR, "src/api/server.ts"), "utf8");
      const index = await readFile(path.join(ROOT_DIR, "src/index.ts"), "utf8");
      assert.match(server, /registerRuntimeExecutiveRoutes/);
      assert.match(server, /runtimeExecutive/);
      assert.match(index, /createAnActRuntimeExecutiveDashboardModule/);
      assert.match(index, /runtimeExecutive/);
    });
  });
});
