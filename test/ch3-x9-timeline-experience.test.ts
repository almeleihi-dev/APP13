import { describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import type { AuthContext } from "../src/shared/auth/index.js";
import {
  TIMELINE_EXPERIENCE_VERSION,
  TIMELINE_SCREEN_IDS,
  TIMELINE_EXPERIENCE_FLOW,
  TIMELINE_LIFECYCLE_FLOW,
  TIMELINE_EVENT_TYPE_ORDER,
  TIMELINE_FILTER_IDS,
  TIMELINE_PROGRESS_STAGES,
  validateTimelineExperience,
  createAnActTimelineExperienceModule,
  createTimelineExperienceService,
  createTimelineRepository,
  buildTimelineHomeScreen,
  buildTimelineHistoryScreen,
  buildTimelineDetailScreen,
  buildTimelineProgressScreen,
  buildTimelineFiltersScreen,
  buildTimelineEmptyStateScreen,
  sortTimelineEvents,
  groupEventsByDate,
  buildProgressStages,
  applyTimelineFilter,
  buildTimelineSummary,
} from "../src/runtime-experience/timeline/module.js";
import { NEED_EXPERIENCE_VERSION } from "../src/runtime-experience/need/module.js";
import { ACTION_EXPERIENCE_VERSION } from "../src/runtime-experience/action/module.js";
import { CONTRACT_EXPERIENCE_VERSION } from "../src/runtime-experience/contract/module.js";
import { CHAT_EXPERIENCE_VERSION } from "../src/runtime-experience/chat/module.js";
import { buildInitialNavigationState } from "../src/navigation-framework/module.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../src/navigation-framework/validation/navigation-validator.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-timeline-exp-001",
  sessionId: "session-timeline-exp-001",
  roles: ["customer"],
  scopes: [],
  authenticated: true,
};

const FIXED_AT = "2026-06-20T18:00:00.000Z";

