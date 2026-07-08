import type { VisualFlowSpec } from "../foundation/prototype-schema.js";
import { OFFICIAL_TRANSITION_SPEC } from "../foundation/prototype-schema.js";

export const ONBOARDING_FLOW: VisualFlowSpec = {
  id: "flow-first-user-journey",
  name: "First User Journey",
  purpose: "New user onboarding from Need Home through profile setup to first search.",
  steps: [
    { screenId: "prototype-need-home", label: "Land on Need Home" },
    { screenId: "prototype-profile", label: "Complete profile setup" },
    { screenId: "prototype-search", label: "Explore search" },
    { screenId: "prototype-opportunity-list", label: "Browse opportunities" },
  ],
};

export const SEARCH_TO_ACTION_FLOW: VisualFlowSpec = {
  id: "flow-search-to-action",
  name: "Search to Action",
  purpose: "Discover via search, select opportunity, create request, transition to Action.",
  steps: [
    { screenId: "prototype-search", label: "Search for opportunities" },
    { screenId: "prototype-opportunity-list", label: "Review matches" },
    { screenId: "prototype-request", label: "Create request" },
    {
      screenId: "prototype-transition",
      label: "Official transition",
      transitionStageText: "Matching...",
      modeTransition: OFFICIAL_TRANSITION_SPEC.forward,
    },
    { screenId: "prototype-action-home", label: "Enter Action Mode" },
  ],
};
