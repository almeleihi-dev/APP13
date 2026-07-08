import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  NegotiationIntelligenceService,
  calculateAgreementProbability,
  buildAnalysisContext,
  resolveNegotiationState,
  resolveRecommendedEscrow,
  calculateRecommendedPrice,
  calculateRecommendedDays,
} from "../src/negotiation/intelligence/index.js";
import { AppError, ErrorCodes } from "../src/shared/errors/index.js";

describe("AI-7 negotiation state transitions", () => {
  const service = new NegotiationIntelligenceService();

  it("classifies a small price gap as likely_agreement", () => {
    const result = service.analyze({
      customer_offer: 10000,
      provider_offer: 10500,
      trust_score: 92,
      risk_profile: "low",
    });

    assert.equal(result.negotiation_state, "likely_agreement");
    assert.equal(result.recommended_price, 10300);
    assert.equal(result.recommended_escrow, "single_release");
    assert.equal(result.agreement_probability, 1);
  });

  it("classifies a moderate price gap as negotiable", () => {
    const result = service.analyze({
      customer_offer: 10000,
      provider_offer: 13000,
      trust_score: 80,
      risk_profile: "medium",
    });

    assert.equal(result.negotiation_state, "negotiable");
    assert.equal(result.recommended_price, 11500);
    assert.equal(result.recommended_escrow, "two_stage");
    assert.equal(result.agreement_probability, 0.77);
  });

  it("classifies a wide price gap as difficult", () => {
    const result = service.analyze({
      customer_offer: 10000,
      provider_offer: 15500,
      trust_score: 70,
      risk_profile: "medium",
      customer_days: 10,
      provider_days: 20,
      scope_items: 6,
    });

    assert.equal(result.negotiation_state, "difficult");
    assert.equal(result.recommended_price, 12800);
    assert.equal(result.recommended_days, 15);
    assert.equal(result.recommended_escrow, "four_stage");
    assert.equal(result.agreement_probability, 0.5);
    assert.ok(result.compromises.length >= 3);
  });

  it("classifies a very wide price gap as unlikely", () => {
    const result = service.analyze({
      customer_offer: 10000,
      provider_offer: 30000,
      trust_score: 40,
      risk_profile: "high",
    });

    assert.equal(result.negotiation_state, "unlikely");
    assert.equal(result.recommended_price, 20000);
    assert.equal(result.recommended_escrow, "milestone_based");
    assert.equal(result.agreement_probability, 0.18);
  });
});

describe("AI-7 escrow recommendation rules", () => {
  it("recommends single_release for high trust and low risk", () => {
    assert.equal(resolveRecommendedEscrow(92, "low"), "single_release");
  });

  it("recommends two_stage for trust score 75 and above", () => {
    assert.equal(resolveRecommendedEscrow(80, "low"), "two_stage");
  });

  it("recommends four_stage for medium risk without sufficient trust", () => {
    assert.equal(resolveRecommendedEscrow(60, "medium"), "four_stage");
  });

  it("recommends milestone_based for high risk without sufficient trust", () => {
    assert.equal(resolveRecommendedEscrow(60, "high"), "milestone_based");
  });
});

describe("AI-7 trust influence on agreement probability", () => {
  it("increases agreement probability as trust score rises", () => {
    const baseContext = buildAnalysisContext({
      customer_offer: 10000,
      provider_offer: 12500,
      risk_profile: "medium",
    });

    const highTrust = calculateAgreementProbability({
      ...baseContext,
      trust_score: 92,
    });
    const lowTrust = calculateAgreementProbability({
      ...baseContext,
      trust_score: 60,
    });

    assert.ok(highTrust > lowTrust);
    assert.equal(highTrust, 0.85);
    assert.equal(lowTrust, 0.75);
  });
});

describe("AI-7 deterministic helpers", () => {
  it("resolves negotiation states from price gap thresholds", () => {
    assert.equal(resolveNegotiationState(10), "likely_agreement");
    assert.equal(resolveNegotiationState(10.1), "negotiable");
    assert.equal(resolveNegotiationState(30), "negotiable");
    assert.equal(resolveNegotiationState(30.1), "difficult");
    assert.equal(resolveNegotiationState(60), "difficult");
    assert.equal(resolveNegotiationState(60.1), "unlikely");
  });

  it("rounds recommended price to the nearest 100 SAR", () => {
    assert.equal(calculateRecommendedPrice(10000, 10500), 10300);
    assert.equal(calculateRecommendedPrice(10000, 10400), 10200);
  });

  it("rounds recommended days up when both timelines are provided", () => {
    assert.equal(calculateRecommendedDays(10, 11), 11);
    assert.equal(calculateRecommendedDays(10, 20), 15);
    assert.equal(calculateRecommendedDays(10, undefined), undefined);
  });
});

describe("AI-7 NegotiationIntelligenceService validation", () => {
  const service = new NegotiationIntelligenceService();

  it("rejects missing offer values", () => {
    assert.throws(
      () => service.analyze({ customer_offer: 1000, provider_offer: Number.NaN }),
      (error) =>
        error instanceof AppError &&
        error.problem.code === ErrorCodes.VALIDATION_ERROR &&
        error.problem.engine === "negotiation"
    );
  });

  it("rejects invalid risk profiles", () => {
    assert.throws(
      () =>
        service.analyze({
          customer_offer: 1000,
          provider_offer: 1200,
          risk_profile: "extreme" as "low",
        }),
      (error) =>
        error instanceof AppError &&
        error.problem.code === ErrorCodes.VALIDATION_ERROR &&
        error.problem.engine === "negotiation"
    );
  });

  it("produces deterministic output for the same input", () => {
    const input = {
      customer_offer: 9000,
      provider_offer: 11000,
      customer_days: 14,
      provider_days: 21,
      scope_items: 4,
      trust_score: 88,
      risk_profile: "medium" as const,
    };

    assert.deepEqual(service.analyze(input), service.analyze(input));
  });
});
