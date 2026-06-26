import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerLivingProfessionalIdentityRoutes } from "../src/api/routes/living-professional-identity.js";
import {
  LIVING_PROFESSIONAL_IDENTITY_SCHEMA_VERSION,
  LIVING_PROFESSIONAL_IDENTITY_SECTIONS,
  buildAllIdentitySections,
  buildDefaultSharingPermissions,
  buildLivingProfessionalIdentityContext,
  buildLivingProfessionalIdentityExperience,
  createLivingProfessionalIdentityModule,
  validateLivingProfessionalIdentityContext,
} from "../src/living-experience/module.js";
import { collectLivingProfessionalIdentityEngineSnapshot } from "../src/living-experience/professional-identity/application/identity-collector.js";
import { createDevelopMeModule } from "../src/develop-me/module.js";
import { createPersonalAssistantModule } from "../src/personal-assistant/module.js";
import { createLearnByActionModule } from "../src/learn-by-action/module.js";
import { createExpertNetworkModule } from "../src/expert-network/module.js";
import { createTeamBuilderModule } from "../src/team-builder/module.js";
import { createKnowledgeBankModule } from "../src/knowledge-bank/module.js";
import { createIntelligenceOrchestrationModule } from "../src/intelligence-orchestration/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch2-x13",
  roles: ["provider"],
  tier: "T2",
  status: "active",
  sessionId: "ch2-x13-user-session",
};

const ADMIN_AUTH: AuthContext = {
  userId: "admin-ch2-x13",
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "ch2-x13-admin-session",
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
    teamBuilder: createTeamBuilderModule().teamBuilder,
    knowledgeBank: createKnowledgeBankModule().knowledgeBank,
    intelligenceOrchestration: createIntelligenceOrchestrationModule().intelligenceOrchestration,
  };
}

