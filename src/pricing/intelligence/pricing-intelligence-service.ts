import { AppError, ErrorCodes, problem } from "../../shared/errors/index.js";
import {
  buildPriceComponents,
  buildPriceRange,
  calculateConfidence,
  resolvePricingTier,
} from "./pricing-rule-library.js";
import type { ComplexityLevel, LocationTier, PricingCalculateInput, PricingCalculateResult } from "./types.js";

const COMPLEXITY_LEVELS: ComplexityLevel[] = ["low", "medium", "high"];
const LOCATION_TIERS: LocationTier[] = ["rural", "standard", "metro", "premium"];

function validateInput(input: PricingCalculateInput): void {
  if (typeof input.profession !== "string" || input.profession.trim().length === 0) {
    throw new AppError(
      problem({
        title: "Bad Request",
        status: 400,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "pricing",
        detail: "profession is required",
      })
    );
  }

  if (!Array.isArray(input.action_codes)) {
    throw new AppError(
      problem({
        title: "Bad Request",
        status: 400,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "pricing",
        detail: "action_codes must be an array",
      })
    );
  }

  if (typeof input.trust_score !== "number" || !Number.isFinite(input.trust_score)) {
    throw new AppError(
      problem({
        title: "Bad Request",
        status: 400,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "pricing",
        detail: "trust_score must be a finite number",
      })
    );
  }

  if (!COMPLEXITY_LEVELS.includes(input.complexity)) {
    throw new AppError(
      problem({
        title: "Bad Request",
        status: 400,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "pricing",
        detail: "complexity must be one of: low, medium, high",
      })
    );
  }

  if (typeof input.estimated_days !== "number" || !Number.isFinite(input.estimated_days) || input.estimated_days <= 0) {
    throw new AppError(
      problem({
        title: "Bad Request",
        status: 400,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "pricing",
        detail: "estimated_days must be a positive finite number",
      })
    );
  }

  if (typeof input.urgent !== "boolean") {
    throw new AppError(
      problem({
        title: "Bad Request",
        status: 400,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "pricing",
        detail: "urgent must be a boolean",
      })
    );
  }

  if (!LOCATION_TIERS.includes(input.location_tier)) {
    throw new AppError(
      problem({
        title: "Bad Request",
        status: 400,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "pricing",
        detail: "location_tier must be one of: rural, standard, metro, premium",
      })
    );
  }
}

export class PricingIntelligenceService {
  calculate(input: PricingCalculateInput): PricingCalculateResult {
    validateInput(input);

    const price_components = buildPriceComponents(input);
    const price_range = buildPriceRange(price_components);

    return {
      currency: "SAR",
      price_range,
      price_components,
      pricing_tier: resolvePricingTier(price_range),
      confidence: calculateConfidence(input.trust_score),
    };
  }
}

export function createPricingIntelligenceService(): PricingIntelligenceService {
  return new PricingIntelligenceService();
}