describe("CH3-X9 AN ACT Timeline Experience", () => {
  describe("domain", () => {
    it("defines timeline screen ids and lifecycle flow", () => {
      assert.equal(TIMELINE_SCREEN_IDS.length, 6);
      assert.equal(TIMELINE_EVENT_TYPE_ORDER.length, 10);
      assert.equal(TIMELINE_FILTER_IDS.length, 6);
      assert.ok(TIMELINE_LIFECYCLE_FLOW.includes("Archive"));
      assert.ok(TIMELINE_EXPERIENCE_FLOW.some((s) => s.screenId === "timeline-home"));
    });

    it("orders timeline events chronologically", () => {
      const repository = createTimelineRepository();
      const events = repository.getEvents(USER_AUTH.userId);
      const sorted = sortTimelineEvents(events);
      for (let i = 1; i < sorted.length; i++) {
        assert.ok(new Date(sorted[i]!.timestamp) >= new Date(sorted[i - 1]!.timestamp));
      }
    });

    it("builds timeline summary from events", () => {
      const repository = createTimelineRepository();
      const events = repository.getEvents(USER_AUTH.userId);
      const summary = buildTimelineSummary(events);
      assert.ok(summary.completionPercentage >= 0);
      assert.ok(summary.totalEvents === events.length);
      assert.equal(summary.currentLifecycleStage, "action");
    });
  });

  describe("presentation", () => {
    it("builds timeline home with required sections", () => {
      const repository = createTimelineRepository();
      const events = repository.getEvents(USER_AUTH.userId);
      const summary = repository.getSummary(USER_AUTH.userId);
      const screen = buildTimelineHomeScreen(
        summary,
        events,
        buildInitialNavigationState("/timeline/home"),
        FIXED_AT
      );
      assert.equal(screen.screenId, "timeline-home");
      assert.equal(screen.layoutId, "need-layout");
      const sectionIds = screen.sections.map((s) => s.id);
      assert.ok(sectionIds.includes("todays-activity"));
      assert.ok(sectionIds.includes("active-actions"));
      assert.ok(sectionIds.includes("recent-events"));
      assert.ok(sectionIds.includes("upcoming-milestones"));
      assert.ok(sectionIds.includes("completion-percentage"));
      assert.ok(sectionIds.includes("current-lifecycle-stage"));
      assert.ok(sectionIds.includes("live-frame-summary"));
    });

    it("builds timeline history grouped by date", () => {
      const repository = createTimelineRepository();
      const events = repository.getEvents(USER_AUTH.userId);
      const groups = groupEventsByDate(events);
      const screen = buildTimelineHistoryScreen(
        groups,
        buildInitialNavigationState("/timeline/history"),
        FIXED_AT
      );
      assert.equal(screen.screenId, "timeline-history");
      assert.ok(screen.sections.some((s) => s.id.startsWith("date-group-")));
    });

    it("builds timeline detail with event fields", () => {
      const repository = createTimelineRepository();
      const event = repository.getEvents(USER_AUTH.userId)[0]!;
      const screen = buildTimelineDetailScreen(
        event,
        buildInitialNavigationState("/timeline/detail"),
        FIXED_AT
      );
      assert.equal(screen.screenId, "timeline-detail");
      const sectionIds = screen.sections.map((s) => s.id);
      assert.ok(sectionIds.includes("event-title"));
      assert.ok(sectionIds.includes("event-description"));
      assert.ok(sectionIds.includes("confidence"));
      assert.ok(sectionIds.includes("return-links"));
    });

    it("uses core UI components without custom styling", () => {
      const screen = buildTimelineEmptyStateScreen(
        buildInitialNavigationState("/timeline/empty"),
        FIXED_AT
      );
      for (const section of screen.sections) {
        for (const component of section.components) {
          assert.ok(component.componentId.startsWith("core-ui-"));
        }
      }
    });
  });

  describe("builder", () => {
    it("builds progress stages with completed current remaining", () => {
      const repository = createTimelineRepository();
      const stages = buildProgressStages(repository.getEvents(USER_AUTH.userId));
      assert.equal(stages.length, TIMELINE_PROGRESS_STAGES.length);
      assert.ok(stages.some((s) => s.status === "completed"));
      assert.ok(stages.some((s) => s.status === "current" || s.status === "remaining"));
    });

    it("applies timeline filters", () => {
      const repository = createTimelineRepository();
      const events = repository.getEvents(USER_AUTH.userId);
      const completed = applyTimelineFilter(events, "completed");
      assert.ok(completed.every((e) => e.status === "completed"));
      const active = applyTimelineFilter(events, "active");
      assert.ok(active.every((e) => e.status === "current" || e.status === "upcoming"));
    });

    it("builds progress and filters screens", () => {
      const repository = createTimelineRepository();
      const stages = buildProgressStages(repository.getEvents(USER_AUTH.userId));
      const progress = buildTimelineProgressScreen(
        stages,
        buildInitialNavigationState("/timeline/progress"),
        FIXED_AT
      );
      assert.equal(progress.screenId, "timeline-progress");
      const filters = buildTimelineFiltersScreen(
        "week",
        buildInitialNavigationState("/timeline/filters"),
        FIXED_AT
      );
      assert.equal(filters.screenId, "timeline-filters");
      assert.equal(filters.sections.find((s) => s.id === "filter-options")?.components.length, 6);
    });
  });

  describe("service", () => {
    const service = createTimelineExperienceService({ repository: createTimelineRepository() });

    it("returns read-only timeline experience", () => {
      const experience = service.getExperience(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(experience.version, TIMELINE_EXPERIENCE_VERSION);
      assert.equal(experience.need_experience_version, NEED_EXPERIENCE_VERSION);
      assert.equal(experience.action_experience_version, ACTION_EXPERIENCE_VERSION);
      assert.equal(experience.contract_experience_version, CONTRACT_EXPERIENCE_VERSION);
      assert.equal(experience.chat_experience_version, CHAT_EXPERIENCE_VERSION);
      assert.equal(experience.read_only, true);
      assert.equal(experience.runtime_experience, true);
      assert.equal(experience.current_screen, "timeline-home");
    });

    it("supports home history detail progress navigation", () => {
      const home = service.getHome(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(home.screenId, "timeline-home");
      const history = service.getHistory(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(history.screenId, "timeline-history");
      const events = createTimelineRepository().getEvents(USER_AUTH.userId);
      const detail = service.getDetail(USER_AUTH, events[0]!.id, { generated_at: FIXED_AT });
      assert.equal(detail.screenId, "timeline-detail");
      const progress = service.getProgress(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(progress.screenId, "timeline-progress");
    });

    it("supports back navigation without mutating lifecycle", () => {
      service.getHistory(USER_AUTH, { generated_at: FIXED_AT });
      const back = service.dispatchAction(USER_AUTH, { type: "back" }, { generated_at: FIXED_AT }) as {
        screen: { screenId: string };
        read_only: boolean;
      };
      assert.ok(back.screen);
      assert.equal(back.read_only, true);
    });

    it("returns handoff routes for related experiences", () => {
      const need = service.dispatchAction(USER_AUTH, { type: "return-need-home" }) as { return_route: string };
      assert.equal(need.return_route, "/need/home");
      const action = service.dispatchAction(USER_AUTH, { type: "return-action-home" }) as { return_route: string };
      assert.equal(action.return_route, "/action/home");
      const contract = service.dispatchAction(USER_AUTH, { type: "return-contract" }) as { return_route: string };
      assert.equal(contract.return_route, "/contract/home");
      const chat = service.dispatchAction(USER_AUTH, { type: "return-chat" }) as { return_route: string };
      assert.equal(chat.return_route, "/chat/home");
    });

    it("refreshes timeline display without mutation", () => {
      const refreshed = service.refresh(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(refreshed.read_only, true);
      assert.ok(refreshed.event_count > 0);
      assert.equal(refreshed.refreshed_at, FIXED_AT);
    });
  });

  describe("accessibility", () => {
    it("meets minimum touch target and navigation spec", () => {
      const service = createTimelineExperienceService({ repository: createTimelineRepository() });
      const screen = service.getHome(USER_AUTH, { generated_at: FIXED_AT, reduced_motion: true });
      assert.ok(screen.accessibility.minimumTouchTargetPx >= 44);
      assert.equal(screen.accessibility.supportsKeyboardNavigation, true);
      assert.equal(screen.accessibility.supportsScreenReader, true);
      assert.equal(NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx >= 44, true);
    });
  });

  describe("validation", () => {
    it("passes full timeline experience runtime validation", () => {
      const result = validateTimelineExperience();
      assert.equal(result.valid, true, result.errors.join("; "));
      assert.equal(result.errors.length, 0);
      assert.equal(result.checked.screens, 6);
      assert.equal(result.checked.eventTypes, 10);
      assert.equal(result.checked.filters, 6);
      assert.equal(result.checked.progressStages, 5);
      assert.equal(result.checked.chatExperienceLink, true);
    });

    it("module factory exposes validate and service", () => {
      const mod = createAnActTimelineExperienceModule();
      assert.equal(mod.version, TIMELINE_EXPERIENCE_VERSION);
      assert.equal(mod.validate().valid, true);
      assert.ok(mod.timelineExperience.getFlow().flow.length >= 5);
      assert.equal(mod.timelineExperience.getFlow().read_only, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH3-X9", async () => {
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");
      assert.match(packageSource, /verify:ch3-x9/);
      assert.match(packageSource, /test:ch3-x9-timeline-experience/);
    });

    it("registers timeline experience routes module", async () => {
      const routesSource = await readFile(path.join(ROOT_DIR, "src/api/routes/timeline-experience.ts"), "utf8");
      assert.match(routesSource, /\/timeline-experience/);
      assert.match(routesSource, /\/timeline-experience\/history/);
      assert.match(routesSource, /\/timeline-experience\/detail/);
      assert.match(routesSource, /\/timeline-experience\/refresh/);
    });
  });
});
