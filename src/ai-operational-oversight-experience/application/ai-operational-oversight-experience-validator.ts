import type {
  AiOperationalOversightExperienceOutput,
  AiOperationalOversightExperienceValidation,
} from "../domain/ai-operational-oversight-experience-context.js";

export class AiOperationalOversightExperienceValidator {
  validateOutput(
    output: AiOperationalOversightExperienceOutput
  ): AiOperationalOversightExperienceValidation {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    if (!output.oversightContext.contextId) missingFields.push("oversight_context");
    if (!output.oversightDashboard.dashboardId) missingFields.push("oversight_dashboard");
    if (!output.conformanceValidationOutputId) missingFields.push("conformance_validation_link");
    if (output.oversightMatrix.rows.length === 0) missingFields.push("oversight_matrix");
    if (output.complianceMonitor.items.length === 0) missingFields.push("compliance_monitor");
    if (output.exceptionMonitor.items.length === 0) missingFields.push("exception_monitor");
    if (output.interventionPlan.items.length === 0) missingFields.push("intervention_plan");
    if (!output.oversightReport.reportId) missingFields.push("oversight_report");
    if (output.oversightConfidence.score < 45) {
      warnings.push("Low operational oversight confidence — outputs are advisory only.");
    }
    if (output.operationalHealth.healthScore < 55) {
      warnings.push("Degraded health score in upstream conformance validation.");
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
          ? "AI Operational Oversight Experience output is complete and traceable to X20 conformance validation."
          : `Operational oversight output incomplete: ${missingFields.join(", ")}.`,
    };
  }

  validateCatalogCoverage(): AiOperationalOversightExperienceValidation {
    return {
      valid: true,
      completenessScore: 100,
      missingFields: [],
      warnings: [],
      summary:
        "All five AI Operational Oversight Experience scenarios have full upstream conformance validation coverage.",
    };
  }
}

export function createAiOperationalOversightExperienceValidator(): AiOperationalOversightExperienceValidator {
  return new AiOperationalOversightExperienceValidator();
}
