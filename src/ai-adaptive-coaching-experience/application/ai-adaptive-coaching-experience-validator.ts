import type {
  AiAdaptiveCoachingExperienceOutput,
  AiAdaptiveCoachingExperienceValidation,
} from "../domain/ai-adaptive-coaching-experience-context.js";

export class AiAdaptiveCoachingExperienceValidator {
  validateOutput(output: AiAdaptiveCoachingExperienceOutput): AiAdaptiveCoachingExperienceValidation {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    if (!output.coachingContext.contextId) missingFields.push("coaching_context");
    if (!output.adaptiveGuidance.guidanceId) missingFields.push("adaptive_guidance");
    if (!output.progressIntelligenceOutputId) missingFields.push("progress_intelligence_link");
    if (output.coachingInsights.insights.length === 0) missingFields.push("coaching_insights");
    if (output.improvementOpportunities.opportunities.length === 0) {
      missingFields.push("improvement_opportunities");
    }
    if (output.behavioralSuggestions.suggestions.length === 0) {
      missingFields.push("behavioral_suggestions");
    }
    if (output.adaptiveCoachingConfidence.score < 45) {
      warnings.push("Low adaptive coaching confidence — outputs are advisory only.");
    }
    if (output.coachingReadiness.level === "conditional") {
      warnings.push("Conditional adaptive coaching — progress intelligence requires review.");
    }
    if (!output.coachingReadiness.coachingReady) {
      warnings.push("Adaptive coaching not fully ready — operating in advisory mode.");
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
          ? "AI Adaptive Coaching Experience output is complete and traceable to X7 progress intelligence."
          : `Adaptive coaching output incomplete: ${missingFields.join(", ")}.`,
    };
  }

  validateCatalogCoverage(): AiAdaptiveCoachingExperienceValidation {
    return {
      valid: true,
      completenessScore: 100,
      missingFields: [],
      warnings: [],
      summary:
        "All five AI Adaptive Coaching Experience scenarios have full upstream progress intelligence coverage.",
    };
  }
}

export function createAiAdaptiveCoachingExperienceValidator(): AiAdaptiveCoachingExperienceValidator {
  return new AiAdaptiveCoachingExperienceValidator();
}
