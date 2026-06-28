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
  RUNTIME_JOURNEY_VERSION,
} from "../src/runtime-experience/runtime-journey/module.js";
import {
  RUNTIME_STATE_VERSION,
  OFFICIAL_RUNTIME_LIFECYCLE,
  resolveApplicationPhase,
  resolveRuntimeMode,
  createInitialApplicationRuntimeState,
  createInitialRuntimeContext,
  createAnActRuntimeStateModule,
  createRuntimeStateRepository,
  validateRuntimeState,
  buildRuntimeStateSummary,
  buildSessionInspector,
  buildLifecycleViewPresentation,
  createLifecycleManager,
} from "../src/runtime-experience/runtime-state/module.js";
import { NEED_EXPERIENCE_VERSION } from "../src/runtime-experience/need/module.js";
import { ACTION_EXPERIENCE_VERSION } from "../src/runtime-experience/action/module.js";
import { CONTRACT_EXPERIENCE_VERSION } from "../src/runtime-experience/contract/module.js";
import { CHAT_EXPERIENCE_VERSION } from "../src/runtime-experience/chat/module.js";
import { TIMELINE_EXPERIENCE_VERSION } from "../src/runtime-experience/timeline/module.js";
import { NOTIFICATION_EXPERIENCE_VERSION } from "../src/runtime-experience/notification/module.js";
import { PROFILE_EXPERIENCE_VERSION } from "../src/runtime-experience/profile/module.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../src/navigation-framework/validation/navigation-validator.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-runtime-state-001",
  sessionId: "session-runtime-state-001",
  roles: ["customer"],
  scopes: [],
  authenticated: true,
};

const FIXED_AT = "2026-06-21T10:00:00.000Z";

function createStateModule() {
  const { needExperience } = createAnActNeedExperienceModule();
  const { actionExperience } = createAnActActionExperienceModule();
  const { contractExperience } = createAnActContractExperienceModule();
  const { chatExperience } = createAnActChatExperienceModule();
  const { timelineExperience } = createAnActTimelineExperienceModule();
  const { notificationExperience } = createAnActNotificationExperienceModule();
  const { profileExperience } = createAnActProfileExperienceModule();
  const journeyRepository = createRuntimeJourneyRepository();
  const { runtimeJourney } = createAnActRuntimeJourneyModule({
    needExperience,
    actionExperience,
    contractExperience,
    chatExperience,
    timelineExperience,
    notificationExperience,
    profileExperience,
    repository: journeyRepository,
  });
  const stateRepository = createRuntimeStateRepository();
  return createAnActRuntimeStateModule({ runtimeJourney, repository: stateRepository });
}

