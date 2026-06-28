import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerExecutiveIntelligenceCenterRoutes } from "../src/api/routes/executive-intelligence-center.js";
import {
  EXECUTIVE_INTELLIGENCE_CENTER_SCHEMA_VERSION,
  EXECUTIVE_INTELLIGENCE_CENTER_SCENARIO_IDS,
  EXECUTIVE_INTELLIGENCE_CENTER_SCENARIO_TO_CANONICAL,
  EXECUTIVE_INTELLIGENCE_CHAIN,
  createExecutiveIntelligenceCenterModule,
  createExecutiveCommandOverviewBuilder,
  createExecutiveReportsBuilder,
  createExecutiveConfidenceBuilder,
  createExecutiveIntelligenceCenterValidator,
} from "../src/executive-intelligence-center/module.js";
import { createIntelligenceDashboardModule } from "../src/intelligence-dashboard/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch4-c20",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch4-c20-user-session",
};

describe("CH4-C20 executive intelligence center", () => {
  describe("domain (unit)", () => {
    it("provides executive center scenarios aligned with C1 through C19", () => {
      assert.equal(EXECUTIVE_INTELLIGENCE_CENTER_SCENARIO_IDS.length, 5);
      for (const scenarioId of EXECUTIVE_INTELLIGENCE_CENTER_SCENARIO_IDS) {
        assert.ok(
          EXECUTIVE_INTELLIGENCE_CENTER_SCENARIO_TO_CANONICAL[scenarioId],
          `missing canonical for ${scenarioId}`
        );
      }
      assert.equal(EXECUTIVE_INTELLIGENCE_CHAIN.length, 20);
      assert.ok(EXECUTIVE_INTELLIGENCE_CHAIN.includes("executive_intelligence_center"));
    });

    it("builds executive command overview from dashboard output deterministically", () => {
      const { intelligenceDashboard } = createIntelligenceDashboardModule();
      const dashboard = intelligenceDashboard.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const builder = createExecutiveCommandOverviewBuilder();

      const first = builder.build(dashboard);
      const second = builder.build(dashboard);
      assert.deepEqual(first, second);
      assert.ok(["optimal", "stable", "monitoring", "critical"].includes(first.platformStatus));
    });

    it("generates executive reports from dashboard deterministically", () => {
      const { intelligenceDashboard } = createIntelligenceDashboardModule();
      const dashboard = intelligenceDashboard.buildOutputForValidation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      const reports = createExecutiveReportsBuilder().build(dashboard);
      assert.ok(reports.length >= 4);
      assert.ok(reports.some((r) => r.category === "strategic"));
    });

    it("generates executive confidence from dashboard and platform health", () => {
      const { executiveIntelligenceCenter } = createExecutiveIntelligenceCenterModule();
      const output = executiveIntelligenceCenter.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      const { intelligenceDashboard } = createIntelligenceDashboardModule();
      const dashboard = intelligenceDashboard.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });

      const confidence = createExecutiveConfidenceBuilder().build(
        dashboard,
        output.platformHealth.score
      );
      assert.ok(["low", "medium", "high"].includes(confidence.level));
      assert.equal(confidence.dashboardConfidenceScore, dashboard.dashboardConfidence.score);
    });

    it("validates executive center outputs for all scenarios", () => {
      const { executiveIntelligenceCenter } = createExecutiveIntelligenceCenterModule();
      const validator = createExecutiveIntelligenceCenterValidator();

      for (const scenarioId of EXECUTIVE_INTELLIGENCE_CENTER_SCENARIO_IDS) {
        const output = executiveIntelligenceCenter.buildOutputForValidation(USER_AUTH, {
          scenario_id: scenarioId,
        });
        assert.equal(output.readOnly, true);
        assert.ok(output.dashboardOutputId.startsWith("dashboard-"));
        assert.ok(output.executiveReports.length >= 4);
        assert.ok(output.explanation.ecosystemSummary.length > 0);

        const report = validator.validateOutput(output);
        assert.equal(report.valid, true, `invalid executive center for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns executive intelligence center home for authenticated users", () => {
      const { executiveIntelligenceCenter } = createExecutiveIntelligenceCenterModule();
      const home = executiveIntelligenceCenter.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.ok(home.executive_chain.includes("executive_intelligence_center"));
      assert.ok(home.available_views.includes("Executive Overview"));
    });

    it("rejects unauthenticated access", () => {
      const { executiveIntelligenceCenter } = createExecutiveIntelligenceCenterModule();
      assert.throws(
        () => executiveIntelligenceCenter.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic executive outputs for the same scenario", () => {
      const { executiveIntelligenceCenter } = createExecutiveIntelligenceCenterModule();
      const first = executiveIntelligenceCenter.getOverview(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const second = executiveIntelligenceCenter.getOverview(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      assert.deepEqual(first.command_overview, second.command_overview);
    });

    it("links executive center output to intelligence dashboard", () => {
      const { executiveIntelligenceCenter } = createExecutiveIntelligenceCenterModule();
      const output = executiveIntelligenceCenter.buildOutputForValidation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.match(output.dashboardOutputId, /^dashboard-/);
      assert.match(output.experienceOutputId, /^experience-/);
      assert.match(output.orchestrationOutputId, /^orchestration-/);
    });

    it("includes human-readable executive explanation", () => {
      const { executiveIntelligenceCenter } = createExecutiveIntelligenceCenterModule();
      const explanation = executiveIntelligenceCenter.getExplanation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.match(explanation.explanation.summary, /executive|ecosystem|intelligence/i);
      assert.ok(explanation.explanation.platformSummary.length > 0);
      assert.ok(explanation.executive_confidence.score >= 35);
    });

    it("delegates upstream only through intelligence dashboard", () => {
      const { executiveIntelligenceCenter } = createExecutiveIntelligenceCenterModule();
      const orchestration = executiveIntelligenceCenter.getOrchestration(USER_AUTH, {
        scenario_id: "preparing_professional_service_request",
      });
      assert.equal(orchestration.read_only, true);
      assert.ok(orchestration.orchestration_summary.orchestrationOutputId.startsWith("orchestration-"));
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH4-C20", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createExecutiveIntelligenceCenterModule/);
      assert.match(indexSource, /executiveIntelligenceCenter/);
      assert.match(serverSource, /registerExecutiveIntelligenceCenterRoutes/);
      assert.match(serverSource, /executiveIntelligenceCenter/);
      assert.match(packageSource, /verify:ch4-c20/);
      assert.match(packageSource, /test:ch4-c20-executive-intelligence-center/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers executive intelligence center routes behind auth middleware", async () => {
      const { executiveIntelligenceCenter } = createExecutiveIntelligenceCenterModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerExecutiveIntelligenceCenterRoutes(app, executiveIntelligenceCenter);

      const home = await app.inject({ method: "GET", url: "/executive-intelligence-center" });
      assert.equal(home.statusCode, 200);

      const overview = await app.inject({
        method: "GET",
        url: "/executive-intelligence-center/overview?scenario_id=moving_a_room",
      });
      assert.equal(overview.statusCode, 200);
      const overviewBody = overview.json() as {
        command_overview: { headline: string };
        read_only: boolean;
      };
      assert.equal(overviewBody.read_only, true);
      assert.equal(overviewBody.command_overview.headline, "Executive Command Center Overview");

      const platformHealth = await app.inject({
        method: "GET",
        url: "/executive-intelligence-center/platform-health?scenario_id=cleaning_an_apartment",
      });
      assert.equal(platformHealth.statusCode, 200);

      const strategic = await app.inject({
        method: "GET",
        url: "/executive-intelligence-center/strategic-status?scenario_id=fixing_small_home_issue",
      });
      assert.equal(strategic.statusCode, 200);

      const reports = await app.inject({
        method: "GET",
        url: "/executive-intelligence-center/reports?scenario_id=delivering_a_document",
      });
      assert.equal(reports.statusCode, 200);
      const reportsBody = reports.json() as { executive_reports: unknown[] };
      assert.ok(reportsBody.executive_reports.length >= 4);

      const explanation = await app.inject({
        method: "GET",
        url: "/executive-intelligence-center/explanation?scenario_id=moving_a_room",
      });
      assert.equal(explanation.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/executive-intelligence-center/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as { summary: { schemaVersion: string } };
      assert.equal(summaryBody.summary.schemaVersion, EXECUTIVE_INTELLIGENCE_CENTER_SCHEMA_VERSION);

      const validate = await app.inject({
        method: "GET",
        url: "/executive-intelligence-center/validate",
      });
      assert.equal(validate.statusCode, 200);
      const report = validate.json() as { validation: { valid: boolean } };
      assert.equal(report.validation.valid, true);

      await app.close();
    });
  });
});
