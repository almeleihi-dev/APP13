import { describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import type { AuthContext } from "../src/shared/auth/index.js";
import {
  ACTION_EXPERIENCE_VERSION,
  ACTION_SCREEN_IDS,
  ACTION_EXPERIENCE_FLOW,
  ACTION_SCREEN_PROTOTYPE_MAP,
  ACTION_RETURN_TRANSITION_STAGES,
  validateActionExperience,
  createAnActActionExperienceModule,
  createActionExperienceService,
  createActionRepository,
  buildActionHomeScreen,
  buildActionTransitionView,
  createActionReturnTransitionState,
  advanceActionReturnTransition,
} from "../src/runtime-experience/action/module.js";
import { OFFICIAL_TRANSITION_SPEC } from "../src/prototype-library/foundation/prototype-schema.js";
import { NEED_EXPERIENCE_VERSION } from "../src/runtime-experience/need/module.js";
import { buildInitialNavigationState } from "../src/navigation-framework/module.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-action-exp-001",
  sessionId: "session-action-exp-001",
  roles: ["provider"],
  scopes: [],
  authenticated: true,
};

const FIXED_AT = "2026-06-20T14:00:00.000Z";

describe("CH3-X6 AN ACT Action Experience", () => {
  describe("domain", () => {
    it("defines action screen ids and prototype map", () => {
      assert.equal(ACTION_SCREEN_IDS.length, 7);
      assert.equal(ACTION_SCREEN_PROTOTYPE_MAP["action-home"], "prototype-action-home");
      assert.equal(ACTION_SCREEN_PROTOTYPE_MAP["contract-preview"], "prototype-contract");
      assert.equal(ACTION_SCREEN_PROTOTYPE_MAP.transition, "prototype-transition");
    });

    it("defines complete action experience flow", () => {
      assert.equal(ACTION_EXPERIENCE_FLOW.length, 6);
      assert.equal(ACTION_EXPERIENCE_FLOW[0]?.screenId, "action-home");
      assert.equal(ACTION_EXPERIENCE_FLOW.at(-1)?.screenId, "transition");
    });
  });

  describe("presentation", () => {
    it("builds action home with required sections", () => {
      const repository = createActionRepository();
      repository.applyNeedHandoff(USER_AUTH.userId);
      const screen = buildActionHomeScreen(
        repository,
        USER_AUTH.userId,
        buildInitialNavigationState("/action/home"),
        FIXED_AT
      );
      assert.equal(screen.screenId, "action-home");
      assert.equal(screen.layoutId, "action-layout");
      assert.equal(screen.mode, "action");
      const sectionIds = screen.sections.map((s) => s.id);
      assert.ok(sectionIds.includes("current-action"));
      assert.ok(sectionIds.includes("live-status"));
      assert.ok(sectionIds.includes("active-contract"));
      assert.ok(sectionIds.includes("remaining-time"));
      assert.ok(sectionIds.includes("customer-summary"));
      assert.ok(sectionIds.includes("live-frame"));
      assert.ok(sectionIds.includes("quick-actions"));
      assert.ok(sectionIds.includes("bottom-navigation"));
    });

    it("uses core UI components without custom styling", () => {
      const repository = createActionRepository();
      const screen = buildActionHomeScreen(
        repository,
        USER_AUTH.userId,
        buildInitialNavigationState("/action/home"),
        FIXED_AT
      );
      assert.ok(screen.designTokens.includes("background.primary"));
      for (const section of screen.sections) {
        for (const component of section.components) {
          assert.ok(component.componentId.startsWith("core-ui-"));
        }
      }
    });
  });

  describe("transition", () => {
    it("uses official an act return transition with action stages", () => {
      const engine = createActionReturnTransitionState();
      const advanced = advanceActionReturnTransition(engine, 0.6, 3);
      const view = buildActionTransitionView(advanced);
      assert.equal(view.brandLine, "an act...");
      assert.equal(view.brandLine, OFFICIAL_TRANSITION_SPEC.brandLine);
      assert.deepEqual(view.stageTexts, ACTION_RETURN_TRANSITION_STAGES);
      assert.ok(view.stageTexts.includes("Returning..."));
      assert.equal(view.progressVariant, "terminal");
      assert.equal(view.direction, "action-to-need");
    });
  });

  describe("service", () => {
    const service = createActionExperienceService({ repository: createActionRepository() });

    it("enters action mode from need transition handoff", () => {
      const experience = service.enterFromNeedTransition(USER_AUTH, {
        generated_at: FIXED_AT,
        need_handoff: {
          actionSummary: "Panel Upgrade",
          location: "Riyadh",
          schedule: "Mon 10:00",
          notes: "Urgent",
          estimatedCost: 850,
        },
      });
      assert.equal(experience.version, ACTION_EXPERIENCE_VERSION);
      assert.equal(experience.need_experience_version, NEED_EXPERIENCE_VERSION);
      assert.equal(experience.current_screen, "action-home");
      assert.equal(experience.mode, "action");
      assert.equal(experience.runtime_experience, true);
    });

    it("supports contract to active action flow", () => {
      service.enterFromNeedTransition(USER_AUTH, { generated_at: FIXED_AT });
      service.getContract(USER_AUTH, { generated_at: FIXED_AT });
      const continued = service.continueContract(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(continued.screen.screenId, "active-action");
      const stageSection = continued.screen.sections.find((s) => s.id === "current-stage");
      assert.ok(stageSection);
    });

    it("supports progress and completion flow", () => {
      service.continueContract(USER_AUTH, { generated_at: FIXED_AT });
      service.getProgress(USER_AUTH, { generated_at: FIXED_AT });
      service.dispatchAction(USER_AUTH, { type: "advance-progress", milestoneId: "ms-2" });
      const completed = service.completeAction(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(completed.screen.screenId, "completion-screen");
      const success = completed.screen.sections.find((s) => s.id === "success-state");
      assert.ok(success);
    });

    it("supports return transition to need mode", () => {
      service.completeAction(USER_AUTH, { generated_at: FIXED_AT });
      const returned = service.startReturnTransition(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(returned.screen.screenId, "transition");
      assert.equal(returned.transition.brandLine, "an act...");
      assert.equal(returned.next_mode, "need");
      const advanced = service.advanceTransition(USER_AUTH, { progress: 1, generated_at: FIXED_AT });
      assert.equal(advanced.complete, true);
      assert.equal(advanced.mode, "need");
    });

    it("supports waiting screen states", () => {
      service.enterFromNeedTransition(USER_AUTH, { generated_at: FIXED_AT });
      const waiting = service.getWaiting(USER_AUTH, { reason: "customer", generated_at: FIXED_AT });
      assert.equal(waiting.screenId, "waiting-screen");
      assert.ok(waiting.sections.some((s) => s.id === "waiting-customer"));
    });

    it("supports back and bottom navigation", () => {
      service.getContract(USER_AUTH, { generated_at: FIXED_AT });
      const back = service.dispatchAction(USER_AUTH, { type: "back" }, { generated_at: FIXED_AT }) as {
        screen: { screenId: string };
      };
      assert.ok(back.screen);
      const nav = service.dispatchAction(
        USER_AUTH,
        { type: "bottom-nav", itemId: "progress" },
        { generated_at: FIXED_AT }
      ) as { screen: { screenId: string } };
      assert.equal(nav.screen.screenId, "progress-screen");
    });
  });

  describe("validation", () => {
    it("passes full action experience runtime validation", () => {
      const result = validateActionExperience();
      assert.equal(result.valid, true, result.errors.join("; "));
      assert.equal(result.errors.length, 0);
      assert.equal(result.checked.screens, 7);
      assert.equal(result.checked.navigation, true);
      assert.equal(result.checked.transition, true);
      assert.equal(result.checked.accessibility, true);
      assert.equal(result.checked.needExperienceLink, true);
    });

    it("module factory exposes validate and service", () => {
      const mod = createAnActActionExperienceModule();
      assert.equal(mod.version, ACTION_EXPERIENCE_VERSION);
      assert.equal(mod.validate().valid, true);
      assert.ok(mod.actionExperience.getFlow().flow.length >= 6);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH3-X6", async () => {
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");
      assert.match(packageSource, /verify:ch3-x6/);
      assert.match(packageSource, /test:ch3-x6-action-experience/);
    });

    it("registers action experience routes module", async () => {
      const routesSource = await readFile(path.join(ROOT_DIR, "src/api/routes/action-experience.ts"), "utf8");
      assert.match(routesSource, /\/action-experience/);
      assert.match(routesSource, /\/action-experience\/enter/);
      assert.match(routesSource, /\/action-experience\/return/);
    });
  });
});
