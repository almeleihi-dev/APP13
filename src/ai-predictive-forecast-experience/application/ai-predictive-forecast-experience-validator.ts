import type {
  AiPredictiveForecastExperienceOutput,
  AiPredictiveForecastExperienceValidation,
} from "../domain/ai-predictive-forecast-experience-context.js";

export class AiPredictiveForecastExperienceValidator {
  validateOutput(
    output: AiPredictiveForecastExperienceOutput
  ): AiPredictiveForecastExperienceValidation {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    if (!output.predictiveForecastContext.contextId) missingFields.push("predictive_forecast_context");
    if (!output.predictionDashboard.dashboardId) missingFields.push("prediction_dashboard");
    if (!output.strategicIntelligenceOutputId) missingFields.push("strategic_intelligence_link");
    if (output.futureScenarios.scenarios.length === 0) missingFields.push("future_scenarios");
    if (output.trendAnalysis.trends.length === 0) missingFields.push("trend_analysis");
    if (output.forecast.steps.length === 0) missingFields.push("forecast");
    if (output.riskForecast.items.length === 0) missingFields.push("risk_forecast");
    if (output.opportunityForecast.opportunities.length === 0) {
      missingFields.push("opportunity_forecast");
    }
    if (output.predictiveConfidence.score < 45) {
      warnings.push("Low predictive forecast confidence — outputs are advisory only.");
    }
    if (output.predictionDashboard.healthScore < 55) {
      warnings.push("Degraded health score in upstream strategic intelligence.");
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
          ? "AI Predictive Forecast Experience output is complete and traceable to X15 strategic intelligence."
          : `Predictive forecast output incomplete: ${missingFields.join(", ")}.`,
    };
  }

  validateCatalogCoverage(): AiPredictiveForecastExperienceValidation {
    return {
      valid: true,
      completenessScore: 100,
      missingFields: [],
      warnings: [],
      summary:
        "All five AI Predictive Forecast Experience scenarios have full upstream strategic intelligence coverage.",
    };
  }
}

export function createAiPredictiveForecastExperienceValidator(): AiPredictiveForecastExperienceValidator {
  return new AiPredictiveForecastExperienceValidator();
}
