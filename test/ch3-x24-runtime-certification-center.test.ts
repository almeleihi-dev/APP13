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
  RUNTIME_CERTIFICATION_CENTER_VERSION,
  CERTIFICATION_FIXED_TIMESTAMP,
  CERTIFICATION_MODULE_IDS,
  CERTIFICATION_CHECK_IDS,
  buildRuntimeCertificationCenterDefinition,
  buildCertificationOverview,
  buildCertificationStatus,
  buildCertificationSummary,
  calculateCertificationPercentage,
  createAnActRuntimeCertificationCenterModule,
  createRuntimeCertificationRepository,
  validateRuntimeCertification,
  collectCertificationDependencyValidation,
  validateCertificationCheckCompleteness,
  validateCertificationModuleCoverage,
  buildCertificationHome,
} from "../src/runtime-experience/runtime-certification/module.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../src/navigation-framework/validation/navigation-validator.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-runtime-certification-001",
  sessionId: "session-runtime-certification-001",
  roles: ["customer"],
  scopes: [],
  authenticated: true,
};

function createCertificationModule() {
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
  return createAnActRuntimeCertificationCenterModule({
    runtimeReadiness,
    runtimeExecutive,
    runtimeOperations,
    runtimeRelease,
    repository: createRuntimeCertificationRepository(),
  });
}

