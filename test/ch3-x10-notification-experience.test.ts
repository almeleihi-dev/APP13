import { describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import type { AuthContext } from "../src/shared/auth/index.js";
import {
  NOTIFICATION_EXPERIENCE_VERSION,
  NOTIFICATION_SCREEN_IDS,
  NOTIFICATION_EXPERIENCE_FLOW,
  NOTIFICATION_LIFECYCLE_FLOW,
  NOTIFICATION_TYPE_ORDER,
  NOTIFICATION_FILTER_IDS,
  NOTIFICATION_SETTINGS_OPTIONS,
  validateNotificationExperience,
  createAnActNotificationExperienceModule,
  createNotificationExperienceService,
  createNotificationRepository,
  buildNotificationHomeScreen,
  buildNotificationListScreen,
  buildNotificationDetailScreen,
  buildNotificationFiltersScreen,
  buildNotificationSettingsScreen,
  buildNotificationEmptyStateScreen,
  sortNotifications,
  groupNotificationsByDate,
  applyNotificationFilter,
  buildNotificationSummary,
} from "../src/runtime-experience/notification/module.js";
import { NEED_EXPERIENCE_VERSION } from "../src/runtime-experience/need/module.js";
import { ACTION_EXPERIENCE_VERSION } from "../src/runtime-experience/action/module.js";
import { CONTRACT_EXPERIENCE_VERSION } from "../src/runtime-experience/contract/module.js";
import { CHAT_EXPERIENCE_VERSION } from "../src/runtime-experience/chat/module.js";
import { TIMELINE_EXPERIENCE_VERSION } from "../src/runtime-experience/timeline/module.js";
import { buildInitialNavigationState } from "../src/navigation-framework/module.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../src/navigation-framework/validation/navigation-validator.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-notification-exp-001",
  sessionId: "session-notification-exp-001",
  roles: ["customer"],
  scopes: [],
  authenticated: true,
};

const FIXED_AT = "2026-06-20T18:00:00.000Z";

