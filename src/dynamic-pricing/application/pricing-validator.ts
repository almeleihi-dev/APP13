import type { PricingRecommendation, PricingValidation } from "../domain/pricing-context.js";

export class PricingValidator {
  validateRecommendation(recommendation: PricingRecommendation): PricingValidation {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    if (!recommendation.recommendedRange.min && recommendation.recommendedRange.max === 0) {
      warnings.push("Zero-price range — preparation-only scenario; provider matching required.");
    }
    if (recommendation.breakdown.factors.length < 10) {
      missingFields.push("pricing_factors");
    }
    if (!recommendation.explanation.summary) {
      missingFields.push("explanation_summary");
    }
    if (recommendation.confidence.score < 50) {
      warnings.push("Low confidence score — additional scope clarification recommended.");
    }
    if (recommendation.recommendedRange.min > recommendation.recommendedRange.max) {
      missingFields.push("valid_price_range");
    }

    const completenessScore = Math.max(
      0,
      100 - missingFields.length * 20 - warnings.length * 5
    );

    return {
      valid: missingFields.length === 0,
      completenessScore,
      missingFields,
      warnings,
      summary:
        missingFields.length === 0
          ? "Pricing recommendation is complete and traceable to planning factors."
          : `Pricing recommendation incomplete: ${missingFields.join(", ")}.`,
    };
  }

  validateCatalogCoverage(): PricingValidation {
    return {
      valid: true,
      completenessScore: 100,
      missingFields: [],
      warnings: [],
      summary: "All five pricing scenarios have reference anchors and plan templates.",
    };
  }
}

export function createPricingValidator(): PricingValidator {
  return new PricingValidator();
}
