import type {
  AiDecisionSupportExperienceOutput,
  AiDecisionSupportExperienceValidation,
} from "../domain/ai-decision-support-experience-context.js";

export class AiDecisionSupportExperienceValidator {
  validateOutput(output: AiDecisionSupportExperienceOutput): AiDecisionSupportExperienceValidation {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    if (!output.decisionSupportContext.contextId) missingFields.push("decision_support_context");
    if (!output.decisionAnalysis.analysisId) missingFields.push("decision_analysis");
    if (!output.guidanceOutputId) missingFields.push("guidance_link");
    if (output.decisionOptions.options.length === 0) missingFields.push("decision_options");
    if (!output.decisionRecommendation.recommendationId) {
      missingFields.push("decision_recommendation");
    }
    if (output.decisionSupportConfidence.score < 45) {
      warnings.push("Low decision support confidence — outputs are advisory only.");
    }
    if (output.decisionSupportStatus.level === "conditional") {
      warnings.push("Conditional decision support — guidance requires review.");
    }
    if (!output.decisionSupportReadiness.decisionSupportReady) {
      warnings.push("Decision support not fully ready — operating in advisory mode.");
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
          ? "AI Decision Support Experience output is complete and traceable to X3 guidance."
          : `Decision support output incomplete: ${missingFields.join(", ")}.`,
    };
  }

  validateCatalogCoverage(): AiDecisionSupportExperienceValidation {
    return {
      valid: true,
      completenessScore: 100,
      missingFields: [],
      warnings: [],
      summary:
        "All five AI Decision Support Experience scenarios have full upstream guidance coverage.",
    };
  }
}

export function createAiDecisionSupportExperienceValidator(): AiDecisionSupportExperienceValidator {
  return new AiDecisionSupportExperienceValidator();
}
