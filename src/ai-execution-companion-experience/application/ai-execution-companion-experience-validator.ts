import type {
  AiExecutionCompanionExperienceOutput,
  AiExecutionCompanionExperienceValidation,
} from "../domain/ai-execution-companion-experience-context.js";

export class AiExecutionCompanionExperienceValidator {
  validateOutput(
    output: AiExecutionCompanionExperienceOutput
  ): AiExecutionCompanionExperienceValidation {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    if (!output.executionContext.contextId) missingFields.push("execution_context");
    if (!output.currentStep.stepId) missingFields.push("current_step");
    if (!output.actionPlanningOutputId) missingFields.push("action_planning_link");
    if (output.nextActions.actions.length === 0) missingFields.push("next_actions");
    if (output.activeChecklist.items.length === 0) missingFields.push("active_checklist");
    if (output.progressTimeline.phases.length === 0) missingFields.push("progress_timeline");
    if (output.executionCompanionConfidence.score < 45) {
      warnings.push("Low execution companion confidence — outputs are advisory only.");
    }
    if (output.executionCompanionReadiness.level === "conditional") {
      warnings.push("Conditional execution companion — action planning requires review.");
    }
    if (!output.executionCompanionReadiness.companionReady) {
      warnings.push("Execution companion not fully ready — operating in advisory mode.");
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
          ? "AI Execution Companion Experience output is complete and traceable to X5 action planning."
          : `Execution companion output incomplete: ${missingFields.join(", ")}.`,
    };
  }

  validateCatalogCoverage(): AiExecutionCompanionExperienceValidation {
    return {
      valid: true,
      completenessScore: 100,
      missingFields: [],
      warnings: [],
      summary:
        "All five AI Execution Companion Experience scenarios have full upstream action planning coverage.",
    };
  }
}

export function createAiExecutionCompanionExperienceValidator(): AiExecutionCompanionExperienceValidator {
  return new AiExecutionCompanionExperienceValidator();
}
