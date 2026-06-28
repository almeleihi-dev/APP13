import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerLivingLiveFrameRoutes } from "../src/api/routes/living-live-frame.js";
import {
  LIVING_LIVE_FRAME_SCHEMA_VERSION,
  LIVING_LIVE_FRAME_SECTIONS,
  buildAllLiveFrameSections,
  buildLivingLiveFrameContext,
  buildLivingLiveFrameExperience,
  computeBaseTrustScore,
  createLivingLiveFrameModule,
  resolveFrameTier,
  validateLivingLiveFrameContext,
} from "../src/living-experience/module.js";
import { collectLivingLiveFrameEngineSnapshot } from "../src/living-experience/live-frame/application/live-frame-collector.js";
import { createDevelopMeModule } from "../src/develop-me/module.js";
import { createPersonalAssistantModule } from "../src/personal-assistant/module.js";
import { createLearnByActionModule } from "../src/learn-by-action/module.js";
import { createKnowledgeBankModule } from "../src/knowledge-bank/module.js";
import { createIntelligenceOrchestrationModule } from "../src/intelligence-orchestration/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch2-x4",
  roles: ["provider"],
  tier: "T2",
  status: "active",
  sessionId: "ch2-x4-user-session",
};

const ADMIN_AUTH: AuthContext = {
  userId: "admin-ch2-x4",
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "ch2-x4-admin-session",
};

const FIXED_AT = "2026-06-20T14:00:00.000Z";

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
    knowledgeBank: createKnowledgeBankModule().knowledgeBank,
    intelligenceOrchestration: createIntelligenceOrchestrationModule().intelligenceOrchestration,
  };
}

