import { AppError, ErrorCodes, problem } from "../../shared/errors/index.js";
import { generateCompromises } from "./compromise-library.js";
import {
  buildAnalysisContext,
  buildExplanation,
  calculateAgreementProbability,
  calculateRecommendedDays,
  calculateRecommendedPrice,
  resolveNegotiationState,
  resolveRecommendedEscrow,
} from "./negotiation-rule-library.js";
import type { NegotiationAnalyzeInput, NegotiationAnalyzeResult, RiskProfile } from "./types.js";

const RISK_PROFILES: RiskProfile[] = ["low", "medium", "high"];

function validateOffer(value: number, field: string): void {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new AppError(
      problem({
        title: "Bad Request",
        status: 400,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "negotiation",
        detail: `${field} must be a non-negative finite number`,
      })
    );
  }
}

function validateOptionalDays(value: number | undefined, field: string): void {
  if (value === undefined) return;

  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new AppError(
      problem({
        title: "Bad Request",
        status: 400,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "negotiation",
        detail: `${field} must be a positive finite number when provided`,
      })
    );
  }
}

function validateInput(input: NegotiationAnalyzeInput): void {
  validateOffer(input.customer_offer, "customer_offer");
  validateOffer(input.provider_offer, "provider_offer");
  validateOptionalDays(input.customer_days, "customer_days");
  validateOptionalDays(input.provider_days, "provider_days");

  if (input.scope_items !== undefined) {
    if (
      typeof input.scope_items !== "number" ||
      !Number.isFinite(input.scope_items) ||
      input.scope_items < 0
    ) {
      throw new AppError(
        problem({
          title: "Bad Request",
          status: 400,
          code: ErrorCodes.VALIDATION_ERROR,
          engine: "negotiation",
          detail: "scope_items must be a non-negative finite number when provided",
        })
      );
    }
  }

  if (input.trust_score !== undefined) {
    if (
      typeof input.trust_score !== "number" ||
      !Number.isFinite(input.trust_score) ||
      input.trust_score < 0 ||
      input.trust_score > 100
    ) {
      throw new AppError(
        problem({
          title: "Bad Request",
          status: 400,
          code: ErrorCodes.VALIDATION_ERROR,
          engine: "negotiation",
          detail: "trust_score must be between 0 and 100 when provided",
        })
      );
    }
  }

  if (input.risk_profile !== undefined && !RISK_PROFILES.includes(input.risk_profile)) {
    throw new AppError(
      problem({
        title: "Bad Request",
        status: 400,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "negotiation",
        detail: "risk_profile must be one of: low, medium, high",
      })
    );
  }

  if (input.contract_value !== undefined) {
    validateOffer(input.contract_value, "contract_value");
  }
}

export class NegotiationIntelligenceService {
  analyze(input: NegotiationAnalyzeInput): NegotiationAnalyzeResult {
    validateInput(input);

    const context = buildAnalysisContext(input);
    const negotiation_state = resolveNegotiationState(context.price_gap_percent);
    const agreement_probability = calculateAgreementProbability(context);
    const recommended_price = calculateRecommendedPrice(
      input.customer_offer,
      input.provider_offer
    );
    const recommended_days = calculateRecommendedDays(
      input.customer_days,
      input.provider_days
    );
    const recommended_escrow = resolveRecommendedEscrow(
      context.trust_score,
      context.risk_profile
    );
    const compromises = generateCompromises(context);
    const explanation = buildExplanation(
      negotiation_state,
      context,
      recommended_price,
      recommended_escrow
    );

    return {
      negotiation_state,
      agreement_probability,
      recommended_price,
      ...(recommended_days !== undefined ? { recommended_days } : {}),
      recommended_escrow,
      compromises,
      explanation,
    };
  }
}

export function createNegotiationIntelligenceService(): NegotiationIntelligenceService {
  return new NegotiationIntelligenceService();
}
