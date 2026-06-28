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
  RUNTIME_COORDINATOR_VERSION,
  COORDINATOR_DELEGATION_TARGETS,
  buildRuntimeCoordinatorDefinition,
  createAnActRuntimeCoordinatorModule,
  createRuntimeCoordinatorRepository,
  createExperienceResolver,
  createExecutionPlanner,
  validateRuntimeCoordinator,
  buildCoordinationSummary,
  buildExecutionView,
} from "../src/runtime-experience/runtime-coordinator/module.js";
import { RUNTIME_JOURNEY_VERSION } from "../src/runtime-experience/runtime-journey/module.js";
import { RUNTIME_STATE_VERSION } from "../src/runtime-experience/runtime-state/module.js";
import { RUNTIME_REGISTRY_VERSION } from "../src/runtime-experience/runtime-registry/module.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../src/navigation-framework/validation/navigation-validator.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-runtime-coordinator-001",
  sessionId: "session-runtime-coordinator-001",
  roles: ["customer"],
  scopes: [],
  authenticated: true,
};

const FIXED_AT = "2026-06-21T14:00:00.000Z";

function createCoordinatorModule() {
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
  return createAnActRuntimeCoordinatorModule({
    runtimeJourney,
    runtimeState,
    runtimeRegistry,
    repository: createRuntimeCoordinatorRepository(),
  });
}