describe("CH3-X24 AN ACT Runtime Certification Center", () => {
  describe("domain", () => {
    it("defines nineteen certification modules", () => {
      assert.equal(CERTIFICATION_MODULE_IDS.length, 19);
      assert.ok(CERTIFICATION_MODULE_IDS.includes("runtime-readiness"));
    });

    it("defines nineteen certification checks", () => {
      assert.equal(CERTIFICATION_CHECK_IDS.length, 19);
      assert.ok(CERTIFICATION_CHECK_IDS.includes("runtime-readiness"));
    });

    it("builds read-only certification definition", () => {
      const def = buildRuntimeCertificationCenterDefinition();
      assert.equal(def.version, RUNTIME_CERTIFICATION_CENTER_VERSION);
      assert.equal(def.readOnly, true);
      assert.equal(def.noDeployment, true);
      assert.equal(def.noRuntimeExecution, true);
      assert.equal(def.noBubbleIntegration, true);
      assert.equal(def.noBusinessLogicDuplication, true);
    });

    it("uses deterministic fixed timestamp", () => {
      assert.equal(CERTIFICATION_FIXED_TIMESTAMP, "2026-06-22T00:00:00.000Z");
    });

    it("calculates certification percentage", () => {
      assert.equal(calculateCertificationPercentage(19, 19), 100);
      assert.equal(calculateCertificationPercentage(10, 19), 53);
    });

    it("builds certification overview", () => {
      const overview = buildCertificationOverview([
        { id: "need", label: "Need", delegateModule: "CH3-X5", status: "certified", certified: true },
      ]);
      assert.equal(overview.certifiedCount, 1);
      assert.equal(overview.overallStatus, "certified");
    });

    it("builds certification status", () => {
      const overview = buildCertificationOverview([
        { id: "need", label: "Need", delegateModule: "CH3-X5", status: "certified", certified: true },
      ]);
      const status = buildCertificationStatus({
        overview,
        checks: [{ id: "need-experience", label: "Need", delegateModule: "CH3-X5", status: "passed", message: "ok", required: true }],
        releaseCertified: true,
        readinessComplete: true,
      });
      assert.equal(status.certified, true);
      assert.equal(status.readyForProductionApproval, true);
    });

    it("builds certification summary", () => {
      const overview = buildCertificationOverview([
        { id: "need", label: "Need", delegateModule: "CH3-X5", status: "certified", certified: true },
      ]);
      const status = buildCertificationStatus({
        overview,
        checks: [{ id: "need-experience", label: "Need", delegateModule: "CH3-X5", status: "passed", message: "ok", required: true }],
        releaseCertified: true,
        readinessComplete: true,
      });
      const summary = buildCertificationSummary({
        overview,
        status,
        checks: [{ id: "need-experience", label: "Need", delegateModule: "CH3-X5", status: "passed", message: "ok", required: true }],
      });
      assert.equal(summary.readOnly, true);
      assert.equal(summary.delegated, true);
    });
  });

  describe("certification home", () => {
    it("returns certification overview with read-only guarantees", () => {
      const { runtimeCertification } = createCertificationModule();
      const view = runtimeCertification.getCertification(USER_AUTH);
      assert.equal(view.version, RUNTIME_CERTIFICATION_CENTER_VERSION);
      assert.equal(view.read_only, true);
      assert.equal(view.delegates_only, true);
      assert.equal(view.no_runtime_execution, true);
      assert.equal(view.module_count, 19);
    });

    it("builds read-only certification home screen", () => {
      const home = buildCertificationHome(100, true);
      assert.equal(home.readOnly, true);
      assert.equal(home.screenId, "certification-home");
    });
  });

  describe("certification dashboard", () => {
    it("returns certification dashboard", () => {
      const { runtimeCertification } = createCertificationModule();
      const dashboard = runtimeCertification.getDashboard(USER_AUTH);
      assert.equal(dashboard.dashboard.moduleCount, 19);
      assert.equal(dashboard.dashboard.certifiedCount, 19);
      assert.equal(dashboard.screen.readOnly, true);
    });

    it("reports certified overall status", () => {
      const { runtimeCertification } = createCertificationModule();
      const dashboard = runtimeCertification.getDashboard(USER_AUTH);
      assert.equal(dashboard.dashboard.overallStatus, "certified");
      assert.equal(dashboard.dashboard.certificationPercentage, 100);
    });
  });

  describe("certification status", () => {
    it("returns certification authority status", () => {
      const { runtimeCertification } = createCertificationModule();
      const status = runtimeCertification.getStatus(USER_AUTH);
      assert.equal(status.status.certified, true);
      assert.equal(status.status.readyForProductionApproval, true);
    });

    it("marks status screen read-only", () => {
      const { runtimeCertification } = createCertificationModule();
      const status = runtimeCertification.getStatus(USER_AUTH);
      assert.equal(status.screen.readOnly, true);
      assert.equal(status.screen.screenId, "certification-status-screen");
    });
  });

  describe("certification checks", () => {
    it("returns certification checks", () => {
      const { runtimeCertification } = createCertificationModule();
      const checks = runtimeCertification.getChecks(USER_AUTH);
      assert.equal(checks.count, 19);
      assert.equal(checks.passed, 19);
    });

    it("marks checklist screen read-only", () => {
      const { runtimeCertification } = createCertificationModule();
      const checks = runtimeCertification.getChecks(USER_AUTH);
      assert.equal(checks.screen.readOnly, true);
      assert.equal(checks.screen.screenId, "certification-checklist-screen");
    });
  });

  describe("certification summary", () => {
    it("returns certification summary", () => {
      const { runtimeCertification } = createCertificationModule();
      const summary = runtimeCertification.getSummary(USER_AUTH);
      assert.equal(summary.summary.readOnly, true);
      assert.equal(summary.summary.delegated, true);
      assert.equal(summary.summary.overview.certifiedCount, 19);
      assert.equal(summary.summary.readyForProductionApproval, true);
    });

    it("marks summary screen read-only", () => {
      const { runtimeCertification } = createCertificationModule();
      const summary = runtimeCertification.getSummary(USER_AUTH);
      assert.equal(summary.screen.readOnly, true);
      assert.equal(summary.screen.screenId, "certification-summary-screen");
    });
  });

  describe("certification board", () => {
    it("returns certification board", () => {
      const { runtimeCertification } = createCertificationModule();
      const board = runtimeCertification.getBoard(USER_AUTH);
      assert.equal(board.count, 8);
      assert.ok(board.board.some((c) => c.id === "certification"));
      assert.ok(board.board.some((c) => c.id === "approval"));
    });

    it("marks certification board screen read-only", () => {
      const { runtimeCertification } = createCertificationModule();
      const board = runtimeCertification.getBoard(USER_AUTH);
      assert.equal(board.screen.readOnly, true);
      assert.equal(board.screen.screenId, "certification-board");
    });
  });

  describe("refresh", () => {
    it("refreshes certification view without runtime execution", () => {
      const { runtimeCertification } = createCertificationModule();
      const refreshed = runtimeCertification.refresh(USER_AUTH) as {
        ok: boolean;
        read_only: boolean;
        no_runtime_execution: boolean;
        aggregation: { overview: { certifiedCount: number } };
      };
      assert.equal(refreshed.ok, true);
      assert.equal(refreshed.read_only, true);
      assert.equal(refreshed.no_runtime_execution, true);
      assert.equal(refreshed.aggregation.overview.certifiedCount, 19);
    });
  });

  describe("runtime integration", () => {
    it("integrates runtime readiness via CH3-X23", () => {
      const deps = collectCertificationDependencyValidation();
      assert.equal(deps.readiness, true);
    });

    it("integrates runtime executive via CH3-X22", () => {
      const deps = collectCertificationDependencyValidation();
      assert.equal(deps.executive, true);
    });

    it("integrates runtime operations via CH3-X21", () => {
      const deps = collectCertificationDependencyValidation();
      assert.equal(deps.operations, true);
    });

    it("integrates runtime release via CH3-X20", () => {
      const deps = collectCertificationDependencyValidation();
      assert.equal(deps.release, true);
    });

    it("integrates runtime launcher via CH3-X19", () => {
      const deps = collectCertificationDependencyValidation();
      assert.equal(deps.launcher, true);
    });

    it("integrates need experience via CH3-X5", () => {
      const deps = collectCertificationDependencyValidation();
      assert.equal(deps.need, true);
    });
  });

  describe("validation", () => {
    it("passes full runtime certification validation", () => {
      const result = validateRuntimeCertification();
      assert.equal(result.valid, true);
      assert.equal(result.checked.moduleCount, 19);
      assert.equal(result.checked.checkCount, 19);
      assert.equal(result.checked.readOnlyGuarantees, true);
      assert.equal(result.checked.noDuplicatedRuntimeLogic, true);
    });

    it("validates certification module coverage", () => {
      assert.equal(validateCertificationModuleCoverage(), true);
    });

    it("validates certification check completeness", () => {
      assert.equal(validateCertificationCheckCompleteness(), true);
    });

    it("module factory exposes validate and service", () => {
      const mod = createCertificationModule();
      assert.equal(mod.version, RUNTIME_CERTIFICATION_CENTER_VERSION);
      assert.ok(mod.runtimeCertification);
      assert.equal(mod.validate().valid, true);
    });
  });

  describe("accessibility", () => {
    it("meets accessibility in certification view", () => {
      const { runtimeCertification } = createCertificationModule();
      const view = runtimeCertification.getCertification(USER_AUTH);
      assert.ok(view.accessibility.compliant);
      assert.ok(view.accessibility.minimumTouchTargetPx >= NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx);
    });
  });

  describe("read-only guarantees", () => {
    it("does not execute runtime on refresh", () => {
      const { runtimeCertification } = createCertificationModule();
      const refreshed = runtimeCertification.refresh(USER_AUTH) as { delegated: boolean; no_runtime_execution: boolean };
      assert.equal(refreshed.delegated, true);
      assert.equal(refreshed.no_runtime_execution, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH3-X24", async () => {
      const pkg = JSON.parse(await readFile(path.join(ROOT_DIR, "package.json"), "utf8"));
      assert.ok(pkg.scripts["verify:ch3-x24"]);
      assert.ok(pkg.scripts["test:ch3-x24-runtime-certification-center"]);
    });

    it("registers runtime certification routes module", async () => {
      const routes = await readFile(path.join(ROOT_DIR, "src/api/routes/runtime-certification.ts"), "utf8");
      assert.match(routes, /registerRuntimeCertificationRoutes/);
      assert.match(routes, /\/runtime-certification\/validate/);
      assert.match(routes, /\/runtime-certification\/refresh/);
    });

    it("wires runtime certification in server and index", async () => {
      const server = await readRouteWiringSource();
      const index = await readModuleWiringSource();
      assert.match(server, /registerRuntimeCertificationRoutes/);
      assert.match(server, /runtimeCertification/);
      assert.match(index, /createAnActRuntimeCertificationCenterModule/);
      assert.match(index, /runtimeCertification/);
    });
  });
});
