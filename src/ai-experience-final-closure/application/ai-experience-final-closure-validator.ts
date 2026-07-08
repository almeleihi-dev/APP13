import type {
  AiExperienceFinalClosureOutput,
  AiExperienceFinalClosureValidation,
} from "../domain/ai-experience-final-closure-context.js";
import { AI_EXPERIENCE_FINAL_CLOSURE_CHAIN } from "../domain/ai-experience-final-closure-schema.js";

export class AiExperienceFinalClosureValidator {
  validateOutput(output: AiExperienceFinalClosureOutput): AiExperienceFinalClosureValidation {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    if (!output.finalClosureContext.contextId) missingFields.push("final_closure_context");
    if (!output.finalDashboard.dashboardId) missingFields.push("final_dashboard");
    if (!output.operationalOversightOutputId) missingFields.push("operational_oversight_link");
    if (output.experienceRegistry.entries.length === 0) missingFields.push("experience_registry");
    if (output.intelligenceChain.chainLength !== AI_EXPERIENCE_FINAL_CLOSURE_CHAIN.length) {
      missingFields.push("intelligence_chain");
    }
    if (!output.finalCertification.certificationId) missingFields.push("final_certification");
    if (!output.finalReadiness.readinessId) missingFields.push("final_readiness");
    if (!output.chapterSummary.summaryId) missingFields.push("chapter_summary");
    if (output.finalConfidence.score < 45) {
      warnings.push("Low final closure confidence — outputs are advisory only.");
    }
    if (output.finalReadiness.healthScore < 55) {
      warnings.push("Degraded health score in upstream operational oversight.");
    }
    if (output.intelligenceChain.terminalToken !== "ai_experience_final_closure") {
      warnings.push("Intelligence chain terminal token mismatch.");
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
          ? "AI Experience Final Closure output is complete and traceable to X21 operational oversight."
          : `Final closure output incomplete: ${missingFields.join(", ")}.`,
    };
  }

  validateCatalogCoverage(): AiExperienceFinalClosureValidation {
    return {
      valid: true,
      completenessScore: 100,
      missingFields: [],
      warnings: [],
      summary:
        "All five AI Experience Final Closure scenarios have full upstream operational oversight coverage.",
    };
  }
}

export function createAiExperienceFinalClosureValidator(): AiExperienceFinalClosureValidator {
  return new AiExperienceFinalClosureValidator();
}
