import { describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import type { AuthContext } from "../src/shared/auth/index.js";
import {
  NEED_EXPERIENCE_VERSION,
  NEED_SCREEN_IDS,
  NEED_EXPERIENCE_FLOW,
  NEED_SCREEN_PROTOTYPE_MAP,
  validateNeedExperience,
  createAnActNeedExperienceModule,
  createNeedExperienceService,
  createNeedRepository,
  buildNeedHomeScreen,
  buildNeedTransitionView,
  createNeedTransitionState,
  advanceNeedTransition,
} from "../src/runtime-experience/need/module.js";
import { OFFICIAL_TRANSITION_SPEC } from "../src/prototype-library/foundation/prototype-schema.js";
import { buildInitialNavigationState } from "../src/navigation-framework/module.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-need-exp-001",
  sessionId: "session-need-exp-001",
  roles: ["customer"],
  scopes: [],
  authenticated: true,
};

const FIXED_AT = "2026-06-20T12:00:00.000Z";

describe("CH3-X5 AN ACT Need Experience", () => {
  describe("domain", () => {
    it("defines need screen ids and prototype map", () => {
      assert.equal(NEED_SCREEN_IDS.length, 6);
      assert.equal(NEED_SCREEN_PROTOTYPE_MAP["need-home"], "prototype-need-home");
      assert.equal(NEED_SCREEN_PROTOTYPE_MAP.transition, "prototype-transition");
    });

    it("defines complete need experience flow", () => {
      assert.equal(NEED_EXPERIENCE_FLOW.length, 5);
      assert.equal(NEED_EXPERIENCE_FLOW[0]?.screenId, "need-home");
      assert.equal(NEED_EXPERIENCE_FLOW.at(-1)?.screenId, "transition");
    });
  });

  describe("presentation", () => {
    it("builds need home with required sections", () => {
      const repository = createNeedRepository();
      const screen = buildNeedHomeScreen(
        repository,
        USER_AUTH.userId,
        buildInitialNavigationState("/need/home"),
        FIXED_AT
      );
      assert.equal(screen.screenId, "need-home");
      assert.equal(screen.prototypeId, "prototype-need-home");
      assert.equal(screen.layoutId, "need-layout");
      const sectionIds = screen.sections.map((s) => s.id);
      assert.ok(sectionIds.includes("welcome"));
      assert.ok(sectionIds.includes("search-entry"));
      assert.ok(sectionIds.includes("quick-categories"));
      assert.ok(sectionIds.includes("recommended-actions"));
      assert.ok(sectionIds.includes("recent-activity"));
      assert.ok(sectionIds.includes("suggested-opportunities"));
      assert.ok(sectionIds.includes("bottom-navigation"));
      assert.equal(screen.navigation.bottomNavigationVisible, true);
    });

    it("uses design tokens from prototype without custom styling", () => {
      const repository = createNeedRepository();
      const screen = buildNeedHomeScreen(
        repository,
        USER_AUTH.userId,
        buildInitialNavigationState("/need/home"),
        FIXED_AT
      );
      assert.ok(screen.designTokens.includes("background.primary"));
      assert.ok(screen.designTokens.includes("accent.primary"));
      for (const section of screen.sections) {
        for (const component of section.components) {
          assert.ok(component.componentId.startsWith("core-ui-"));
        }
      }
    });
  });

  describe("transition", () => {
    it("uses official an act transition with dynamic stages", () => {
      const engine = createNeedTransitionState();
      const advanced = advanceNeedTransition(engine, 0.5, 2);
      const view = buildNeedTransitionView(advanced);
      assert.equal(view.brandLine, "an act...");
      assert.equal(view.brandLine, OFFICIAL_TRANSITION_SPEC.brandLine);
      assert.ok(view.stageTexts.includes("Preparing..."));
      assert.ok(view.stageTexts.includes("Matching..."));
      assert.ok(view.stageTexts.includes("Action Ready."));
      assert.equal(view.progressVariant, "terminal");
      assert.equal(view.direction, "need-to-action");
      assert.ok(view.backgroundToken.length > 0);
    });
  });

  describe("service", () => {
    const service = createNeedExperienceService({ repository: createNeedRepository() });

    it("returns full need experience on launch", () => {
      const experience = service.getExperience(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(experience.version, NEED_EXPERIENCE_VERSION);
      assert.equal(experience.current_screen, "need-home");
      assert.equal(experience.mode, "need");
      assert.equal(experience.runtime_experience, true);
      assert.equal(experience.screen.screenId, "need-home");
    });

    it("supports search to opportunity list flow", () => {
      const result = service.performSearch(USER_AUTH, {
        keyword: "electrician",
        generated_at: FIXED_AT,
      });
      assert.ok(result.opportunity_count >= 1);
      assert.equal(result.screen.screenId, "opportunity-list");
      const oppSection = result.screen.sections.find((s) => s.id === "opportunity-cards");
      assert.ok(oppSection);
      const card = oppSection!.components[0];
      assert.ok(card?.props.liveFrame);
      assert.ok(card?.props.rating);
      assert.ok(card?.props.distanceKm);
    });

    it("supports request screen with continue to transition", () => {
      service.performSearch(USER_AUTH, { keyword: "electrician", generated_at: FIXED_AT });
      service.getRequest(USER_AUTH, { opportunity_id: "opp-1", generated_at: FIXED_AT });
      const request = service.getRequest(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(request.screenId, "request");
      service.dispatchAction(USER_AUTH, {
        type: "update-request",
        fields: { location: "Riyadh", schedule: "Mon 10:00", notes: "Panel upgrade" },
      });
      const continued = service.continueRequest(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(continued.screen.screenId, "transition");
      assert.equal(continued.transition.brandLine, "an act...");
      assert.equal(continued.next_mode, "action");
    });

    it("advances transition to action mode", () => {
      service.continueRequest(USER_AUTH, { generated_at: FIXED_AT });
      const advanced = service.advanceTransition(USER_AUTH, { progress: 1, generated_at: FIXED_AT });
      assert.equal(advanced.complete, true);
      assert.equal(advanced.mode, "action");
      assert.equal(advanced.transition.stageText.length > 0, true);
    });

    it("supports back and bottom navigation", () => {
      service.getSearch(USER_AUTH, { generated_at: FIXED_AT });
      const back = service.dispatchAction(USER_AUTH, { type: "back" }, { generated_at: FIXED_AT }) as {
        screen: { screenId: string };
      };
      assert.ok(back.screen);
      const nav = service.dispatchAction(
        USER_AUTH,
        { type: "bottom-nav", itemId: "search" },
        { generated_at: FIXED_AT }
      ) as { screen: { screenId: string } };
      assert.equal(nav.screen.screenId, "search");
    });
  });

  describe("validation", () => {
    it("passes full need experience runtime validation", () => {
      const result = validateNeedExperience();
      assert.equal(result.valid, true, result.errors.join("; "));
      assert.equal(result.errors.length, 0);
      assert.equal(result.checked.screens, 6);
      assert.equal(result.checked.navigation, true);
      assert.equal(result.checked.transition, true);
      assert.equal(result.checked.accessibility, true);
    });

    it("module factory exposes validate and service", () => {
      const mod = createAnActNeedExperienceModule();
      assert.equal(mod.version, NEED_EXPERIENCE_VERSION);
      assert.equal(mod.validate().valid, true);
      assert.ok(mod.needExperience.getFlow().flow.length >= 5);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH3-X5", async () => {
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");
      assert.match(packageSource, /verify:ch3-x5/);
      assert.match(packageSource, /test:ch3-x5-need-experience/);
    });

    it("registers need experience routes module", async () => {
      const routesSource = await readFile(path.join(ROOT_DIR, "src/api/routes/need-experience.ts"), "utf8");
      assert.match(routesSource, /\/need-experience/);
      assert.match(routesSource, /\/need-experience\/search/);
      assert.match(routesSource, /\/need-experience\/request\/continue/);
    });
  });
});