describe("CH2-X4 living live frame experience", () => {
  describe("domain (unit)", () => {
    it("builds thirteen live frame sections deterministically", () => {
      const context = buildLivingLiveFrameContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const engines = collectLivingLiveFrameEngineSnapshot({
        authContext: USER_AUTH,
        context,
        engines: buildEngineDeps(),
      });

      const first = buildAllLiveFrameSections(context, engines);
      const second = buildAllLiveFrameSections(context, engines);

      assert.equal(first.length, 13);
      assert.deepEqual(first.map((s) => s.sectionId), second.map((s) => s.sectionId));
      assert.equal(first[0]?.sectionId, "current_live_frame");
    });

    it("explains trust score with readable factors", () => {
      const context = buildLivingLiveFrameContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const trust = buildAllLiveFrameSections(context, {}).find((s) => s.sectionId === "trust_score");
      assert.ok(trust && "scoreExplanations" in trust);
      assert.equal(trust.scoreExplanations.length, 3);
      assert.ok(trust.scoreExplanations.every((e) => e.explanation.length > 10));
    });

    it("includes frame timeline and history", () => {
      const context = buildLivingLiveFrameContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllLiveFrameSections(context, {});
      const timeline = sections.find((s) => s.sectionId === "timeline");
      const history = sections.find((s) => s.sectionId === "frame_history");
      assert.ok(timeline && "events" in timeline);
      assert.ok(history && "upgradeHistory" in history);
      assert.ok(timeline.events.length >= 1);
    });

    it("projects future frame tier from recommendations", () => {
      const context = buildLivingLiveFrameContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const projection = buildAllLiveFrameSections(context, {}).find(
        (s) => s.sectionId === "future_projection"
      );
      assert.ok(projection && "projectedTier" in projection);
      assert.ok(projection.projectedTrustScore >= computeBaseTrustScore(context));
      assert.ok(projection.assumptions.length >= 2);
    });

    it("provides recommendation engine output", () => {
      const context = buildLivingLiveFrameContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const engines = collectLivingLiveFrameEngineSnapshot({
        authContext: USER_AUTH,
        context,
        engines: buildEngineDeps(),
      });
      const recommendations = buildAllLiveFrameSections(context, engines).find(
        (s) => s.sectionId === "recommendations"
      );
      assert.ok(recommendations && "recommendations" in recommendations);
      assert.ok(recommendations.recommendations.length >= 1);
      assert.ok(recommendations.recommendations[0]?.why);
    });

    it("adapts frame to geographic regulations", () => {
      const context = buildLivingLiveFrameContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const validation = validateLivingLiveFrameContext(context);
      assert.equal(validation.valid, true);

      const meaning = buildAllLiveFrameSections(context, {}).find((s) => s.sectionId === "frame_meaning");
      assert.ok(meaning && "regionalContext" in meaning);
      assert.match(meaning.regionalContext, /US|state|licensing/i);
    });
  });

  describe("service (unit)", () => {
    it("returns living live frame for authenticated users", () => {
      const { livingLiveFrame } = createLivingLiveFrameModule({ engines: buildEngineDeps() });
      const frame = livingLiveFrame.getFrame(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(frame.schema_version, LIVING_LIVE_FRAME_SCHEMA_VERSION);
      assert.equal(frame.living, true);
      assert.equal(frame.trust_first, true);
      assert.equal(frame.sections.length, 13);
      assert.ok(frame.current_tier);
      assert.ok(frame.trust_score >= 0);
    });

    it("returns individual section endpoints", () => {
      const { livingLiveFrame } = createLivingLiveFrameModule({ engines: buildEngineDeps() });
      const current = livingLiveFrame.getCurrent(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(current.section_id, "current_live_frame");
      assert.ok(current.color);
      assert.ok(current.professional_explanation);
    });

    it("refreshes frame without execution side effects", () => {
      const { livingLiveFrame } = createLivingLiveFrameModule({ engines: buildEngineDeps() });
      const refreshed = livingLiveFrame.refresh(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(refreshed.refreshed, true);
      assert.equal(refreshed.frame.sections.length, 13);
      assert.equal(refreshed.experience_only, true);
    });

    it("restricts statistics to platform_admin", () => {
      const { livingLiveFrame } = createLivingLiveFrameModule({ engines: buildEngineDeps() });

      assert.throws(
        () => livingLiveFrame.getStatistics(USER_AUTH),
        (error: unknown) => error instanceof AppError
      );

      livingLiveFrame.getFrame(ADMIN_AUTH, { generated_at: FIXED_AT });
      const stats = livingLiveFrame.getStatistics(ADMIN_AUTH);
      assert.ok(stats.total_users >= 1);
      assert.equal(stats.read_only, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH2-X4", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createLivingLiveFrameModule/);
      assert.match(indexSource, /livingLiveFrame/);
      assert.match(serverSource, /registerLivingLiveFrameRoutes/);
      assert.match(serverSource, /livingLiveFrame/);
      assert.match(packageSource, /verify:ch2-x4/);
      assert.match(packageSource, /test:ch2-x4-living-live-frame/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers living live frame routes", async () => {
      const { livingLiveFrame } = createLivingLiveFrameModule({ engines: buildEngineDeps() });
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", (request, _reply, done) => {
        request.authContext = USER_AUTH;
        done();
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerLivingLiveFrameRoutes(app, livingLiveFrame);

      const frame = await app.inject({ method: "GET", url: "/living-live-frame" });
      assert.equal(frame.statusCode, 200);
      const body = frame.json() as { living: boolean; sections: unknown[] };
      assert.equal(body.living, true);
      assert.equal(body.sections.length, 13);

      const projection = await app.inject({ method: "GET", url: "/living-live-frame/projection" });
      assert.equal(projection.statusCode, 200);
      assert.equal((projection.json() as { section_id: string }).section_id, "future_projection");

      await app.close();
    });
  });
});

describe("CH2-X4 frame catalog", () => {
  it("defines thirteen sections in layout order", () => {
    assert.equal(LIVING_LIVE_FRAME_SECTIONS.length, 13);
    assert.deepEqual(LIVING_LIVE_FRAME_SECTIONS.slice(0, 3), [
      "current_live_frame",
      "frame_meaning",
      "trust_score",
    ]);
  });

  it("resolves frame tier from trust score", () => {
    assert.equal(resolveFrameTier(90), "PLATINUM_ELITE");
    assert.equal(resolveFrameTier(60), "TRUSTED");
    assert.equal(resolveFrameTier(30), "WATCHLIST");
  });

  it("builds full living live frame aggregate", () => {
    const context = buildLivingLiveFrameContext({
      authContext: USER_AUTH,
      onboarding: ONBOARDING,
      generatedAt: FIXED_AT,
    });
    const experience = buildLivingLiveFrameExperience({ context, engines: {} });
    assert.equal(experience.living, true);
    assert.equal(experience.trustFirst, true);
    assert.match(experience.tagline, /trust identity/i);
  });
});
