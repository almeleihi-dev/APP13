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
  RUNTIME_JOURNEY_VERSION,
  OFFICIAL_RUNTIME_JOURNEY_FLOW,
  RUNTIME_JOURNEY_STEPS,
  RUNTIME_JOURNEY_EXPERIENCE_IDS,
  buildRuntimeJourneyDefinition,
  createAnActRuntimeJourneyModule,
  createRuntimeJourneyRepository,
  validateRuntimeJourney,
  buildRuntimeJourneyNavigation,
  buildRuntimeNavigationAccessibility,
  buildFirstUserJourneySections,
  buildReturnJourneySections,
  buildSessionSummarySections,
} from "../src/runtime-experience/runtime-journey/module.js";
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
  userId: "user-runtime-journey-001",
  sessionId: "session-runtime-journey-001",
  roles: ["customer"],
  scopes: [],
  authenticated: true,
};

const FIXED_AT = "2026-06-20T20:00:00.000Z";

function createJourneyModule() {
  const { needExperience } = createAnActNeedExperienceModule();
  const { actionExperience } = createAnActActionExperienceModule();
  const { contractExperience } = createAnActContractExperienceModule();
  const { chatExperience } = createAnActChatExperienceModule();
  const { timelineExperience } = createAnActTimelineExperienceModule();
  const { notificationExperience } = createAnActNotificationExperienceModule();
  const { profileExperience } = createAnActProfileExperienceModule();
  const repository = createRuntimeJourneyRepository();
  return createAnActRuntimeJourneyModule({
    needExperience,
    actionExperience,
    contractExperience,
    chatExperience,
    timelineExperience,
    notificationExperience,
    profileExperience,
    repository,
  });
}