describe("CH2-X13 living professional identity experience", () => {
  describe("domain (unit)", () => {
    it("builds thirteen identity sections deterministically", () => {
      const context = buildLivingProfessionalIdentityContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const engines = collectLivingProfessionalIdentityEngineSnapshot({
        authContext: USER_AUTH,
        context,
        engines: buildEngineDeps(),
      });
      const permissions = buildDefaultSharingPermissions(context);

      const first = buildAllIdentitySections(context, engines, permissions);
      const second = buildAllIdentitySections(context, engines, permissions);

      assert.equal(first.length, 13);
      assert.deepEqual(first.map((s) => s.sectionId), second.map((s) => s.sectionId));
      assert.equal(first[0]?.sectionId, "identity_summary");
    });

    it("generates identity summary with explainable score", () => {
      const context = buildLivingProfessionalIdentityContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const summary = buildAllIdentitySections(context, {}, buildDefaultSharingPermissions(context)).find(
        (s) => s.sectionId === "identity_summary"
      );
      assert.ok(summary && summary.explanation.length > 20);
      assert.ok(summary.identityScore >= 0 && summary.identityScore <= 98);
      assert.ok(summary.professionalIntroduction.includes("Austin"));
    });

    it("generates professional dna with styles", () => {
      const context = buildLivingProfessionalIdentityContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const dna = buildAllIdentitySections(context, {}, buildDefaultSharingPermissions(context)).find(
        (s) => s.sectionId === "professional_dna"
      );
      assert.ok(dna && dna.naturalStrengths.length >= 1);
      assert.ok(dna.leadershipStyle.length > 5);
    });

    it("integrates passport live frame journey and impact sections", () => {
      const context = buildLivingProfessionalIdentityContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllIdentitySections(context, {}, buildDefaultSharingPermissions(context));

      assert.ok(sections.find((s) => s.sectionId === "professional_passport"));
      assert.ok(sections.find((s) => s.sectionId === "live_frame"));
      assert.ok(sections.find((s) => s.sectionId === "professional_journey"));
      assert.ok(sections.find((s) => s.sectionId === "professional_impact"));
    });

    it("implements verified skills and professional strengths", () => {
      const context = buildLivingProfessionalIdentityContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllIdentitySections(context, {}, buildDefaultSharingPermissions(context));

      const skills = sections.find((s) => s.sectionId === "verified_skills");
      const strengths = sections.find((s) => s.sectionId === "professional_strengths");

      assert.ok(skills && skills.verified.length >= 1);
      assert.ok(strengths && strengths.topStrengths.length >= 1);
    });

    it("implements opportunities reputation and network sections", () => {
      const context = buildLivingProfessionalIdentityContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sections = buildAllIdentitySections(context, {}, buildDefaultSharingPermissions(context));

      assert.ok(sections.find((s) => s.sectionId === "professional_opportunities"));
      assert.ok(sections.find((s) => s.sectionId === "professional_reputation"));
      const network = sections.find((s) => s.sectionId === "professional_network");
      assert.ok(network && network.experts.length >= 1);
    });

    it("implements future identity with assumptions", () => {
      const context = buildLivingProfessionalIdentityContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const future = buildAllIdentitySections(context, {}, buildDefaultSharingPermissions(context)).find(
        (s) => s.sectionId === "future_identity"
      );
      assert.ok(future && future.assumptions.length >= 3);
      assert.ok(future.thirtyDays.length > 5);
    });

    it("implements identity sharing with permission-based views", () => {
      const context = buildLivingProfessionalIdentityContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const sharing = buildAllIdentitySections(context, {}, buildDefaultSharingPermissions(context)).find(
        (s) => s.sectionId === "identity_sharing"
      );
      assert.ok(sharing && sharing.permissionBased === true);
      assert.ok(sharing.professionalQr.includes("app13://identity/"));
      assert.equal(sharing.permissionManagement.publicView, false);
      assert.equal(sharing.permissionManagement.privateView, true);
    });

    it("adapts identity to geographic intelligence", () => {
      const context = buildLivingProfessionalIdentityContext({
        authContext: USER_AUTH,
        onboarding: ONBOARDING,
        generatedAt: FIXED_AT,
      });
      const validation = validateLivingProfessionalIdentityContext(context);
      assert.equal(validation.valid, true);

      const opportunities = buildAllIdentitySections(context, {}, buildDefaultSharingPermissions(context)).find(
        (s) => s.sectionId === "professional_opportunities"
      );
      assert.ok(opportunities && opportunities.governmentOpportunities.length >= 1);
    });
  });

  describe("service (unit)", () => {
    it("returns living identity experience for authenticated users", () => {
      const { livingProfessionalIdentity } = createLivingProfessionalIdentityModule({ engines: buildEngineDeps() });
      const experience = livingProfessionalIdentity.getExperience(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(experience.schema_version, LIVING_PROFESSIONAL_IDENTITY_SCHEMA_VERSION);
      assert.equal(experience.living, true);
      assert.equal(experience.sections.length, 13);
      assert.equal(experience.unified_identity, true);
      assert.equal(experience.never_fabricate_achievements, true);
      assert.equal(experience.permission_based, true);
    });

    it("returns individual identity section endpoints", () => {
      const { livingProfessionalIdentity } = createLivingProfessionalIdentityModule({ engines: buildEngineDeps() });
      const summary = livingProfessionalIdentity.getSummary(USER_AUTH);
      const dna = livingProfessionalIdentity.getDna(USER_AUTH);

      assert.equal(summary.section_id, "identity_summary");
      assert.equal(dna.section_id, "professional_dna");
      assert.ok(summary.explanation);
    });

    it("updates sharing permissions with explicit user consent", () => {
      const { livingProfessionalIdentity } = createLivingProfessionalIdentityModule({ engines: buildEngineDeps() });
      livingProfessionalIdentity.getExperience(USER_AUTH, { generated_at: FIXED_AT });

      const updated = livingProfessionalIdentity.updateSharingPermissions(USER_AUTH, {
        public_view: true,
        partner_view: true,
        generated_at: FIXED_AT,
      });
      assert.equal(updated.updated, true);
      assert.equal(updated.permissions.public_view, true);
      assert.equal(updated.permission_based, true);

      const sharing = livingProfessionalIdentity.getSharing(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal((sharing.permission_management as { public_view: boolean }).public_view, true);
    });

    it("refreshes experience without changing identity automatically", () => {
      const { livingProfessionalIdentity } = createLivingProfessionalIdentityModule({ engines: buildEngineDeps() });
      const refreshed = livingProfessionalIdentity.refresh(USER_AUTH, { generated_at: FIXED_AT });

      assert.equal(refreshed.refreshed, true);
      assert.equal(refreshed.never_change_identity_automatically, true);
      assert.equal(refreshed.experience.sections.length, 13);
    });

    it("restricts statistics to platform_admin", () => {
      const { livingProfessionalIdentity } = createLivingProfessionalIdentityModule({ engines: buildEngineDeps() });

      assert.throws(
        () => livingProfessionalIdentity.getStatistics(USER_AUTH),
        (error: unknown) => error instanceof AppError
      );

      livingProfessionalIdentity.getExperience(ADMIN_AUTH, { generated_at: FIXED_AT });
      const stats = livingProfessionalIdentity.getStatistics(ADMIN_AUTH);
      assert.ok(stats.total_experiences >= 1);
      assert.equal(stats.read_only, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH2-X13", async () => {
      const indexSource = await readFile(path.join(ROOT_DIR, "src/index.ts"), "utf8");
      const serverSource = await readFile(path.join(ROOT_DIR, "src/api/server.ts"), "utf8");
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createLivingProfessionalIdentityModule/);
      assert.match(indexSource, /livingProfessionalIdentity/);
      assert.match(serverSource, /registerLivingProfessionalIdentityRoutes/);
      assert.match(serverSource, /livingProfessionalIdentity/);
      assert.match(packageSource, /verify:ch2-x13/);
      assert.match(packageSource, /test:ch2-x13-living-professional-identity/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers living professional identity routes", async () => {
      const { livingProfessionalIdentity } = createLivingProfessionalIdentityModule({ engines: buildEngineDeps() });
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", (request, _reply, done) => {
        request.authContext = USER_AUTH;
        done();
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerLivingProfessionalIdentityRoutes(app, livingProfessionalIdentity);

      const experience = await app.inject({ method: "GET", url: "/living-professional-identity" });
      assert.equal(experience.statusCode, 200);
      const body = experience.json() as {
        living: boolean;
        sections: unknown[];
        unified_identity: boolean;
      };
      assert.equal(body.living, true);
      assert.equal(body.sections.length, 13);
      assert.equal(body.unified_identity, true);

      const summary = await app.inject({ method: "GET", url: "/living-professional-identity/summary" });
      assert.equal(summary.statusCode, 200);
      assert.equal((summary.json() as { section_id: string }).section_id, "identity_summary");

      await app.close();
    });
  });
});

describe("CH2-X13 professional identity catalog", () => {
  it("defines thirteen sections in layout order", () => {
    assert.equal(LIVING_PROFESSIONAL_IDENTITY_SECTIONS.length, 13);
    assert.deepEqual(LIVING_PROFESSIONAL_IDENTITY_SECTIONS.slice(0, 3), [
      "identity_summary",
      "professional_dna",
      "professional_passport",
    ]);
  });

  it("builds full living professional identity aggregate", () => {
    const context = buildLivingProfessionalIdentityContext({
      authContext: USER_AUTH,
      onboarding: ONBOARDING,
      generatedAt: FIXED_AT,
    });
    const experience = buildLivingProfessionalIdentityExperience({
      context,
      engines: {},
      permissions: buildDefaultSharingPermissions(context),
    });
    assert.equal(experience.living, true);
    assert.match(experience.tagline, /professional digital identity/i);
  });
});
