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
  RUNTIME_PREVIEW_VERSION,
  PREVIEW_FIXED_TIMESTAMP,
  PREVIEW_TARGET_IDS,
  PREVIEW_TARGETS,
  getPreviewTarget,
  previewCoveragePercentage,
  buildRuntimePreviewDefinition,
  createAnActRuntimePreviewModule,
  createRuntimePreviewRepository,
  validateRuntimePreview,
  collectPreviewDependencyValidation,
  validatePreviewTargetsIntegrity,
  buildPreviewHome,
} from "../src/runtime-experience/runtime-preview/module.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../src/navigation-framework/validation/navigation-validator.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-runtime-preview-001",
  sessionId: "session-runtime-preview-001",
  roles: ["customer"],
  scopes: [],
  authenticated: true,
};

function createPreviewModule() {
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
  return createAnActRuntimePreviewModule({
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
}

describe("CH3-X18 AN ACT Runtime Preview Engine", () => {
  describe("domain", () => {
    it("defines thirteen preview targets", () => {
      assert.equal(PREVIEW_TARGET_IDS.length, 13);
      assert.equal(PREVIEW_TARGETS.length, 13);
      assert.ok(PREVIEW_TARGET_IDS.includes("runtime-demo"));
      assert.ok(PREVIEW_TARGET_IDS.includes("runtime-health"));
    });

    it("builds read-only preview definition", () => {
      const def = buildRuntimePreviewDefinition();
      assert.equal(def.version, RUNTIME_PREVIEW_VERSION);
      assert.equal(def.readOnly, true);
      assert.equal(def.delegatesOnly, true);
      assert.equal(def.noLifecycleMutations, true);
      assert.equal(def.noPersistence, true);
      assert.equal(def.noAi, true);
      assert.equal(def.noNetworking, true);
    });

    it("uses deterministic fixed timestamp", () => {
      assert.equal(PREVIEW_FIXED_TIMESTAMP, "2026-06-21T18:30:00.000Z");
    });

    it("calculates preview coverage percentage", () => {
      assert.equal(previewCoveragePercentage(0, 13), 0);
      assert.equal(previewCoveragePercentage(13, 13), 100);
    });
  });

  describe("coverage", () => {
    it("loads target with required fields", () => {
      const target = getPreviewTarget("need");
      assert.equal(target.id, "need");
      assert.ok(target.title.length > 0);
      assert.equal(target.entryScreen, "need-home");
      assert.equal(target.delegateModule, "CH3-X5");
      assert.equal(target.validationStatus, "valid");
      assert.equal(target.readiness, "ready");
    });

    it("lists all targets via service", () => {
      const { runtimePreview } = createPreviewModule();
      const coverage = runtimePreview.getCoverage(USER_AUTH);
      assert.equal(coverage.count, 13);
      assert.equal(coverage.targets.length, 13);
    });

    it("gets target preview by id", () => {
      const { runtimePreview } = createPreviewModule();
      const found = runtimePreview.getTarget(USER_AUTH, "chat") as {
        found: boolean;
        preview: { read_only: boolean; delegateModule: string };
      };
      assert.equal(found.found, true);
      assert.equal(found.preview.read_only, true);
      assert.equal(found.preview.delegateModule, "CH3-X8");
    });

    it("returns not found for unknown target", () => {
      const { runtimePreview } = createPreviewModule();
      const found = runtimePreview.getTarget(USER_AUTH, "unknown-target") as { found: boolean };
      assert.equal(found.found, false);
    });
  });

  describe("preview delegation", () => {
    it("previews need experience via CH3-X5 delegation", () => {
      const { runtimePreview } = createPreviewModule();
      const result = runtimePreview.getTarget(USER_AUTH, "need") as {
        found: boolean;
        preview: { delegateModule: string; presentation: { readOnly: boolean } };
      };
      assert.equal(result.found, true);
      assert.equal(result.preview.delegateModule, "CH3-X5");
      assert.equal(result.preview.presentation.readOnly, true);
    });

    it("previews runtime journey via CH3-X12 delegation", () => {
      const { runtimePreview } = createPreviewModule();
      const result = runtimePreview.getTarget(USER_AUTH, "runtime-journey") as {
        preview: { delegateModule: string };
      };
      assert.equal(result.preview.delegateModule, "CH3-X12");
    });

    it("previews runtime state via CH3-X13 delegation", () => {
      const { runtimePreview } = createPreviewModule();
      const result = runtimePreview.getTarget(USER_AUTH, "runtime-state") as {
        preview: { delegateModule: string };
      };
      assert.equal(result.preview.delegateModule, "CH3-X13");
    });

    it("previews runtime registry via CH3-X14 delegation", () => {
      const { runtimePreview } = createPreviewModule();
      const result = runtimePreview.getTarget(USER_AUTH, "runtime-registry") as {
        preview: { delegateModule: string };
      };
      assert.equal(result.preview.delegateModule, "CH3-X14");
    });

    it("previews runtime coordinator via CH3-X15 delegation", () => {
      const { runtimePreview } = createPreviewModule();
      const result = runtimePreview.getTarget(USER_AUTH, "runtime-coordinator") as {
        preview: { delegateModule: string };
      };
      assert.equal(result.preview.delegateModule, "CH3-X15");
    });

    it("previews runtime health via CH3-X16 delegation", () => {
      const { runtimePreview } = createPreviewModule();
      const result = runtimePreview.getTarget(USER_AUTH, "runtime-health") as {
        preview: { delegateModule: string };
      };
      assert.equal(result.preview.delegateModule, "CH3-X16");
    });

    it("previews runtime demo via CH3-X17 delegation", () => {
      const { runtimePreview } = createPreviewModule();
      const result = runtimePreview.getTarget(USER_AUTH, "runtime-demo") as {
        preview: { delegateModule: string };
      };
      assert.equal(result.preview.delegateModule, "CH3-X17");
    });
  });

  describe("summary and session", () => {
    it("returns preview overview with read-only guarantees", () => {
      const { runtimePreview } = createPreviewModule();
      const view = runtimePreview.getPreview(USER_AUTH);
      assert.equal(view.version, RUNTIME_PREVIEW_VERSION);
      assert.equal(view.read_only, true);
      assert.equal(view.delegates_only, true);
      assert.equal(view.no_lifecycle_mutations, true);
      assert.equal(view.target_count, 13);
    });

    it("tracks preview session progress", () => {
      const { runtimePreview } = createPreviewModule();
      runtimePreview.getTarget(USER_AUTH, "need");
      runtimePreview.getTarget(USER_AUTH, "action");
      const session = runtimePreview.getSession(USER_AUTH);
      assert.equal(session.session.viewedTargetIds.length, 2);
      assert.ok(session.coverage > 0);
    });

    it("returns preview summary", () => {
      const { runtimePreview } = createPreviewModule();
      runtimePreview.getTarget(USER_AUTH, "profile");
      const summary = runtimePreview.getSummary(USER_AUTH);
      assert.equal(summary.summary.readOnly, true);
      assert.equal(summary.summary.delegated, true);
      assert.equal(summary.screen.readOnly, true);
    });

    it("builds all target previews", () => {
      const { runtimePreview } = createPreviewModule();
      const all = runtimePreview.getAllPreviews(USER_AUTH);
      assert.equal(all.count, 13);
      assert.equal(all.previews.length, 13);
      assert.ok(all.previews.every((p) => p.read_only === true));
    });
  });

  describe("delegation validation", () => {
    it("validates need delegation availability", () => {
      const deps = collectPreviewDependencyValidation();
      assert.equal(deps.need, true);
    });

    it("validates registry delegation availability", () => {
      const deps = collectPreviewDependencyValidation();
      assert.equal(deps.registry, true);
    });

    it("validates coordinator delegation availability", () => {
      const deps = collectPreviewDependencyValidation();
      assert.equal(deps.coordinator, true);
    });

    it("validates health delegation availability", () => {
      const deps = collectPreviewDependencyValidation();
      assert.equal(deps.health, true);
    });

    it("validates demo delegation availability", () => {
      const deps = collectPreviewDependencyValidation();
      assert.equal(deps.demo, true);
    });
  });

  describe("validation", () => {
    it("passes full runtime preview validation", () => {
      const result = validateRuntimePreview();
      assert.equal(result.valid, true);
      assert.equal(result.checked.targetCount, 13);
      assert.equal(result.checked.readOnlyGuarantees, true);
      assert.equal(result.checked.noLifecycleMutations, true);
    });

    it("validates target integrity", () => {
      assert.equal(validatePreviewTargetsIntegrity(), true);
    });

    it("module factory exposes validate and service", () => {
      const mod = createPreviewModule();
      assert.equal(mod.version, RUNTIME_PREVIEW_VERSION);
      assert.ok(mod.runtimePreview);
      assert.equal(mod.validate().valid, true);
    });
  });

  describe("accessibility", () => {
    it("meets accessibility in preview view", () => {
      const { runtimePreview } = createPreviewModule();
      const view = runtimePreview.getPreview(USER_AUTH);
      assert.ok(view.accessibility.compliant);
      assert.ok(view.accessibility.minimumTouchTargetPx >= NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx);
    });

    it("builds read-only preview home screen", () => {
      const home = buildPreviewHome(13);
      assert.equal(home.readOnly, true);
      assert.equal(home.screenId, "preview-home");
    });
  });

  describe("read-only guarantees", () => {
    it("marks all presentation screens read-only", () => {
      const { runtimePreview } = createPreviewModule();
      const all = runtimePreview.getAllPreviews(USER_AUTH);
      for (const p of all.previews) {
        assert.equal(p.presentation.readOnly, true);
      }
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH3-X18", async () => {
      const pkg = JSON.parse(await readFile(path.join(ROOT_DIR, "package.json"), "utf8"));
      assert.ok(pkg.scripts["verify:ch3-x18"]);
      assert.ok(pkg.scripts["test:ch3-x18-runtime-preview"]);
    });

    it("registers runtime preview routes module", async () => {
      const routes = await readFile(path.join(ROOT_DIR, "src/api/routes/runtime-preview.ts"), "utf8");
      assert.match(routes, /registerRuntimePreviewRoutes/);
      assert.match(routes, /\/runtime-preview\/validate/);
    });

    it("wires runtime preview in server and index", async () => {
      const server = await readRouteWiringSource();
      const index = await readModuleWiringSource();
      assert.match(server, /registerRuntimePreviewRoutes/);
      assert.match(server, /runtimePreview/);
      assert.match(index, /createAnActRuntimePreviewModule/);
      assert.match(index, /runtimePreview/);
    });
  });
});
