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
  RUNTIME_FINAL_READINESS_REVIEW_VERSION,
  FINAL_READINESS_FIXED_TIMESTAMP,
  FINAL_READINESS_MODULE_IDS,
  FINAL_READINESS_CHECK_IDS,
  FINAL_READINESS_RISK_DEFINITIONS,
  buildRuntimeFinalReadinessReviewDefinition,
  buildFinalReadinessOverview,
  buildFinalReadinessRisks,
  buildFinalReadinessSummary,
  calculateReviewPercentage,
  createAnActRuntimeFinalReadinessReviewModule,
  createRuntimeFinalReadinessRepository,
  validateRuntimeFinalReadiness,
  collectFinalReadinessDependencyValidation,
  validateFinalReadinessCheckCompleteness,
  validateFinalReadinessModuleCoverage,
  buildFinalReadinessHome,
} from "../src/runtime-experience/runtime-final-readiness/module.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../src/navigation-framework/validation/navigation-validator.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-runtime-final-readiness-001",
  sessionId: "session-runtime-final-readiness-001",
  roles: ["customer"],
  scopes: [],
  authenticated: true,
};

function createFinalReadinessModule() {
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
  return createAnActRuntimeFinalReadinessReviewModule({
    runtimeCertification,
    runtimeReadiness,
    runtimeExecutive,
    runtimeOperations,
    repository: createRuntimeFinalReadinessRepository(),
  });
}

