import { describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import type { AuthContext } from "../src/shared/auth/index.js";
import {
  CONTRACT_EXPERIENCE_VERSION,
  CONTRACT_SCREEN_IDS,
  CONTRACT_SECTION_IDS,
  CONTRACT_EXPERIENCE_FLOW,
  CONTRACT_TO_ACTION_TRANSITION_STAGES,
  validateContractExperience,
  createAnActContractExperienceModule,
  createContractExperienceService,
  createContractRepository,
  buildContractHomeScreen,
  buildContractTransitionView,
  createContractTransitionState,
  advanceContractTransition,
  reviewContractReadiness,
} from "../src/runtime-experience/contract/module.js";
import { NEED_EXPERIENCE_VERSION } from "../src/runtime-experience/need/module.js";
import { ACTION_EXPERIENCE_VERSION } from "../src/runtime-experience/action/module.js";
import { OFFICIAL_TRANSITION_SPEC } from "../src/prototype-library/foundation/prototype-schema.js";
import { buildInitialNavigationState } from "../src/navigation-framework/module.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-contract-exp-001",
  sessionId: "session-contract-exp-001",
  roles: ["customer"],
  scopes: [],
  authenticated: true,
};

const FIXED_AT = "2026-06-20T16:00:00.000Z";

describe("CH3-X7 AN ACT Contract Experience", () => {
  describe("domain", () => {
    it("defines contract screen ids and sections", () => {
      assert.equal(CONTRACT_SCREEN_IDS.length, 10);
      assert.equal(CONTRACT_SECTION_IDS.length, 8);
      assert.ok(CONTRACT_EXPERIENCE_FLOW.some((s) => s.screenId === "contract-review"));
      assert.ok(CONTRACT_EXPERIENCE_FLOW.some((s) => s.screenId === "confirmation"));
    });
  });

  describe("presentation", () => {
    it("builds contract home with required sections", () => {
      const repository = createContractRepository();
      const summary = repository.getOrCreate(USER_AUTH.userId);
      const screen = buildContractHomeScreen(
        summary,
        buildInitialNavigationState("/contract/home"),
        FIXED_AT
      );
      assert.equal(screen.screenId, "contract-home");
      assert.equal(screen.layoutId, "action-layout");
      const sectionIds = screen.sections.map((s) => s.id);
      assert.ok(sectionIds.includes("contract-summary"));
      assert.ok(sectionIds.includes("action-title"));
      assert.ok(sectionIds.includes("parties-summary"));
      assert.ok(sectionIds.includes("current-status"));
      assert.ok(sectionIds.includes("estimated-cost"));
      assert.ok(sectionIds.includes("estimated-time"));
      assert.ok(sectionIds.includes("location"));
      assert.ok(sectionIds.includes("live-frame"));
      assert.ok(sectionIds.includes("next-step"));
    });

    it("uses core UI components without custom styling", () => {
      const repository = createContractRepository();
      const screen = buildContractHomeScreen(
        repository.getOrCreate(USER_AUTH.userId),
        buildInitialNavigationState("/contract/home"),
        FIXED_AT
      );
      for (const section of screen.sections) {
        for (const component of section.components) {
          assert.ok(component.componentId.startsWith("core-ui-"));
        }
      }
    });
  });

  describe("transition", () => {
    it("uses official an act contract transition stages", () => {
      const engine = createContractTransitionState();
      const advanced = advanceContractTransition(engine, 1, 3);
      const view = buildContractTransitionView(advanced);
      assert.equal(view.brandLine, "an act...");
      assert.equal(view.brandLine, OFFICIAL_TRANSITION_SPEC.brandLine);
      assert.deepEqual(view.stageTexts, CONTRACT_TO_ACTION_TRANSITION_STAGES);
      assert.ok(view.stageTexts.includes("Action Ready."));
    });
  });

  describe("service", () => {
    const service = createContractExperienceService({ repository: createContractRepository() });

    it("enters contract experience from action preview", () => {
      const experience = service.enterFromActionPreview(USER_AUTH, {
        generated_at: FIXED_AT,
        need_handoff: {
          actionSummary: "Panel Upgrade",
          location: "Riyadh",
          schedule: "Mon 10:00",
          estimatedCost: 900,
        },
      });
      assert.equal(experience.version, CONTRACT_EXPERIENCE_VERSION);
      assert.equal(experience.need_experience_version, NEED_EXPERIENCE_VERSION);
      assert.equal(experience.action_experience_version, ACTION_EXPERIENCE_VERSION);
      assert.equal(experience.current_screen, "contract-home");
      assert.equal(experience.runtime_experience, true);
    });

    it("supports full contract review flow", () => {
      service.enterFromActionPreview(USER_AUTH, { generated_at: FIXED_AT });
      service.getReview(USER_AUTH, { generated_at: FIXED_AT });
      service.getParties(USER_AUTH, { generated_at: FIXED_AT });
      service.getTerms(USER_AUTH, { generated_at: FIXED_AT });
      service.getTimeline(USER_AUTH, { generated_at: FIXED_AT });
      service.getCost(USER_AUTH, { generated_at: FIXED_AT });
      const confirmation = service.getConfirmation(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(confirmation.screenId, "confirmation");
      const experience = service.getExperience(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(experience.review.readyForConfirmation, true);
    });

    it("requires explicit user confirmation — no auto confirm", () => {
      service.enterFromActionPreview(USER_AUTH, { generated_at: FIXED_AT });
      service.getReview(USER_AUTH, { generated_at: FIXED_AT });
      service.getParties(USER_AUTH, { generated_at: FIXED_AT });
      service.getTerms(USER_AUTH, { generated_at: FIXED_AT });
      service.getTimeline(USER_AUTH, { generated_at: FIXED_AT });
      service.getCost(USER_AUTH, { generated_at: FIXED_AT });
      service.getConfirmation(USER_AUTH, { generated_at: FIXED_AT });
      assert.throws(
        () => service.confirmContract(USER_AUTH, { confirmed: false, generated_at: FIXED_AT }),
        /explicit user consent/
      );
      const confirmed = service.confirmContract(USER_AUTH, { confirmed: true, generated_at: FIXED_AT });
      assert.equal(confirmed.confirmed, true);
      assert.equal(confirmed.automatic, false);
      assert.equal(confirmed.screen.screenId, "status");
    });

    it("transitions to active action after confirmation", () => {
      service.confirmContract(USER_AUTH, { confirmed: true, generated_at: FIXED_AT });
      const started = service.startTransition(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(started.screen.screenId, "transition");
      assert.equal(started.transition.brandLine, "an act...");
      assert.equal(started.next_route, "/action/active");
      const advanced = service.advanceTransition(USER_AUTH, { progress: 1, generated_at: FIXED_AT });
      assert.equal(advanced.complete, true);
    });

    it("supports back and section navigation", () => {
      service.getReview(USER_AUTH, { generated_at: FIXED_AT });
      const back = service.dispatchAction(USER_AUTH, { type: "back" }, { generated_at: FIXED_AT }) as {
        screen: { screenId: string };
      };
      assert.ok(back.screen);
      const nav = service.dispatchAction(
        USER_AUTH,
        { type: "section-nav", sectionId: "terms" },
        { generated_at: FIXED_AT }
      ) as { screen: { screenId: string } };
      assert.equal(nav.screen.screenId, "terms");
    });
  });

  describe("validation", () => {
    it("passes full contract experience runtime validation", () => {
      const result = validateContractExperience();
      assert.equal(result.valid, true, result.errors.join("; "));
      assert.equal(result.errors.length, 0);
      assert.equal(result.checked.screens, 10);
      assert.equal(result.checked.sections, 8);
      assert.equal(result.checked.transition, true);
      assert.equal(result.checked.needExperienceLink, true);
      assert.equal(result.checked.actionExperienceLink, true);
    });

    it("module factory exposes validate and service", () => {
      const mod = createAnActContractExperienceModule();
      assert.equal(mod.version, CONTRACT_EXPERIENCE_VERSION);
      assert.equal(mod.validate().valid, true);
      assert.ok(mod.contractExperience.getFlow().flow.length >= 8);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH3-X7", async () => {
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");
      assert.match(packageSource, /verify:ch3-x7/);
      assert.match(packageSource, /test:ch3-x7-contract-experience/);
    });

    it("registers contract experience routes module", async () => {
      const routesSource = await readFile(path.join(ROOT_DIR, "src/api/routes/contract-experience.ts"), "utf8");
      assert.match(routesSource, /\/contract-experience/);
      assert.match(routesSource, /\/contract-experience\/confirm/);
      assert.match(routesSource, /\/contract-experience\/transition\/start/);
    });
  });
});
