import type { VisualFlowSpec } from "../foundation/prototype-schema.js";

export const ACTION_FLOW: VisualFlowSpec = {
  id: "flow-action",
  name: "Action Flow",
  purpose: "Active action execution from contract through milestones to completion.",
  steps: [
    { screenId: "prototype-action-home", label: "Action home" },
    { screenId: "prototype-contract", label: "Contract active" },
    { screenId: "prototype-active-action", label: "Execute action" },
    { screenId: "prototype-chat", label: "Collaborate via chat" },
    { screenId: "prototype-completion", label: "Mark completion" },
  ],
};