describe("CH3-X25 AN ACT Runtime Final Readiness Review", () => {
  describe("domain", () => {
    it("defines twenty final readiness modules", () => {
      assert.equal(FINAL_READINESS_MODULE_IDS.length, 20);
      assert.ok(FINAL_READINESS_MODULE_IDS.includes("runtime-certification"));
    });

    it("defines twenty final readiness checks", () => {
      assert.equal(FINAL_READINESS_CHECK_IDS.length, 20);
      assert.ok(FINAL_READINESS_CHECK_IDS.includes("runtime-certification"));
    });

    it("defines five final readiness risk categories", () => {
      assert.equal(FINAL_READINESS_RISK_DEFINITIONS.length, 5);
      assert.ok(FINAL_READINESS_RISK_DEFINITIONS.some((r) => r.id === "readiness-risk"));
    });

    it("builds read-only final readiness definition", () => {
      const def = buildRuntimeFinalReadinessReviewDefinition();
      assert.equal(def.version, RUNTIME_FINAL_READINESS_REVIEW_VERSION);
      assert.equal(def.readOnly, true);
      assert.equal(def.noDeployment, true);
      assert.equal(def.noRuntimeExecution, true);
      assert.equal(def.noBubbleIntegration, true);
      assert.equal(def.noBusinessLogicDuplication, true);
    });

    it("uses deterministic fixed timestamp", () => {
      assert.equal(FINAL_READINESS_FIXED_TIMESTAMP, "2026-06-22T01:00:00.000Z");
    });

    it("calculates review percentage", () => {
      assert.equal(calculateReviewPercentage(20, 20), 100);
      assert.equal(calculateReviewPercentage(10, 20), 50);
    });

    it("builds final readiness overview", () => {
      const overview = buildFinalReadinessOverview([
        { id: "need", label: "Need", delegateModule: "CH3-X5", status: "approved", approved: true },
      ]);
      assert.equal(overview.approvedCount, 1);
      assert.equal(overview.overallStatus, "approved");
    });

    it("builds final readiness risks from checks", () => {
      const checks = FINAL_READINESS_CHECK_IDS.map((id) => ({
        id,
        label: id,
        delegateModule: "CH3-X5",
        status: "passed" as const,
        message: "ok",
        required: true,
      }));
      const overview = buildFinalReadinessOverview([
        { id: "need", label: "Need", delegateModule: "CH3-X5", status: "approved", approved: true },
      ]);
      const risks = buildFinalReadinessRisks(checks, overview);
      assert.equal(risks.length, 5);
      assert.ok(risks.every((r) => r.mitigated));
    });

    it("builds final readiness summary", () => {
      const overview = buildFinalReadinessOverview([
        { id: "need", label: "Need", delegateModule: "CH3-X5", status: "approved", approved: true },
      ]);
      const risks = [{ id: "experience-risk", title: "Experience", description: "d", severity: "low" as const, delegateModule: "CH3-X5", mitigated: true }];
      const summary = buildFinalReadinessSummary({
        overview,
        risks,
        checks: [{ id: "need-experience", label: "Need", delegateModule: "CH3-X5", status: "passed", message: "ok", required: true }],
        certificationApproved: true,
      });
      assert.equal(summary.readOnly, true);
      assert.equal(summary.delegated, true);
    });
  });

  describe("final readiness home", () => {
    it("returns final readiness overview with read-only guarantees", () => {
      const { runtimeFinalReadiness } = createFinalReadinessModule();
      const view = runtimeFinalReadiness.getFinalReadiness(USER_AUTH);
      assert.equal(view.version, RUNTIME_FINAL_READINESS_REVIEW_VERSION);
      assert.equal(view.read_only, true);
      assert.equal(view.delegates_only, true);
      assert.equal(view.no_runtime_execution, true);
      assert.equal(view.module_count, 20);
    });

    it("builds read-only final readiness home screen", () => {
      const home = buildFinalReadinessHome(100, true);
      assert.equal(home.readOnly, true);
      assert.equal(home.screenId, "final-readiness-home");
    });
  });

  describe("final readiness dashboard", () => {
    it("returns final readiness dashboard", () => {
      const { runtimeFinalReadiness } = createFinalReadinessModule();
      const dashboard = runtimeFinalReadiness.getDashboard(USER_AUTH);
      assert.equal(dashboard.dashboard.moduleCount, 20);
      assert.equal(dashboard.dashboard.approvedCount, 20);
      assert.equal(dashboard.screen.readOnly, true);
    });

    it("reports approved overall status", () => {
      const { runtimeFinalReadiness } = createFinalReadinessModule();
      const dashboard = runtimeFinalReadiness.getDashboard(USER_AUTH);
      assert.equal(dashboard.dashboard.overallStatus, "approved");
      assert.equal(dashboard.dashboard.reviewPercentage, 100);
    });
  });

  describe("final readiness checks", () => {
    it("returns final readiness checks", () => {
      const { runtimeFinalReadiness } = createFinalReadinessModule();
      const checks = runtimeFinalReadiness.getChecks(USER_AUTH);
      assert.equal(checks.count, 20);
      assert.equal(checks.passed, 20);
    });

    it("marks checklist screen read-only", () => {
      const { runtimeFinalReadiness } = createFinalReadinessModule();
      const checks = runtimeFinalReadiness.getChecks(USER_AUTH);
      assert.equal(checks.screen.readOnly, true);
      assert.equal(checks.screen.screenId, "final-readiness-checklist");
    });
  });

  describe("final readiness risks", () => {
    it("returns final readiness risks", () => {
      const { runtimeFinalReadiness } = createFinalReadinessModule();
      const risks = runtimeFinalReadiness.getRisks(USER_AUTH);
      assert.equal(risks.count, 5);
      assert.equal(risks.mitigated, 5);
    });

    it("marks risks screen read-only", () => {
      const { runtimeFinalReadiness } = createFinalReadinessModule();
      const risks = runtimeFinalReadiness.getRisks(USER_AUTH);
      assert.equal(risks.screen.readOnly, true);
      assert.equal(risks.screen.screenId, "final-readiness-risks-screen");
    });
  });

  describe("final readiness summary", () => {
    it("returns final readiness summary", () => {
      const { runtimeFinalReadiness } = createFinalReadinessModule();
      const summary = runtimeFinalReadiness.getSummary(USER_AUTH);
      assert.equal(summary.summary.readOnly, true);
      assert.equal(summary.summary.delegated, true);
      assert.equal(summary.summary.overview.approvedCount, 20);
      assert.equal(summary.summary.readyForProduction, true);
    });

    it("marks summary screen read-only", () => {
      const { runtimeFinalReadiness } = createFinalReadinessModule();
      const summary = runtimeFinalReadiness.getSummary(USER_AUTH);
      assert.equal(summary.screen.readOnly, true);
      assert.equal(summary.screen.screenId, "final-readiness-summary-screen");
    });
  });

  describe("final readiness board", () => {
    it("returns final readiness board", () => {
      const { runtimeFinalReadiness } = createFinalReadinessModule();
      const board = runtimeFinalReadiness.getBoard(USER_AUTH);
      assert.equal(board.count, 9);
      assert.ok(board.board.some((c) => c.id === "final-review"));
      assert.ok(board.board.some((c) => c.id === "production"));
    });

    it("marks final readiness board screen read-only", () => {
      const { runtimeFinalReadiness } = createFinalReadinessModule();
      const board = runtimeFinalReadiness.getBoard(USER_AUTH);
      assert.equal(board.screen.readOnly, true);
      assert.equal(board.screen.screenId, "final-readiness-board");
    });
  });

  describe("refresh", () => {
    it("refreshes final readiness view without runtime execution", () => {
      const { runtimeFinalReadiness } = createFinalReadinessModule();
      const refreshed = runtimeFinalReadiness.refresh(USER_AUTH) as {
        ok: boolean;
        read_only: boolean;
        no_runtime_execution: boolean;
        aggregation: { overview: { approvedCount: number } };
      };
      assert.equal(refreshed.ok, true);
      assert.equal(refreshed.read_only, true);
      assert.equal(refreshed.no_runtime_execution, true);
      assert.equal(refreshed.aggregation.overview.approvedCount, 20);
    });
  });

  describe("runtime integration", () => {
    it("integrates runtime certification via CH3-X24", () => {
      const deps = collectFinalReadinessDependencyValidation();
      assert.equal(deps.certification, true);
    });

    it("integrates runtime readiness via CH3-X23", () => {
      const deps = collectFinalReadinessDependencyValidation();
      assert.equal(deps.readiness, true);
    });

    it("integrates runtime executive via CH3-X22", () => {
      const deps = collectFinalReadinessDependencyValidation();
      assert.equal(deps.executive, true);
    });

    it("integrates runtime operations via CH3-X21", () => {
      const deps = collectFinalReadinessDependencyValidation();
      assert.equal(deps.operations, true);
    });

    it("integrates runtime release via CH3-X20", () => {
      const deps = collectFinalReadinessDependencyValidation();
      assert.equal(deps.release, true);
    });

    it("integrates need experience via CH3-X5", () => {
      const deps = collectFinalReadinessDependencyValidation();
      assert.equal(deps.need, true);
    });
  });

  describe("validation", () => {
    it("passes full runtime final readiness validation", () => {
      const result = validateRuntimeFinalReadiness();
      assert.equal(result.valid, true);
      assert.equal(result.checked.moduleCount, 20);
      assert.equal(result.checked.checkCount, 20);
      assert.equal(result.checked.readOnlyGuarantees, true);
      assert.equal(result.checked.noDuplicatedRuntimeLogic, true);
    });

    it("validates final readiness module coverage", () => {
      assert.equal(validateFinalReadinessModuleCoverage(), true);
    });

    it("validates final readiness check completeness", () => {
      assert.equal(validateFinalReadinessCheckCompleteness(), true);
    });

    it("module factory exposes validate and service", () => {
      const mod = createFinalReadinessModule();
      assert.equal(mod.version, RUNTIME_FINAL_READINESS_REVIEW_VERSION);
      assert.ok(mod.runtimeFinalReadiness);
      assert.equal(mod.validate().valid, true);
    });
  });

  describe("accessibility", () => {
    it("meets accessibility in final readiness view", () => {
      const { runtimeFinalReadiness } = createFinalReadinessModule();
      const view = runtimeFinalReadiness.getFinalReadiness(USER_AUTH);
      assert.ok(view.accessibility.compliant);
      assert.ok(view.accessibility.minimumTouchTargetPx >= NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx);
    });
  });

  describe("read-only guarantees", () => {
    it("does not execute runtime on refresh", () => {
      const { runtimeFinalReadiness } = createFinalReadinessModule();
      const refreshed = runtimeFinalReadiness.refresh(USER_AUTH) as { delegated: boolean; no_runtime_execution: boolean };
      assert.equal(refreshed.delegated, true);
      assert.equal(refreshed.no_runtime_execution, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH3-X25", async () => {
      const pkg = JSON.parse(await readFile(path.join(ROOT_DIR, "package.json"), "utf8"));
      assert.ok(pkg.scripts["verify:ch3-x25"]);
      assert.ok(pkg.scripts["test:ch3-x25-runtime-final-readiness-review"]);
    });

    it("registers runtime final readiness routes module", async () => {
      const routes = await readFile(path.join(ROOT_DIR, "src/api/routes/runtime-final-readiness.ts"), "utf8");
      assert.match(routes, /registerRuntimeFinalReadinessRoutes/);
      assert.match(routes, /\/runtime-final-readiness\/validate/);
      assert.match(routes, /\/runtime-final-readiness\/refresh/);
    });

    it("wires runtime final readiness in server and index", async () => {
      const server = await readRouteWiringSource();
      const index = await readModuleWiringSource();
      assert.match(server, /registerRuntimeFinalReadinessRoutes/);
      assert.match(server, /runtimeFinalReadiness/);
      assert.match(index, /createAnActRuntimeFinalReadinessReviewModule/);
      assert.match(index, /runtimeFinalReadiness/);
    });
  });
});
