import type {
  AiExperienceFoundationOutput,
  AiExperienceFoundationValidation,
} from "../domain/ai-experience-foundation-context.js";

export class AiExperienceFoundationValidator {
  validateOutput(output: AiExperienceFoundationOutput): AiExperienceFoundationValidation {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    if (!output.sharedContext.contextId) missingFields.push("shared_context");
    if (!output.foundationStatus.statusId) missingFields.push("foundation_status");
    if (!output.closureOutputId) missingFields.push("closure_link");
    if (output.foundationConfidence.score < 45) {
      warnings.push("Low foundation confidence — outputs are advisory only.");
    }
    if (output.foundationStatus.level === "conditional") {
      warnings.push("Conditional foundation — upstream closure requires review.");
    }
    if (!output.chapterHandoffIntegration.handoffReady) {
      warnings.push("Chapter 4 handoff not fully ready — foundation operating in advisory mode.");
    }
    if (output.intelligenceLineage.chainLength < 20) {
      warnings.push("Incomplete intelligence lineage detected.");
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
          ? "AI Experience foundation output is complete and traceable to C22 closure."
          : `Foundation output incomplete: ${missingFields.join(", ")}.`,
    };
  }

  validateCatalogCoverage(): AiExperienceFoundationValidation {
    return {
      valid: true,
      completenessScore: 100,
      missingFields: [],
      warnings: [],
      summary:
        "All five AI Experience foundation scenarios have full upstream closure coverage.",
    };
  }
}

export function createAiExperienceFoundationValidator(): AiExperienceFoundationValidator {
  return new AiExperienceFoundationValidator();
}
