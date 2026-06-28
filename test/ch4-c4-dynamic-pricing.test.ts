import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerDynamicPricingRoutes } from "../src/api/routes/dynamic-pricing.js";
import {
  DYNAMIC_PRICING_SCHEMA_VERSION,
  createDynamicPricingModule,
  createPricingFactorAnalyzer,
  createPricingCalculator,
  createPricingConfidenceBuilder,
  createPricingExplanationBuilder,
  createPricingValidator,
  PRICING_SCENARIO_IDS,
  PRICING_SCENARIO_TO_CANONICAL,
} from "../src/dynamic-pricing/module.js";
import { createActionPlanBuilder } from "../src/action-planning/module.js";
import { getCanonicalActionById } from "../src/action-ontology/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch4-c4",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch4-c4-user-session",
};

describe("CH4-C4 dynamic action pricing intelligence", () => {
  describe("domain (unit)", () => {
    it("provides pricing scenarios aligned with C1/C2/C3", () => {
      assert.equal(PRICING_SCENARIO_IDS.length, 5);
      for (const scenarioId of PRICING_SCENARIO_IDS) {
        assert.ok(PRICING_SCENARIO_TO_CANONICAL[scenarioId], `missing canonical for ${scenarioId}`);
      }
    });

    it("produces deterministic pricing from the same plan", () => {
      const builder = createActionPlanBuilder();
      const canonical = getCanonicalActionById("act.move.room_contents");
      assert.ok(canonical);
      const plan = builder.build({ scenarioId: "moving_a_room" }, canonical!);

      const analyzer = createPricingFactorAnalyzer();
      const calculator = createPricingCalculator();

      const analysis = analyzer.analyze({
        plan,
        canonicalAction: canonical!,
        urgency: "standard",
        distanceBand: "local",
        marketLabel: "Moving Services",
      });

      const first = calculator.calculate({
        plan,
        analysis,
        factors: analysis.factors,
        urgency: "standard",
        distanceBand: "local",
        scenarioAnchor: { min: 80, max: 350 },
      });
      const second = calculator.calculate({
        plan,
        analysis,
        factors: analysis.factors,
        urgency: "standard",
        distanceBand: "local",
        scenarioAnchor: { min: 80, max: 350 },
      });

      assert.deepEqual(first.range, second.range);
      assert.equal(first.breakdown.factors.length, 14);
    });

    it("calculates pricing factors with traceable contributions", () => {
      const builder = createActionPlanBuilder();
      const canonical = getCanonicalActionById("act.clean.apartment_full");
      const plan = builder.build({ scenarioId: "cleaning_an_apartment" }, canonical!);
      const analyzer = createPricingFactorAnalyzer();
      const analysis = analyzer.analyze({
        plan,
        canonicalAction: canonical!,
        urgency: "priority",
        distanceBand: "regional",
        marketLabel: "Cleaning Services",
      });

      assert.ok(analysis.complexityScore >= 20);
      assert.ok(analysis.factors.some((f) => f.category === "timeline"));
      assert.ok(analysis.factors.some((f) => f.category === "skills"));
      assert.ok(analysis.factors.every((f) => f.trace.length > 0));
    });

    it("generates confidence levels from plan completeness", () => {
      const builder = createActionPlanBuilder();
      const canonical = getCanonicalActionById("act.deliver.document_secure");
      const plan = builder.build({ scenarioId: "delivering_a_document" }, canonical!);
      const confidenceBuilder = createPricingConfidenceBuilder();
      const confidence = confidenceBuilder.build({
        plan,
        factorCount: 14,
        hasScenarioAnchor: true,
        complexityScore: 40,
      });

      assert.ok(["low", "medium", "high"].includes(confidence.level));
      assert.ok(confidence.score >= 40);
      assert.ok(confidence.dataCompleteness >= 50);
    });

    it("builds human-readable explanations", () => {
      const builder = createActionPlanBuilder();
      const canonical = getCanonicalActionById("act.maint.fix_minor_issue");
      const plan = builder.build({ scenarioId: "fixing_small_home_issue" }, canonical!);
      const analyzer = createPricingFactorAnalyzer();
      const calculator = createPricingCalculator();
      const explanationBuilder = createPricingExplanationBuilder();

      const analysis = analyzer.analyze({
        plan,
        canonicalAction: canonical!,
        urgency: "standard",
        distanceBand: "local",
        marketLabel: "Maintenance Services",
      });
      const { range, breakdown } = calculator.calculate({
        plan,
        analysis,
        factors: analysis.factors,
        urgency: "standard",
        distanceBand: "local",
        scenarioAnchor: { min: 75, max: 280 },
      });
      const explanation = explanationBuilder.build({ plan, canonicalAction: canonical!, range, breakdown });

      assert.match(explanation.summary, /recommend/i);
      assert.ok(explanation.factorNarratives.length >= 5);
      assert.ok(explanation.timelineInfluence.length > 0);
      assert.ok(explanation.trustRecommendation.length > 0);
    });

    it("validates pricing recommendations for all scenarios", () => {
      const { dynamicPricing } = createDynamicPricingModule();
      const validator = createPricingValidator();

      for (const scenarioId of PRICING_SCENARIO_IDS) {
        const range = dynamicPricing.getRange(USER_AUTH, { scenario_id: scenarioId });
        const breakdown = dynamicPricing.getBreakdown(USER_AUTH, { scenario_id: scenarioId });
        assert.equal(range.read_only, true);
        assert.ok(breakdown.breakdown.factors.length >= 10);

        const recommendation = {
          recommendationId: range.recommendation_id,
          planId: `plan-${scenarioId}`,
          canonicalActionId: PRICING_SCENARIO_TO_CANONICAL[scenarioId],
          scenarioId,
          goal: "test",
          marketCategory: "test",
          recommendedRange: range.recommended_range,
          confidence: range.confidence,
          breakdown: breakdown.breakdown,
          explanation: dynamicPricing.getExplanation(USER_AUTH, { scenario_id: scenarioId }).explanation,
          readOnly: true as const,
        };
        const report = validator.validateRecommendation(recommendation);
        assert.equal(report.valid, true, `invalid pricing for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns pricing home for authenticated users", () => {
      const { dynamicPricing } = createDynamicPricingModule();
      const home = dynamicPricing.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.ok(home.pricing_chain.includes("action_plan"));
    });

    it("rejects unauthenticated access", () => {
      const { dynamicPricing } = createDynamicPricingModule();
      assert.throws(
        () => dynamicPricing.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns full pricing output for delivery scenario", () => {
      const { dynamicPricing } = createDynamicPricingModule();
      const range = dynamicPricing.getRange(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.ok(range.recommended_range.min >= 0);
      assert.ok(range.recommended_range.max >= range.recommended_range.min);

      const summary = dynamicPricing.getSummary(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.equal(summary.summary.schemaVersion, DYNAMIC_PRICING_SCHEMA_VERSION);
    });

    it("applies urgency and distance adjustments deterministically", () => {
      const { dynamicPricing } = createDynamicPricingModule();
      const standard = dynamicPricing.getRange(USER_AUTH, {
        scenario_id: "moving_a_room",
        urgency: "standard",
        distance_band: "local",
      });
      const urgent = dynamicPricing.getRange(USER_AUTH, {
        scenario_id: "moving_a_room",
        urgency: "urgent",
        distance_band: "remote",
      });
      assert.ok(urgent.recommended_range.min >= standard.recommended_range.min);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH4-C4", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createDynamicPricingModule/);
      assert.match(indexSource, /dynamicPricing/);
      assert.match(serverSource, /registerDynamicPricingRoutes/);
      assert.match(serverSource, /dynamicPricing/);
      assert.match(packageSource, /verify:ch4-c4/);
      assert.match(packageSource, /test:ch4-c4-dynamic-pricing/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers dynamic pricing routes behind auth middleware", async () => {
      const { dynamicPricing } = createDynamicPricingModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerDynamicPricingRoutes(app, dynamicPricing);

      const home = await app.inject({ method: "GET", url: "/dynamic-pricing" });
      assert.equal(home.statusCode, 200);

      const range = await app.inject({
        method: "GET",
        url: "/dynamic-pricing/range?scenario_id=moving_a_room",
      });
      assert.equal(range.statusCode, 200);
      const rangeBody = range.json() as {
        recommended_range: { min: number; max: number; currency: string };
        confidence: { level: string };
      };
      assert.equal(rangeBody.recommended_range.currency, "SAR");
      assert.ok(rangeBody.recommended_range.max >= rangeBody.recommended_range.min);
      assert.ok(rangeBody.confidence.level);

      const breakdown = await app.inject({
        method: "GET",
        url: "/dynamic-pricing/breakdown?scenario_id=cleaning_an_apartment",
      });
      assert.equal(breakdown.statusCode, 200);

      const explanation = await app.inject({
        method: "GET",
        url: "/dynamic-pricing/explanation?scenario_id=delivering_a_document",
      });
      assert.equal(explanation.statusCode, 200);

      const validate = await app.inject({ method: "GET", url: "/dynamic-pricing/validate" });
      assert.equal(validate.statusCode, 200);
      const report = validate.json() as { validation: { valid: boolean } };
      assert.equal(report.validation.valid, true);

      await app.close();
    });
  });
});
