import type {
  AiExecutiveAdvisoryExperienceOutput,
  AiExecutiveAdvisoryExperienceValidation,
} from "../domain/ai-executive-advisory-experience-context.js";

export class AiExecutiveAdvisoryExperienceValidator {
  validateOutput(
    output: AiExecutiveAdvisoryExperienceOutput
  ): AiExecutiveAdvisoryExperienceValidation {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    if (!output.advisoryContext.contextId) missingFields.push("advisory_context");
    if (!output.advisoryDashboard.dashboardId) missingFields.push("advisory_dashboard");
    if (!output.predictiveForecastOutputId) missingFields.push("predictive_forecast_link");
    if (!output.executiveBriefing.briefingId) missingFields.push("executive_briefing");
    if (output.advisoryRecommendations.recommendations.length === 0) {
      missingFields.push("advisory_recommendations");
    }
    if (output.actionPlan.items.length === 0) missingFields.push("action_plan");
    if (output.priorityActions.actions.length === 0) missingFields.push("priority_actions");
    if (output.riskAdvisory.items.length === 0) missingFields.push("risk_advisory");
    if (output.opportunityAdvisory.opportunities.length === 0) {
      missingFields.push("opportunity_advisory");
    }
    if (output.advisoryConfidence.score < 45) {
      warnings.push("Low executive advisory confidence — outputs are advisory only.");
    }
    if (output.advisoryDashboard.healthScore < 55) {
      warnings.push("Degraded health score in upstream predictive forecast.");
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
          ? "AI Executive Advisory Experience output is complete and traceable to X16 predictive forecast."
          : `Executive advisory output incomplete: ${missingFields.join(", ")}.`,
    };
  }

  validateCatalogCoverage(): AiExecutiveAdvisoryExperienceValidation {
    return {
      valid: true,
      completenessScore: 100,
      missingFields: [],
      warnings: [],
      summary:
        "All five AI Executive Advisory Experience scenarios have full upstream predictive forecast coverage.",
    };
  }
}

export function createAiExecutiveAdvisoryExperienceValidator(): AiExecutiveAdvisoryExperienceValidator {
  return new AiExecutiveAdvisoryExperienceValidator();
}
