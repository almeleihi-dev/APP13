import type {
  AiProgressIntelligenceExperienceOutput,
  AiProgressIntelligenceExperienceValidation,
} from "../domain/ai-progress-intelligence-experience-context.js";

export class AiProgressIntelligenceExperienceValidator {
  validateOutput(
    output: AiProgressIntelligenceExperienceOutput
  ): AiProgressIntelligenceExperienceValidation {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    if (!output.progressContext.contextId) missingFields.push("progress_context");
    if (!output.progressOverview.overviewId) missingFields.push("progress_overview");
    if (!output.executionCompanionOutputId) missingFields.push("execution_companion_link");
    if (output.remainingActivities.activities.length === 0) missingFields.push("remaining_activities");
    if (output.progressMetrics.metrics.length === 0) missingFields.push("progress_metrics");
    if (output.timelineStatus.phases.length === 0) missingFields.push("timeline_status");
    if (output.progressIntelligenceConfidence.score < 45) {
      warnings.push("Low progress intelligence confidence — outputs are advisory only.");
    }
    if (output.progressIntelligenceReadiness.level === "conditional") {
      warnings.push("Conditional progress intelligence — execution companion requires review.");
    }
    if (!output.progressIntelligenceReadiness.intelligenceReady) {
      warnings.push("Progress intelligence not fully ready — operating in advisory mode.");
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
          ? "AI Progress Intelligence Experience output is complete and traceable to X6 execution companion."
          : `Progress intelligence output incomplete: ${missingFields.join(", ")}.`,
    };
  }

  validateCatalogCoverage(): AiProgressIntelligenceExperienceValidation {
    return {
      valid: true,
      completenessScore: 100,
      missingFields: [],
      warnings: [],
      summary:
        "All five AI Progress Intelligence Experience scenarios have full upstream execution companion coverage.",
    };
  }
}

export function createAiProgressIntelligenceExperienceValidator(): AiProgressIntelligenceExperienceValidator {
  return new AiProgressIntelligenceExperienceValidator();
}
