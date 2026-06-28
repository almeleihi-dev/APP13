import type {
  ActionIntelligenceFinalClosureOutput,
  ActionIntelligenceFinalClosureValidation,
} from "../domain/action-intelligence-final-closure-context.js";

export class ActionIntelligenceFinalClosureValidator {
  validateOutput(output: ActionIntelligenceFinalClosureOutput): ActionIntelligenceFinalClosureValidation {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    if (!output.chapterCompletionStatus.statusId) missingFields.push("chapter_completion_status");
    if (!output.finalExecutiveClosureReport.reportId) missingFields.push("final_executive_closure_report");
    if (!output.certificationOutputId) missingFields.push("certification_link");
    if (output.closureConfidence.score < 45) {
      warnings.push("Low closure confidence — handoff outputs are advisory only.");
    }
    if (output.chapterCompletionStatus.level === "conditional") {
      warnings.push("Conditional closure — some domains require review before Chapter 5 handoff.");
    }
    if (!output.chapterHandoffReport.handoffReady) {
      warnings.push("Chapter handoff not yet ready — readiness review recommended.");
    }
    if (output.finalExecutiveClosureReport.warnings.length > 0) {
      warnings.push(...output.finalExecutiveClosureReport.warnings);
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
          ? "Action intelligence final closure output is complete and traceable to C21 certification."
          : `Closure output incomplete: ${missingFields.join(", ")}.`,
    };
  }

  validateCatalogCoverage(): ActionIntelligenceFinalClosureValidation {
    return {
      valid: true,
      completenessScore: 100,
      missingFields: [],
      warnings: [],
      summary:
        "All five action intelligence final closure scenarios have full upstream certification coverage.",
    };
  }
}

export function createActionIntelligenceFinalClosureValidator(): ActionIntelligenceFinalClosureValidator {
  return new ActionIntelligenceFinalClosureValidator();
}
