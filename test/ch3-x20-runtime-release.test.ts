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
  RUNTIME_RELEASE_VERSION,
  RELEASE_FIXED_TIMESTAMP,
  RELEASE_CHECK_IDS,
  KNOWN_RELEASE_LIMITATIONS,
  calculateReleaseReadinessPercentage,
  calculateRuntimeQualityScore,
  buildRuntimeReleaseDefinition,
  buildReleaseReadiness,
  resolveReleaseCandidateDecision,
  createAnActRuntimeReleaseModule,
  createRuntimeReleaseRepository,
  validateRuntimeRelease,
  collectReleaseDependencyValidation,
  validateReleaseCheckCompleteness,
  validateReleaseCandidateConsistency,
  buildReleaseHome,
} from "../src/runtime-experience/runtime-release/module.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../src/navigation-framework/validation/navigation-validator.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-runtime-release-001",
  sessionId: "session-runtime-release-001",
  roles: ["customer"],
  scopes: [],
  authenticated: true,
};

function createReleaseModule() {
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
  return createAnActRuntimeReleaseModule({
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
}

describe("CH3-X20 AN ACT Runtime Release Candidate", () => {
  describe("domain", () => {
    it("defines fifteen release checks", () => {
      assert.equal(RELEASE_CHECK_IDS.length, 15);
      assert.ok(RELEASE_CHECK_IDS.includes("runtime-launcher"));
    });

    it("builds read-only release definition", () => {
      const def = buildRuntimeReleaseDefinition();
      assert.equal(def.version, RUNTIME_RELEASE_VERSION);
      assert.equal(def.readOnly, true);
      assert.equal(def.noReleaseExecution, true);
      assert.equal(def.noDeployment, true);
      assert.equal(def.noBubbleImplementation, true);
    });

    it("uses deterministic fixed timestamp", () => {
      assert.equal(RELEASE_FIXED_TIMESTAMP, "2026-06-21T20:00:00.000Z");
    });

    it("calculates release readiness percentage", () => {
      assert.equal(calculateReleaseReadinessPercentage(15, 15), 100);
      assert.equal(calculateRuntimeQualityScore(15, 15), 100);
    });

    it("builds release readiness summary", () => {
      const readiness = buildReleaseReadiness({
        passedChecks: 15,
        totalChecks: 15,
        warnings: [],
        blockers: [],
      });
      assert.equal(readiness.readyForCertification, true);
      assert.equal(readiness.qualityScore, 100);
    });

    it("resolves certified release candidate decision", () => {
      assert.equal(resolveReleaseCandidateDecision(100, [], []), "certified");
    });

    it("documents known release limitations", () => {
      assert.ok(KNOWN_RELEASE_LIMITATIONS.length >= 4);
      assert.ok(KNOWN_RELEASE_LIMITATIONS.some((l) => l.includes("no deployment")));
    });
  });

  describe("release home", () => {
    it("returns release overview with read-only guarantees", () => {
      const { runtimeRelease } = createReleaseModule();
      const view = runtimeRelease.getRelease(USER_AUTH);
      assert.equal(view.version, RUNTIME_RELEASE_VERSION);
      assert.equal(view.read_only, true);
      assert.equal(view.delegates_only, true);
      assert.equal(view.no_release_execution, true);
      assert.equal(view.check_count, 15);
    });

    it("builds read-only release home screen", () => {
      const home = buildReleaseHome(100, 100);
      assert.equal(home.readOnly, true);
      assert.equal(home.screenId, "release-home");
    });
  });

  describe("readiness evaluation", () => {
    it("returns release readiness at 100 percent", () => {
      const { runtimeRelease } = createReleaseModule();
      const result = runtimeRelease.getReadiness(USER_AUTH);
      assert.equal(result.readiness.readinessPercentage, 100);
      assert.equal(result.readiness.qualityScore, 100);
      assert.equal(result.readiness.readyForCertification, true);
    });

    it("returns readiness screen read-only", () => {
      const { runtimeRelease } = createReleaseModule();
      const result = runtimeRelease.getReadiness(USER_AUTH);
      assert.equal(result.screen.readOnly, true);
    });

    it("refreshes release evaluation without executing release", () => {
      const { runtimeRelease } = createReleaseModule();
      const refreshed = runtimeRelease.refresh(USER_AUTH) as {
        ok: boolean;
        read_only: boolean;
        no_release_execution: boolean;
        evaluation: { candidate: { decision: string } };
      };
      assert.equal(refreshed.ok, true);
      assert.equal(refreshed.read_only, true);
      assert.equal(refreshed.no_release_execution, true);
      assert.equal(refreshed.evaluation.candidate.decision, "certified");
    });
  });

  describe("checklist generation", () => {
    it("generates release checklist with fifteen checks", () => {
      const { runtimeRelease } = createReleaseModule();
      const checklist = runtimeRelease.getChecklist(USER_AUTH);
      assert.equal(checklist.count, 15);
      assert.equal(checklist.passed, 15);
    });

    it("marks checklist screen read-only", () => {
      const { runtimeRelease } = createReleaseModule();
      const checklist = runtimeRelease.getChecklist(USER_AUTH);
      assert.equal(checklist.screen.readOnly, true);
    });
  });

  describe("release report", () => {
    it("generates release report", () => {
      const { runtimeRelease } = createReleaseModule();
      const report = runtimeRelease.getReport(USER_AUTH);
      assert.equal(report.report.readOnly, true);
      assert.equal(report.report.noReleaseExecution, true);
      assert.equal(report.report.checks.length, 15);
    });

    it("marks report screen read-only", () => {
      const { runtimeRelease } = createReleaseModule();
      const report = runtimeRelease.getReport(USER_AUTH);
      assert.equal(report.screen.readOnly, true);
    });
  });

  describe("release candidate", () => {
    it("certifies release candidate", () => {
      const { runtimeRelease } = createReleaseModule();
      const candidate = runtimeRelease.getCandidate(USER_AUTH);
      assert.equal(candidate.candidate.decision, "certified");
      assert.equal(candidate.candidate.certified, true);
      assert.equal(candidate.candidate.qualityScore, 100);
    });

    it("marks candidate screen read-only", () => {
      const { runtimeRelease } = createReleaseModule();
      const candidate = runtimeRelease.getCandidate(USER_AUTH);
      assert.equal(candidate.screen.readOnly, true);
    });
  });

  describe("certification summary", () => {
    it("produces certification summary", () => {
      const { runtimeRelease } = createReleaseModule();
      const cert = runtimeRelease.getCertification(USER_AUTH);
      assert.equal(cert.certification.certified, true);
      assert.equal(cert.certification.noReleaseExecution, true);
      assert.ok(cert.certification.recommendations.length > 0);
      assert.ok(cert.certification.knownLimitations.length > 0);
    });

    it("marks certification screen read-only", () => {
      const { runtimeRelease } = createReleaseModule();
      const cert = runtimeRelease.getCertification(USER_AUTH);
      assert.equal(cert.screen.readOnly, true);
    });
  });

  describe("release summary", () => {
    it("returns complete release summary", () => {
      const { runtimeRelease } = createReleaseModule();
      const summary = runtimeRelease.getSummary(USER_AUTH);
      assert.equal(summary.summary.certificationComplete, true);
      assert.equal(summary.summary.readOnly, true);
      assert.equal(summary.summary.delegated, true);
    });
  });

  describe("runtime integration", () => {
    it("integrates runtime launcher via CH3-X19", () => {
      const deps = collectReleaseDependencyValidation();
      assert.equal(deps.launcher, true);
    });

    it("integrates runtime preview via CH3-X18", () => {
      const deps = collectReleaseDependencyValidation();
      assert.equal(deps.preview, true);
    });

    it("integrates runtime demo via CH3-X17", () => {
      const deps = collectReleaseDependencyValidation();
      assert.equal(deps.demo, true);
    });

    it("integrates runtime health via CH3-X16", () => {
      const deps = collectReleaseDependencyValidation();
      assert.equal(deps.health, true);
    });

    it("integrates runtime coordinator via CH3-X15", () => {
      const deps = collectReleaseDependencyValidation();
      assert.equal(deps.coordinator, true);
    });

    it("integrates runtime registry via CH3-X14", () => {
      const deps = collectReleaseDependencyValidation();
      assert.equal(deps.registry, true);
    });

    it("integrates runtime state via CH3-X13", () => {
      const deps = collectReleaseDependencyValidation();
      assert.equal(deps.state, true);
    });

    it("integrates runtime journey via CH3-X12", () => {
      const deps = collectReleaseDependencyValidation();
      assert.equal(deps.journey, true);
    });

    it("integrates need experience via CH3-X5", () => {
      const deps = collectReleaseDependencyValidation();
      assert.equal(deps.need, true);
    });
  });

  describe("validation", () => {
    it("passes full runtime release validation", () => {
      const result = validateRuntimeRelease();
      assert.equal(result.valid, true);
      assert.equal(result.checked.releaseCheckCount, 15);
      assert.equal(result.checked.readOnlyGuarantees, true);
      assert.equal(result.checked.noDuplicatedRuntimeLogic, true);
    });

    it("validates release check completeness", () => {
      assert.equal(validateReleaseCheckCompleteness(), true);
    });

    it("validates release candidate consistency", () => {
      assert.equal(validateReleaseCandidateConsistency(), true);
    });

    it("module factory exposes validate and service", () => {
      const mod = createReleaseModule();
      assert.equal(mod.version, RUNTIME_RELEASE_VERSION);
      assert.ok(mod.runtimeRelease);
      assert.equal(mod.validate().valid, true);
    });
  });

  describe("accessibility", () => {
    it("meets accessibility in release view", () => {
      const { runtimeRelease } = createReleaseModule();
      const view = runtimeRelease.getRelease(USER_AUTH);
      assert.ok(view.accessibility.compliant);
      assert.ok(view.accessibility.minimumTouchTargetPx >= NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx);
    });
  });

  describe("read-only guarantees", () => {
    it("does not execute release on refresh", () => {
      const { runtimeRelease } = createReleaseModule();
      const refreshed = runtimeRelease.refresh(USER_AUTH) as { no_release_execution: boolean; delegated: boolean };
      assert.equal(refreshed.no_release_execution, true);
      assert.equal(refreshed.delegated, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH3-X20", async () => {
      const pkg = JSON.parse(await readFile(path.join(ROOT_DIR, "package.json"), "utf8"));
      assert.ok(pkg.scripts["verify:ch3-x20"]);
      assert.ok(pkg.scripts["test:ch3-x20-runtime-release"]);
    });

    it("registers runtime release routes module", async () => {
      const routes = await readFile(path.join(ROOT_DIR, "src/api/routes/runtime-release.ts"), "utf8");
      assert.match(routes, /registerRuntimeReleaseRoutes/);
      assert.match(routes, /\/runtime-release\/validate/);
      assert.match(routes, /\/runtime-release\/refresh/);
    });

    it("wires runtime release in server and index", async () => {
      const server = await readFile(path.join(ROOT_DIR, "src/api/server.ts"), "utf8");
      const index = await readFile(path.join(ROOT_DIR, "src/index.ts"), "utf8");
      assert.match(server, /registerRuntimeReleaseRoutes/);
      assert.match(server, /runtimeRelease/);
      assert.match(index, /createAnActRuntimeReleaseModule/);
      assert.match(index, /runtimeRelease/);
    });
  });
});
