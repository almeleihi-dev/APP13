export type ActionCreatorStage =
  | "identity"
  | "structure"
  | "building"
  | "blueprint"
  | "trust"
  | "marketplace"
  | "quality"
  | "complete";

/** Entry intent for the Copilot builder: an ability ("I can…") or a need ("I need…"). */
export type ActionIntent = "offer" | "need";

/** Location mode — guidance only; not persisted as a structured backend field. */
export type ActionLocationMode = "near_me" | "same_city" | "country" | "worldwide" | "remote";

export interface ActionBlueprintForm {
  /** Backend action type code (category/skill/domain) chosen from GET /v1/action-types. Persisted. */
  actionTypeCode: string;
  name: string;
  purpose: string;
  targetCustomer: string;
  expectedOutcome: string;
  requirements: string;
  estimatedDuration: string;
  deliverables: string;
  evidence: string;
  successCriteria: string;
  /** Guidance-only fields (no backend structured storage yet) — folded into description. */
  locationMode: ActionLocationMode | "";
  availability: string;
  trustRequirement: string;
}

export const EMPTY_ACTION_BLUEPRINT: ActionBlueprintForm = {
  actionTypeCode: "",
  name: "",
  purpose: "",
  targetCustomer: "",
  expectedOutcome: "",
  requirements: "",
  estimatedDuration: "",
  deliverables: "",
  evidence: "",
  successCriteria: "",
  locationMode: "",
  availability: "",
  trustRequirement: "",
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
