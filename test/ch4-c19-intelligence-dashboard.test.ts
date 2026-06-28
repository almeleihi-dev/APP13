import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerIntelligenceDashboardRoutes } from "../src/api/routes/intelligence-dashboard.js";
import {
  INTELLIGENCE_DASHBOARD_SCHEMA_VERSION,
  INTELLIGENCE_DASHBOARD_SCENARIO_IDS,
  INTELLIGENCE_DASHBOARD_SCENARIO_TO_CANONICAL,
  INTELLIGENCE_DASHBOARD_CHAIN,
  createIntelligenceDashboardModule,
  createIntelligenceHealthBuilder,
  createTimelineBuilder,
  createDashboardConfidenceBuilder,
  createIntelligenceDashboardValidator,
} from "../src/intelligence-dashboard/module.js";
import { createActionIntelligenceExperienceModule } from "../src/action-intelligence-experience/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch4-c19",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch4-c19-user-session",
};

describe("CH4-C19 intelligence dashboard", () => {
  describe("domain (unit)", () => {
    it("provides dashboard scenarios aligned with C1 through C18", () => {
      assert.equal(INTELLIGENCE_DASHBOARD_SCENARIO_IDS.length, 5);
      for (const scenarioId of INTELLIGENCE_DASHBOARD_SCENARIO_IDS) {
        assert.ok(
          INTELLIGENCE_DASHBOARD_SCENARIO_TO_CANONICAL[scenarioId],
          `missing canonical for ${scenarioId}`
        );
      }
      assert.equal(INTELLIGENCE_DASHBOARD_CHAIN.length, 19);
      assert.ok(INTELLIGENCE_DASHBOARD_CHAIN.includes("intelligence_dashboard"));
    });

    it("builds intelligence health from experience output deterministically", () => {
      const { actionIntelligenceExperience } = createActionIntelligenceExperienceModule();
      const experience = actionIntelligenceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const builder = createIntelligenceHealthBuilder();

      const first = builder.build(experience);
      const second = builder.build(experience);
      assert.deepEqual(first, second);
      assert.ok(["healthy", "stable", "attention", "critical"].includes(first.status));
    });

    it("builds end-to-end intelligence timeline deterministically", () => {
      const { actionIntelligenceExperience } = createActionIntelligenceExperienceModule();
      const experience = actionIntelligenceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      const timeline = createTimelineBuilder().build(experience);
      assert.equal(timeline.length, 16);
      assert.equal(timeline[0]!.layerKey, "intent");
    });

    it("generates dashboard confidence from experience and health scores", () => {
      const { intelligenceDashboard } = createIntelligenceDashboardModule();
      const output = intelligenceDashboard.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      const { actionIntelligenceExperience } = createActionIntelligenceExperienceModule();
      const experience = actionIntelligenceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });

      const confidence = createDashboardConfidenceBuilder().build(
        experience,
        output.intelligenceHealth.score
      );
      assert.ok(["low", "medium", "high"].includes(confidence.level));
      assert.equal(confidence.experienceConfidenceScore, experience.experienceConfidence.score);
    });

    it("validates dashboard outputs for all scenarios", () => {
      const { intelligenceDashboard } = createIntelligenceDashboardModule();
      const validator = createIntelligenceDashboardValidator();

      for (const scenarioId of INTELLIGENCE_DASHBOARD_SCENARIO_IDS) {
        const output = intelligenceDashboard.buildOutputForValidation(USER_AUTH, {
          scenario_id: scenarioId,
        });
        assert.equal(output.readOnly, true);
        assert.ok(output.experienceOutputId.startsWith("experience-"));
        assert.equal(output.timeline.length, 16);
        assert.ok(output.executiveSummary.headline.length > 0);

        const report = validator.validateOutput(output);
        assert.equal(report.valid, true, `invalid dashboard for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns intelligence dashboard home for authenticated users", () => {
      const { intelligenceDashboard } = createIntelligenceDashboardModule();
      const home = intelligenceDashboard.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.ok(home.dashboard_chain.includes("intelligence_dashboard"));
      assert.ok(home.available_panels.includes("Executive Overview"));
    });

    it("rejects unauthenticated access", () => {
      const { intelligenceDashboard } = createIntelligenceDashboardModule();
      assert.throws(
        () => intelligenceDashboard.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic dashboard outputs for the same scenario", () => {
      const { intelligenceDashboard } = createIntelligenceDashboardModule();
      const first = intelligenceDashboard.getExecutiveOverview(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const second = intelligenceDashboard.getExecutiveOverview(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      assert.deepEqual(first.executive_overview, second.executive_overview);
    });

    it("links dashboard output to action intelligence experience", () => {
      const { intelligenceDashboard } = createIntelligenceDashboardModule();
      const output = intelligenceDashboard.buildOutputForValidation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.match(output.experienceOutputId, /^experience-/);
      assert.match(output.orchestrationOutputId, /^orchestration-/);
      assert.match(output.strategyOutputId, /^strategy-/);
    });

    it("includes layer overviews for trust strategy and evolution", () => {
      const { intelligenceDashboard } = createIntelligenceDashboardModule();
      const trust = intelligenceDashboard.getTrust(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      const strategy = intelligenceDashboard.getStrategy(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      const evolution = intelligenceDashboard.getEvolution(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.equal(trust.layer_overview.layerKey, "trust_intelligence");
      assert.equal(strategy.layer_overview.layerKey, "strategy_intelligence");
      assert.equal(evolution.layer_overview.layerKey, "evolution_intelligence");
    });

    it("delegates upstream only through action intelligence experience", () => {
      const { intelligenceDashboard } = createIntelligenceDashboardModule();
      const timeline = intelligenceDashboard.getTimeline(USER_AUTH, {
        scenario_id: "preparing_professional_service_request",
      });
      assert.equal(timeline.read_only, true);
      assert.equal(timeline.timeline.length, 16);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH4-C19", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createIntelligenceDashboardModule/);
      assert.match(indexSource, /intelligenceDashboard/);
      assert.match(serverSource, /registerIntelligenceDashboardRoutes/);
      assert.match(serverSource, /intelligenceDashboard/);
      assert.match(packageSource, /verify:ch4-c19/);
      assert.match(packageSource, /test:ch4-c19-intelligence-dashboard/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers intelligence dashboard routes behind auth middleware", async () => {
      const { intelligenceDashboard } = createIntelligenceDashboardModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerIntelligenceDashboardRoutes(app, intelligenceDashboard);

      const home = await app.inject({ method: "GET", url: "/intelligence-dashboard" });
      assert.equal(home.statusCode, 200);

      const overview = await app.inject({
        method: "GET",
        url: "/intelligence-dashboard/overview?scenario_id=moving_a_room",
      });
      assert.equal(overview.statusCode, 200);
      const overviewBody = overview.json() as {
        executive_overview: { headline: string };
        read_only: boolean;
      };
      assert.equal(overviewBody.read_only, true);
      assert.equal(overviewBody.executive_overview.headline, "Executive Intelligence Overview");

      const health = await app.inject({
        method: "GET",
        url: "/intelligence-dashboard/health?scenario_id=cleaning_an_apartment",
      });
      assert.equal(health.statusCode, 200);

      const strategy = await app.inject({
        method: "GET",
        url: "/intelligence-dashboard/strategy?scenario_id=fixing_small_home_issue",
      });
      assert.equal(strategy.statusCode, 200);

      const timeline = await app.inject({
        method: "GET",
        url: "/intelligence-dashboard/timeline?scenario_id=delivering_a_document",
      });
      assert.equal(timeline.statusCode, 200);
      const timelineBody = timeline.json() as { timeline: unknown[] };
      assert.equal(timelineBody.timeline.length, 16);

      const executiveSummary = await app.inject({
        method: "GET",
        url: "/intelligence-dashboard/executive-summary?scenario_id=moving_a_room",
      });
      assert.equal(executiveSummary.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/intelligence-dashboard/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as { summary: { schemaVersion: string } };
      assert.equal(summaryBody.summary.schemaVersion, INTELLIGENCE_DASHBOARD_SCHEMA_VERSION);

      const validate = await app.inject({ method: "GET", url: "/intelligence-dashboard/validate" });
      assert.equal(validate.statusCode, 200);
      const report = validate.json() as { validation: { valid: boolean } };
      assert.equal(report.validation.valid, true);

      await app.close();
    });
  });
});
