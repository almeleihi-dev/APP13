import { describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import type { AuthContext } from "../src/shared/auth/index.js";
import {
  PROFILE_EXPERIENCE_VERSION,
  PROFILE_SCREEN_IDS,
  PROFILE_EXPERIENCE_FLOW,
  PROFILE_RUNTIME_FLOW,
  PROFILE_SECTION_IDS,
  PROFILE_SETTINGS_OPTIONS,
  validateProfileExperience,
  createAnActProfileExperienceModule,
  createProfileExperienceService,
  createProfileRepository,
  buildDefaultProfileSummary,
  buildProfileHomeScreen,
  buildProfileIdentityScreen,
  buildProfileLiveFrameScreen,
  buildProfileAchievementsScreen,
  buildProfileAnalyticsScreen,
  buildProfileHistoryScreen,
  buildProfileSettingsScreen,
  buildProfileEmptyStateScreen,
  buildProfileQuickStats,
} from "../src/runtime-experience/profile/module.js";
import { NEED_EXPERIENCE_VERSION } from "../src/runtime-experience/need/module.js";
import { ACTION_EXPERIENCE_VERSION } from "../src/runtime-experience/action/module.js";
import { CONTRACT_EXPERIENCE_VERSION } from "../src/runtime-experience/contract/module.js";
import { CHAT_EXPERIENCE_VERSION } from "../src/runtime-experience/chat/module.js";
import { TIMELINE_EXPERIENCE_VERSION } from "../src/runtime-experience/timeline/module.js";
import { NOTIFICATION_EXPERIENCE_VERSION } from "../src/runtime-experience/notification/module.js";
import { buildInitialNavigationState } from "../src/navigation-framework/module.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../src/navigation-framework/validation/navigation-validator.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-profile-exp-001",
  sessionId: "session-profile-exp-001",
  roles: ["customer"],
  scopes: [],
  authenticated: true,
};

const FIXED_AT = "2026-06-20T18:00:00.000Z";

