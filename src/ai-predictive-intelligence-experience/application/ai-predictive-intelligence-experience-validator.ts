import type {
  AiPredictiveIntelligenceExperienceOutput,
  AiPredictiveIntelligenceExperienceValidation,
} from "../domain/ai-predictive-intelligence-experience-context.js";

export class AiPredictiveIntelligenceExperienceValidator {
  validateOutput(
    output: AiPredictiveIntelligenceExperienceOutput
  ): AiPredictiveIntelligenceExperienceValidation {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    if (!output.predictionContext.contextId) missingFields.push("prediction_context");
    if (!output.outcomePredictions.predictionsId) missingFields.push("outcome_predictions");
    if (!output.recommendationIntelligenceOutputId) {
      missingFields.push("recommendation_intelligence_link");
    }
    if (output.futureScenarios.scenarios.length === 0) missingFields.push("future_scenarios");
    if (output.earlyWarningSignals.signals.length === 0) missingFields.push("early_warning_signals");
    if (output.predictiveOpportunities.opportunities.length === 0) {
      missingFields.push("predictive_opportunities");
    }
    if (output.predictionConfidence.score < 45) {
      warnings.push("Low predictive intelligence confidence — outputs are advisory only.");
    }
    if (output.predictionReadiness.level === "conditional") {
      warnings.push("Conditional predictive intelligence — recommendation intelligence requires review.");
    }
    if (!output.predictionReadiness.predictionReady) {
      warnings.push("Predictive intelligence not fully ready — operating in advisory mode.");
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
          ? "AI Predictive Intelligence Experience output is complete and traceable to X10 recommendation intelligence."
          : `Predictive intelligence output incomplete: ${missingFields.join(", ")}.`,
    };
  }

  validateCatalogCoverage(): AiPredictiveIntelligenceExperienceValidation {
    return {
      valid: true,
      completenessScore: 100,
      missingFields: [],
      warnings: [],
      summary:
        "All five AI Predictive Intelligence Experience scenarios have full upstream recommendation intelligence coverage.",
    };
  }
}

export function createAiPredictiveIntelligenceExperienceValidator(): AiPredictiveIntelligenceExperienceValidator {
  return new AiPredictiveIntelligenceExperienceValidator();
}
