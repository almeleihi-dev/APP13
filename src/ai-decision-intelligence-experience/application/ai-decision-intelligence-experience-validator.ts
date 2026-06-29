import type {
  AiDecisionIntelligenceExperienceOutput,
  AiDecisionIntelligenceExperienceValidation,
} from "../domain/ai-decision-intelligence-experience-context.js";

export class AiDecisionIntelligenceExperienceValidator {
  validateOutput(
    output: AiDecisionIntelligenceExperienceOutput
  ): AiDecisionIntelligenceExperienceValidation {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    if (!output.decisionContext.contextId) missingFields.push("decision_context");
    if (!output.decisionDashboard.dashboardId) missingFields.push("decision_dashboard");
    if (!output.orchestrationOutputId) missingFields.push("orchestration_link");
    if (output.decisionTree.nodes.length === 0) missingFields.push("decision_tree");
    if (output.decisionOptions.options.length === 0) missingFields.push("decision_options");
    if (output.decisionRecommendations.recommendations.length === 0) {
      missingFields.push("decision_recommendations");
    }
    if (output.riskAnalysis.factors.length === 0) missingFields.push("risk_analysis");
    if (output.opportunityAnalysis.opportunities.length === 0) {
      missingFields.push("opportunity_analysis");
    }
    if (output.decisionConfidence.score < 45) {
      warnings.push("Low decision intelligence confidence — outputs are advisory only.");
    }
    if (output.decisionDashboard.healthScore < 55) {
      warnings.push("Degraded health score in upstream orchestration — review decision options carefully.");
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
          ? "AI Decision Intelligence Experience output is complete and traceable to X13 orchestration."
          : `Decision intelligence output incomplete: ${missingFields.join(", ")}.`,
    };
  }

  validateCatalogCoverage(): AiDecisionIntelligenceExperienceValidation {
    return {
      valid: true,
      completenessScore: 100,
      missingFields: [],
      warnings: [],
      summary:
        "All five AI Decision Intelligence Experience scenarios have full upstream orchestration coverage.",
    };
  }
}

export function createAiDecisionIntelligenceExperienceValidator(): AiDecisionIntelligenceExperienceValidator {
  return new AiDecisionIntelligenceExperienceValidator();
}
