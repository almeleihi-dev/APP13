import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerLivingTodayIActedRoutes } from "../src/api/routes/living-today-i-acted.js";
import {
  LIVING_TODAY_I_ACTED_SCHEMA_VERSION,
  LIVING_TODAY_I_ACTED_SECTIONS,
  buildAllActedSections,
  buildLivingTodayIActedContext,
  buildLivingTodayIActedExperience,
  createLivingTodayIActedModule,
  validateLivingTodayIActedContext,
} from "../src/living-experience/module.js";
import { collectLivingTodayIActedEngineSnapshot } from "../src/living-experience/today-i-acted/application/acted-collector.js";
import { createDevelopMeModule } from "../src/develop-me/module.js";
import { createPersonalAssistantModule } from "../src/personal-assistant/module.js";
import { createLearnByActionModule } from "../src/learn-by-action/module.js";
import { createExpertNetworkModule } from "../src/expert-network/module.js";
import { createIntelligenceOrchestrationModule } from "../src/intelligence-orchestration/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch2-x6",
  roles: ["provider"],
  tier: "T2",
  status: "active",
  sessionId: "ch2-x6-user-session",
};

const ADMIN_AUTH: AuthContext = {
  userId: "admin-ch2-x6",
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "ch2-x6-admin-session",
};

const FIXED_AT = "2026-06-20T16:00:00.000Z";

const ONBOARDING = {
  account: { displayName: "Alex Rivera", email: "alex@app13.dev" },
  ironVerification: {
    identityConfirmed: true,
    phoneVerified: true,
    emailVerified: true,
    governmentVerificationStatus: "not_started" as const,
  },
  geographicIntelligence: {
    country: "US",
    city: "Austin",
    preferredWorkRegion: "Texas Gulf Coast",
    languages: ["English"],
    currency: "USD",
    legalEnvironment: "US commercial",
    professionalRegulations: ["state_licensing"],
  },
  professionalBackground: {
    skills: ["project_coordination", "safety_compliance"],
    certificates: ["OSHA_30"],
    licenses: ["general_contractor"],
    experienceYears: 8,
    industries: ["construction"],
    favoriteActivities: ["site_supervision"],
  },
  professionalStory: {
    proudestAchievement: "Led a zero-incident hospital renovation.",
    careerChangingProject: "Multi-site retrofit leadership project.",
    preferredWorkType: "On-site supervision.",
  },
  smartQuestions: {
    enjoyedAction: "project_supervision",
    requestedAction: "project_supervision",
    masterAction: "advanced_project_management",
    enjoysLeading: true,
    prefersAlone: false,
    enjoysTeaching: true,
    enjoysConsulting: false,
    enjoysBuilding: true,
    enjoysReviewing: true,
  },
  professionalCalibration: {
    missions: [
      { missionId: "strongest_skill", response: "coordination", score: 85 },
      { missionId: "learning_ability", response: "quick", score: 80 },
      { missionId: "professional_behavior", response: "reliable", score: 90 },
    ],
  },
};

function buildEngineDeps() {
  return {
    developMe: createDevelopMeModule().developMe,
    personalAssistant: createPersonalAssistantModule().personalAssistant,
    learnByAction: createLearnByActionModule().learnByAction,
    expertNetwork: createExpertNetworkModule().expertNetwork,
    intelligenceOrchestration: createIntelligenceOrchestrationModule().intelligenceOrchestration,
  };
}

