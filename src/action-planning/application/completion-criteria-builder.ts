import type { CanonicalAction } from "../../action-ontology/domain/canonical-action.js";
import type { CompletionCriteria } from "../domain/action-plan.js";

export class CompletionCriteriaBuilder {
  buildFromCanonicalAction(canonicalAction: CanonicalAction): CompletionCriteria[] {
    const evidenceCriteria: CompletionCriteria[] = canonicalAction.evidenceRequirements.map(
      (evidence) => ({
        criteriaId: `criteria.${evidence.evidenceId}`,
        label: evidence.label,
        description: evidence.description,
        evidenceRequired: [evidence.evidenceId],
        mandatory: evidence.minimumCount > 0,
      })
    );

    evidenceCriteria.push({
      criteriaId: "criteria.all_tasks_complete",
      label: "All plan tasks completed",
      description: "Every task in the action plan must reach completed status.",
      evidenceRequired: ["ev.plan_task_signoff"],
      mandatory: true,
    });

    evidenceCriteria.push({
      criteriaId: "criteria.decision_points_passed",
      label: "Decision points satisfied",
      description: "All mandatory decision points and gates must pass.",
      evidenceRequired: ["ev.decision_gate_signoff"],
      mandatory: true,
    });

    return evidenceCriteria;
  }
}

export function createCompletionCriteriaBuilder(): CompletionCriteriaBuilder {
  return new CompletionCriteriaBuilder();
}
