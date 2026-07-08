import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerLivingPartnerEcosystemRoutes } from "../src/api/routes/living-partner-ecosystem.js";
import {
  LIVING_PARTNER_ECOSYSTEM_SCHEMA_VERSION,
  LIVING_PARTNER_ECOSYSTEM_SECTIONS,
  buildAllPartnerEcosystemSections,
  buildLivingPartnerEcosystemContext,
  buildLivingPartnerEcosystemExperience,
  createLivingPartnerEcosystemModule,
  validateLivingPartnerEcosystemContext,
} from "../src/living-experience/module.js";
import { collectLivingPartnerEcosystemEngineSnapshot } from "../src/living-experience/partner-ecosystem/application/partner-collector.js";
import { createDevelopMeModule } from "../src/develop-me/module.js";
import { createPersonalAssistantModule } from "../src/personal-assistant/module.js";
import { createLearnByActionModule } from "../src/learn-by-action/module.js";
import { createExpertNetworkModule } from "../src/expert-network/module.js";
import { createIntelligenceOrchestrationModule } from "../src/intelligence-orchestration/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch2-x8",
  roles: ["provider"],
  tier: "T2",
  status: "active",
  sessionId: "ch2-x8-user-session",
};

const ADMIN_AUTH: AuthContext = {
  userId: "admin-ch2-x8",
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "ch2-x8-admin-session",
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

describe("CH2-X8 living partner ecosystem experience", () => {
  describe("domain (unit)", () => {
    it("builds thirteen partner ecosystem sections deterministically", () => {
      const context = buildLivingPartnerEcosystemContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const engines = collectLivingPartnerEcosystemEngineSnapshot({
        authContext: USER_AUTH,
        context,
        engines: buildEngineDeps(),
      });

      const first = buildAllPartnerEcosystemSections(context, engines, {
        approved: [],
        pending: [],
        expired: [],
        permissionHistory: [],
      });
      const second = buildAllPartnerEcosystemSections(context, engines, {
        approved: [],
        pending: [],
        expired: [],
        permissionHistory: [],
      });

      assert.equal(first.length, 13);
      assert.deepEqual(first.map((s) => s.sectionId), second.map((s) => s.sectionId));
      assert.equal(first[0]?.sectionId, "todays_best_partner");
    });

    it("generates exactly one today's best partner", () => {
      const context = buildLivingPartnerEcosystemContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const best = buildAllPartnerEcosystemSections(context, {}, {
        approved: [],
        pending: [],
        expired: [],
        permissionHistory: [],
      }).find((s) => s.sectionId === "todays_best_partner");
      assert.ok(best && "why" in best);
      assert.ok(best.why.length > 10);
      assert.equal(best.partner.recommendationOnly, true);
    });

    it("implements training government financial and insurance partners", () => {
      const context = buildLivingPartnerEcosystemContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllPartnerEcosystemSections(context, {}, {
        approved: [],
        pending: [],
        expired: [],
        permissionHistory: [],
      });

      const training = sections.find((s) => s.sectionId === "training_partners");
      const government = sections.find((s) => s.sectionId === "government_partners");
      const financial = sections.find((s) => s.sectionId === "financial_partners");
      const insurance = sections.find((s) => s.sectionId === "insurance_partners");

      assert.ok(training && "partners" in training);
      assert.ok(training.partners.length >= 3);
      assert.ok(government && government.partners.every((p) => p.eligibility.length > 5));
      assert.ok(financial && financial.partners.every((p) => p.recommendationOnly));
      assert.ok(insurance && insurance.partners.every((p) => p.recommendationOnly));
    });

    it("implements certification and employment partners", () => {
      const context = buildLivingPartnerEcosystemContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllPartnerEcosystemSections(context, {}, {
        approved: [],
        pending: [],
        expired: [],
        permissionHistory: [],
      });

      const certification = sections.find((s) => s.sectionId === "certification_partners");
      const employment = sections.find((s) => s.sectionId === "employment_partners");

      assert.ok(certification && certification.partners.length >= 2);
      assert.ok(employment && employment.partners.length >= 3);
    });

    it("implements eligibility analysis with explainable results", () => {
      const context = buildLivingPartnerEcosystemContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const eligibility = buildAllPartnerEcosystemSections(context, {}, {
        approved: [],
        pending: [],
        expired: [],
        permissionHistory: [],
      }).find((s) => s.sectionId === "eligibility_analysis");
      assert.ok(eligibility && "eligibilityScore" in eligibility);
      assert.ok(eligibility.eligibilityScore >= 0);
      assert.ok(eligibility.explanations.length >= 3);
      assert.ok(eligibility.explanations.some((e) => /benefit|payment/i.test(e)));
    });

    it("implements connected partners with permission history", () => {
      const pending = [{
        partnerId: "partner://pending/1",
        name: "Training partner",
        category: "training",
        status: "pending" as const,
        connectedAt: FIXED_AT,
      }];
      const context = buildLivingPartnerEcosystemContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const connected = buildAllPartnerEcosystemSections(context, {}, {
        approved: [],
        pending,
        expired: [],
        permissionHistory: [{ partnerId: "partner://pending/1", action: "connection_requested", recordedAt: FIXED_AT, userInitiated: true }],
      }).find((s) => s.sectionId === "connected_partners");
      assert.ok(connected && connected.pending.length === 1);
      assert.ok(connected.permissionHistory.length === 1);
    });

    it("generates next recommended partner with effort estimate", () => {
      const context = buildLivingPartnerEcosystemContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const engines = collectLivingPartnerEcosystemEngineSnapshot({
        authContext: USER_AUTH,
        context,
        engines: buildEngineDeps(),
      });
      const next = buildAllPartnerEcosystemSections(context, engines, {
        approved: [],
        pending: [],
        expired: [],
        permissionHistory: [],
      }).find((s) => s.sectionId === "next_recommended_partner");
      assert.ok(next && "expectedBenefit" in next);
      assert.ok(next.estimatedEffortMinutes >= 45);
    });

    it("adapts partner ecosystem to geographic intelligence", () => {
      const context = buildLivingPartnerEcosystemContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const validation = validateLivingPartnerEcosystemContext(context);
      assert.equal(validation.valid, true);

      const government = buildAllPartnerEcosystemSections(context, {}, {
        approved: [],
        pending: [],
        expired: [],
        permissionHistory: [],
      }).find((s) => s.sectionId === "government_partners");
      assert.ok(government && government.partners.some((p) => /US|Austin|Texas/i.test(p.eligibility)));
    });
  });

  describe("service (unit)", () => {
    it("returns living partner ecosystem for authenticated users", () => {
      const { livingPartnerEcosystem } = createLivingPartnerEcosystemModule({ engines: buildEngineDeps() });
      const experience = livingPartnerEcosystem.getExperience(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(experience.schema_version, LIVING_PARTNER_ECOSYSTEM_SCHEMA_VERSION);
      assert.equal(experience.living, true);
      assert.equal(experience.sections.length, 13);
      assert.equal(experience.recommendations_only, true);
      assert.equal(experience.partners_execute, true);
      assert.match(experience.tagline, /best partner/i);
    });

    it("returns individual partner section endpoints", () => {
      const { livingPartnerEcosystem } = createLivingPartnerEcosystemModule({ engines: buildEngineDeps() });
      const training = livingPartnerEcosystem.getTraining(USER_AUTH);
      const eligibility = livingPartnerEcosystem.getEligibility(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(training.section_id, "training_partners");
      assert.ok((training.partners as unknown[]).length >= 3);
      assert.equal(eligibility.section_id, "eligibility_analysis");
      assert.ok(eligibility.eligibility_score >= 0);
    });

    it("connects partners only with user permission", () => {
      const { livingPartnerEcosystem } = createLivingPartnerEcosystemModule({ engines: buildEngineDeps() });
      livingPartnerEcosystem.getExperience(USER_AUTH, { generated_at: FIXED_AT });

      const denied = livingPartnerEcosystem.connectPartner(USER_AUTH, {
        partner_id: "partner://test/1",
        name: "Training partner",
        category: "training",
        user_permission_granted: false,
        generated_at: FIXED_AT,
      });
      assert.equal(denied.connected, null);

      const granted = livingPartnerEcosystem.connectPartner(USER_AUTH, {
        partner_id: "partner://test/1",
        name: "Training partner",
        category: "training",
        user_permission_granted: true,
        generated_at: FIXED_AT,
      });
      assert.ok(granted.connected);
      assert.equal(granted.partners_execute, true);

      const connected = livingPartnerEcosystem.getConnected(USER_AUTH, { generated_at: FIXED_AT });
      assert.ok((connected.pending as unknown[]).length >= 1);
    });

    it("refreshes experience without execution side effects", () => {
      const { livingPartnerEcosystem } = createLivingPartnerEcosystemModule({ engines: buildEngineDeps() });
      const refreshed = livingPartnerEcosystem.refresh(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(refreshed.refreshed, true);
      assert.equal(refreshed.experience.sections.length, 13);
      assert.equal(refreshed.recommendations_only, true);
    });

    it("restricts statistics to platform_admin", () => {
      const { livingPartnerEcosystem } = createLivingPartnerEcosystemModule({ engines: buildEngineDeps() });

      assert.throws(
        () => livingPartnerEcosystem.getStatistics(USER_AUTH),
        (error: unknown) => error instanceof AppError
      );

      livingPartnerEcosystem.getExperience(ADMIN_AUTH, { generated_at: FIXED_AT });
      const stats = livingPartnerEcosystem.getStatistics(ADMIN_AUTH);
      assert.ok(stats.total_experiences >= 1);
      assert.equal(stats.read_only, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH2-X8", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createLivingPartnerEcosystemModule/);
      assert.match(indexSource, /livingPartnerEcosystem/);
      assert.match(serverSource, /registerLivingPartnerEcosystemRoutes/);
      assert.match(serverSource, /livingPartnerEcosystem/);
      assert.match(packageSource, /verify:ch2-x8/);
      assert.match(packageSource, /test:ch2-x8-living-partner-ecosystem/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers living partner ecosystem routes", async () => {
      const { livingPartnerEcosystem } = createLivingPartnerEcosystemModule({ engines: buildEngineDeps() });
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", (request, _reply, done) => {
        request.authContext = USER_AUTH;
        done();
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerLivingPartnerEcosystemRoutes(app, livingPartnerEcosystem);

      const experience = await app.inject({ method: "GET", url: "/living-partner-ecosystem" });
      assert.equal(experience.statusCode, 200);
      const body = experience.json() as { living: boolean; sections: unknown[] };
      assert.equal(body.living, true);
      assert.equal(body.sections.length, 13);

      const best = await app.inject({ method: "GET", url: "/living-partner-ecosystem/best" });
      assert.equal(best.statusCode, 200);
      assert.equal((best.json() as { section_id: string }).section_id, "todays_best_partner");

      await app.close();
    });
  });
});

describe("CH2-X8 partner ecosystem catalog", () => {
  it("defines thirteen sections in layout order", () => {
    assert.equal(LIVING_PARTNER_ECOSYSTEM_SECTIONS.length, 13);
    assert.deepEqual(LIVING_PARTNER_ECOSYSTEM_SECTIONS.slice(0, 3), [
      "todays_best_partner",
      "training_partners",
      "government_partners",
    ]);
  });

  it("builds full living partner ecosystem aggregate", () => {
    const context = buildLivingPartnerEcosystemContext({
      authContext: USER_AUTH,
      onboarding: ONBOARDING,
      generatedAt: FIXED_AT,
    });
    const experience = buildLivingPartnerEcosystemExperience({ context, engines: {} });
    assert.equal(experience.living, true);
    assert.match(experience.tagline, /best partner/i);
  });
});
