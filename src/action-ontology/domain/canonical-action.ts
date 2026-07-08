import type {
  ActionFamilyId,
  ActionType,
  RelationshipType,
} from "./action-ontology-schema.js";

export interface ActionPrecondition {
  preconditionId: string;
  label: string;
  description: string;
  mandatory: boolean;
}

export interface ActionEvidenceRequirement {
  evidenceId: string;
  label: string;
  description: string;
  minimumCount: number;
}

export interface CanonicalActionSkill {
  skillId: string;
  name: string;
  level: "entry" | "professional" | "expert";
}

export interface CanonicalActionResource {
  resourceId: string;
  name: string;
  type: "tool" | "material" | "vehicle" | "space" | "document" | "personnel";
  required: boolean;
}

export interface CanonicalActionRiskSignal {
  signalId: string;
  severity: "low" | "medium" | "high";
  description: string;
}

export interface CanonicalAction {
  id: string;
  name: string;
  category: ActionFamilyId;
  actionType: ActionType;
  description: string;
  requiredSkills: CanonicalActionSkill[];
  requiredResources: CanonicalActionResource[];
  preconditions: ActionPrecondition[];
  evidenceRequirements: ActionEvidenceRequirement[];
  riskSignals: CanonicalActionRiskSignal[];
  contractHints: string[];
  executionHints: string[];
  trustSignals: string[];
  relatedActionIds: string[];
}

export type ActionCategory = ActionFamilyId;

export interface ActionOntologyNode {
  nodeId: string;
  actionId: string;
  family: ActionFamilyId;
  actionType: ActionType;
  label: string;
}

export interface ActionRelationship {
  relationshipId: string;
  sourceActionId: string;
  targetActionId: string;
  relationshipType: RelationshipType;
  description: string;
}

export interface ActionOntologyValidation {
  valid: boolean;
  completenessScore: number;
  actionCount: number;
  familyCount: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}

export interface ActionOntologySummary {
  schemaVersion: string;
  totalActions: number;
  totalFamilies: number;
  totalRelationships: number;
  families: Array<{
    familyId: ActionFamilyId;
    actionCount: number;
    primaryActionId: string;
  }>;
  c1ScenarioLinks: Array<{
    scenarioId: string;
    canonicalActionId: string;
    familyId: ActionFamilyId;
  }>;
  readOnly: true;
  ontologyChain: readonly string[];
  generatedAt: string;
}