describe("CH3-X12 AN ACT Complete Runtime Journey", () => {
  describe("domain", () => {
    it("defines official runtime journey flow with 15 steps", () => {
      assert.equal(RUNTIME_JOURNEY_STEPS.length, 15);
      assert.equal(OFFICIAL_RUNTIME_JOURNEY_FLOW.length, 15);
      assert.equal(RUNTIME_JOURNEY_STEPS[0]?.id, "launch");
      assert.equal(RUNTIME_JOURNEY_STEPS.at(-1)?.id, "need-home-return");
    });

    it("integrates all seven runtime experiences", () => {
      assert.equal(RUNTIME_JOURNEY_EXPERIENCE_IDS.length, 7);
      assert.deepEqual([...RUNTIME_JOURNEY_EXPERIENCE_IDS], [
        "need",
        "action",
        "contract",
        "chat",
        "timeline",
        "notification",
        "profile",
      ]);
    });

    it("builds deterministic journey definition", () => {
      const definition = buildRuntimeJourneyDefinition();
      assert.equal(definition.version, RUNTIME_JOURNEY_VERSION);
      assert.equal(definition.deterministic, true);
      assert.equal(definition.readOnly, true);
      assert.equal(definition.flow.length, 15);
    });

    it("uses valid routes for every step", () => {
      for (const step of RUNTIME_JOURNEY_STEPS) {
        assert.ok(step.route.startsWith("/"), `Invalid route for ${step.id}`);
      }
    });
  });

  describe("navigation", () => {
    it("builds navigation view with continuity", () => {
      const nav = buildRuntimeJourneyNavigation("action-home");
      assert.equal(nav.currentStepId, "action-home");
      assert.equal(nav.canGoBack, true);
      assert.equal(nav.canGoNext, true);
      assert.equal(nav.nextStepId, "contract");
      assert.equal(nav.previousStepId, "need-transition");
      assert.equal(nav.returnRoute, "/need/home");
    });

    it("meets accessibility spec for journey navigation", () => {
      const accessibility = buildRuntimeNavigationAccessibility();
      assert.ok(accessibility.minimumTouchTargetPx >= 44);
      assert.equal(accessibility.supportsKeyboardNavigation, true);
      assert.equal(accessibility.supportsScreenReader, true);
      assert.equal(NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx >= 44, true);
    });
  });

  describe("presentation", () => {
    it("builds first user journey sections without duplicating screens", () => {
      const sections = buildFirstUserJourneySections();
      assert.equal(sections.length, 2);
      assert.equal(sections[0]?.components.length, 15);
      assert.ok(sections[1]?.components.every((c) => c.componentId === "core-ui-badge"));
    });

    it("builds return journey and session summary from session", () => {
      const { runtimeJourney } = createJourneyModule();
      runtimeJourney.start(USER_AUTH, { generated_at: FIXED_AT });
      const sessionView = runtimeJourney.getSession(USER_AUTH, { generated_at: FIXED_AT });
      const returnSections = buildReturnJourneySections(sessionView as unknown as Parameters<typeof buildReturnJourneySections>[0]);
      const summarySections = buildSessionSummarySections(sessionView as unknown as Parameters<typeof buildSessionSummarySections>[0]);
      assert.ok(returnSections.some((s) => s.id === "return-transition"));
      assert.ok(summarySections.some((s) => s.id === "session-summary"));
    });
  });

  describe("service", () => {
    it("starts journey at launch and advances to need home", () => {
      const { runtimeJourney } = createJourneyModule();
      const started = runtimeJourney.start(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(started.runtime_journey, true);
      assert.equal(started.read_only, true);
      assert.equal(started.deterministic, true);
      assert.equal(started.current_step, "launch");
      const next = runtimeJourney.next(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(next.current_step, "need-home");
      assert.equal(next.active_experience, "need");
    });

    it("walks full official flow through profile", () => {
      const { runtimeJourney } = createJourneyModule();
      runtimeJourney.start(USER_AUTH, { generated_at: FIXED_AT });
      const expectedSteps = [
        "need-home",
        "search",
        "opportunity-list",
        "request",
        "need-transition",
        "action-home",
        "contract",
        "chat",
        "timeline",
        "notification",
        "profile",
      ];
      for (const stepId of expectedSteps) {
        const view = runtimeJourney.next(USER_AUTH, { generated_at: FIXED_AT });
        assert.equal(view.current_step, stepId, `Expected step ${stepId}`);
      }
      assert.equal(runtimeJourney.getCurrent(USER_AUTH, { generated_at: FIXED_AT }).current_step, "profile");
    });

    it("preserves handoff context across need to action transition", () => {
      const { runtimeJourney } = createJourneyModule();
      runtimeJourney.start(USER_AUTH, { generated_at: FIXED_AT });
      for (let i = 0; i < 5; i++) runtimeJourney.next(USER_AUTH, { generated_at: FIXED_AT });
      const view = runtimeJourney.next(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(view.current_step, "action-home");
      assert.ok(view.handoff.needRequest);
      assert.equal(view.handoff.actionId, "action-journey-001");
    });

    it("preserves session history through steps", () => {
      const { runtimeJourney } = createJourneyModule();
      runtimeJourney.start(USER_AUTH, { generated_at: FIXED_AT });
      runtimeJourney.next(USER_AUTH, { generated_at: FIXED_AT });
      runtimeJourney.next(USER_AUTH, { generated_at: FIXED_AT });
      const history = runtimeJourney.getHistory(USER_AUTH);
      assert.ok(history.history.length >= 3);
      assert.equal(history.step_count, 15);
    });

    it("supports back navigation without breaking session", () => {
      const { runtimeJourney } = createJourneyModule();
      runtimeJourney.start(USER_AUTH, { generated_at: FIXED_AT });
      runtimeJourney.next(USER_AUTH, { generated_at: FIXED_AT });
      runtimeJourney.next(USER_AUTH, { generated_at: FIXED_AT });
      const back = runtimeJourney.back(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(back.current_step, "need-home");
      assert.equal(back.read_only, true);
    });

    it("finishes journey at need home return", () => {
      const { runtimeJourney } = createJourneyModule();
      runtimeJourney.start(USER_AUTH, { generated_at: FIXED_AT });
      for (let i = 0; i < 14; i++) runtimeJourney.next(USER_AUTH, { generated_at: FIXED_AT });
      const finished = runtimeJourney.finish(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(finished.current_step, "need-home-return");
      assert.equal(finished.finished, true);
      assert.equal(finished.return_context.completed, true);
    });

    it("resets journey deterministically", () => {
      const { runtimeJourney } = createJourneyModule();
      runtimeJourney.start(USER_AUTH, { generated_at: FIXED_AT });
      for (let i = 0; i < 5; i++) runtimeJourney.next(USER_AUTH, { generated_at: FIXED_AT });
      const reset = runtimeJourney.reset(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(reset.current_step, "launch");
      assert.equal(reset.finished, false);
    });

    it("links all experience versions in journey view", () => {
      const { runtimeJourney } = createJourneyModule();
      const view = runtimeJourney.getJourney(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(view.need_experience_version, NEED_EXPERIENCE_VERSION);
      assert.equal(view.action_experience_version, ACTION_EXPERIENCE_VERSION);
      assert.equal(view.contract_experience_version, CONTRACT_EXPERIENCE_VERSION);
      assert.equal(view.chat_experience_version, CHAT_EXPERIENCE_VERSION);
      assert.equal(view.timeline_experience_version, TIMELINE_EXPERIENCE_VERSION);
      assert.equal(view.notification_experience_version, NOTIFICATION_EXPERIENCE_VERSION);
      assert.equal(view.profile_experience_version, PROFILE_EXPERIENCE_VERSION);
    });
  });

  describe("validation", () => {
    it("passes complete runtime journey validation", () => {
      const result = validateRuntimeJourney();
      assert.equal(result.valid, true, result.errors.join("; "));
      assert.equal(result.errors.length, 0);
      assert.equal(result.checked.steps, 15);
      assert.equal(result.checked.experiences, 7);
      assert.equal(result.checked.needIntegration, true);
      assert.equal(result.checked.actionIntegration, true);
      assert.equal(result.checked.contractIntegration, true);
      assert.equal(result.checked.chatIntegration, true);
      assert.equal(result.checked.timelineIntegration, true);
      assert.equal(result.checked.notificationIntegration, true);
      assert.equal(result.checked.profileIntegration, true);
      assert.equal(result.checked.sessionContinuity, true);
      assert.equal(result.checked.lifecycleContinuity, true);
      assert.equal(result.checked.noBrokenRoutes, true);
    });

    it("module factory exposes validate and service", () => {
      const mod = createJourneyModule();
      assert.equal(mod.version, RUNTIME_JOURNEY_VERSION);
      assert.equal(mod.validate().valid, true);
      assert.equal(mod.runtimeJourney.validateRuntime().valid, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH3-X12", async () => {
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");
      assert.match(packageSource, /verify:ch3-x12/);
      assert.match(packageSource, /test:ch3-x12-runtime-journey/);
    });

    it("registers runtime journey routes module", async () => {
      const routesSource = await readFile(path.join(ROOT_DIR, "src/api/routes/runtime-journey.ts"), "utf8");
      assert.match(routesSource, /\/runtime-journey/);
      assert.match(routesSource, /\/runtime-journey\/start/);
      assert.match(routesSource, /\/runtime-journey\/next/);
      assert.match(routesSource, /\/runtime-journey\/validate/);
    });

    it("wires runtime journey in server and index", async () => {
      const serverSource = await readFile(path.join(ROOT_DIR, "src/api/server.ts"), "utf8");
      const indexSource = await readFile(path.join(ROOT_DIR, "src/index.ts"), "utf8");
      assert.match(serverSource, /registerRuntimeJourneyRoutes/);
      assert.match(serverSource, /runtimeJourney/);
      assert.match(indexSource, /createAnActRuntimeJourneyModule/);
      assert.match(indexSource, /runtimeJourney/);
    });
  });
});
