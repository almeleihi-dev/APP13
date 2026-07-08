import type { CoordinationResult } from "../domain/coordination-result.js";

export function buildCoordinationSummary(result: Pick<
  CoordinationResult,
  "activeExperience" | "navigationDecision" | "transitionDecision" | "lifecycleDecision" | "contextUpdates" | "validationResult"
>) {
  return {
    sections: [
      {
        id: "coordination-summary",
        label: "Coordination Summary",
        components: [
          {
            id: "active-experience",
            componentId: "core-ui-badge",
            props: { experience: result.activeExperience },
            accessibility: { label: "Active experience", role: "status" },
          },
          {
            id: "navigation-decision",
            componentId: "core-ui-card",
            props: {
              delegateTo: result.navigationDecision.delegateTo,
              action: result.navigationDecision.action,
              route: result.navigationDecision.route,
            },
            accessibility: { label: "Navigation decision", role: "region" },
          },
          {
            id: "lifecycle-decision",
            componentId: "core-ui-chip",
            props: {
              phase: result.lifecycleDecision.phase,
              delegateTo: result.lifecycleDecision.delegateTo,
            },
            accessibility: { label: "Lifecycle decision", role: "status" },
          },
        ],
      },
    ],
    delegated: true,
    validationValid: result.validationResult.valid,
  };
}