describe("CH3-X11 AN ACT Profile Experience", () => {
  describe("domain", () => {
    it("defines profile screen ids and sections", () => {
      assert.equal(PROFILE_SCREEN_IDS.length, 8);
      assert.equal(PROFILE_SECTION_IDS.length, 6);
      assert.equal(PROFILE_SETTINGS_OPTIONS.length, 5);
      assert.ok(PROFILE_RUNTIME_FLOW.includes("Live Frame"));
      assert.ok(PROFILE_EXPERIENCE_FLOW.some((s) => s.screenId === "profile-home"));
    });

    it("builds default profile summary with required fields", () => {
      const summary = buildDefaultProfileSummary(USER_AUTH.userId);
      assert.equal(summary.id, USER_AUTH.userId);
      assert.ok(summary.displayName.length > 0);
      assert.ok(summary.professionalScore > 0);
      assert.ok(summary.trustScore > 0);
      assert.ok(summary.completionScore > 0);
      assert.ok(summary.badges.length > 0);
      assert.ok(summary.recommendations.length >= 0);
      assert.ok(summary.confidence > 0);
    });

    it("builds quick statistics from summary", () => {
      const summary = buildDefaultProfileSummary(USER_AUTH.userId);
      const stats = buildProfileQuickStats(summary);
      assert.equal(stats.length, 4);
      assert.ok(stats.some((s) => s.label === "Actions"));
    });
  });

  describe("presentation", () => {
    it("builds profile home with required sections", () => {
      const summary = createProfileRepository().getProfile(USER_AUTH.userId);
      const screen = buildProfileHomeScreen(
        summary,
        buildInitialNavigationState("/profile/home"),
        FIXED_AT
      );
      assert.equal(screen.screenId, "profile-home");
      assert.equal(screen.layoutId, "need-layout");
      const sectionIds = screen.sections.map((s) => s.id);
      assert.ok(sectionIds.includes("avatar"));
      assert.ok(sectionIds.includes("live-frame"));
      assert.ok(sectionIds.includes("verification-badges"));
      assert.ok(sectionIds.includes("scores"));
      assert.ok(sectionIds.includes("quick-statistics"));
      assert.ok(sectionIds.includes("recent-activity"));
    });

    it("builds profile identity with licenses and certifications", () => {
      const summary = createProfileRepository().getProfile(USER_AUTH.userId);
      const screen = buildProfileIdentityScreen(
        summary,
        buildInitialNavigationState("/profile/identity"),
        FIXED_AT
      );
      assert.equal(screen.screenId, "profile-identity");
      const sectionIds = screen.sections.map((s) => s.id);
      assert.ok(sectionIds.includes("licenses"));
      assert.ok(sectionIds.includes("certifications"));
      assert.ok(sectionIds.includes("member-since"));
    });

    it("builds live frame screen with progress", () => {
      const summary = createProfileRepository().getProfile(USER_AUTH.userId);
      const screen = buildProfileLiveFrameScreen(
        summary,
        buildInitialNavigationState("/profile/live-frame"),
        FIXED_AT
      );
      assert.equal(screen.screenId, "profile-live-frame");
      const sectionIds = screen.sections.map((s) => s.id);
      assert.ok(sectionIds.includes("current-frame"));
      assert.ok(sectionIds.includes("next-level-progress"));
      assert.ok(sectionIds.includes("ranking"));
    });

    it("builds achievements screen", () => {
      const summary = createProfileRepository().getProfile(USER_AUTH.userId);
      const screen = buildProfileAchievementsScreen(
        summary,
        buildInitialNavigationState("/profile/achievements"),
        FIXED_AT
      );
      assert.equal(screen.screenId, "profile-achievements");
      assert.ok(screen.sections.some((s) => s.id === "milestone-progress"));
    });

    it("builds analytics screen with chart placeholders", () => {
      const summary = createProfileRepository().getProfile(USER_AUTH.userId);
      const screen = buildProfileAnalyticsScreen(
        summary,
        buildInitialNavigationState("/profile/analytics"),
        FIXED_AT
      );
      assert.equal(screen.screenId, "profile-analytics");
      assert.ok(screen.sections.some((s) => s.id === "chart-placeholders"));
    });

    it("builds history screen with return links", () => {
      const summary = createProfileRepository().getProfile(USER_AUTH.userId);
      const screen = buildProfileHistoryScreen(
        summary,
        buildInitialNavigationState("/profile/history"),
        FIXED_AT
      );
      assert.equal(screen.screenId, "profile-history");
      assert.ok(screen.sections.some((s) => s.id === "return-links"));
    });

    it("uses core UI components without custom styling", () => {
      const screen = buildProfileEmptyStateScreen(
        buildInitialNavigationState("/profile/empty"),
        FIXED_AT
      );
      for (const section of screen.sections) {
        for (const component of section.components) {
          assert.ok(component.componentId.startsWith("core-ui-"));
        }
      }
    });
  });

  describe("service", () => {
    const service = createProfileExperienceService({ repository: createProfileRepository() });

    it("returns read-only profile experience", () => {
      const experience = service.getExperience(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(experience.version, PROFILE_EXPERIENCE_VERSION);
      assert.equal(experience.need_experience_version, NEED_EXPERIENCE_VERSION);
      assert.equal(experience.action_experience_version, ACTION_EXPERIENCE_VERSION);
      assert.equal(experience.contract_experience_version, CONTRACT_EXPERIENCE_VERSION);
      assert.equal(experience.chat_experience_version, CHAT_EXPERIENCE_VERSION);
      assert.equal(experience.timeline_experience_version, TIMELINE_EXPERIENCE_VERSION);
      assert.equal(experience.notification_experience_version, NOTIFICATION_EXPERIENCE_VERSION);
      assert.equal(experience.read_only, true);
      assert.equal(experience.persistence, false);
      assert.equal(experience.current_screen, "profile-home");
    });

    it("supports full profile navigation flow", () => {
      const home = service.getHome(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(home.screenId, "profile-home");
      const identity = service.getIdentity(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(identity.screenId, "profile-identity");
      const liveFrame = service.getLiveFrame(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(liveFrame.screenId, "profile-live-frame");
      const achievements = service.getAchievements(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(achievements.screenId, "profile-achievements");
      const analytics = service.getAnalytics(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(analytics.screenId, "profile-analytics");
      const history = service.getHistory(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(history.screenId, "profile-history");
      const settings = service.getSettings(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(settings.screenId, "profile-settings");
    });

    it("supports back navigation without mutation", () => {
      service.getIdentity(USER_AUTH, { generated_at: FIXED_AT });
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
      const timeline = service.dispatchAction(USER_AUTH, { type: "return-timeline" }) as { return_route: string };
      assert.equal(timeline.return_route, "/timeline/home");
      const notifications = service.dispatchAction(USER_AUTH, { type: "return-notifications" }) as { return_route: string };
      assert.equal(notifications.return_route, "/notification/home");
    });

    it("refreshes display without persistence", () => {
      const refreshed = service.refresh(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(refreshed.read_only, true);
      assert.equal(refreshed.persistence, false);
      assert.equal(refreshed.profile_id, USER_AUTH.userId);
    });
  });

  describe("accessibility", () => {
    it("meets minimum touch target and navigation spec", () => {
      const service = createProfileExperienceService({ repository: createProfileRepository() });
      const screen = service.getHome(USER_AUTH, { generated_at: FIXED_AT, reduced_motion: true });
      assert.ok(screen.accessibility.minimumTouchTargetPx >= 44);
      assert.equal(screen.accessibility.supportsKeyboardNavigation, true);
      assert.equal(screen.accessibility.supportsScreenReader, true);
      assert.equal(NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx >= 44, true);
    });
  });

  describe("validation", () => {
    it("passes full profile experience runtime validation", () => {
      const result = validateProfileExperience();
      assert.equal(result.valid, true, result.errors.join("; "));
      assert.equal(result.errors.length, 0);
      assert.equal(result.checked.screens, 8);
      assert.equal(result.checked.profileSections, 6);
      assert.equal(result.checked.settingsOptions, 5);
      assert.equal(result.checked.notificationExperienceLink, true);
    });

    it("module factory exposes validate and service", () => {
      const mod = createAnActProfileExperienceModule();
      assert.equal(mod.version, PROFILE_EXPERIENCE_VERSION);
      assert.equal(mod.validate().valid, true);
      assert.ok(mod.profileExperience.getFlow().flow.length >= 7);
      assert.equal(mod.profileExperience.getFlow().persistence, false);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH3-X11", async () => {
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");
      assert.match(packageSource, /verify:ch3-x11/);
      assert.match(packageSource, /test:ch3-x11-profile-experience/);
    });

    it("registers profile experience routes module", async () => {
      const routesSource = await readFile(path.join(ROOT_DIR, "src/api/routes/profile-experience.ts"), "utf8");
      assert.match(routesSource, /\/profile-experience/);
      assert.match(routesSource, /\/profile-experience\/identity/);
      assert.match(routesSource, /\/profile-experience\/live-frame/);
      assert.match(routesSource, /\/profile-experience\/refresh/);
    });
  });
});
