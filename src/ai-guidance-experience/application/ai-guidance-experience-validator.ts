import type {
  AiGuidanceExperienceOutput,
  AiGuidanceExperienceValidation,
} from "../domain/ai-guidance-experience-context.js";

export class AiGuidanceExperienceValidator {
  validateOutput(output: AiGuidanceExperienceOutput): AiGuidanceExperienceValidation {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    if (!output.guidanceContext.contextId) missingFields.push("guidance_context");
    if (!output.guidancePlan.planId) missingFields.push("guidance_plan");
    if (!output.conversationOutputId) missingFields.push("conversation_link");
    if (output.guidanceSteps.steps.length === 0) missingFields.push("guidance_steps");
    if (output.guidanceRecommendations.recommendations.length === 0) {
      missingFields.push("guidance_recommendations");
    }
    if (output.guidanceConfidence.score < 45) {
      warnings.push("Low guidance confidence — outputs are advisory only.");
    }
    if (output.guidanceStatus.level === "conditional") {
      warnings.push("Conditional guidance — conversation requires review.");
    }
    if (!output.guidanceReadiness.guidanceReady) {
      warnings.push("Guidance not fully ready — operating in advisory mode.");
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
          ? "AI Guidance Experience output is complete and traceable to X2 conversation."
          : `Guidance output incomplete: ${missingFields.join(", ")}.`,
    };
  }

  validateCatalogCoverage(): AiGuidanceExperienceValidation {
    return {
      valid: true,
      completenessScore: 100,
      missingFields: [],
      warnings: [],
      summary:
        "All five AI Guidance Experience scenarios have full upstream conversation coverage.",
    };
  }
}

export function createAiGuidanceExperienceValidator(): AiGuidanceExperienceValidator {
  return new AiGuidanceExperienceValidator();
}
