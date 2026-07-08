import type { CoordinationPlan } from "../domain/coordination-plan.js";

export function buildExecutionView(plan: CoordinationPlan) {
  return {
    planId: plan.planId,
    activeExperience: plan.activeExperience,
    lifecyclePhase: plan.lifecyclePhase,
    inTransition: plan.inTransition,
    sections: [
      {
        id: "execution-view",
        label: "Execution Plan",
        components: plan.steps.map((step, i) => ({
          id: `step-${i}`,
          componentId: "core-ui-card",
          props: {
            action: step.action,
            delegateTo: step.delegateTo,
            route: step.route,
            description: step.description,
            readOnly: true,
          },
          accessibility: { label: step.description, role: "listitem" },
        })),
      },
    ],
  };
}
