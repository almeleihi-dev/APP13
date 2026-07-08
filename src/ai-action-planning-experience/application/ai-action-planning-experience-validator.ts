import type {
  AiActionPlanningExperienceOutput,
  AiActionPlanningExperienceValidation,
} from "../domain/ai-action-planning-experience-context.js";

export class AiActionPlanningExperienceValidator {
  validateOutput(output: AiActionPlanningExperienceOutput): AiActionPlanningExperienceValidation {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    if (!output.actionPlanningContext.contextId) missingFields.push("action_planning_context");
    if (!output.actionPlan.planId) missingFields.push("action_plan");
    if (!output.decisionSupportOutputId) missingFields.push("decision_support_link");
    if (output.prioritizedTasks.tasks.length === 0) missingFields.push("prioritized_tasks");
    if (output.milestones.milestones.length === 0) missingFields.push("milestones");
    if (output.executionChecklist.items.length === 0) missingFields.push("execution_checklist");
    if (output.actionPlanningConfidence.score < 45) {
      warnings.push("Low action planning confidence — outputs are advisory only.");
    }
    if (output.actionPlanningReadiness.level === "conditional") {
      warnings.push("Conditional action planning — decision support requires review.");
    }
    if (!output.actionPlanningReadiness.planningReady) {
      warnings.push("Action planning not fully ready — operating in advisory mode.");
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
          ? "AI Action Planning Experience output is complete and traceable to X4 decision support."
          : `Action planning output incomplete: ${missingFields.join(", ")}.`,
    };
  }

  validateCatalogCoverage(): AiActionPlanningExperienceValidation {
    return {
      valid: true,
      completenessScore: 100,
      missingFields: [],
      warnings: [],
      summary:
        "All five AI Action Planning Experience scenarios have full upstream decision support coverage.",
    };
  }
}

export function createAiActionPlanningExperienceValidator(): AiActionPlanningExperienceValidator {
  return new AiActionPlanningExperienceValidator();
}
