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
  RUNTIME_DEMO_VERSION,
  DEMO_FIXED_TIMESTAMP,
  DEMO_SCENARIO_IDS,
  DEMO_SCENARIOS,
  getDemoScenario,
  scenarioProgress,
  buildRuntimeDemoDefinition,
  createAnActRuntimeDemoModule,
  createRuntimeDemoRepository,
  validateRuntimeDemo,
  collectDemoDependencyValidation,
  validateDemoScenariosIntegrity,
  buildDemoHome,
  buildDemoControls,
} from "../src/runtime-experience/runtime-demo/module.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../src/navigation-framework/validation/navigation-validator.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-runtime-demo-001",
  sessionId: "session-runtime-demo-001",
  roles: ["customer"],
  scopes: [],
  authenticated: true,
};

function createDemoModule() {
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
  return createAnActRuntimeDemoModule({
    runtimeState,
    runtimeCoordinator,
    runtimeRegistry,
    runtimeHealth,
    repository: createRuntimeDemoRepository(),
  });
}

describe("CH3-X17 AN ACT Runtime Demo Mode", () => {
  describe("domain", () => {
    it("defines ten demo scenarios", () => {
      assert.equal(DEMO_SCENARIO_IDS.length, 10);
      assert.equal(DEMO_SCENARIOS.length, 10);
      assert.ok(DEMO_SCENARIO_IDS.includes("full-runtime-journey"));
      assert.ok(DEMO_SCENARIO_IDS.includes("return-journey"));
    });

    it("builds read-only demo definition", () => {
      const def = buildRuntimeDemoDefinition();
      assert.equal(def.version, RUNTIME_DEMO_VERSION);
      assert.equal(def.readOnly, true);
      assert.equal(def.simulatedData, true);
      assert.equal(def.delegatesOnly, true);
    });

    it("uses deterministic fixed timestamp", () => {
      assert.equal(DEMO_FIXED_TIMESTAMP, "2026-06-21T18:00:00.000Z");
    });

    it("calculates scenario progress", () => {
      assert.equal(scenarioProgress(0, 5), 0);
      assert.equal(scenarioProgress(4, 5), 100);
    });
  });

  describe("scenarios", () => {
    it("loads scenario with required fields", () => {
      const scenario = getDemoScenario("need-journey");
      assert.equal(scenario.id, "need-journey");
      assert.ok(scenario.title.length > 0);
      assert.ok(scenario.entryRoute.startsWith("/"));
      assert.equal(scenario.validationStatus, "valid");
      assert.equal(scenario.readiness, "ready");
    });

    it("lists all scenarios via service", () => {
      const { runtimeDemo } = createDemoModule();
      const list = runtimeDemo.getScenarios(USER_AUTH);
      assert.equal(list.count, 10);
      assert.equal(list.scenarios.length, 10);
    });

    it("gets scenario by id", () => {
      const { runtimeDemo } = createDemoModule();
      const found = runtimeDemo.getScenario(USER_AUTH, "chat-journey") as { found: boolean; scenario: { id: string } };
      assert.equal(found.found, true);
      assert.equal(found.scenario.id, "chat-journey");
    });
  });

  describe("playback", () => {
    it("starts demo scenario with delegation", () => {
      const { runtimeDemo } = createDemoModule();
      const started = runtimeDemo.start(USER_AUTH, { scenario_id: "need-journey" }) as {
        ok: boolean;
        read_only: boolean;
        delegated: boolean;
      };
      assert.equal(started.ok, true);
      assert.equal(started.read_only, true);
      assert.equal(started.delegated, true);
    });

    it("advances demo playback via coordinator delegation", () => {
      const { runtimeDemo } = createDemoModule();
      runtimeDemo.start(USER_AUTH, { scenario_id: "need-journey" });
      const next = runtimeDemo.next(USER_AUTH) as { ok: boolean; delegated: boolean };
      assert.equal(next.ok, true);
      assert.equal(next.delegated, true);
    });

    it("supports previous step during demo", () => {
      const { runtimeDemo } = createDemoModule();
      runtimeDemo.start(USER_AUTH, { scenario_id: "need-journey" });
      runtimeDemo.next(USER_AUTH);
      const prev = runtimeDemo.previous(USER_AUTH) as { ok: boolean };
      assert.equal(prev.ok, true);
    });

    it("pauses and resumes demo without business logic", () => {
      const { runtimeDemo } = createDemoModule();
      runtimeDemo.start(USER_AUTH, { scenario_id: "profile-journey" });
      const paused = runtimeDemo.pause(USER_AUTH) as { ok: boolean; session: { status: string } };
      assert.equal(paused.ok, true);
      assert.equal(paused.session.status, "paused");
      const resumed = runtimeDemo.resume(USER_AUTH) as { ok: boolean; session: { status: string } };
      assert.equal(resumed.ok, true);
      assert.equal(resumed.session.status, "playing");
    });

    it("restarts demo scenario deterministically", () => {
      const { runtimeDemo } = createDemoModule();
      runtimeDemo.start(USER_AUTH, { scenario_id: "action-journey" });
      runtimeDemo.next(USER_AUTH);
      const restarted = runtimeDemo.restart(USER_AUTH) as { ok: boolean };
      assert.equal(restarted.ok, true);
    });

    it("stops demo playback", () => {
      const { runtimeDemo } = createDemoModule();
      runtimeDemo.start(USER_AUTH, { scenario_id: "timeline-journey" });
      const stopped = runtimeDemo.stop(USER_AUTH) as { ok: boolean; session: { status: string } };
      assert.equal(stopped.ok, true);
      assert.equal(stopped.session.status, "stopped");
    });
  });

  describe("summary and session", () => {
    it("returns runtime summary with health delegation", () => {
      const { runtimeDemo } = createDemoModule();
      runtimeDemo.start(USER_AUTH, { scenario_id: "first-user-journey" });
      const summary = runtimeDemo.getSummary(USER_AUTH);
      assert.ok(summary.summary.healthStatus);
      assert.ok(summary.summary.readinessPercentage >= 0);
      assert.equal(summary.screen.readOnly, true);
    });

    it("tracks session progress", () => {
      const { runtimeDemo } = createDemoModule();
      runtimeDemo.start(USER_AUTH, { scenario_id: "need-journey" });
      const session = runtimeDemo.getSession(USER_AUTH);
      assert.equal(session.session.status, "playing");
      assert.ok(session.progress >= 0);
    });

    it("returns demo view with registry integration", () => {
      const { runtimeDemo } = createDemoModule();
      const view = runtimeDemo.getDemo(USER_AUTH);
      assert.equal(view.runtime_demo, true);
      assert.equal(view.registry_experience_count, 9);
      assert.equal(view.scenario_count, 10);
    });
  });

  describe("controls", () => {
    it("exposes start control when idle", () => {
      const { runtimeDemo } = createDemoModule();
      const session = runtimeDemo.getSession(USER_AUTH);
      assert.ok(session.controls.sections[0]?.components.some((c) => c.props.control === "start"));
    });

    it("exposes playback controls when playing", () => {
      const { runtimeDemo } = createDemoModule();
      runtimeDemo.start(USER_AUTH, { scenario_id: "contract-journey" });
      const controls = buildDemoControls("playing", ["pause", "next", "previous", "restart", "stop"]);
      assert.equal(controls.readOnly, true);
      assert.equal(controls.sections[0]?.components.length, 5);
    });
  });

  describe("delegation", () => {
    it("validates journey delegation availability", () => {
      const deps = collectDemoDependencyValidation();
      assert.equal(deps.journey, true);
      assert.equal(deps.state, true);
    });

    it("validates registry delegation availability", () => {
      const deps = collectDemoDependencyValidation();
      assert.equal(deps.registry, true);
    });

    it("validates coordinator delegation availability", () => {
      const deps = collectDemoDependencyValidation();
      assert.equal(deps.coordinator, true);
    });

    it("validates health delegation availability", () => {
      const deps = collectDemoDependencyValidation();
      assert.equal(deps.health, true);
    });
  });

  describe("validation", () => {
    it("passes full runtime demo validation", () => {
      const result = validateRuntimeDemo();
      assert.equal(result.valid, true, result.errors.join("; "));
      assert.equal(result.checked.scenarioCount, 10);
      assert.equal(result.checked.journeyDelegation, true);
      assert.equal(result.checked.playbackIntegrity, true);
      assert.equal(result.checked.readOnlyGuarantees, true);
      assert.equal(result.checked.noDuplicatedOrchestration, true);
    });

    it("validates scenario integrity", () => {
      assert.equal(validateDemoScenariosIntegrity(), true);
    });

    it("module factory exposes validate and service", () => {
      const mod = createDemoModule();
      assert.equal(mod.version, RUNTIME_DEMO_VERSION);
      assert.equal(mod.validate().valid, true);
    });
  });

  describe("accessibility", () => {
    it("meets accessibility in demo view", () => {
      const { runtimeDemo } = createDemoModule();
      const view = runtimeDemo.getDemo(USER_AUTH);
      assert.equal(view.accessibility.compliant, NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx >= 44);
    });

    it("builds read-only demo home screen", () => {
      const home = buildDemoHome(10);
      assert.equal(home.readOnly, true);
      assert.equal(home.screenId, "demo-home");
    });
  });

  describe("read-only guarantees", () => {
    it("marks all presentation screens read-only", () => {
      const { runtimeDemo } = createDemoModule();
      const started = runtimeDemo.start(USER_AUTH, { scenario_id: "notification-journey" }) as {
        step?: { readOnly: boolean };
        journey?: { readOnly: boolean };
      };
      assert.equal(started.step?.readOnly, true);
      assert.equal(started.journey?.readOnly, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH3-X17", async () => {
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");
      assert.match(packageSource, /verify:ch3-x17/);
      assert.match(packageSource, /test:ch3-x17-runtime-demo/);
    });

    it("registers runtime demo routes module", async () => {
      const routesSource = await readFile(path.join(ROOT_DIR, "src/api/routes/runtime-demo.ts"), "utf8");
      assert.match(routesSource, /\/runtime-demo/);
      assert.match(routesSource, /\/runtime-demo\/start/);
      assert.match(routesSource, /\/runtime-demo\/validate/);
    });

    it("wires runtime demo in server and index", async () => {
      const serverSource = await readFile(path.join(ROOT_DIR, "src/api/server.ts"), "utf8");
      const indexSource = await readFile(path.join(ROOT_DIR, "src/index.ts"), "utf8");
      assert.match(serverSource, /registerRuntimeDemoRoutes/);
      assert.match(serverSource, /runtimeDemo/);
      assert.match(indexSource, /createAnActRuntimeDemoModule/);
      assert.match(indexSource, /runtimeDemo/);
    });
  });
});
