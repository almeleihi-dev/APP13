import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  PricingIntelligenceService,
  buildPriceComponents,
  buildPriceRange,
  resolveBenchmarkBand,
} from "../src/pricing/intelligence/index.js";
import { AppError, ErrorCodes } from "../src/shared/errors/index.js";

const BASE_INPUT = {
  profession: "software_developer",
  action_codes: ["E.3.1"],
  trust_score: 92,
  complexity: "medium" as const,
  estimated_days: 14,
  urgent: false,
  location_tier: "metro" as const,
};

describe("AI-6 PricingIntelligenceService", () => {
  const service = new PricingIntelligenceService();

  it("calculates reference software pricing profile", () => {
    const result = service.calculate(BASE_INPUT);

    assert.equal(result.currency, "SAR");
    assert.equal(result.pricing_tier, "recommended");
    assert.equal(result.confidence, 0.92);
    assert.deepEqual(result.price_components, {
      base_price: 10000,
      trust_adjustment: 10,
      complexity_adjustment: 10,
      urgency_adjustment: 0,
      location_adjustment: 5,
    });
    assert.deepEqual(result.price_range, {
      minimum: 8000,
      recommended: 12500,
      premium: 15000,
    });
  });

  it("rejects invalid estimated_days", () => {
    assert.throws(
      () => service.calculate({ ...BASE_INPUT, estimated_days: 0 }),
      (error) =>
        error instanceof AppError &&
        error.problem.code === ErrorCodes.VALIDATION_ERROR &&
        error.problem.engine === "pricing"
    );
  });

  it("produces deterministic output for the same input", () => {
    assert.deepEqual(service.calculate(BASE_INPUT), service.calculate(BASE_INPUT));
  });
});

describe("AI-6 pricing range calculation", () => {
  it("derives minimum and premium tiers from base price", () => {
    const components = buildPriceComponents(BASE_INPUT);
    const range = buildPriceRange(components);

    assert.equal(range.minimum, 8000);
    assert.equal(range.premium, 15000);
    assert.ok(range.recommended >= range.minimum);
    assert.ok(range.premium >= range.recommended);
  });
});

describe("AI-6 benchmark library", () => {
  it("maps software developer profession to software development band", () => {
    const band = resolveBenchmarkBand("software_developer", ["E.3.1"]);
    assert.equal(band.id, "software_development");
    assert.equal(band.min, 5000);
    assert.equal(band.max, 50000);
  });

  it("maps cleaning action code to cleaning band", () => {
    const band = resolveBenchmarkBand("unknown", ["A.4.2"]);
    assert.equal(band.id, "cleaning");
    assert.equal(band.max, 500);
  });

  it("maps logo design action code override", () => {
    const band = resolveBenchmarkBand("graphic_designer", ["E.1.1"]);
    assert.equal(band.id, "logo_design");
  });
});
