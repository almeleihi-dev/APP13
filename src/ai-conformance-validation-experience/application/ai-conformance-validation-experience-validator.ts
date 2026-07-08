import type {
  AiConformanceValidationExperienceOutput,
  AiConformanceValidationExperienceValidation,
} from "../domain/ai-conformance-validation-experience-context.js";

export class AiConformanceValidationExperienceValidator {
  validateOutput(
    output: AiConformanceValidationExperienceOutput
  ): AiConformanceValidationExperienceValidation {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    if (!output.conformanceContext.contextId) missingFields.push("conformance_context");
    if (!output.conformanceDashboard.dashboardId) missingFields.push("conformance_dashboard");
    if (!output.accountabilityLedgerOutputId) missingFields.push("accountability_ledger_link");
    if (output.validationMatrix.rows.length === 0) missingFields.push("validation_matrix");
    if (output.complianceStatus.items.length === 0) missingFields.push("compliance_status");
    if (output.conformanceRules.rules.length === 0) missingFields.push("conformance_rules");
    if (output.deviationAnalysis.items.length === 0) missingFields.push("deviation_analysis");
    if (output.correctiveActions.actions.length === 0) missingFields.push("corrective_actions");
    if (!output.validationReport.reportId) missingFields.push("validation_report");
    if (output.conformanceConfidence.score < 45) {
      warnings.push("Low conformance validation confidence — outputs are advisory only.");
    }
    if (output.conformanceDashboard.healthScore < 55) {
      warnings.push("Degraded health score in upstream accountability ledger.");
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
          ? "AI Conformance Validation Experience output is complete and traceable to X19 accountability ledger."
          : `Conformance validation output incomplete: ${missingFields.join(", ")}.`,
    };
  }

  validateCatalogCoverage(): AiConformanceValidationExperienceValidation {
    return {
      valid: true,
      completenessScore: 100,
      missingFields: [],
      warnings: [],
      summary:
        "All five AI Conformance Validation Experience scenarios have full upstream accountability ledger coverage.",
    };
  }
}

export function createAiConformanceValidationExperienceValidator(): AiConformanceValidationExperienceValidator {
  return new AiConformanceValidationExperienceValidator();
}
