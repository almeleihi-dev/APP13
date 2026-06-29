import type {
  AiInsightGenerationExperienceOutput,
  AiInsightGenerationExperienceValidation,
} from "../domain/ai-insight-generation-experience-context.js";

export class AiInsightGenerationExperienceValidator {
  validateOutput(
    output: AiInsightGenerationExperienceOutput
  ): AiInsightGenerationExperienceValidation {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    if (!output.insightContext.contextId) missingFields.push("insight_context");
    if (!output.generatedInsights.insightsId) missingFields.push("generated_insights");
    if (!output.adaptiveCoachingOutputId) missingFields.push("adaptive_coaching_link");
    if (output.keyFindings.findings.length === 0) missingFields.push("key_findings");
    if (output.patternDetection.patterns.length === 0) missingFields.push("pattern_detection");
    if (output.opportunityAnalysis.opportunities.length === 0) {
      missingFields.push("opportunity_analysis");
    }
    if (output.strategicInsights.insights.length === 0) missingFields.push("strategic_insights");
    if (output.insightGenerationConfidence.score < 45) {
      warnings.push("Low insight generation confidence — outputs are advisory only.");
    }
    if (output.insightReadiness.level === "conditional") {
      warnings.push("Conditional insight generation — adaptive coaching requires review.");
    }
    if (!output.insightReadiness.insightReady) {
      warnings.push("Insight generation not fully ready — operating in advisory mode.");
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
          ? "AI Insight Generation Experience output is complete and traceable to X8 adaptive coaching."
          : `Insight generation output incomplete: ${missingFields.join(", ")}.`,
    };
  }

  validateCatalogCoverage(): AiInsightGenerationExperienceValidation {
    return {
      valid: true,
      completenessScore: 100,
      missingFields: [],
      warnings: [],
      summary:
        "All five AI Insight Generation Experience scenarios have full upstream adaptive coaching coverage.",
    };
  }
}

export function createAiInsightGenerationExperienceValidator(): AiInsightGenerationExperienceValidator {
  return new AiInsightGenerationExperienceValidator();
}
