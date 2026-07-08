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
  createAnActRuntimeExecutiveLaunchAuthorityModule,
  createRuntimeExecutiveLaunchAuthorityRepository,
} from "../src/runtime-experience/runtime-executive-launch-authority/module.js";
import {
  RUNTIME_COMPLETION_VERSION,
  RUNTIME_COMPLETION_FIXED_TIMESTAMP,
  CH3_RUNTIME_MODULE_IDS,
  CH3_RUNTIME_CHECK_IDS,
  CH3_RUNTIME_API_ENDPOINT_COUNT,
  CH3_RUNTIME_TEST_SUITE_COUNT,
  buildRuntimeCompletionDefinition,
  buildRuntimeCertification,
  buildRuntimeStatistics,
  buildRuntimeArchitectureSummary,
  calculateCompletionPercentage,
  createAnActRuntimeCompletionModule,
  createRuntimeCompletionRepository,
  validateRuntimeCompletionCertification,
  collectRuntimeCompletionDependencyValidation,
  validateRuntimeCompletionModuleCoverage,
  validateRuntimeCompletionCheckCompleteness,
  buildCompletionHome,
} from "../src/runtime-experience/runtime-completion/module.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../src/navigation-framework/validation/navigation-validator.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-runtime-completion-001",
  sessionId: "session-runtime-completion-001",
  roles: ["customer"],
  scopes: [],
  authenticated: true,
};

function createRuntimeCompletionModule() {
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
  const { runtimeExecutiveLaunchAuthority } = createAnActRuntimeExecutiveLaunchAuthorityModule({
    runtimeLaunchReadinessAuthority,
    runtimeLaunchControl,
    runtimeOperationsCenter,
    runtimeProductionApproval,
    runtimeExecutive,
    repository: createRuntimeExecutiveLaunchAuthorityRepository(),
  });
  return createAnActRuntimeCompletionModule({
    runtimeExecutiveLaunchAuthority,
    repository: createRuntimeCompletionRepository(),
  });
}

