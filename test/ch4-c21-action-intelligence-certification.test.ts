import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerActionIntelligenceCertificationRoutes } from "../src/api/routes/action-intelligence-certification.js";
import {
  ACTION_INTELLIGENCE_CERTIFICATION_SCHEMA_VERSION,
  ACTION_INTELLIGENCE_CERTIFICATION_FIXED_TIMESTAMP,
  CERTIFICATION_SCENARIO_IDS,
  CERTIFICATION_SCENARIO_TO_CANONICAL,
  CERTIFICATION_CHAIN,
  CERTIFIED_ECOSYSTEM_LAYER_COUNT,
  createActionIntelligenceCertificationModule,
  createPlatformCertificationBuilder,
  createExecutiveCertificationReportBuilder,
  createActionIntelligenceCertificationValidator,
} from "../src/action-intelligence-certification/module.js";
import { createExecutiveIntelligenceCenterModule } from "../src/executive-intelligence-center/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch4-c21",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch4-c21-user-session",
};

describe("CH4-C21 action intelligence final certification", () => {
  describe("domain (unit)", () => {
    it("provides certification scenarios aligned with C1 through C20", () => {
      assert.equal(CERTIFICATION_SCENARIO_IDS.length, 5);
      for (const scenarioId of CERTIFICATION_SCENARIO_IDS) {
        assert.ok(
          CERTIFICATION_SCENARIO_TO_CANONICAL[scenarioId],
          `missing canonical for ${scenarioId}`
        );
      }
      assert.equal(CERTIFICATION_CHAIN.length, 21);
      assert.equal(CERTIFIED_ECOSYSTEM_LAYER_COUNT, 20);
      assert.ok(CERTIFICATION_CHAIN.includes("action_intelligence_certification"));
    });

    it("builds platform certification from executive output deterministically", () => {
      const { executiveIntelligenceCenter } = createExecutiveIntelligenceCenterModule();
      const executive = executiveIntelligenceCenter.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const builder = createPlatformCertificationBuilder();

      const first = builder.build(executive);
      const second = builder.build(executive);
      assert.deepEqual(first, second);
      assert.ok(["certified", "conditional", "pending", "failed"].includes(first.level));
    });

    it("generates executive certification report from executive output deterministically", () => {
      const { executiveIntelligenceCenter } = createExecutiveIntelligenceCenterModule();
      const executive = executiveIntelligenceCenter.buildOutputForValidation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      const platform = createPlatformCertificationBuilder().build(executive);
      const report = createExecutiveCertificationReportBuilder().build(executive, [
        { name: "Platform", level: platform.level, score: platform.score },
      ]);
      assert.ok(report.certifiedDomains.length >= 1);
      assert.ok(report.overallScore >= 0);
    });

    it("generates certification confidence from executive output", () => {
      const { actionIntelligenceCertification } = createActionIntelligenceCertificationModule();
      const output = actionIntelligenceCertification.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      assert.ok(["low", "medium", "high"].includes(output.certificationConfidence.level));
      assert.ok(output.certificationConfidence.score >= 40);
    });

    it("validates certification outputs for all scenarios", () => {
      const { actionIntelligenceCertification } = createActionIntelligenceCertificationModule();
      const validator = createActionIntelligenceCertificationValidator();

      for (const scenarioId of CERTIFICATION_SCENARIO_IDS) {
        const output = actionIntelligenceCertification.buildOutputForValidation(USER_AUTH, {
          scenario_id: scenarioId,
        });
        assert.equal(output.readOnly, true);
        assert.ok(output.executiveCenterOutputId.startsWith("executive-"));
        assert.ok(output.explanation.ecosystemSummary.length > 0);
        assert.ok(output.executiveCertificationReport.certifiedDomains.length >= 1);

        const report = validator.validateOutput(output);
        assert.equal(report.valid, true, `invalid certification for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns certification home for authenticated users", () => {
      const { actionIntelligenceCertification } = createActionIntelligenceCertificationModule();
      const home = actionIntelligenceCertification.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.ok(home.certification_chain.includes("action_intelligence_certification"));
      assert.ok(home.certification_domains.includes("Platform"));
    });

    it("rejects unauthenticated access", () => {
      const { actionIntelligenceCertification } = createActionIntelligenceCertificationModule();
      assert.throws(
        () => actionIntelligenceCertification.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic certification outputs for the same scenario", () => {
      const { actionIntelligenceCertification } = createActionIntelligenceCertificationModule();
      const first = actionIntelligenceCertification.getPlatform(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const second = actionIntelligenceCertification.getPlatform(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      assert.deepEqual(first.platform_certification, second.platform_certification);
    });

    it("links certification output to executive intelligence center", () => {
      const { actionIntelligenceCertification } = createActionIntelligenceCertificationModule();
      const output = actionIntelligenceCertification.buildOutputForValidation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.match(output.executiveCenterOutputId, /^executive-/);
      assert.match(output.dashboardOutputId, /^dashboard-/);
      assert.match(output.orchestrationOutputId, /^orchestration-/);
      assert.match(output.outputId, /^certification-executive-/);
    });

    it("includes human-readable certification explanation", () => {
      const { actionIntelligenceCertification } = createActionIntelligenceCertificationModule();
      const explanation = actionIntelligenceCertification.getExplanation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.match(explanation.explanation.summary, /certification|ecosystem|C1/i);
      assert.ok(explanation.explanation.platformSummary.length > 0);
      assert.ok(explanation.certification_confidence.score >= 40);
    });

    it("delegates upstream only through executive intelligence center", () => {
      const { actionIntelligenceCertification } = createActionIntelligenceCertificationModule();
      const delegation = actionIntelligenceCertification.getDelegation(USER_AUTH, {
        scenario_id: "preparing_professional_service_request",
      });
      assert.equal(delegation.read_only, true);
      const cert = delegation.certification as { soleUpstream: string; noDuplicatedLogic: boolean };
      assert.equal(cert.soleUpstream, "CH4-C20 Executive Intelligence Center");
      assert.equal(cert.noDuplicatedLogic, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH4-C21", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createActionIntelligenceCertificationModule/);
      assert.match(indexSource, /actionIntelligenceCertification/);
      assert.match(serverSource, /registerActionIntelligenceCertificationRoutes/);
      assert.match(serverSource, /actionIntelligenceCertification/);
      assert.match(packageSource, /verify:ch4-c21/);
      assert.match(packageSource, /test:ch4-c21-action-intelligence-certification/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers action intelligence certification routes behind auth middleware", async () => {
      const { actionIntelligenceCertification } = createActionIntelligenceCertificationModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerActionIntelligenceCertificationRoutes(app, actionIntelligenceCertification);

      const home = await app.inject({ method: "GET", url: "/action-intelligence-certification" });
      assert.equal(home.statusCode, 200);

      const platform = await app.inject({
        method: "GET",
        url: "/action-intelligence-certification/platform?scenario_id=moving_a_room",
      });
      assert.equal(platform.statusCode, 200);
      const platformBody = platform.json() as {
        platform_certification: { statusId: string };
        read_only: boolean;
      };
      assert.equal(platformBody.read_only, true);
      assert.equal(platformBody.platform_certification.statusId, "cert.platform");

      const architecture = await app.inject({
        method: "GET",
        url: "/action-intelligence-certification/architecture?scenario_id=cleaning_an_apartment",
      });
      assert.equal(architecture.statusCode, 200);

      const executiveReport = await app.inject({
        method: "GET",
        url: "/action-intelligence-certification/executive-report?scenario_id=fixing_small_home_issue",
      });
      assert.equal(executiveReport.statusCode, 200);
      const reportBody = executiveReport.json() as {
        executive_certification_report: { certifiedDomains: string[] };
      };
      assert.ok(reportBody.executive_certification_report.certifiedDomains.length >= 1);

      const explanation = await app.inject({
        method: "GET",
        url: "/action-intelligence-certification/explanation?scenario_id=moving_a_room",
      });
      assert.equal(explanation.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/action-intelligence-certification/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as {
        summary: { schemaVersion: string; generatedAt: string };
      };
      assert.equal(summaryBody.summary.schemaVersion, ACTION_INTELLIGENCE_CERTIFICATION_SCHEMA_VERSION);
      assert.equal(summaryBody.summary.generatedAt, ACTION_INTELLIGENCE_CERTIFICATION_FIXED_TIMESTAMP);

      const validate = await app.inject({
        method: "GET",
        url: "/action-intelligence-certification/validate",
      });
      assert.equal(validate.statusCode, 200);
      const validation = validate.json() as { validation: { valid: boolean } };
      assert.equal(validation.validation.valid, true);

      await app.close();
    });
  });
});
