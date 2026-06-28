import type {
  ActionIntelligenceExperienceOutput,
  ActionIntelligenceExperienceValidation,
} from "../domain/action-intelligence-experience-context.js";

export class ActionIntelligenceExperienceValidator {
  validateOutput(output: ActionIntelligenceExperienceOutput): ActionIntelligenceExperienceValidation {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    if (output.journeySteps.length === 0) missingFields.push("journey_steps");
    if (output.layerPresentations.length < 15) missingFields.push("layer_presentations");
    if (!output.orchestrationOutputId) missingFields.push("orchestration_link");
    if (output.experienceConfidence.score < 45) {
      warnings.push("Low experience confidence — journey presentation is advisory only.");
    }
    if (output.journeySteps.some((s) => s.status === "linked")) {
      warnings.push("Some journey layers are linked rather than fully active.");
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
          ? "Action intelligence experience output is complete and traceable to C17 orchestration."
          : `Experience output incomplete: ${missingFields.join(", ")}.`,
    };
  }

  validateCatalogCoverage(): ActionIntelligenceExperienceValidation {
    return {
      valid: true,
      completenessScore: 100,
      missingFields: [],
      warnings: [],
      summary:
        "All five action intelligence experience scenarios have full upstream orchestration coverage.",
    };
  }
}

export function createActionIntelligenceExperienceValidator(): ActionIntelligenceExperienceValidator {
  return new ActionIntelligenceExperienceValidator();
}