describe("CH3-X15 AN ACT Runtime Experience Coordinator", () => {
  describe("domain", () => {
    it("defines coordinator version and delegation targets", () => {
      assert.equal(COORDINATOR_DELEGATION_TARGETS.length, 10);
      assert.ok(COORDINATOR_DELEGATION_TARGETS.includes("runtime-journey"));
      assert.ok(COORDINATOR_DELEGATION_TARGETS.includes("runtime-registry"));
    });

    it("builds coordinator definition as delegation-only", () => {
      const def = buildRuntimeCoordinatorDefinition();
      assert.equal(def.version, RUNTIME_COORDINATOR_VERSION);
      assert.equal(def.delegationOnly, true);
      assert.equal(def.ownsBusinessLogic, false);
      assert.equal(def.deterministic, true);
    });
  });

  describe("application", () => {
    it("resolves experience by route from registry", () => {
      const { runtimeRegistry } = createAnActRuntimeRegistryModule({
        repository: createRuntimeRegistryRepository(),
      });
      const resolver = createExperienceResolver();
      const resolved = resolver.resolveByRoute(USER_AUTH, runtimeRegistry, "/need/home");
      assert.equal(resolved?.id, "need");
      assert.equal(resolved?.primaryRoute, "/need/home");
    });

    it("builds execution plan with delegation steps", () => {
      const planner = createExecutionPlanner();
      const plan = planner.buildPlan(
        {
          currentRoute: "/need/home",
          requestedRoute: "/need/search",
          action: "next",
          context: { runtimePhase: "need-session" },
          generatedAt: FIXED_AT,
        },
        "need"
      );
      assert.ok(plan.steps.some((s) => s.delegateTo === "runtime-registry"));
      assert.ok(plan.steps.some((s) => s.delegateTo === "runtime-state"));
      assert.equal(plan.lifecyclePhase, "need-session");
    });
  });

  describe("service", () => {
    it("returns coordinator view with delegation metadata", () => {
      const { runtimeCoordinator } = createCoordinatorModule();
      const view = runtimeCoordinator.getCoordinator(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(view.runtime_coordinator, true);
      assert.equal(view.delegation_only, true);
      assert.equal(view.read_only, true);
      assert.equal(view.deterministic, true);
    });

    it("reports status from delegated runtime state", () => {
      const { runtimeCoordinator } = createCoordinatorModule();
      runtimeCoordinator.reset(USER_AUTH, { generated_at: FIXED_AT });
      const status = runtimeCoordinator.getStatus(USER_AUTH, { generated_at: FIXED_AT });
      assert.ok(status.active_experience);
      assert.equal(status.finished, false);
    });

    it("resolves active experience and route", () => {
      const { runtimeCoordinator } = createCoordinatorModule();
      runtimeCoordinator.reset(USER_AUTH, { generated_at: FIXED_AT });
      const active = runtimeCoordinator.getActive(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(active.current_step_id, "launch");
      assert.ok(active.current_route);
    });

    it("builds coordination plan without executing business logic", () => {
      const { runtimeCoordinator } = createCoordinatorModule();
      runtimeCoordinator.reset(USER_AUTH, { generated_at: FIXED_AT });
      const planView = runtimeCoordinator.getPlan(USER_AUTH, {
        generated_at: FIXED_AT,
        requested_route: "/need/home",
        action: "next",
      });
      assert.ok(planView.plan.planId);
      assert.ok(planView.execution.sections.length > 0);
    });

    it("coordinates via registry and state delegation", () => {
      const { runtimeCoordinator } = createCoordinatorModule();
      runtimeCoordinator.reset(USER_AUTH, { generated_at: FIXED_AT });
      const result = runtimeCoordinator.coordinate(USER_AUTH, {
        generated_at: FIXED_AT,
        requested_route: "/need/home",
        action: "next",
      });
      assert.equal(result.delegated, true);
      assert.equal(result.navigationDecision.delegateTo, "runtime-state");
      assert.equal(result.lifecycleDecision.delegateTo, "runtime-journey");
      assert.equal(result.validationResult.delegateTo, "runtime-registry");
    });

    it("navigates by delegating to runtime state", () => {
      const { runtimeCoordinator } = createCoordinatorModule();
      runtimeCoordinator.reset(USER_AUTH, { generated_at: FIXED_AT });
      const result = runtimeCoordinator.navigate(USER_AUTH, {
        generated_at: FIXED_AT,
        action: "next",
      });
      assert.equal(result.delegated, true);
      assert.equal(result.navigationDecision.delegateTo, "runtime-state");
      assert.equal((result.state_view as { current_step_id: string }).current_step_id, "need-home");
    });

    it("coordinates transition via runtime state", () => {
      const { runtimeCoordinator } = createCoordinatorModule();
      runtimeCoordinator.reset(USER_AUTH, { generated_at: FIXED_AT });
      runtimeCoordinator.navigate(USER_AUTH, { generated_at: FIXED_AT, action: "next" });
      const result = runtimeCoordinator.transition(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(result.delegated, true);
      assert.ok(result.transitionDecision);
    });

    it("resets by delegating to state and journey", () => {
      const { runtimeCoordinator } = createCoordinatorModule();
      runtimeCoordinator.reset(USER_AUTH, { generated_at: FIXED_AT });
      runtimeCoordinator.navigate(USER_AUTH, { generated_at: FIXED_AT, action: "next" });
      const reset = runtimeCoordinator.reset(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(reset.delegated, true);
      assert.equal(reset.state_view?.current_step_id, "launch");
    });

    it("returns coordination map from registry", () => {
      const { runtimeCoordinator } = createCoordinatorModule();
      const map = runtimeCoordinator.getMap(USER_AUTH);
      assert.equal(map.registry_map.map.length, 9);
      assert.equal(map.delegation_only, true);
      assert.ok(map.coordination_map.sections.length > 0);
    });

    it("links journey, state, and registry versions", () => {
      const { runtimeCoordinator } = createCoordinatorModule();
      const view = runtimeCoordinator.getCoordinator(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(view.runtime_journey_version, RUNTIME_JOURNEY_VERSION);
      assert.equal(view.runtime_state_version, RUNTIME_STATE_VERSION);
      assert.equal(view.runtime_registry_version, RUNTIME_REGISTRY_VERSION);
    });
  });

  describe("presentation", () => {
    it("builds coordination summary and execution view", () => {
      const summary = buildCoordinationSummary({
        activeExperience: "need",
        navigationDecision: { delegateTo: "runtime-state", action: "stay", route: "/need/home", reason: "test" },
        transitionDecision: { delegateTo: "runtime-state", inTransition: false, route: "/system/transition" },
        lifecycleDecision: { phase: "need-session", delegateTo: "runtime-journey", advance: false },
        contextUpdates: { preserved: true, delegateTo: "runtime-state", updates: {} },
        validationResult: { valid: true, delegateTo: "runtime-registry" },
      });
      assert.equal(summary.delegated, true);
      const execution = buildExecutionView({
        planId: "plan-test",
        currentRoute: "/need/home",
        activeExperience: "need",
        steps: [{ action: "resolve", delegateTo: "runtime-registry", description: "Resolve", route: "/need/home" }],
        lifecyclePhase: "need-session",
        inTransition: false,
      });
      assert.equal(execution.planId, "plan-test");
    });
  });

  describe("validation", () => {
    it("passes full runtime coordinator validation", () => {
      const result = validateRuntimeCoordinator();
      assert.equal(result.valid, true, result.errors.join("; "));
      assert.equal(result.errors.length, 0);
      assert.equal(result.checked.delegationTargets, 10);
      assert.equal(result.checked.needIntegration, true);
      assert.equal(result.checked.journeyIntegration, true);
      assert.equal(result.checked.stateIntegration, true);
      assert.equal(result.checked.registryIntegration, true);
      assert.equal(result.checked.coordinatorDelegation, true);
      assert.equal(result.checked.noDuplicatedOrchestration, true);
    });

    it("module factory exposes validate and service", () => {
      const mod = createCoordinatorModule();
      assert.equal(mod.version, RUNTIME_COORDINATOR_VERSION);
      assert.equal(mod.validate().valid, true);
      assert.equal(mod.runtimeCoordinator.validateRuntime().valid, true);
    });
  });

  describe("accessibility", () => {
    it("meets minimum touch target in coordinator view", () => {
      const { runtimeCoordinator } = createCoordinatorModule();
      const view = runtimeCoordinator.getCoordinator(USER_AUTH, { generated_at: FIXED_AT });
      assert.ok(view.accessibility.minimumTouchTargetPx >= 44);
      assert.equal(NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx >= 44, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH3-X15", async () => {
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");
      assert.match(packageSource, /verify:ch3-x15/);
      assert.match(packageSource, /test:ch3-x15-runtime-coordinator/);
    });

    it("registers runtime coordinator routes module", async () => {
      const routesSource = await readFile(path.join(ROOT_DIR, "src/api/routes/runtime-coordinator.ts"), "utf8");
      assert.match(routesSource, /\/runtime-coordinator/);
      assert.match(routesSource, /\/runtime-coordinator\/coordinate/);
      assert.match(routesSource, /\/runtime-coordinator\/navigate/);
      assert.match(routesSource, /\/runtime-coordinator\/validate/);
    });

    it("wires runtime coordinator in server and index", async () => {
      const serverSource = await readFile(path.join(ROOT_DIR, "src/api/server.ts"), "utf8");
      const indexSource = await readFile(path.join(ROOT_DIR, "src/index.ts"), "utf8");
      assert.match(serverSource, /registerRuntimeCoordinatorRoutes/);
      assert.match(serverSource, /runtimeCoordinator/);
      assert.match(indexSource, /createAnActRuntimeCoordinatorModule/);
      assert.match(indexSource, /runtimeCoordinator/);
    });
  });
});
