import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerAiAccountabilityLedgerExperienceRoutes } from "../src/api/routes/ai-accountability-ledger-experience.js";
import {
  AI_ACCOUNTABILITY_LEDGER_EXPERIENCE_SCHEMA_VERSION,
  AI_ACCOUNTABILITY_LEDGER_EXPERIENCE_FIXED_TIMESTAMP,
  ACCOUNTABILITY_LEDGER_SCENARIO_IDS,
  ACCOUNTABILITY_LEDGER_SCENARIO_TO_CANONICAL,
  AI_ACCOUNTABILITY_LEDGER_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
  createAiAccountabilityLedgerExperienceModule,
  createLedgerContextBuilder,
  createAccountabilityChainBuilder,
  createAiAccountabilityLedgerExperienceValidator,
} from "../src/ai-accountability-ledger-experience/module.js";
import { createAiGovernanceAssuranceExperienceModule } from "../src/ai-governance-assurance-experience/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch5-x19",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch5-x19-user-session",
};

describe("CH5-X19 AI Accountability Ledger Experience", () => {
  describe("domain (unit)", () => {
    it("provides accountability ledger scenarios aligned with X18 governance assurance", () => {
      assert.equal(ACCOUNTABILITY_LEDGER_SCENARIO_IDS.length, 5);
      for (const scenarioId of ACCOUNTABILITY_LEDGER_SCENARIO_IDS) {
        assert.ok(
          ACCOUNTABILITY_LEDGER_SCENARIO_TO_CANONICAL[scenarioId],
          `missing canonical for ${scenarioId}`
        );
      }
      assert.equal(AI_ACCOUNTABILITY_LEDGER_EXPERIENCE_CHAIN.length, 41);
      assert.equal(UPSTREAM_MODULE_ID, "CH5-X18");
      assert.ok(
        AI_ACCOUNTABILITY_LEDGER_EXPERIENCE_CHAIN.includes("ai_accountability_ledger_experience")
      );
    });

    it("builds ledger context from governance assurance output deterministically", () => {
      const { aiGovernanceAssuranceExperience } = createAiGovernanceAssuranceExperienceModule();
      const assurance = aiGovernanceAssuranceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const builder = createLedgerContextBuilder();

      const first = builder.build(assurance);
      const second = builder.build(assurance);
      assert.deepEqual(first, second);
      assert.equal(first.experienceMode, "read_only");
      assert.match(first.contextId, /^ledger-context-governance-assurance-/);
    });

    it("generates accountability chain from governance assurance output deterministically", () => {
      const { aiGovernanceAssuranceExperience } = createAiGovernanceAssuranceExperienceModule();
      const assurance = aiGovernanceAssuranceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      const chain = createAccountabilityChainBuilder().build(assurance);
      assert.equal(chain.links.length, 4);
      assert.ok(chain.summary.includes("accountability chain"));
    });

    it("generates ledger confidence from governance assurance output", () => {
      const { aiAccountabilityLedgerExperience } = createAiAccountabilityLedgerExperienceModule();
      const output = aiAccountabilityLedgerExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      assert.ok(["low", "medium", "high"].includes(output.ledgerConfidence.level));
      assert.ok(output.ledgerConfidence.score >= 40);
    });

    it("validates accountability ledger outputs for all scenarios", () => {
      const { aiAccountabilityLedgerExperience } = createAiAccountabilityLedgerExperienceModule();
      const validator = createAiAccountabilityLedgerExperienceValidator();

      for (const scenarioId of ACCOUNTABILITY_LEDGER_SCENARIO_IDS) {
        const output = aiAccountabilityLedgerExperience.buildOutputForValidation(USER_AUTH, {
          scenario_id: scenarioId,
        });
        assert.equal(output.readOnly, true);
        assert.ok(output.governanceAssuranceOutputId.startsWith("governance-assurance-"));
        assert.equal(output.accountabilityChain.links.length, 4);
        assert.equal(output.decisionTrace.entries.length, 4);
        assert.equal(output.evidenceRegister.items.length, 3);
        assert.equal(output.responsibilityMap.items.length, 3);
        assert.equal(output.auditTrail.entries.length, 3);
        assert.ok(output.ledgerExplanation.summary.length > 0);

        const report = validator.validateOutput(output);
        assert.equal(report.valid, true, `invalid accountability ledger for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns AI Accountability Ledger Experience home for authenticated users", () => {
      const { aiAccountabilityLedgerExperience } = createAiAccountabilityLedgerExperienceModule();
      const home = aiAccountabilityLedgerExperience.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.equal(home.upstream_module, "CH5-X18");
      assert.ok(home.accountability_ledger_chain.includes("ai_accountability_ledger_experience"));
      assert.ok(home.accountability_ledger_views.includes("Ledger Dashboard"));
    });

    it("rejects unauthenticated access", () => {
      const { aiAccountabilityLedgerExperience } = createAiAccountabilityLedgerExperienceModule();
      assert.throws(
        () => aiAccountabilityLedgerExperience.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic accountability ledger outputs for the same scenario", () => {
      const { aiAccountabilityLedgerExperience } = createAiAccountabilityLedgerExperienceModule();
      const first = aiAccountabilityLedgerExperience.getAccountabilityChain(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const second = aiAccountabilityLedgerExperience.getAccountabilityChain(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      assert.deepEqual(first.view, second.view);
    });

    it("links accountability ledger output to AI Governance Assurance Experience", () => {
      const { aiAccountabilityLedgerExperience } = createAiAccountabilityLedgerExperienceModule();
      const output = aiAccountabilityLedgerExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.match(
        output.governanceAssuranceOutputId,
        /^governance-assurance-executive-advisory-/
      );
      assert.match(
        output.executiveAdvisoryOutputId,
        /^executive-advisory-predictive-forecast-/
      );
      assert.match(output.outputId, /^accountability-ledger-governance-assurance-/);
    });

    it("includes human-readable accountability ledger explanation", () => {
      const { aiAccountabilityLedgerExperience } = createAiAccountabilityLedgerExperienceModule();
      const explanation = aiAccountabilityLedgerExperience.getExplanation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.match(
        explanation.explanation.summary,
        /accountability ledger|chain links|evidence items/i
      );
      assert.ok(explanation.explanation.chainSummary.length > 0);
      assert.ok(explanation.ledger_confidence.score >= 40);
    });

    it("delegates upstream only through AI Governance Assurance Experience", () => {
      const { aiAccountabilityLedgerExperience } = createAiAccountabilityLedgerExperienceModule();
      const output = aiAccountabilityLedgerExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "preparing_professional_service_request",
      });
      assert.equal(
        output.delegationAccountabilityLedger.soleUpstream,
        "CH5-X18 AI Governance Assurance Experience"
      );
      assert.equal(output.delegationAccountabilityLedger.noDuplicatedLogic, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH5-X19", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createAiAccountabilityLedgerExperienceModule/);
      assert.match(indexSource, /aiAccountabilityLedgerExperience/);
      assert.match(serverSource, /registerAiAccountabilityLedgerExperienceRoutes/);
      assert.match(serverSource, /aiAccountabilityLedgerExperience/);
      assert.match(packageSource, /verify:ch5-x19/);
      assert.match(packageSource, /test:ch5-x19-ai-accountability-ledger-experience/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers AI Accountability Ledger Experience routes behind auth middleware", async () => {
      const { aiAccountabilityLedgerExperience } = createAiAccountabilityLedgerExperienceModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerAiAccountabilityLedgerExperienceRoutes(app, aiAccountabilityLedgerExperience);

      const home = await app.inject({
        method: "GET",
        url: "/ai-accountability-ledger-experience",
      });
      assert.equal(home.statusCode, 200);

      const dashboard = await app.inject({
        method: "GET",
        url: "/ai-accountability-ledger-experience/ledger-dashboard?scenario_id=moving_a_room",
      });
      assert.equal(dashboard.statusCode, 200);
      const dashBody = dashboard.json() as { view: { readOnly: boolean }; read_only: boolean };
      assert.equal(dashBody.read_only, true);
      assert.equal(dashBody.view.readOnly, true);

      const chain = await app.inject({
        method: "GET",
        url: "/ai-accountability-ledger-experience/accountability-chain?scenario_id=cleaning_an_apartment",
      });
      assert.equal(chain.statusCode, 200);
      const chainBody = chain.json() as { view: { links: unknown[] } };
      assert.equal(chainBody.view.links.length, 4);

      const trace = await app.inject({
        method: "GET",
        url: "/ai-accountability-ledger-experience/decision-trace?scenario_id=fixing_small_home_issue",
      });
      assert.equal(trace.statusCode, 200);
      const traceBody = trace.json() as { view: { entries: unknown[] } };
      assert.equal(traceBody.view.entries.length, 4);

      const evidence = await app.inject({
        method: "GET",
        url: "/ai-accountability-ledger-experience/evidence-register?scenario_id=moving_a_room",
      });
      assert.equal(evidence.statusCode, 200);
      const evidenceBody = evidence.json() as { view: { items: unknown[] } };
      assert.equal(evidenceBody.view.items.length, 3);

      const responsibility = await app.inject({
        method: "GET",
        url: "/ai-accountability-ledger-experience/responsibility-map?scenario_id=moving_a_room",
      });
      assert.equal(responsibility.statusCode, 200);
      const respBody = responsibility.json() as { view: { items: unknown[] } };
      assert.equal(respBody.view.items.length, 3);

      const audit = await app.inject({
        method: "GET",
        url: "/ai-accountability-ledger-experience/audit-trail?scenario_id=moving_a_room",
      });
      assert.equal(audit.statusCode, 200);
      const auditBody = audit.json() as { view: { entries: unknown[] } };
      assert.equal(auditBody.view.entries.length, 3);

      const transparency = await app.inject({
        method: "GET",
        url: "/ai-accountability-ledger-experience/transparency-report?scenario_id=moving_a_room",
      });
      assert.equal(transparency.statusCode, 200);

      const confidence = await app.inject({
        method: "GET",
        url: "/ai-accountability-ledger-experience/confidence?scenario_id=moving_a_room",
      });
      assert.equal(confidence.statusCode, 200);

      const explanation = await app.inject({
        method: "GET",
        url: "/ai-accountability-ledger-experience/explanation?scenario_id=moving_a_room",
      });
      assert.equal(explanation.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/ai-accountability-ledger-experience/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as {
        summary: { schemaVersion: string; generatedAt: string; decisionTraceCount: number };
      };
      assert.equal(summaryBody.summary.schemaVersion, AI_ACCOUNTABILITY_LEDGER_EXPERIENCE_SCHEMA_VERSION);
      assert.equal(summaryBody.summary.generatedAt, AI_ACCOUNTABILITY_LEDGER_EXPERIENCE_FIXED_TIMESTAMP);
      assert.equal(summaryBody.summary.decisionTraceCount, 4);

      const validate = await app.inject({
        method: "GET",
        url: "/ai-accountability-ledger-experience/validate",
      });
      assert.equal(validate.statusCode, 200);
      const validation = validate.json() as { validation: { valid: boolean } };
      assert.equal(validation.validation.valid, true);

      await app.close();
    });
  });
});
