export type ActionCreatorStage =
  | "identity"
  | "structure"
  | "building"
  | "blueprint"
  | "trust"
  | "marketplace"
  | "quality"
  | "complete";

export interface ActionBlueprintForm {
  name: string;
  purpose: string;
  targetCustomer: string;
  expectedOutcome: string;
  requirements: string;
  estimatedDuration: string;
  deliverables: string;
  evidence: string;
  successCriteria: string;
}

export const EMPTY_ACTION_BLUEPRINT: ActionBlueprintForm = {
  name: "",
  purpose: "",
  targetCustomer: "",
  expectedOutcome: "",
  requirements: "",
  estimatedDuration: "",
  deliverables: "",
  evidence: "",
  successCriteria: "",
};

export const ACTION_CREATOR_STAGES: ActionCreatorStage[] = [
  "identity",
  "structure",
  "building",
  "blueprint",
  "trust",
  "marketplace",
  "quality",
  "complete",
];

export const ACTION_CREATOR_STEP_LABELS: Record<ActionCreatorStage, string> = {
  identity: "Action Identity",
  structure: "Action Structure",
  building: "Building Blueprint",
  blueprint: "Professional Blueprint",
  trust: "Trust Preview",
  marketplace: "Marketplace Preview",
  quality: "Action Quality",
  complete: "Blueprint Saved",
};
