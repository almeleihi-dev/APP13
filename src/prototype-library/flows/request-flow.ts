import type { VisualFlowSpec } from "../foundation/prototype-schema.js";
import { OFFICIAL_TRANSITION_SPEC } from "../foundation/prototype-schema.js";

export const REQUEST_TO_CONTRACT_FLOW: VisualFlowSpec = {
  id: "flow-request-to-contract",
  name: "Request to Contract",
  purpose: "From request creation through transition to contract review.",
  steps: [
    { screenId: "prototype-request", label: "Create request" },
    {
      screenId: "prototype-transition",
      label: "Transition to Action",
      transitionStageText: "Building Contract...",
      modeTransition: OFFICIAL_TRANSITION_SPEC.forward,
    },
    { screenId: "prototype-action-home", label: "Action dashboard" },
    { screenId: "prototype-contract", label: "Review contract" },
  ],
};

export const REQUEST_FLOW: VisualFlowSpec = {
  id: "flow-request",
  name: "Request Flow",
  purpose: "Complete request lifecycle from opportunity to contract.",
  steps: REQUEST_TO_CONTRACT_FLOW.steps,
};
