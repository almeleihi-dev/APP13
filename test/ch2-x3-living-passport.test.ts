import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerLivingPassportRoutes } from "../src/api/routes/living-passport.js";
import {
  LIVING_PASSPORT_SCHEMA_VERSION,
  LIVING_PASSPORT_SECTIONS,
  buildAllPassportSections,
  buildLivingPassportContext,
  buildLivingProfessionalPassport,
  createLivingPassportModule,
  validateLivingPassportContext,
} from "../src/living-experience/module.js";
import { collectLivingPassportEngineSnapshot } from "../src/living-experience/professional-passport/application/passport-collector.js";
import { createDevelopMeModule } from "../src/develop-me/module.js";
import { createLearnByActionModule } from "../src/learn-by-action/module.js";
import { createExpertNetworkModule } from "../src/expert-network/module.js";
import { createTeamBuilderModule } from "../src/team-builder/module.js";
import { createKnowledgeBankModule } from "../src/knowledge-bank/module.js";
import { createPersonalAssistantModule } from "../src/personal-assistant/module.js";
import { createIntelligenceOrchestrationModule } from "../src/intelligence-orchestration/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch2-x3",
  roles: ["provider"],
  tier: "T2",
  status: "active",
  sessionId: "ch2-x3-user-session",
};

const ADMIN_AUTH: AuthContext = {
  userId: "admin-ch2-x3",
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "ch2-x3-admin-session",
};

const FIXED_AT = "2026-06-20T10:00:00.000Z";

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
    languages: ["English", "Spanish"],
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
};

function buildEngineDeps() {
  return {
    developMe: createDevelopMeModule().developMe,
    learnByAction: createLearnByActionModule().learnByAction,
    expertNetwork: createExpertNetworkModule().expertNetwork,
    teamBuilder: createTeamBuilderModule().teamBuilder,
    knowledgeBank: createKnowledgeBankModule().knowledgeBank,
    personalAssistant: createPersonalAssistantModule().personalAssistant,
    intelligenceOrchestration: createIntelligenceOrchestrationModule().intelligenceOrchestration,
  };
}

