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
  RUNTIME_READINESS_CONSOLE_VERSION,
  READINESS_FIXED_TIMESTAMP,
  READINESS_MODULE_IDS,
  READINESS_CHECK_IDS,
  READINESS_GATE_DEFINITIONS,
  buildRuntimeReadinessConsoleDefinition,
  buildReadinessOverview,
  buildReadinessGates,
  buildReadinessSummary,
  calculateReadinessPercentage,
  createAnActRuntimeReadinessConsoleModule,
  createRuntimeReadinessConsoleRepository,
  validateRuntimeReadinessConsole,
  collectReadinessDependencyValidation,
  validateReadinessCheckCompleteness,
  validateReadinessModuleCoverage,
  buildReadinessConsoleHome,
} from "../src/runtime-experience/runtime-readiness/module.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../src/navigation-framework/validation/navigation-validator.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-runtime-readiness-001",
  sessionId: "session-runtime-readiness-001",
  roles: ["customer"],
  scopes: [],
  authenticated: true,
};

function createReadinessModule() {
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
  return createAnActRuntimeReadinessConsoleModule({
    runtimeExecutive,
    runtimeOperations,
    runtimeRelease,
    runtimeLauncher,
    repository: createRuntimeReadinessConsoleRepository(),
  });
}

describe("CH3-X23 AN ACT Runtime Readiness Console", () => {
  describe("domain", () => {
    it("defines eighteen readiness modules", () => {
      assert.equal(READINESS_MODULE_IDS.length, 18);
      assert.ok(READINESS_MODULE_IDS.includes("runtime-executive"));
    });

    it("defines eighteen readiness checks", () => {
      assert.equal(READINESS_CHECK_IDS.length, 18);
      assert.ok(READINESS_CHECK_IDS.includes("runtime-executive"));
    });

    it("defines six readiness gates", () => {
      assert.equal(READINESS_GATE_DEFINITIONS.length, 6);
      assert.ok(READINESS_GATE_DEFINITIONS.some((g) => g.id === "handoff-gate"));
    });

    it("builds read-only readiness definition", () => {
      const def = buildRuntimeReadinessConsoleDefinition();
      assert.equal(def.version, RUNTIME_READINESS_CONSOLE_VERSION);
      assert.equal(def.readOnly, true);
      assert.equal(def.noDeployment, true);
      assert.equal(def.noRuntimeExecution, true);
      assert.equal(def.noBubbleIntegration, true);
      assert.equal(def.noBusinessLogicDuplication, true);
    });

    it("uses deterministic fixed timestamp", () => {
      assert.equal(READINESS_FIXED_TIMESTAMP, "2026-06-21T23:00:00.000Z");
    });

    it("calculates readiness percentage", () => {
      assert.equal(calculateReadinessPercentage(18, 18), 100);
      assert.equal(calculateReadinessPercentage(9, 18), 50);
    });

    it("builds readiness overview", () => {
      const overview = buildReadinessOverview([
        { id: "need", label: "Need", delegateModule: "CH3-X5", status: "ready", passed: true },
      ]);
      assert.equal(overview.readyCount, 1);
      assert.equal(overview.overallStatus, "ready");
    });

    it("builds readiness gates from checks", () => {
      const checks = READINESS_CHECK_IDS.map((id) => ({ id, status: "passed" }));
      const gates = buildReadinessGates(checks);
      assert.equal(gates.length, 6);
      assert.ok(gates.every((g) => g.status === "open"));
    });

    it("builds readiness summary", () => {
      const overview = buildReadinessOverview([
        { id: "need", label: "Need", delegateModule: "CH3-X5", status: "ready", passed: true },
      ]);
      const gates = buildReadinessGates([{ id: "need-experience", status: "passed" }]);
      const summary = buildReadinessSummary({
        overview,
        gates,
        checks: [{ id: "need-experience", label: "Need", delegateModule: "CH3-X5", status: "passed", message: "ok", required: true }],
      });
      assert.equal(summary.readOnly, true);
      assert.equal(summary.delegated, true);
    });
  });

  describe("readiness home", () => {
    it("returns readiness overview with read-only guarantees", () => {
      const { runtimeReadiness } = createReadinessModule();
      const view = runtimeReadiness.getReadiness(USER_AUTH);
      assert.equal(view.version, RUNTIME_READINESS_CONSOLE_VERSION);
      assert.equal(view.read_only, true);
      assert.equal(view.delegates_only, true);
      assert.equal(view.no_runtime_execution, true);
      assert.equal(view.module_count, 18);
    });

    it("builds read-only readiness home screen", () => {
      const home = buildReadinessConsoleHome(100, 6);
      assert.equal(home.readOnly, true);
      assert.equal(home.screenId, "readiness-console-home");
    });
  });

  describe("readiness overview", () => {
    it("returns readiness overview", () => {
      const { runtimeReadiness } = createReadinessModule();
      const overview = runtimeReadiness.getOverview(USER_AUTH);
      assert.equal(overview.overview.moduleCount, 18);
      assert.equal(overview.overview.readyCount, 18);
      assert.equal(overview.screen.readOnly, true);
    });

    it("reports ready overall status", () => {
      const { runtimeReadiness } = createReadinessModule();
      const overview = runtimeReadiness.getOverview(USER_AUTH);
      assert.equal(overview.overview.overallStatus, "ready");
      assert.equal(overview.overview.readinessPercentage, 100);
    });
  });

  describe("readiness checks", () => {
    it("returns readiness checks", () => {
      const { runtimeReadiness } = createReadinessModule();
      const checks = runtimeReadiness.getChecks(USER_AUTH);
      assert.equal(checks.count, 18);
      assert.equal(checks.passed, 18);
    });

    it("marks checklist screen read-only", () => {
      const { runtimeReadiness } = createReadinessModule();
      const checks = runtimeReadiness.getChecks(USER_AUTH);
      assert.equal(checks.screen.readOnly, true);
      assert.equal(checks.screen.screenId, "readiness-checklist-screen");
    });
  });

  describe("readiness gates", () => {
    it("returns readiness gates", () => {
      const { runtimeReadiness } = createReadinessModule();
      const gates = runtimeReadiness.getGates(USER_AUTH);
      assert.equal(gates.count, 6);
      assert.equal(gates.open, 6);
    });

    it("marks gates screen read-only", () => {
      const { runtimeReadiness } = createReadinessModule();
      const gates = runtimeReadiness.getGates(USER_AUTH);
      assert.equal(gates.screen.readOnly, true);
      assert.equal(gates.screen.screenId, "readiness-gates-screen");
    });
  });

  describe("readiness summary", () => {
    it("returns readiness summary", () => {
      const { runtimeReadiness } = createReadinessModule();
      const summary = runtimeReadiness.getSummary(USER_AUTH);
      assert.equal(summary.summary.readOnly, true);
      assert.equal(summary.summary.delegated, true);
      assert.equal(summary.summary.overview.readyCount, 18);
      assert.equal(summary.summary.readyForHandoff, true);
    });

    it("marks summary screen read-only", () => {
      const { runtimeReadiness } = createReadinessModule();
      const summary = runtimeReadiness.getSummary(USER_AUTH);
      assert.equal(summary.screen.readOnly, true);
      assert.equal(summary.screen.screenId, "readiness-summary-screen");
    });
  });

  describe("command board", () => {
    it("returns readiness command board", () => {
      const { runtimeReadiness } = createReadinessModule();
      const board = runtimeReadiness.getCommandBoard(USER_AUTH);
      assert.equal(board.count, 7);
      assert.ok(board.commandBoard.some((c) => c.id === "readiness"));
      assert.ok(board.commandBoard.some((c) => c.id === "handoff"));
    });

    it("marks command board screen read-only", () => {
      const { runtimeReadiness } = createReadinessModule();
      const board = runtimeReadiness.getCommandBoard(USER_AUTH);
      assert.equal(board.screen.readOnly, true);
      assert.equal(board.screen.screenId, "readiness-command-board");
    });
  });

  describe("refresh", () => {
    it("refreshes readiness view without runtime execution", () => {
      const { runtimeReadiness } = createReadinessModule();
      const refreshed = runtimeReadiness.refresh(USER_AUTH) as {
        ok: boolean;
        read_only: boolean;
        no_runtime_execution: boolean;
        aggregation: { overview: { readyCount: number } };
      };
      assert.equal(refreshed.ok, true);
      assert.equal(refreshed.read_only, true);
      assert.equal(refreshed.no_runtime_execution, true);
      assert.equal(refreshed.aggregation.overview.readyCount, 18);
    });
  });

  describe("runtime integration", () => {
    it("integrates runtime executive via CH3-X22", () => {
      const deps = collectReadinessDependencyValidation();
      assert.equal(deps.executive, true);
    });

    it("integrates runtime operations via CH3-X21", () => {
      const deps = collectReadinessDependencyValidation();
      assert.equal(deps.operations, true);
    });

    it("integrates runtime release via CH3-X20", () => {
      const deps = collectReadinessDependencyValidation();
      assert.equal(deps.release, true);
    });

    it("integrates runtime launcher via CH3-X19", () => {
      const deps = collectReadinessDependencyValidation();
      assert.equal(deps.launcher, true);
    });

    it("integrates runtime health via CH3-X16", () => {
      const deps = collectReadinessDependencyValidation();
      assert.equal(deps.health, true);
    });

    it("integrates need experience via CH3-X5", () => {
      const deps = collectReadinessDependencyValidation();
      assert.equal(deps.need, true);
    });
  });

  describe("validation", () => {
    it("passes full runtime readiness validation", () => {
      const result = validateRuntimeReadinessConsole();
      assert.equal(result.valid, true);
      assert.equal(result.checked.moduleCount, 18);
      assert.equal(result.checked.checkCount, 18);
      assert.equal(result.checked.readOnlyGuarantees, true);
      assert.equal(result.checked.noDuplicatedRuntimeLogic, true);
    });

    it("validates readiness module coverage", () => {
      assert.equal(validateReadinessModuleCoverage(), true);
    });

    it("validates readiness check completeness", () => {
      assert.equal(validateReadinessCheckCompleteness(), true);
    });

    it("module factory exposes validate and service", () => {
      const mod = createReadinessModule();
      assert.equal(mod.version, RUNTIME_READINESS_CONSOLE_VERSION);
      assert.ok(mod.runtimeReadiness);
      assert.equal(mod.validate().valid, true);
    });
  });

  describe("accessibility", () => {
    it("meets accessibility in readiness view", () => {
      const { runtimeReadiness } = createReadinessModule();
      const view = runtimeReadiness.getReadiness(USER_AUTH);
      assert.ok(view.accessibility.compliant);
      assert.ok(view.accessibility.minimumTouchTargetPx >= NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx);
    });
  });

  describe("read-only guarantees", () => {
    it("does not execute runtime on refresh", () => {
      const { runtimeReadiness } = createReadinessModule();
      const refreshed = runtimeReadiness.refresh(USER_AUTH) as { delegated: boolean; no_runtime_execution: boolean };
      assert.equal(refreshed.delegated, true);
      assert.equal(refreshed.no_runtime_execution, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH3-X23", async () => {
      const pkg = JSON.parse(await readFile(path.join(ROOT_DIR, "package.json"), "utf8"));
      assert.ok(pkg.scripts["verify:ch3-x23"]);
      assert.ok(pkg.scripts["test:ch3-x23-runtime-readiness-console"]);
    });

    it("registers runtime readiness routes module", async () => {
      const routes = await readFile(path.join(ROOT_DIR, "src/api/routes/runtime-readiness.ts"), "utf8");
      assert.match(routes, /registerRuntimeReadinessRoutes/);
      assert.match(routes, /\/runtime-readiness\/validate/);
      assert.match(routes, /\/runtime-readiness\/refresh/);
    });

    it("wires runtime readiness in server and index", async () => {
      const server = await readFile(path.join(ROOT_DIR, "src/api/server.ts"), "utf8");
      const index = await readFile(path.join(ROOT_DIR, "src/index.ts"), "utf8");
      assert.match(server, /registerRuntimeReadinessRoutes/);
      assert.match(server, /runtimeReadiness/);
      assert.match(index, /createAnActRuntimeReadinessConsoleModule/);
      assert.match(index, /runtimeReadiness/);
    });
  });
});
