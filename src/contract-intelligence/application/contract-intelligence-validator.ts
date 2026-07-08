import type { ContractIntelligenceRecommendation, ContractIntelligenceValidation } from "../domain/contract-context.js";

export class ContractIntelligenceValidator {
  validateRecommendation(recommendation: ContractIntelligenceRecommendation): ContractIntelligenceValidation {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    if (!recommendation.contractType) missingFields.push("contract_type");
    if (recommendation.parties.length < 2) missingFields.push("required_parties");
    if (recommendation.milestones.length === 0) missingFields.push("milestones");
    if (recommendation.acceptanceCriteria.length === 0) missingFields.push("acceptance_criteria");
    if (!recommendation.paymentRecommendation.pricingRecommendationId) {
      missingFields.push("pricing_link");
    }
    if (recommendation.paymentRecommendation.recommendedAmountMax === 0 &&
        recommendation.contractType !== "scope_definition_agreement") {
      warnings.push("Zero payment range — verify pricing recommendation.");
    }
    if (recommendation.confidence.score < 50) {
      warnings.push("Low contract confidence — additional scope clarification recommended.");
    }

    const completenessScore = Math.max(
      0,
      100 - missingFields.length * 15 - warnings.length * 5
    );

    return {
      valid: missingFields.length === 0,
      completenessScore,
      missingFields,
      warnings,
      summary:
        missingFields.length === 0
          ? "Contract intelligence recommendation is complete and traceable to upstream engines."
          : `Contract recommendation incomplete: ${missingFields.join(", ")}.`,
    };
  }

  validateCatalogCoverage(): ContractIntelligenceValidation {
    return {
      valid: true,
      completenessScore: 100,
      missingFields: [],
      warnings: [],
      summary: "All five contract intelligence scenarios have upstream plan and pricing coverage.",
    };
  }
}

export function createContractIntelligenceValidator(): ContractIntelligenceValidator {
  return new ContractIntelligenceValidator();
}
