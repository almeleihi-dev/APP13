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
  RUNTIME_LAUNCHER_VERSION,
  LAUNCHER_FIXED_TIMESTAMP,
  LAUNCH_MODE_IDS,
  LAUNCH_CHECK_IDS,
  calculateMvpReadinessPercentage,
  buildRuntimeLauncherDefinition,
  buildLaunchReadinessSummary,
  createAnActRuntimeLauncherModule,
  createRuntimeLauncherRepository,
  validateRuntimeLauncher,
  collectLauncherDependencyValidation,
  validateLaunchModeConsistency,
  validateLaunchCheckCompleteness,
  buildLauncherHome,
} from "../src/runtime-experience/runtime-launcher/module.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../src/navigation-framework/validation/navigation-validator.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-runtime-launcher-001",
  sessionId: "session-runtime-launcher-001",
  roles: ["customer"],
  scopes: [],
  authenticated: true,
};

function createLauncherModule() {
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
  return createAnActRuntimeLauncherModule({
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
}

describe("CH3-X19 AN ACT Runtime Launcher & MVP Readiness", () => {
  describe("domain", () => {
    it("defines six launch modes", () => {
      assert.equal(LAUNCH_MODE_IDS.length, 6);
      assert.ok(LAUNCH_MODE_IDS.includes("mvp-readiness"));
      assert.ok(LAUNCH_MODE_IDS.includes("production-candidate"));
    });

    it("defines fourteen launch checks", () => {
      assert.equal(LAUNCH_CHECK_IDS.length, 14);
    });

    it("builds read-only launcher definition", () => {
      const def = buildRuntimeLauncherDefinition();
      assert.equal(def.version, RUNTIME_LAUNCHER_VERSION);
      assert.equal(def.readOnly, true);
      assert.equal(def.noLaunchExecution, true);
      assert.equal(def.noDeployment, true);
      assert.equal(def.noBubbleImplementation, true);
    });

    it("uses deterministic fixed timestamp", () => {
      assert.equal(LAUNCHER_FIXED_TIMESTAMP, "2026-06-21T19:00:00.000Z");
    });

    it("calculates MVP readiness percentage", () => {
      assert.equal(calculateMvpReadinessPercentage(14, 14), 100);
      assert.equal(calculateMvpReadinessPercentage(0, 14), 0);
    });

    it("builds launch readiness summary", () => {
      const summary = buildLaunchReadinessSummary({
        passedChecks: 14,
        totalChecks: 14,
        warnings: [],
        blockers: [],
      });
      assert.equal(summary.mvpReadinessPercentage, 100);
      assert.equal(summary.readyForMvp, true);
      assert.equal(summary.readyForHandoff, true);
      assert.equal(summary.readyForProductionCandidate, true);
    });
  });

  describe("launcher home", () => {
    it("returns launcher overview with read-only guarantees", () => {
      const { runtimeLauncher } = createLauncherModule();
      const view = runtimeLauncher.getLauncher(USER_AUTH);
      assert.equal(view.version, RUNTIME_LAUNCHER_VERSION);
      assert.equal(view.read_only, true);
      assert.equal(view.delegates_only, true);
      assert.equal(view.no_launch_execution, true);
      assert.equal(view.mode_count, 6);
    });

    it("builds read-only launcher home screen", () => {
      const home = buildLauncherHome(6, 100);
      assert.equal(home.readOnly, true);
      assert.equal(home.screenId, "launcher-home");
    });
  });

  describe("launch modes", () => {
    it("lists all launch modes via service", () => {
      const { runtimeLauncher } = createLauncherModule();
      const modes = runtimeLauncher.getModes(USER_AUTH);
      assert.equal(modes.count, 6);
      assert.equal(modes.modes.length, 6);
    });

    it("includes required fields on each mode", () => {
      const { runtimeLauncher } = createLauncherModule();
      const modes = runtimeLauncher.getModes(USER_AUTH);
      for (const mode of modes.modes) {
        assert.ok(mode.title.length > 0);
        assert.ok(mode.description.length > 0);
        assert.ok(Array.isArray(mode.requiredExperiences));
        assert.ok(Array.isArray(mode.missingRequirements));
        assert.ok(mode.recommendedNextStep.length > 0);
      }
    });

    it("enables modes when all requirements pass", () => {
      const { runtimeLauncher } = createLauncherModule();
      const modes = runtimeLauncher.getModes(USER_AUTH);
      const dev = modes.modes.find((m) => m.id === "development");
      assert.ok(dev);
      assert.equal(dev!.enabled, true);
      assert.equal(dev!.readinessStatus, "ready");
    });
  });

  describe("readiness evaluation", () => {
    it("returns MVP readiness percentage", () => {
      const { runtimeLauncher } = createLauncherModule();
      const readiness = runtimeLauncher.getReadiness(USER_AUTH);
      assert.equal(readiness.readiness.mvpReadinessPercentage, 100);
      assert.equal(readiness.readiness.passedChecks, 14);
      assert.equal(readiness.readiness.totalChecks, 14);
    });

    it("returns readiness screen", () => {
      const { runtimeLauncher } = createLauncherModule();
      const readiness = runtimeLauncher.getReadiness(USER_AUTH);
      assert.equal(readiness.screen.readOnly, true);
    });

    it("refreshes readiness evaluation", () => {
      const { runtimeLauncher } = createLauncherModule();
      const refreshed = runtimeLauncher.refresh(USER_AUTH) as {
        ok: boolean;
        read_only: boolean;
        delegated: boolean;
        evaluation: { readiness: { mvpReadinessPercentage: number } };
      };
      assert.equal(refreshed.ok, true);
      assert.equal(refreshed.read_only, true);
      assert.equal(refreshed.delegated, true);
      assert.equal(refreshed.evaluation.readiness.mvpReadinessPercentage, 100);
    });
  });

  describe("checklist generation", () => {
    it("generates launch checklist with all checks", () => {
      const { runtimeLauncher } = createLauncherModule();
      const checklist = runtimeLauncher.getChecklist(USER_AUTH);
      assert.equal(checklist.count, 14);
      assert.equal(checklist.passed, 14);
    });

    it("marks checklist screen read-only", () => {
      const { runtimeLauncher } = createLauncherModule();
      const checklist = runtimeLauncher.getChecklist(USER_AUTH);
      assert.equal(checklist.screen.readOnly, true);
    });
  });

  describe("handoff summary", () => {
    it("produces handoff summary", () => {
      const { runtimeLauncher } = createLauncherModule();
      const handoff = runtimeLauncher.getHandoff(USER_AUTH);
      assert.equal(handoff.handoff.ready, true);
      assert.equal(handoff.handoff.mvpReadinessPercentage, 100);
      assert.equal(handoff.handoff.noBubbleImplementation, true);
    });

    it("marks handoff screen read-only", () => {
      const { runtimeLauncher } = createLauncherModule();
      const handoff = runtimeLauncher.getHandoff(USER_AUTH);
      assert.equal(handoff.screen.readOnly, true);
    });
  });

  describe("blocker and warning detection", () => {
    it("reports zero blockers when all checks pass", () => {
      const { runtimeLauncher } = createLauncherModule();
      const blockers = runtimeLauncher.getBlockers(USER_AUTH);
      assert.equal(blockers.count, 0);
    });

    it("reports zero warnings when all checks pass", () => {
      const { runtimeLauncher } = createLauncherModule();
      const warnings = runtimeLauncher.getWarnings(USER_AUTH);
      assert.equal(warnings.count, 0);
    });
  });

  describe("runtime integration", () => {
    it("integrates runtime health via CH3-X16", () => {
      const deps = collectLauncherDependencyValidation();
      assert.equal(deps.health, true);
    });

    it("integrates runtime demo via CH3-X17", () => {
      const deps = collectLauncherDependencyValidation();
      assert.equal(deps.demo, true);
    });

    it("integrates runtime preview via CH3-X18", () => {
      const deps = collectLauncherDependencyValidation();
      assert.equal(deps.preview, true);
    });

    it("integrates runtime coordinator via CH3-X15", () => {
      const deps = collectLauncherDependencyValidation();
      assert.equal(deps.coordinator, true);
    });

    it("integrates runtime registry via CH3-X14", () => {
      const deps = collectLauncherDependencyValidation();
      assert.equal(deps.registry, true);
    });

    it("integrates runtime state via CH3-X13", () => {
      const deps = collectLauncherDependencyValidation();
      assert.equal(deps.state, true);
    });

    it("integrates runtime journey via CH3-X12", () => {
      const deps = collectLauncherDependencyValidation();
      assert.equal(deps.journey, true);
    });
  });

  describe("validation", () => {
    it("passes full runtime launcher validation", () => {
      const result = validateRuntimeLauncher();
      assert.equal(result.valid, true);
      assert.equal(result.checked.launchModeCount, 6);
      assert.equal(result.checked.launchCheckCount, 14);
      assert.equal(result.checked.readOnlyGuarantees, true);
      assert.equal(result.checked.noDuplicatedRuntimeLogic, true);
    });

    it("validates launch mode consistency", () => {
      assert.equal(validateLaunchModeConsistency(), true);
    });

    it("validates launch checklist completeness", () => {
      assert.equal(validateLaunchCheckCompleteness(), true);
    });

    it("module factory exposes validate and service", () => {
      const mod = createLauncherModule();
      assert.equal(mod.version, RUNTIME_LAUNCHER_VERSION);
      assert.ok(mod.runtimeLauncher);
      assert.equal(mod.validate().valid, true);
    });
  });

  describe("accessibility", () => {
    it("meets accessibility in launcher view", () => {
      const { runtimeLauncher } = createLauncherModule();
      const view = runtimeLauncher.getLauncher(USER_AUTH);
      assert.ok(view.accessibility.compliant);
      assert.ok(view.accessibility.minimumTouchTargetPx >= NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx);
    });
  });

  describe("read-only guarantees", () => {
    it("does not execute launch on refresh", () => {
      const { runtimeLauncher } = createLauncherModule();
      const refreshed = runtimeLauncher.refresh(USER_AUTH) as { read_only: boolean; delegated: boolean };
      assert.equal(refreshed.read_only, true);
      assert.equal(refreshed.delegated, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH3-X19", async () => {
      const pkg = JSON.parse(await readFile(path.join(ROOT_DIR, "package.json"), "utf8"));
      assert.ok(pkg.scripts["verify:ch3-x19"]);
      assert.ok(pkg.scripts["test:ch3-x19-runtime-launcher"]);
    });

    it("registers runtime launcher routes module", async () => {
      const routes = await readFile(path.join(ROOT_DIR, "src/api/routes/runtime-launcher.ts"), "utf8");
      assert.match(routes, /registerRuntimeLauncherRoutes/);
      assert.match(routes, /\/runtime-launcher\/validate/);
      assert.match(routes, /\/runtime-launcher\/refresh/);
    });

    it("wires runtime launcher in server and index", async () => {
      const server = await readRouteWiringSource();
      const index = await readModuleWiringSource();
      assert.match(server, /registerRuntimeLauncherRoutes/);
      assert.match(server, /runtimeLauncher/);
      assert.match(index, /createAnActRuntimeLauncherModule/);
      assert.match(index, /runtimeLauncher/);
    });
  });
});
