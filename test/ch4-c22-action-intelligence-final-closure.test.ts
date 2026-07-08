import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerActionIntelligenceFinalClosureRoutes } from "../src/api/routes/action-intelligence-final-closure.js";
import {
  ACTION_INTELLIGENCE_FINAL_CLOSURE_SCHEMA_VERSION,
  ACTION_INTELLIGENCE_FINAL_CLOSURE_FIXED_TIMESTAMP,
  CLOSURE_SCENARIO_IDS,
  CLOSURE_SCENARIO_TO_CANONICAL,
  CLOSURE_CHAIN,
  COMPLETED_ECOSYSTEM_LAYER_COUNT,
  CHAPTER_NUMBER,
  NEXT_CHAPTER_NUMBER,
  createActionIntelligenceFinalClosureModule,
  createChapterCompletionStatusBuilder,
  createFinalExecutiveClosureReportBuilder,
  createActionIntelligenceFinalClosureValidator,
} from "../src/action-intelligence-final-closure/module.js";
import { createActionIntelligenceCertificationModule } from "../src/action-intelligence-certification/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch4-c22",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch4-c22-user-session",
};

describe("CH4-C22 action intelligence final closure", () => {
  describe("domain (unit)", () => {
    it("provides closure scenarios aligned with C1 through C21", () => {
      assert.equal(CLOSURE_SCENARIO_IDS.length, 5);
      for (const scenarioId of CLOSURE_SCENARIO_IDS) {
        assert.ok(
          CLOSURE_SCENARIO_TO_CANONICAL[scenarioId],
          `missing canonical for ${scenarioId}`
        );
      }
      assert.equal(CLOSURE_CHAIN.length, 22);
      assert.equal(COMPLETED_ECOSYSTEM_LAYER_COUNT, 21);
      assert.equal(CHAPTER_NUMBER, 4);
      assert.equal(NEXT_CHAPTER_NUMBER, 5);
      assert.ok(CLOSURE_CHAIN.includes("action_intelligence_final_closure"));
    });

    it("builds chapter completion status from certification output deterministically", () => {
      const { actionIntelligenceCertification } = createActionIntelligenceCertificationModule();
      const certification = actionIntelligenceCertification.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const builder = createChapterCompletionStatusBuilder();

      const first = builder.build(certification);
      const second = builder.build(certification);
      assert.deepEqual(first, second);
      assert.ok(["complete", "conditional", "pending", "incomplete"].includes(first.level));
      assert.equal(first.chapterNumber, 4);
    });

    it("generates executive closure report from certification output deterministically", () => {
      const { actionIntelligenceCertification } = createActionIntelligenceCertificationModule();
      const certification = actionIntelligenceCertification.buildOutputForValidation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      const chapterStatus = createChapterCompletionStatusBuilder().build(certification);
      const report = createFinalExecutiveClosureReportBuilder().build(certification, chapterStatus);
      assert.ok(report.closedDomains.length >= 1);
      assert.ok(report.overallScore >= 0);
      assert.match(report.headline, /Final Action Intelligence Chapter Closure/i);
    });

    it("generates closure confidence from certification output", () => {
      const { actionIntelligenceFinalClosure } = createActionIntelligenceFinalClosureModule();
      const output = actionIntelligenceFinalClosure.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      assert.ok(["low", "medium", "high"].includes(output.closureConfidence.level));
      assert.ok(output.closureConfidence.score >= 40);
    });

    it("validates closure outputs for all scenarios", () => {
      const { actionIntelligenceFinalClosure } = createActionIntelligenceFinalClosureModule();
      const validator = createActionIntelligenceFinalClosureValidator();

      for (const scenarioId of CLOSURE_SCENARIO_IDS) {
        const output = actionIntelligenceFinalClosure.buildOutputForValidation(USER_AUTH, {
          scenario_id: scenarioId,
        });
        assert.equal(output.readOnly, true);
        assert.ok(output.certificationOutputId.startsWith("certification-"));
        assert.ok(output.explanation.ecosystemSummary.length > 0);
        assert.ok(output.chapterHandoffReport.deliverables.length >= 4);

        const report = validator.validateOutput(output);
        assert.equal(report.valid, true, `invalid closure for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns closure home for authenticated users", () => {
      const { actionIntelligenceFinalClosure } = createActionIntelligenceFinalClosureModule();
      const home = actionIntelligenceFinalClosure.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.equal(home.chapter_number, 4);
      assert.equal(home.next_chapter_number, 5);
      assert.ok(home.closure_chain.includes("action_intelligence_final_closure"));
      assert.ok(home.closure_reports.includes("Chapter Handoff"));
    });

    it("rejects unauthenticated access", () => {
      const { actionIntelligenceFinalClosure } = createActionIntelligenceFinalClosureModule();
      assert.throws(
        () => actionIntelligenceFinalClosure.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic closure outputs for the same scenario", () => {
      const { actionIntelligenceFinalClosure } = createActionIntelligenceFinalClosureModule();
      const first = actionIntelligenceFinalClosure.getChapterStatus(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const second = actionIntelligenceFinalClosure.getChapterStatus(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      assert.deepEqual(first.chapter_completion_status, second.chapter_completion_status);
    });

    it("links closure output to action intelligence certification", () => {
      const { actionIntelligenceFinalClosure } = createActionIntelligenceFinalClosureModule();
      const output = actionIntelligenceFinalClosure.buildOutputForValidation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.match(output.certificationOutputId, /^certification-/);
      assert.match(output.executiveCenterOutputId, /^executive-/);
      assert.match(output.dashboardOutputId, /^dashboard-/);
      assert.match(output.outputId, /^closure-certification-/);
    });

    it("includes human-readable closure explanation", () => {
      const { actionIntelligenceFinalClosure } = createActionIntelligenceFinalClosureModule();
      const explanation = actionIntelligenceFinalClosure.getExplanation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.match(explanation.explanation.summary, /closure|Chapter 4|handoff/i);
      assert.ok(explanation.explanation.chapterSummary.length > 0);
      assert.ok(explanation.closure_confidence.score >= 40);
    });

    it("delegates upstream only through action intelligence certification", () => {
      const { actionIntelligenceFinalClosure } = createActionIntelligenceFinalClosureModule();
      const dependency = actionIntelligenceFinalClosure.getDependency(USER_AUTH, {
        scenario_id: "preparing_professional_service_request",
      });
      assert.equal(dependency.read_only, true);
      const summary = dependency.report as { soleUpstream: string; certificationOutputId: string };
      assert.equal(summary.soleUpstream, "CH4-C21 Action Intelligence Final Certification");
      assert.match(summary.certificationOutputId, /^certification-/);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH4-C22", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createActionIntelligenceFinalClosureModule/);
      assert.match(indexSource, /actionIntelligenceFinalClosure/);
      assert.match(serverSource, /registerActionIntelligenceFinalClosureRoutes/);
      assert.match(serverSource, /actionIntelligenceFinalClosure/);
      assert.match(packageSource, /verify:ch4-c22/);
      assert.match(packageSource, /test:ch4-c22-action-intelligence-final-closure/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers action intelligence final closure routes behind auth middleware", async () => {
      const { actionIntelligenceFinalClosure } = createActionIntelligenceFinalClosureModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerActionIntelligenceFinalClosureRoutes(app, actionIntelligenceFinalClosure);

      const home = await app.inject({ method: "GET", url: "/action-intelligence-final-closure" });
      assert.equal(home.statusCode, 200);

      const chapterStatus = await app.inject({
        method: "GET",
        url: "/action-intelligence-final-closure/chapter-status?scenario_id=moving_a_room",
      });
      assert.equal(chapterStatus.statusCode, 200);
      const statusBody = chapterStatus.json() as {
        chapter_completion_status: { statusId: string; chapterNumber: number };
        read_only: boolean;
      };
      assert.equal(statusBody.read_only, true);
      assert.equal(statusBody.chapter_completion_status.statusId, "closure.chapter");
      assert.equal(statusBody.chapter_completion_status.chapterNumber, 4);

      const architecture = await app.inject({
        method: "GET",
        url: "/action-intelligence-final-closure/architecture?scenario_id=cleaning_an_apartment",
      });
      assert.equal(architecture.statusCode, 200);

      const handoff = await app.inject({
        method: "GET",
        url: "/action-intelligence-final-closure/handoff?scenario_id=fixing_small_home_issue",
      });
      assert.equal(handoff.statusCode, 200);
      const handoffBody = handoff.json() as {
        chapter_handoff_report: { fromChapter: number; toChapter: number; deliverables: string[] };
      };
      assert.equal(handoffBody.chapter_handoff_report.fromChapter, 4);
      assert.equal(handoffBody.chapter_handoff_report.toChapter, 5);
      assert.ok(handoffBody.chapter_handoff_report.deliverables.length >= 4);

      const explanation = await app.inject({
        method: "GET",
        url: "/action-intelligence-final-closure/explanation?scenario_id=moving_a_room",
      });
      assert.equal(explanation.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/action-intelligence-final-closure/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as {
        summary: { schemaVersion: string; generatedAt: string };
      };
      assert.equal(summaryBody.summary.schemaVersion, ACTION_INTELLIGENCE_FINAL_CLOSURE_SCHEMA_VERSION);
      assert.equal(summaryBody.summary.generatedAt, ACTION_INTELLIGENCE_FINAL_CLOSURE_FIXED_TIMESTAMP);

      const validate = await app.inject({
        method: "GET",
        url: "/action-intelligence-final-closure/validate",
      });
      assert.equal(validate.statusCode, 200);
      const validation = validate.json() as { validation: { valid: boolean } };
      assert.equal(validation.validation.valid, true);

      await app.close();
    });
  });
});
