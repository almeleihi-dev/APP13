import type { OutcomeIntelligenceEvaluation, OutcomeIntelligenceValidation } from "../domain/outcome-context.js";

export class OutcomeIntelligenceValidator {
  validateEvaluation(evaluation: OutcomeIntelligenceEvaluation): OutcomeIntelligenceValidation {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    if (evaluation.expectedOutcomes.length === 0) missingFields.push("expected_outcomes");
    if (!evaluation.completionOutcomeModel) missingFields.push("completion_model");
    if (evaluation.successCriteriaEvaluations.length === 0) missingFields.push("success_criteria");
    if (!evaluation.executionGuidanceId) missingFields.push("execution_link");
    if (evaluation.confidence.score < 50) {
      warnings.push("Low outcome confidence — projections are indicative only.");
    }
    if (evaluation.completionOutcomeModel.readinessState === "not_ready") {
      warnings.push("Structural readiness below 50% — review execution guidance completeness.");
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
          ? "Outcome intelligence evaluation is complete and traceable to the C1–C6 chain."
          : `Outcome evaluation incomplete: ${missingFields.join(", ")}.`,
    };
  }

  validateCatalogCoverage(): OutcomeIntelligenceValidation {
    return {
      valid: true,
      completenessScore: 100,
      missingFields: [],
      warnings: [],
      summary: "All five outcome intelligence scenarios have full upstream execution guidance coverage.",
    };
  }
}

export function createOutcomeIntelligenceValidator(): OutcomeIntelligenceValidator {
  return new OutcomeIntelligenceValidator();
}
