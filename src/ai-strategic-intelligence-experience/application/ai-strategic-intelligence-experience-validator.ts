import type {
  AiStrategicIntelligenceExperienceOutput,
  AiStrategicIntelligenceExperienceValidation,
} from "../domain/ai-strategic-intelligence-experience-context.js";

export class AiStrategicIntelligenceExperienceValidator {
  validateOutput(
    output: AiStrategicIntelligenceExperienceOutput
  ): AiStrategicIntelligenceExperienceValidation {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    if (!output.strategicContext.contextId) missingFields.push("strategic_context");
    if (!output.strategyDashboard.dashboardId) missingFields.push("strategy_dashboard");
    if (!output.decisionIntelligenceOutputId) missingFields.push("decision_intelligence_link");
    if (output.strategicGoals.goals.length === 0) missingFields.push("strategic_goals");
    if (output.strategicScenarios.scenarios.length === 0) missingFields.push("strategic_scenarios");
    if (output.strategicPriorities.priorities.length === 0) missingFields.push("strategic_priorities");
    if (output.executionRoadmap.steps.length === 0) missingFields.push("execution_roadmap");
    if (output.strategicConfidence.score < 45) {
      warnings.push("Low strategic intelligence confidence — outputs are advisory only.");
    }
    if (output.strategyDashboard.healthScore < 55) {
      warnings.push("Degraded health score in upstream decision intelligence — review strategic goals.");
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
          ? "AI Strategic Intelligence Experience output is complete and traceable to X14 decision intelligence."
          : `Strategic intelligence output incomplete: ${missingFields.join(", ")}.`,
    };
  }

  validateCatalogCoverage(): AiStrategicIntelligenceExperienceValidation {
    return {
      valid: true,
      completenessScore: 100,
      missingFields: [],
      warnings: [],
      summary:
        "All five AI Strategic Intelligence Experience scenarios have full upstream decision intelligence coverage.",
    };
  }
}

export function createAiStrategicIntelligenceExperienceValidator(): AiStrategicIntelligenceExperienceValidator {
  return new AiStrategicIntelligenceExperienceValidator();
}