describe("CH3-X10 AN ACT Notification Experience", () => {
  describe("domain", () => {
    it("defines notification screen ids and types", () => {
      assert.equal(NOTIFICATION_SCREEN_IDS.length, 6);
      assert.equal(NOTIFICATION_TYPE_ORDER.length, 9);
      assert.equal(NOTIFICATION_FILTER_IDS.length, 7);
      assert.ok(NOTIFICATION_LIFECYCLE_FLOW.includes("Archive"));
      assert.ok(NOTIFICATION_EXPERIENCE_FLOW.some((s) => s.screenId === "notification-home"));
    });

    it("sorts notifications by timestamp descending", () => {
      const repository = createNotificationRepository();
      const items = repository.getNotifications(USER_AUTH.userId);
      const sorted = sortNotifications(items);
      for (let i = 1; i < sorted.length; i++) {
        assert.ok(new Date(sorted[i - 1]!.timestamp) >= new Date(sorted[i]!.timestamp));
      }
    });

    it("builds notification summary", () => {
      const repository = createNotificationRepository();
      const items = repository.getNotifications(USER_AUTH.userId);
      const summary = buildNotificationSummary(items);
      assert.ok(summary.unreadCount > 0);
      assert.equal(summary.totalNotifications, items.length);
    });
  });

  describe("presentation", () => {
    it("builds notification home with required sections", () => {
      const repository = createNotificationRepository();
      const items = repository.getNotifications(USER_AUTH.userId);
      const summary = repository.getSummary(USER_AUTH.userId);
      const screen = buildNotificationHomeScreen(
        summary,
        items,
        buildInitialNavigationState("/notification/home"),
        FIXED_AT
      );
      assert.equal(screen.screenId, "notification-home");
      assert.equal(screen.layoutId, "need-layout");
      const sectionIds = screen.sections.map((s) => s.id);
      assert.ok(sectionIds.includes("unread-count"));
      assert.ok(sectionIds.includes("recent-notifications"));
      assert.ok(sectionIds.includes("important-events"));
      assert.ok(sectionIds.includes("action-reminders"));
      assert.ok(sectionIds.includes("timeline-highlights"));
      assert.ok(sectionIds.includes("contract-updates"));
      assert.ok(sectionIds.includes("live-frame-updates"));
    });

    it("builds notification list grouped by date", () => {
      const repository = createNotificationRepository();
      const items = repository.getNotifications(USER_AUTH.userId);
      const groups = groupNotificationsByDate(items, FIXED_AT);
      const screen = buildNotificationListScreen(
        groups,
        buildInitialNavigationState("/notification/list"),
        FIXED_AT
      );
      assert.equal(screen.screenId, "notification-list");
      assert.ok(screen.sections.some((s) => s.id === "status-filters"));
      assert.ok(screen.sections.some((s) => s.id.startsWith("group-")));
    });

    it("builds notification detail with all fields", () => {
      const repository = createNotificationRepository();
      const notification = repository.getNotifications(USER_AUTH.userId)[0]!;
      const screen = buildNotificationDetailScreen(
        notification,
        buildInitialNavigationState("/notification/detail"),
        FIXED_AT
      );
      assert.equal(screen.screenId, "notification-detail");
      const sectionIds = screen.sections.map((s) => s.id);
      assert.ok(sectionIds.includes("notification-id"));
      assert.ok(sectionIds.includes("message"));
      assert.ok(sectionIds.includes("confidence"));
      assert.ok(sectionIds.includes("return-links"));
    });

    it("uses core UI components without custom styling", () => {
      const screen = buildNotificationEmptyStateScreen(
        buildInitialNavigationState("/notification/empty"),
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
    it("applies notification filters", () => {
      const repository = createNotificationRepository();
      const items = repository.getNotifications(USER_AUTH.userId);
      const unread = applyNotificationFilter(items, "unread");
      assert.ok(unread.every((n) => n.status === "unread"));
      const contracts = applyNotificationFilter(items, "contracts");
      assert.ok(contracts.every((n) => n.type === "contract"));
    });

    it("builds filters and settings screens", () => {
      const filters = buildNotificationFiltersScreen(
        "all",
        buildInitialNavigationState("/notification/filters"),
        FIXED_AT
      );
      assert.equal(filters.screenId, "notification-filters");
      assert.equal(filters.sections.find((s) => s.id === "filter-options")?.components.length, 7);
      const settings = buildNotificationSettingsScreen(
        buildInitialNavigationState("/notification/settings"),
        FIXED_AT
      );
      assert.equal(settings.screenId, "notification-settings");
      assert.equal(settings.sections.find((s) => s.id === "delivery-settings")?.components.length, 6);
    });
  });

  describe("service", () => {
    const service = createNotificationExperienceService({ repository: createNotificationRepository() });

    it("returns read-only notification experience", () => {
      const experience = service.getExperience(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(experience.version, NOTIFICATION_EXPERIENCE_VERSION);
      assert.equal(experience.need_experience_version, NEED_EXPERIENCE_VERSION);
      assert.equal(experience.action_experience_version, ACTION_EXPERIENCE_VERSION);
      assert.equal(experience.contract_experience_version, CONTRACT_EXPERIENCE_VERSION);
      assert.equal(experience.chat_experience_version, CHAT_EXPERIENCE_VERSION);
      assert.equal(experience.timeline_experience_version, TIMELINE_EXPERIENCE_VERSION);
      assert.equal(experience.read_only, true);
      assert.equal(experience.delivery, false);
      assert.equal(experience.current_screen, "notification-home");
    });

    it("supports home list detail navigation", () => {
      const home = service.getHome(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(home.screenId, "notification-home");
      const list = service.getList(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(list.screenId, "notification-list");
      const items = createNotificationRepository().getNotifications(USER_AUTH.userId);
      const detail = service.getDetail(USER_AUTH, items[0]!.id, { generated_at: FIXED_AT });
      assert.equal(detail.screenId, "notification-detail");
      const settings = service.getSettings(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(settings.screenId, "notification-settings");
    });

    it("supports back navigation without lifecycle mutation", () => {
      service.getList(USER_AUTH, { generated_at: FIXED_AT });
      const back = service.dispatchAction(USER_AUTH, { type: "back" }, { generated_at: FIXED_AT }) as {
        screen: { screenId: string };
        read_only: boolean;
      };
      assert.ok(back.screen);
      assert.equal(back.read_only, true);
    });

    it("returns handoff routes for all related experiences", () => {
      const need = service.dispatchAction(USER_AUTH, { type: "return-need-home" }) as { return_route: string };
      assert.equal(need.return_route, "/need/home");
      const action = service.dispatchAction(USER_AUTH, { type: "return-action-home" }) as { return_route: string };
      assert.equal(action.return_route, "/action/home");
      const contract = service.dispatchAction(USER_AUTH, { type: "return-contract" }) as { return_route: string };
      assert.equal(contract.return_route, "/contract/home");
      const chat = service.dispatchAction(USER_AUTH, { type: "return-chat" }) as { return_route: string };
      assert.equal(chat.return_route, "/chat/home");
      const timeline = service.dispatchAction(USER_AUTH, { type: "return-timeline" }) as { return_route: string };
      assert.equal(timeline.return_route, "/timeline/home");
    });

    it("refreshes display without delivery or persistence", () => {
      const refreshed = service.refresh(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(refreshed.read_only, true);
      assert.equal(refreshed.delivery, false);
      assert.ok(refreshed.notification_count > 0);
    });
  });

  describe("accessibility", () => {
    it("meets minimum touch target and navigation spec", () => {
      const service = createNotificationExperienceService({ repository: createNotificationRepository() });
      const screen = service.getHome(USER_AUTH, { generated_at: FIXED_AT, reduced_motion: true });
      assert.ok(screen.accessibility.minimumTouchTargetPx >= 44);
      assert.equal(screen.accessibility.supportsKeyboardNavigation, true);
      assert.equal(screen.accessibility.supportsScreenReader, true);
      assert.equal(NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx >= 44, true);
    });
  });

  describe("validation", () => {
    it("passes full notification experience runtime validation", () => {
      const result = validateNotificationExperience();
      assert.equal(result.valid, true, result.errors.join("; "));
      assert.equal(result.errors.length, 0);
      assert.equal(result.checked.screens, 6);
      assert.equal(result.checked.notificationTypes, 9);
      assert.equal(result.checked.filters, 7);
      assert.equal(result.checked.settingsOptions, 6);
      assert.equal(result.checked.timelineExperienceLink, true);
    });

    it("module factory exposes validate and service", () => {
      const mod = createAnActNotificationExperienceModule();
      assert.equal(mod.version, NOTIFICATION_EXPERIENCE_VERSION);
      assert.equal(mod.validate().valid, true);
      assert.ok(mod.notificationExperience.getFlow().flow.length >= 5);
      assert.equal(mod.notificationExperience.getFlow().delivery, false);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH3-X10", async () => {
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");
      assert.match(packageSource, /verify:ch3-x10/);
      assert.match(packageSource, /test:ch3-x10-notification-experience/);
    });

    it("registers notification experience routes module", async () => {
      const routesSource = await readFile(
        path.join(ROOT_DIR, "src/api/routes/notification-experience.ts"),
        "utf8"
      );
      assert.match(routesSource, /\/notification-experience/);
      assert.match(routesSource, /\/notification-experience\/list/);
      assert.match(routesSource, /\/notification-experience\/detail/);
      assert.match(routesSource, /\/notification-experience\/refresh/);
    });
  });
});
