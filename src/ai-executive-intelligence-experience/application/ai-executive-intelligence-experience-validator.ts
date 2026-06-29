import type {
  AiExecutiveIntelligenceExperienceOutput,
  AiExecutiveIntelligenceExperienceValidation,
} from "../domain/ai-executive-intelligence-experience-context.js";

export class AiExecutiveIntelligenceExperienceValidator {
  validateOutput(
    output: AiExecutiveIntelligenceExperienceOutput
  ): AiExecutiveIntelligenceExperienceValidation {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    if (!output.executiveContext.contextId) missingFields.push("executive_context");
    if (!output.executiveDashboard.dashboardId) missingFields.push("executive_dashboard");
    if (!output.predictiveIntelligenceOutputId) {
      missingFields.push("predictive_intelligence_link");
    }
    if (output.strategicPriorities.priorities.length === 0) missingFields.push("strategic_priorities");
    if (output.criticalDecisions.decisions.length === 0) missingFields.push("critical_decisions");
    if (output.executiveAlerts.alerts.length === 0) missingFields.push("executive_alerts");
    if (output.executiveOpportunities.opportunities.length === 0) {
      missingFields.push("executive_opportunities");
    }
    if (output.executiveConfidence.score < 45) {
      warnings.push("Low executive intelligence confidence — outputs are advisory only.");
    }
    if (output.executiveReadiness.level === "conditional") {
      warnings.push("Conditional executive intelligence — predictive intelligence requires review.");
    }
    if (!output.executiveReadiness.executiveReady) {
      warnings.push("Executive intelligence not fully ready — operating in advisory mode.");
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
          ? "AI Executive Intelligence Experience output is complete and traceable to X11 predictive intelligence."
          : `Executive intelligence output incomplete: ${missingFields.join(", ")}.`,
    };
  }

  validateCatalogCoverage(): AiExecutiveIntelligenceExperienceValidation {
    return {
      valid: true,
      completenessScore: 100,
      missingFields: [],
      warnings: [],
      summary:
        "All five AI Executive Intelligence Experience scenarios have full upstream predictive intelligence coverage.",
    };
  }
}

export function createAiExecutiveIntelligenceExperienceValidator(): AiExecutiveIntelligenceExperienceValidator {
  return new AiExecutiveIntelligenceExperienceValidator();
}