describe("CH3-FINAL AN ACT Runtime Completion & Certification", () => {
  describe("domain", () => {
    it("defines twenty-six Chapter 3 runtime modules", () => {
      assert.equal(CH3_RUNTIME_MODULE_IDS.length, 26);
      assert.ok(CH3_RUNTIME_MODULE_IDS.includes("runtime-executive-launch-authority"));
    });

    it("defines twenty-six Chapter 3 runtime checks", () => {
      assert.equal(CH3_RUNTIME_CHECK_IDS.length, 26);
      assert.ok(CH3_RUNTIME_CHECK_IDS.includes("runtime-executive-launch-authority"));
    });

    it("builds read-only completion definition with CH4 hand-off", () => {
      const def = buildRuntimeCompletionDefinition();
      assert.equal(def.version, RUNTIME_COMPLETION_VERSION);
      assert.equal(def.readOnly, true);
      assert.equal(def.noDeployment, true);
      assert.equal(def.noRuntimeExecution, true);
      assert.equal(def.noExternalIntegration, true);
      assert.equal(def.handoffTarget, "CH4");
    });

    it("uses deterministic fixed timestamp", () => {
      assert.equal(RUNTIME_COMPLETION_FIXED_TIMESTAMP, "2026-06-22T07:00:00.000Z");
    });

    it("tracks runtime statistics", () => {
      const stats = buildRuntimeStatistics();
      assert.equal(stats.moduleCount, 26);
      assert.equal(stats.apiEndpointCount, CH3_RUNTIME_API_ENDPOINT_COUNT);
      assert.equal(stats.testSuiteCount, CH3_RUNTIME_TEST_SUITE_COUNT);
      assert.equal(stats.chapterRange, "CH3-X5 through CH3-X30");
    });

    it("calculates completion percentage", () => {
      assert.equal(calculateCompletionPercentage(26, 26), 100);
      assert.equal(calculateCompletionPercentage(13, 26), 50);
    });

    it("builds runtime certification", () => {
      const certification = buildRuntimeCertification({
        validatedModuleCount: 26,
        totalModuleCount: 26,
        passedCheckCount: 26,
        totalCheckCount: 26,
        officialExecutiveLaunchApproval: true,
      });
      assert.equal(certification.runtimeChapter3Completed, true);
      assert.equal(certification.runtimeCertified, true);
    });

    it("builds architecture summary", () => {
      const architecture = buildRuntimeArchitectureSummary(26);
      assert.equal(architecture.chapter, "CH3");
      assert.equal(architecture.moduleCount, 26);
    });
  });

  describe("completion home", () => {
    it("returns completion overview with certification flags", () => {
      const { runtimeCompletion } = createRuntimeCompletionModule();
      const view = runtimeCompletion.getCompletion(USER_AUTH);
      assert.equal(view.version, RUNTIME_COMPLETION_VERSION);
      assert.equal(view.read_only, true);
      assert.equal(view.delegates_only, true);
      assert.equal(view.no_runtime_execution, true);
      assert.equal(view.module_count, 26);
      assert.equal(view.certification.runtimeChapter3Completed, true);
      assert.equal(view.certification.runtimeCertified, true);
    });

    it("builds read-only completion home screen", () => {
      const home = buildCompletionHome(100, true, true);
      assert.equal(home.readOnly, true);
      assert.equal(home.screenId, "completion-home");
    });
  });

  describe("completion dashboard", () => {
    it("returns completion dashboard with all modules validated", () => {
      const { runtimeCompletion } = createRuntimeCompletionModule();
      const dashboard = runtimeCompletion.getDashboard(USER_AUTH);
      assert.equal(dashboard.dashboard.moduleCount, 26);
      assert.equal(dashboard.dashboard.validatedCount, 26);
      assert.equal(dashboard.dashboard.overallStatus, "completed");
      assert.equal(dashboard.screen.readOnly, true);
    });
  });

  describe("certification", () => {
    it("returns runtime certification with chapter completed and certified", () => {
      const { runtimeCompletion } = createRuntimeCompletionModule();
      const result = runtimeCompletion.getCertification(USER_AUTH);
      assert.equal(result.certification.runtimeChapter3Completed, true);
      assert.equal(result.certification.runtimeCertified, true);
      assert.equal(result.certification.status, "certified");
      assert.equal(result.screen.readOnly, true);
      assert.equal(result.screen.screenId, "certification-screen");
    });
  });

  describe("statistics", () => {
    it("returns runtime statistics", () => {
      const { runtimeCompletion } = createRuntimeCompletionModule();
      const result = runtimeCompletion.getStatistics(USER_AUTH);
      assert.equal(result.statistics.moduleCount, 26);
      assert.equal(result.statistics.apiEndpointCount, 238);
      assert.equal(result.statistics.testSuiteCount, 26);
      assert.equal(result.screen.readOnly, true);
    });
  });

  describe("architecture", () => {
    it("returns architecture summary", () => {
      const { runtimeCompletion } = createRuntimeCompletionModule();
      const result = runtimeCompletion.getArchitecture(USER_AUTH);
      assert.equal(result.architecture.chapter, "CH3");
      assert.equal(result.architecture.moduleCount, 26);
      assert.equal(result.screen.readOnly, true);
      assert.equal(result.screen.screenId, "architecture-screen");
    });
  });

  describe("executive summary", () => {
    it("returns executive summary with hand-off to CH4", () => {
      const { runtimeCompletion } = createRuntimeCompletionModule();
      const result = runtimeCompletion.getExecutiveSummary(USER_AUTH);
      assert.equal(result.executiveSummary.handoffTarget, "CH4");
      assert.equal(result.executiveSummary.runtimeChapter3Completed, true);
      assert.equal(result.executiveSummary.runtimeCertified, true);
      assert.equal(result.screen.readOnly, true);
      assert.equal(result.screen.screenId, "executive-summary-screen");
    });
  });

  describe("refresh", () => {
    it("refreshes completion view without runtime execution", () => {
      const { runtimeCompletion } = createRuntimeCompletionModule();
      const refreshed = runtimeCompletion.refresh(USER_AUTH) as {
        ok: boolean;
        read_only: boolean;
        no_runtime_execution: boolean;
        aggregation: { certification: { runtimeCertified: boolean } };
      };
      assert.equal(refreshed.ok, true);
      assert.equal(refreshed.read_only, true);
      assert.equal(refreshed.no_runtime_execution, true);
      assert.equal(refreshed.aggregation.certification.runtimeCertified, true);
    });
  });

  describe("runtime integration", () => {
    it("integrates executive launch authority via CH3-X30", () => {
      const deps = collectRuntimeCompletionDependencyValidation();
      assert.equal(deps.executiveLaunchAuthority, true);
    });

    it("integrates launch readiness authority via CH3-X29", () => {
      const deps = collectRuntimeCompletionDependencyValidation();
      assert.equal(deps.launchReadinessAuthority, true);
    });

    it("integrates need experience via CH3-X5", () => {
      const deps = collectRuntimeCompletionDependencyValidation();
      assert.equal(deps.need, true);
    });
  });

  describe("validation", () => {
    it("passes full runtime completion certification validation", () => {
      const result = validateRuntimeCompletionCertification();
      assert.equal(result.valid, true);
      assert.equal(result.checked.moduleCount, 26);
      assert.equal(result.checked.checkCount, 26);
      assert.equal(result.checked.apiEndpointCount, 238);
      assert.equal(result.checked.readOnlyGuarantees, true);
      assert.equal(result.checked.noDuplicatedRuntimeLogic, true);
    });

    it("validates completion module coverage", () => {
      assert.equal(validateRuntimeCompletionModuleCoverage(), true);
    });

    it("validates completion check completeness", () => {
      assert.equal(validateRuntimeCompletionCheckCompleteness(), true);
    });

    it("module factory exposes validate and service", () => {
      const mod = createRuntimeCompletionModule();
      assert.equal(mod.version, RUNTIME_COMPLETION_VERSION);
      assert.ok(mod.runtimeCompletion);
      assert.equal(mod.validate().valid, true);
    });
  });

  describe("accessibility", () => {
    it("meets accessibility in completion view", () => {
      const { runtimeCompletion } = createRuntimeCompletionModule();
      const view = runtimeCompletion.getCompletion(USER_AUTH);
      assert.ok(view.accessibility.compliant);
      assert.ok(view.accessibility.minimumTouchTargetPx >= NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx);
    });
  });

  describe("read-only guarantees", () => {
    it("does not execute runtime on refresh", () => {
      const { runtimeCompletion } = createRuntimeCompletionModule();
      const refreshed = runtimeCompletion.refresh(USER_AUTH) as {
        delegated: boolean;
        no_runtime_execution: boolean;
      };
      assert.equal(refreshed.delegated, true);
      assert.equal(refreshed.no_runtime_execution, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH3-FINAL", async () => {
      const pkg = JSON.parse(await readFile(path.join(ROOT_DIR, "package.json"), "utf8"));
      assert.ok(pkg.scripts["verify:ch3-final"]);
      assert.ok(pkg.scripts["test:ch3-final-runtime-completion-certification"]);
    });

    it("registers runtime completion routes module", async () => {
      const routes = await readFile(path.join(ROOT_DIR, "src/api/routes/runtime-completion.ts"), "utf8");
      assert.match(routes, /registerRuntimeCompletionRoutes/);
      assert.match(routes, /\/runtime-completion\/validate/);
      assert.match(routes, /\/runtime-completion\/refresh/);
    });

    it("wires runtime completion in server and index", async () => {
      const server = await readRouteWiringSource();
      const index = await readModuleWiringSource();
      assert.match(server, /registerRuntimeCompletionRoutes/);
      assert.match(server, /runtimeCompletion/);
      assert.match(index, /createAnActRuntimeCompletionModule/);
      assert.match(index, /runtimeCompletion/);
    });
  });
});
