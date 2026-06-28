import type { VisualFlowSpec } from "../foundation/prototype-schema.js";

export const CONTRACT_TO_COMPLETION_FLOW: VisualFlowSpec = {
  id: "flow-contract-to-completion",
  name: "Contract to Completion",
  purpose: "Contract signing through active execution to completion summary.",
  steps: [
    { screenId: "prototype-contract", label: "Sign contract" },
    { screenId: "prototype-active-action", label: "Active execution" },
    { screenId: "prototype-completion", label: "Completion summary" },
    { screenId: "prototype-success", label: "Success confirmation" },
  ],
};

export const CONTRACT_FLOW: VisualFlowSpec = {
  id: "flow-contract",
  name: "Contract Flow",
  purpose: "Contract-centric action workflow.",
  steps: CONTRACT_TO_COMPLETION_FLOW.steps,
};