describe("CH2-X6 living today i acted experience", () => {
  describe("domain (unit)", () => {
    it("builds thirteen daily sections deterministically", () => {
      const context = buildLivingTodayIActedContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const engines = collectLivingTodayIActedEngineSnapshot({
        authContext: USER_AUTH,
        context,
        engines: buildEngineDeps(),
      });

      const first = buildAllActedSections(context, engines);
      const second = buildAllActedSections(context, engines);

      assert.equal(first.length, 13);
      assert.deepEqual(first.map((s) => s.sectionId), second.map((s) => s.sectionId));
      assert.equal(first[0]?.sectionId, "todays_summary");
    });

    it("generates automatic professional story in human language", () => {
      const context = buildLivingTodayIActedContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const story = buildAllActedSections(context, {}).find((s) => s.sectionId === "todays_story");
      assert.ok(story && "story" in story);
      assert.ok(story.story.length > 50);
      assert.ok(!/engine|orchestration|snapshot/i.test(story.story));
    });

    it("implements daily achievements and learning sections", () => {
      const context = buildLivingTodayIActedContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllActedSections(context, {});

      const achievements = sections.find((s) => s.sectionId === "todays_achievements");
      const learning = sections.find((s) => s.sectionId === "todays_learning");

      assert.ok(achievements && "milestones" in achievements);
      assert.ok(achievements.milestones.length >= 1);
      assert.ok(learning && "skillsLearned" in learning);
    });

    it("stores professional memory with never-deleted policy", () => {
      const context = buildLivingTodayIActedContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const memory = buildAllActedSections(context, {}).find((s) => s.sectionId === "professional_memory");
      assert.ok(memory && "todayEntry" in memory);
      assert.equal(memory.retentionPolicy, "never_deleted_automatically");
      assert.equal(memory.searchable, true);
      assert.ok(memory.todayEntry.searchableText.includes("austin"));
    });

    it("provides share-ready story with image metadata", () => {
      const context = buildLivingTodayIActedContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const share = buildAllActedSections(context, {}).find((s) => s.sectionId === "share_story");
      assert.ok(share && "imageMetadata" in share);
      assert.equal(share.imageMetadata.title, "Today I Acted");
      assert.ok(share.branding.watermark.length > 0);
      assert.ok(!/engine|develop_me/i.test(share.shareableStory));
    });

    it("implements evidence builder requiring user permission", () => {
      const context = buildLivingTodayIActedContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const evidence = buildAllActedSections(context, {}).find((s) => s.sectionId === "evidence_builder");
      assert.ok(evidence && "drafts" in evidence);
      assert.equal(evidence.permissionRequired, true);
      assert.ok(evidence.drafts.every((d) => d.requiresPermission));
    });

    it("generates exactly one tomorrow recommendation", () => {
      const context = buildLivingTodayIActedContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const engines = collectLivingTodayIActedEngineSnapshot({
        authContext: USER_AUTH,
        context,
        engines: buildEngineDeps(),
      });
      const tomorrow = buildAllActedSections(context, engines).find((s) => s.sectionId === "tomorrows_suggestion");
      assert.ok(tomorrow && "recommendation" in tomorrow);
      assert.ok(tomorrow.why.length > 10);
      assert.ok(tomorrow.estimatedMinutes >= 30);
    });

    it("adapts daily experience to geographic intelligence", () => {
      const context = buildLivingTodayIActedContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const validation = validateLivingTodayIActedContext(context);
      assert.equal(validation.valid, true);

      const story = buildAllActedSections(context, {}).find((s) => s.sectionId === "todays_story");
      assert.ok(story && "story" in story);
      assert.ok(story.story.includes("Austin"));
    });
  });

  describe("service (unit)", () => {
    it("returns living daily experience for authenticated users", () => {
      const { livingTodayIActed } = createLivingTodayIActedModule({ engines: buildEngineDeps() });
      const experience = livingTodayIActed.getExperience(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(experience.schema_version, LIVING_TODAY_I_ACTED_SCHEMA_VERSION);
      assert.equal(experience.living, true);
      assert.equal(experience.sections.length, 13);
      assert.match(experience.tagline, /professional story/i);
    });

    it("returns share story and evidence builder endpoints", () => {
      const { livingTodayIActed } = createLivingTodayIActedModule({ engines: buildEngineDeps() });
      const share = livingTodayIActed.getShareStory(USER_AUTH, { generated_at: FIXED_AT });
      const evidence = livingTodayIActed.getEvidenceBuilder(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(share.section_id, "share_story");
      assert.ok(share.image_metadata);
      assert.equal(evidence.section_id, "evidence_builder");
      assert.ok(evidence.drafts.length >= 1);
    });

    it("builds evidence only with user permission", () => {
      const { livingTodayIActed } = createLivingTodayIActedModule({ engines: buildEngineDeps() });
      livingTodayIActed.getExperience(USER_AUTH, { generated_at: FIXED_AT });
      const builder = livingTodayIActed.getEvidenceBuilder(USER_AUTH, { generated_at: FIXED_AT });
      const draftId = (builder.drafts as Array<{ evidence_id: string }>)[0]?.evidence_id;
      assert.ok(draftId);

      const denied = livingTodayIActed.buildEvidence(USER_AUTH, {
        evidence_id: draftId,
        user_permission_granted: false,
        generated_at: FIXED_AT,
      });
      assert.equal(denied.permissionGranted, false);

      const granted = livingTodayIActed.buildEvidence(USER_AUTH, {
        evidence_id: draftId,
        user_permission_granted: true,
        generated_at: FIXED_AT,
      });
      assert.equal(granted.permissionGranted, true);
      assert.equal(granted.experience_only, true);
    });

    it("searches professional memory chronologically", () => {
      const { livingTodayIActed } = createLivingTodayIActedModule({ engines: buildEngineDeps() });
      livingTodayIActed.getExperience(USER_AUTH, { generated_at: FIXED_AT });

      const all = livingTodayIActed.searchMemory(USER_AUTH, "");
      assert.ok(all.count >= 1);
      assert.equal(all.retention_policy, "never_deleted_automatically");

      const filtered = livingTodayIActed.searchMemory(USER_AUTH, "2026-06-20");
      assert.ok(filtered.count >= 1);
    });

    it("refreshes experience without execution side effects", () => {
      const { livingTodayIActed } = createLivingTodayIActedModule({ engines: buildEngineDeps() });
      const refreshed = livingTodayIActed.refresh(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(refreshed.refreshed, true);
      assert.equal(refreshed.experience.sections.length, 13);
      assert.equal(refreshed.experience_only, true);
    });

    it("restricts statistics to platform_admin", () => {
      const { livingTodayIActed } = createLivingTodayIActedModule({ engines: buildEngineDeps() });

      assert.throws(
        () => livingTodayIActed.getStatistics(USER_AUTH),
        (error: unknown) => error instanceof AppError
      );

      livingTodayIActed.getExperience(ADMIN_AUTH, { generated_at: FIXED_AT });
      const stats = livingTodayIActed.getStatistics(ADMIN_AUTH);
      assert.ok(stats.total_experiences >= 1);
      assert.equal(stats.read_only, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH2-X6", async () => {
      const indexSource = await readFile(path.join(ROOT_DIR, "src/index.ts"), "utf8");
      const serverSource = await readFile(path.join(ROOT_DIR, "src/api/server.ts"), "utf8");
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createLivingTodayIActedModule/);
      assert.match(indexSource, /livingTodayIActed/);
      assert.match(serverSource, /registerLivingTodayIActedRoutes/);
      assert.match(serverSource, /livingTodayIActed/);
      assert.match(packageSource, /verify:ch2-x6/);
      assert.match(packageSource, /test:ch2-x6-living-today-i-acted/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers living today i acted routes", async () => {
      const { livingTodayIActed } = createLivingTodayIActedModule({ engines: buildEngineDeps() });
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", (request, _reply, done) => {
        request.authContext = USER_AUTH;
        done();
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerLivingTodayIActedRoutes(app, livingTodayIActed);

      const experience = await app.inject({ method: "GET", url: "/living-today-i-acted" });
      assert.equal(experience.statusCode, 200);
      const body = experience.json() as { living: boolean; sections: unknown[] };
      assert.equal(body.living, true);
      assert.equal(body.sections.length, 13);

      const story = await app.inject({ method: "GET", url: "/living-today-i-acted/story" });
      assert.equal(story.statusCode, 200);
      assert.equal((story.json() as { section_id: string }).section_id, "todays_story");

      await app.close();
    });
  });
});

describe("CH2-X6 today i acted catalog", () => {
  it("defines thirteen sections in layout order", () => {
    assert.equal(LIVING_TODAY_I_ACTED_SECTIONS.length, 13);
    assert.deepEqual(LIVING_TODAY_I_ACTED_SECTIONS.slice(0, 3), [
      "todays_summary",
      "todays_actions",
      "todays_story",
    ]);
  });

  it("builds full living daily experience aggregate", () => {
    const context = buildLivingTodayIActedContext({
      authContext: USER_AUTH,
      onboarding: ONBOARDING,
      generatedAt: FIXED_AT,
    });
    const experience = buildLivingTodayIActedExperience({ context, engines: {} });
    assert.equal(experience.living, true);
    assert.match(experience.tagline, /professional story/i);
  });
});