describe("CH2-X3 living professional passport experience", () => {
  describe("domain (unit)", () => {
    it("builds thirteen passport sections deterministically", () => {
      const context = buildLivingPassportContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const engines = collectLivingPassportEngineSnapshot({
        authContext: USER_AUTH,
        context,
        engines: buildEngineDeps(),
      });

      const first = buildAllPassportSections(context, engines, []);
      const second = buildAllPassportSections(context, engines, []);

      assert.equal(first.length, 13);
      assert.deepEqual(first.map((s) => s.sectionId), second.map((s) => s.sectionId));
      assert.equal(first[0]?.sectionId, "professional_identity");
    });

    it("explains professional score factors", () => {
      const context = buildLivingPassportContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllPassportSections(context, {}, []);
      const score = sections.find((s) => s.sectionId === "professional_score");
      assert.ok(score && "scoreExplanations" in score);
      assert.equal(score.scoreExplanations.length, 3);
      assert.equal(score.explainable, true);
    });

    it("integrates trust timeline with live frame milestones", () => {
      const context = buildLivingPassportContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const engines = collectLivingPassportEngineSnapshot({
        authContext: USER_AUTH,
        context,
        engines: buildEngineDeps(),
      });
      const sections = buildAllPassportSections(context, engines, []);
      const timeline = sections.find((s) => s.sectionId === "trust_timeline");
      assert.ok(timeline && "milestones" in timeline);
      assert.ok(timeline.milestones.some((m) => m.category === "passport"));
    });

    it("integrates knowledge bank contributions section", () => {
      const context = buildLivingPassportContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const engines = collectLivingPassportEngineSnapshot({
        authContext: USER_AUTH,
        context,
        engines: buildEngineDeps(),
      });
      const sections = buildAllPassportSections(context, engines, []);
      const knowledge = sections.find((s) => s.sectionId === "knowledge_contributions");
      assert.ok(knowledge && "knowledgeBankContributions" in knowledge);
      assert.ok(knowledge.knowledgeBankContributions.length >= 1);
    });

    it("adapts credentials to geographic regulations", () => {
      const context = buildLivingPassportContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const validation = validateLivingPassportContext(context);
      assert.equal(validation.valid, true);

      const credentials = buildAllPassportSections(context, {}, []).find(
        (s) => s.sectionId === "certificates_licenses"
      );
      assert.ok(credentials && "licenses" in credentials);
      assert.ok(credentials.memberships.length >= 1);
    });

    it("requires explicit approval for partner sharing", () => {
      const context = buildLivingPassportContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const withoutApproval = buildAllPassportSections(context, {}, []);
      const sharing = withoutApproval.find((s) => s.sectionId === "sharing_verification");
      assert.ok(sharing && "partnerVerificationEnabled" in sharing);
      assert.equal(sharing.partnerVerificationEnabled, false);

      const withApproval = buildAllPassportSections(context, {}, [
        {
          partnerType: "employer",
          partnerName: "BuildCo",
          approved: true,
          approvedAt: FIXED_AT,
        },
      ]);
      const sharingApproved = withApproval.find((s) => s.sectionId === "sharing_verification");
      assert.equal(sharingApproved?.partnerVerificationEnabled, true);
      assert.equal(sharingApproved?.employerViewEnabled, true);
    });
  });

  describe("service (unit)", () => {
    it("returns living passport for authenticated users", () => {
      const { livingPassport } = createLivingPassportModule({ engines: buildEngineDeps() });
      const passport = livingPassport.getPassport(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(passport.schema_version, LIVING_PASSPORT_SCHEMA_VERSION);
      assert.equal(passport.living, true);
      assert.equal(passport.lifetime_evolution, true);
      assert.equal(passport.sections.length, 13);
      assert.equal(passport.trust_first, true);
      assert.ok(passport.geographic.country);
    });

    it("returns individual section endpoints", () => {
      const { livingPassport } = createLivingPassportModule({ engines: buildEngineDeps() });
      const liveFrame = livingPassport.getLiveFrame(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(liveFrame.section_id, "live_frame");
      assert.ok(liveFrame.frame_history);
      assert.ok(liveFrame.progress_to_next_frame >= 0);
    });

    it("approves and revokes partner sharing explicitly", () => {
      const { livingPassport } = createLivingPassportModule({ engines: buildEngineDeps() });

      const approved = livingPassport.approvePartner(USER_AUTH, {
        partner_type: "training_partner",
        partner_name: "Skills Academy",
      });
      assert.equal(approved.approved, true);
      assert.equal(approved.explicit_approval_required, true);

      const partners = livingPassport.getPartners(USER_AUTH);
      assert.equal(partners.approved_partners.length, 1);

      livingPassport.revokePartner(USER_AUTH, {
        partner_type: "training_partner",
        partner_name: "Skills Academy",
      });
      const afterRevoke = livingPassport.getPartners(USER_AUTH);
      assert.equal(afterRevoke.approved_partners.length, 0);
    });

    it("refreshes passport without execution side effects", () => {
      const { livingPassport } = createLivingPassportModule({ engines: buildEngineDeps() });
      const refreshed = livingPassport.refresh(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(refreshed.refreshed, true);
      assert.equal(refreshed.passport.sections.length, 13);
      assert.equal(refreshed.experience_only, true);
    });

    it("restricts statistics to platform_admin", () => {
      const { livingPassport } = createLivingPassportModule({ engines: buildEngineDeps() });

      assert.throws(
        () => livingPassport.getStatistics(USER_AUTH),
        (error: unknown) => error instanceof AppError
      );

      livingPassport.getPassport(ADMIN_AUTH, { generated_at: FIXED_AT });
      const stats = livingPassport.getStatistics(ADMIN_AUTH);
      assert.ok(stats.total_passports >= 1);
      assert.equal(stats.read_only, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH2-X3", async () => {
      const indexSource = await readFile(path.join(ROOT_DIR, "src/index.ts"), "utf8");
      const serverSource = await readFile(path.join(ROOT_DIR, "src/api/server.ts"), "utf8");
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createLivingPassportModule/);
      assert.match(indexSource, /livingPassport/);
      assert.match(serverSource, /registerLivingPassportRoutes/);
      assert.match(serverSource, /livingPassport/);
      assert.match(packageSource, /verify:ch2-x3/);
      assert.match(packageSource, /test:ch2-x3-living-passport/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers living passport routes", async () => {
      const { livingPassport } = createLivingPassportModule({ engines: buildEngineDeps() });
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", (request, _reply, done) => {
        request.authContext = USER_AUTH;
        done();
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerLivingPassportRoutes(app, livingPassport);

      const passport = await app.inject({ method: "GET", url: "/living-passport" });
      assert.equal(passport.statusCode, 200);
      const body = passport.json() as { living: boolean; sections: unknown[] };
      assert.equal(body.living, true);
      assert.equal(body.sections.length, 13);

      const identity = await app.inject({ method: "GET", url: "/living-passport/identity" });
      assert.equal(identity.statusCode, 200);
      assert.equal((identity.json() as { section_id: string }).section_id, "professional_identity");

      await app.close();
    });
  });
});

describe("CH2-X3 passport catalog", () => {
  it("defines thirteen sections in layout order", () => {
    assert.equal(LIVING_PASSPORT_SECTIONS.length, 13);
    assert.deepEqual(LIVING_PASSPORT_SECTIONS.slice(0, 3), [
      "professional_identity",
      "professional_score",
      "live_frame",
    ]);
  });

  it("builds full living passport aggregate", () => {
    const context = buildLivingPassportContext({
      authContext: USER_AUTH,
      onboarding: ONBOARDING,
      generatedAt: FIXED_AT,
    });
    const passport = buildLivingProfessionalPassport({
      context,
      engines: {},
      approvedPartners: [],
    });
    assert.equal(passport.lifetimeEvolution, true);
    assert.match(passport.tagline, /One professional/);
  });
});
