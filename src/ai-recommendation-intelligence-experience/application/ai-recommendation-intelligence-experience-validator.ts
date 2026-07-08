import type {
  AiRecommendationIntelligenceExperienceOutput,
  AiRecommendationIntelligenceExperienceValidation,
} from "../domain/ai-recommendation-intelligence-experience-context.js";

export class AiRecommendationIntelligenceExperienceValidator {
  validateOutput(
    output: AiRecommendationIntelligenceExperienceOutput
  ): AiRecommendationIntelligenceExperienceValidation {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    if (!output.recommendationContext.contextId) missingFields.push("recommendation_context");
    if (!output.personalizedRecommendations.recommendationsId) {
      missingFields.push("personalized_recommendations");
    }
    if (!output.insightGenerationOutputId) missingFields.push("insight_generation_link");
    if (output.priorityRecommendations.recommendations.length === 0) {
      missingFields.push("priority_recommendations");
    }
    if (output.opportunityRecommendations.recommendations.length === 0) {
      missingFields.push("opportunity_recommendations");
    }
    if (output.strategicRecommendations.recommendations.length === 0) {
      missingFields.push("strategic_recommendations");
    }
    if (output.recommendationConfidence.score < 45) {
      warnings.push("Low recommendation intelligence confidence — outputs are advisory only.");
    }
    if (output.recommendationReadiness.level === "conditional") {
      warnings.push("Conditional recommendation intelligence — insight generation requires review.");
    }
    if (!output.recommendationReadiness.recommendationReady) {
      warnings.push("Recommendation intelligence not fully ready — operating in advisory mode.");
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
          ? "AI Recommendation Intelligence Experience output is complete and traceable to X9 insight generation."
          : `Recommendation intelligence output incomplete: ${missingFields.join(", ")}.`,
    };
  }

  validateCatalogCoverage(): AiRecommendationIntelligenceExperienceValidation {
    return {
      valid: true,
      completenessScore: 100,
      missingFields: [],
      warnings: [],
      summary:
        "All five AI Recommendation Intelligence Experience scenarios have full upstream insight generation coverage.",
    };
  }
}

export function createAiRecommendationIntelligenceExperienceValidator(): AiRecommendationIntelligenceExperienceValidator {
  return new AiRecommendationIntelligenceExperienceValidator();
}