describe("CH3-X13 AN ACT Runtime State & Session Engine", () => {
  describe("domain", () => {
    it("defines official runtime lifecycle with seven stages", () => {
      assert.equal(OFFICIAL_RUNTIME_LIFECYCLE.length, 7);
      assert.deepEqual([...OFFICIAL_RUNTIME_LIFECYCLE], [
        "Launch",
        "Need Session",
        "Transition",
        "Action Session",
        "Completion",
        "Return Transition",
        "Need Session",
      ]);
    });

    it("resolves application phase and mode from step ids", () => {
      assert.equal(resolveApplicationPhase("need-home"), "need-session");
      assert.equal(resolveApplicationPhase("need-transition"), "transition");
      assert.equal(resolveApplicationPhase("action-home"), "action-session");
      assert.equal(resolveApplicationPhase("completion"), "completion");
      assert.equal(resolveRuntimeMode("need-transition"), "Transition");
      assert.equal(resolveRuntimeMode("action-home"), "Action");
      assert.equal(resolveRuntimeMode("need-home"), "Need");
    });

    it("creates initial runtime context with default routes", () => {
      const context = createInitialRuntimeContext();
      assert.equal(context.contract.route, "/contract/home");
      assert.equal(context.conversation.route, "/chat/home");
      assert.equal(context.timeline.route, "/timeline/home");
      assert.equal(context.returnDestination, "/need/home");
    });

    it("creates initial application runtime state", () => {
      const state = createInitialApplicationRuntimeState(FIXED_AT);
      assert.equal(state.currentStepId, "launch");
      assert.equal(state.runtimePhase, "launch");
      assert.equal(state.launchTimestamp, FIXED_AT);
      assert.deepEqual(state.navigationStack, ["/runtime/launch"]);
    });
  });

  describe("presentation", () => {
    it("builds runtime state summary sections", () => {
      const { runtimeState } = createStateModule();
      runtimeState.start(USER_AUTH, { generated_at: FIXED_AT });
      const sessionView = runtimeState.getSession(USER_AUTH, { generated_at: FIXED_AT });
      const session = {
        userId: sessionView.user_id,
        sessionId: sessionView.session_id,
        state: sessionView.state,
        history: runtimeState.getHistory(USER_AUTH).history,
        generatedAt: sessionView.generated_at,
      };
      const summary = buildRuntimeStateSummary(session);
      assert.ok(summary.some((s) => s.id === "state-overview"));
      assert.ok(summary.some((s) => s.id === "navigation-stack"));
    });

    it("builds session inspector and lifecycle view", () => {
      const { runtimeState } = createStateModule();
      runtimeState.start(USER_AUTH, { generated_at: FIXED_AT });
      const sessionView = runtimeState.getSession(USER_AUTH, { generated_at: FIXED_AT });
      const session = {
        userId: sessionView.user_id,
        sessionId: sessionView.session_id,
        state: sessionView.state,
        history: runtimeState.getHistory(USER_AUTH).history,
        generatedAt: sessionView.generated_at,
        journeySessionId: sessionView.journey_session_id,
      };
      const inspector = buildSessionInspector(session);
      const lifecycleManager = createLifecycleManager();
      const lifecycle = lifecycleManager.buildLifecycleView(session);
      const presentation = buildLifecycleViewPresentation(session, lifecycle);
      assert.ok(inspector.sessionId);
      assert.equal(presentation.lifecycle.length, 7);
    });
  });

  describe("service", () => {
    it("starts authoritative runtime session at launch", () => {
      const { runtimeState } = createStateModule();
      const started = runtimeState.start(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(started.runtime_state, true);
      assert.equal(started.authoritative, true);
      assert.equal(started.read_only, true);
      assert.equal(started.current_step_id, "launch");
      assert.equal(started.launch_timestamp, FIXED_AT);
    });

    it("updates state via journey next without duplicating logic", () => {
      const { runtimeState } = createStateModule();
      runtimeState.start(USER_AUTH, { generated_at: FIXED_AT });
      const updated = runtimeState.update(USER_AUTH, { generated_at: FIXED_AT, action: "next" });
      assert.equal(updated.current_step_id, "need-home");
      assert.equal(updated.current_mode, "Need");
      assert.equal(updated.runtime_phase, "need-session");
      assert.ok(updated.navigation_stack.length >= 2);
    });

    it("tracks navigation stack and previous screen", () => {
      const { runtimeState } = createStateModule();
      runtimeState.start(USER_AUTH, { generated_at: FIXED_AT });
      runtimeState.update(USER_AUTH, { generated_at: FIXED_AT, action: "next" });
      const updated = runtimeState.update(USER_AUTH, { generated_at: FIXED_AT, action: "next" });
      assert.equal(updated.previous_screen, "need-home");
      assert.equal(updated.current_step_id, "search");
    });

    it("preserves handoff context through transition to action session", () => {
      const { runtimeState } = createStateModule();
      runtimeState.start(USER_AUTH, { generated_at: FIXED_AT });
      for (let i = 0; i < 5; i++) {
        runtimeState.update(USER_AUTH, { generated_at: FIXED_AT, action: "next" });
      }
      const transitioned = runtimeState.transition(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(transitioned.current_step_id, "action-home");
      assert.equal(transitioned.runtime_phase, "action-session");
      const ctx = runtimeState.getContext(USER_AUTH, { generated_at: FIXED_AT });
      assert.ok(ctx.active_contract.actionId);
    });

    it("tracks active contexts for shared experiences", () => {
      const { runtimeState } = createStateModule();
      runtimeState.start(USER_AUTH, { generated_at: FIXED_AT });
      for (let i = 0; i < 10; i++) {
        runtimeState.update(USER_AUTH, { generated_at: FIXED_AT, action: "next" });
      }
      const ctx = runtimeState.getContext(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(ctx.active_timeline.route, "/timeline/home");
      assert.equal(ctx.active_notification.route, "/notification/home");
      assert.equal(ctx.active_profile.route, "/profile/home");
    });

    it("records session history with continuity", () => {
      const { runtimeState } = createStateModule();
      runtimeState.start(USER_AUTH, { generated_at: FIXED_AT });
      runtimeState.update(USER_AUTH, { generated_at: FIXED_AT, action: "next" });
      runtimeState.update(USER_AUTH, { generated_at: FIXED_AT, action: "next" });
      const history = runtimeState.getHistory(USER_AUTH);
      assert.ok(history.history.length >= 3);
      assert.equal(history.authoritative, true);
    });

    it("reports lifecycle phase view", () => {
      const { runtimeState } = createStateModule();
      runtimeState.start(USER_AUTH, { generated_at: FIXED_AT });
      runtimeState.update(USER_AUTH, { generated_at: FIXED_AT, action: "next" });
      const phase = runtimeState.getPhase(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(phase.currentPhase, "need-session");
      assert.equal(phase.lifecycle.length, 7);
      assert.equal(phase.inTransition, false);
    });

    it("supports back navigation via update", () => {
      const { runtimeState } = createStateModule();
      runtimeState.start(USER_AUTH, { generated_at: FIXED_AT });
      runtimeState.update(USER_AUTH, { generated_at: FIXED_AT, action: "next" });
      runtimeState.update(USER_AUTH, { generated_at: FIXED_AT, action: "next" });
      const back = runtimeState.update(USER_AUTH, { generated_at: FIXED_AT, action: "back" });
      assert.equal(back.current_step_id, "need-home");
    });

    it("finishes session at need home return", () => {
      const { runtimeState } = createStateModule();
      runtimeState.start(USER_AUTH, { generated_at: FIXED_AT });
      for (let i = 0; i < 14; i++) {
        runtimeState.update(USER_AUTH, { generated_at: FIXED_AT, action: "next" });
      }
      const finished = runtimeState.finish(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(finished.current_step_id, "need-home-return");
      assert.equal(finished.finished, true);
      assert.equal(finished.return_destination, "/need/home");
    });

    it("resets authoritative session deterministically", () => {
      const { runtimeState } = createStateModule();
      runtimeState.start(USER_AUTH, { generated_at: FIXED_AT });
      for (let i = 0; i < 5; i++) {
        runtimeState.update(USER_AUTH, { generated_at: FIXED_AT, action: "next" });
      }
      const reset = runtimeState.reset(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(reset.current_step_id, "launch");
      assert.equal(reset.finished, false);
    });

    it("links all experience and journey versions", () => {
      const { runtimeState } = createStateModule();
      const view = runtimeState.getState(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(view.need_experience_version, NEED_EXPERIENCE_VERSION);
      assert.equal(view.action_experience_version, ACTION_EXPERIENCE_VERSION);
      assert.equal(view.contract_experience_version, CONTRACT_EXPERIENCE_VERSION);
      assert.equal(view.chat_experience_version, CHAT_EXPERIENCE_VERSION);
      assert.equal(view.timeline_experience_version, TIMELINE_EXPERIENCE_VERSION);
      assert.equal(view.notification_experience_version, NOTIFICATION_EXPERIENCE_VERSION);
      assert.equal(view.profile_experience_version, PROFILE_EXPERIENCE_VERSION);
      assert.equal(view.runtime_journey_version, RUNTIME_JOURNEY_VERSION);
    });
  });

  describe("validation", () => {
    it("passes full runtime state engine validation", () => {
      const result = validateRuntimeState();
      assert.equal(result.valid, true, result.errors.join("; "));
      assert.equal(result.errors.length, 0);
      assert.equal(result.checked.lifecycleStages, 7);
      assert.equal(result.checked.needIntegration, true);
      assert.equal(result.checked.actionIntegration, true);
      assert.equal(result.checked.contractIntegration, true);
      assert.equal(result.checked.chatIntegration, true);
      assert.equal(result.checked.timelineIntegration, true);
      assert.equal(result.checked.notificationIntegration, true);
      assert.equal(result.checked.profileIntegration, true);
      assert.equal(result.checked.journeyIntegration, true);
      assert.equal(result.checked.sessionContinuity, true);
      assert.equal(result.checked.stateConsistency, true);
      assert.equal(result.checked.noDuplicateRuntimeState, true);
    });

    it("module factory exposes validate and service", () => {
      const mod = createStateModule();
      assert.equal(mod.version, RUNTIME_STATE_VERSION);
      assert.equal(mod.validate().valid, true);
      assert.equal(mod.runtimeState.validateRuntime().valid, true);
    });
  });

  describe("accessibility", () => {
    it("meets minimum touch target in state view", () => {
      const { runtimeState } = createStateModule();
      const view = runtimeState.start(USER_AUTH, { generated_at: FIXED_AT });
      assert.ok(view.accessibility.minimumTouchTargetPx >= 44);
      assert.equal(NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx >= 44, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH3-X13", async () => {
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");
      assert.match(packageSource, /verify:ch3-x13/);
      assert.match(packageSource, /test:ch3-x13-runtime-state-engine/);
    });

    it("registers runtime state routes module", async () => {
      const routesSource = await readFile(path.join(ROOT_DIR, "src/api/routes/runtime-state.ts"), "utf8");
      assert.match(routesSource, /\/runtime-state/);
      assert.match(routesSource, /\/runtime-state\/start/);
      assert.match(routesSource, /\/runtime-state\/update/);
      assert.match(routesSource, /\/runtime-state\/validate/);
    });

    it("wires runtime state in server and index", async () => {
      const serverSource = await readFile(path.join(ROOT_DIR, "src/api/server.ts"), "utf8");
      const indexSource = await readFile(path.join(ROOT_DIR, "src/index.ts"), "utf8");
      assert.match(serverSource, /registerRuntimeStateRoutes/);
      assert.match(serverSource, /runtimeState/);
      assert.match(indexSource, /createAnActRuntimeStateModule/);
      assert.match(indexSource, /runtimeState/);
    });
  });
});
