import type { VisualFlowSpec } from "../foundation/prototype-schema.js";
import { OFFICIAL_TRANSITION_SPEC } from "../foundation/prototype-schema.js";

export const COMPLETION_TO_RATING_FLOW: VisualFlowSpec = {
  id: "flow-completion-to-rating",
  name: "Completion to Rating",
  purpose: "Post-action completion, success, rating, and return to Need Mode.",
  steps: [
    { screenId: "prototype-completion", label: "Review completion" },
    { screenId: "prototype-success", label: "Success state" },
    { screenId: "prototype-rating", label: "Submit rating" },
    {
      screenId: "prototype-transition",
      label: "Return to Need Mode",
      transitionStageText: "Preparing...",
      modeTransition: OFFICIAL_TRANSITION_SPEC.reverse,
    },
    { screenId: "prototype-need-home", label: "Back to Need Home" },
  ],
};

export const COMPLETION_FLOW: VisualFlowSpec = {
  id: "flow-completion",
  name: "Completion Flow",
  purpose: "Full completion and rating journey.",
  steps: COMPLETION_TO_RATING_FLOW.steps,
};
