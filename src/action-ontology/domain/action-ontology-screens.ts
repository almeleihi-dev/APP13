import {
  ACTION_FAMILIES,
  ACTION_ONTOLOGY_FIXED_TIMESTAMP,
  ACTION_ONTOLOGY_SCHEMA_VERSION,
  ONTOLOGY_CHAIN,
} from "./action-ontology-schema.js";
import type {
  ActionOntologySummary,
  ActionOntologyValidation,
  ActionRelationship,
  CanonicalAction,
} from "./canonical-action.js";

export interface ActionOntologyHome {
  schema_version: typeof ACTION_ONTOLOGY_SCHEMA_VERSION;
  headline: string;
  description: string;
  ontology_chain: readonly string[];
  family_count: number;
  action_count: number;
  families: Array<{
    family_id: string;
    label: string;
    primary_action_id: string;
  }>;
  c1_integration_note: string;
  read_only: true;
  generated_at: string;
}

export interface CanonicalActionsScreen {
  schema_version: typeof ACTION_ONTOLOGY_SCHEMA_VERSION;
  total_count: number;
  family_filter: string | null;
  actions: Array<{
    action_id: string;
    name: string;
    category: string;
    action_type: string;
    description: string;
    required_skills: CanonicalAction["requiredSkills"];
    required_resources: CanonicalAction["requiredResources"];
    preconditions: CanonicalAction["preconditions"];
    evidence_requirements: CanonicalAction["evidenceRequirements"];
    risk_signals: CanonicalAction["riskSignals"];
    contract_hints: string[];
    execution_hints: string[];
    trust_signals: string[];
    related_action_ids: string[];
  }>;
  read_only: true;
}

export interface ActionRelationshipsScreen {
  schema_version: typeof ACTION_ONTOLOGY_SCHEMA_VERSION;
  action_id: string | null;
  relationship_count: number;
  relationships: Array<{
    relationship_id: string;
    source_action_id: string;
    target_action_id: string;
    relationship_type: string;
    description: string;
  }>;
  read_only: true;
}

export interface ActionOntologyValidationScreen {
  schema_version: typeof ACTION_ONTOLOGY_SCHEMA_VERSION;
  validation: ActionOntologyValidation;
  read_only: true;
}

export interface ActionOntologySummaryScreen {
  schema_version: typeof ACTION_ONTOLOGY_SCHEMA_VERSION;
  summary: ActionOntologySummary;
  read_only: true;
}

const FAMILY_LABELS: Record<(typeof ACTION_FAMILIES)[number], string> = {
  moving: "Moving",
  cleaning: "Cleaning",
  delivery: "Delivery",
  maintenance: "Maintenance",
  professional_service_request: "Professional Service Request",
  documentation_evidence: "Documentation / Evidence",
  inspection_verification: "Inspection / Verification",
  scheduling_coordination: "Scheduling / Coordination",
  pricing_estimation: "Pricing / Estimation",
  contract_preparation: "Contract Preparation",
};

export function buildActionOntologyHome(input: {
  actions: CanonicalAction[];
  families: Array<{ familyId: string; primaryActionId: string }>;
}): ActionOntologyHome {
  return {
    schema_version: ACTION_ONTOLOGY_SCHEMA_VERSION,
    headline: "AN ACT Action Ontology",
    description:
      "Canonical vocabulary of executable actions — the shared language for all AN ACT intelligence layers.",
    ontology_chain: ONTOLOGY_CHAIN,
    family_count: input.families.length,
    action_count: input.actions.length,
    families: input.families.map((family) => ({
      family_id: family.familyId,
      label: FAMILY_LABELS[family.familyId as keyof typeof FAMILY_LABELS] ?? family.familyId,
      primary_action_id: family.primaryActionId,
    })),
    c1_integration_note:
      "CH4-C1 scenario decomposition maps to canonical actions via scenario_id or matching action families.",
    read_only: true,
    generated_at: ACTION_ONTOLOGY_FIXED_TIMESTAMP,
  };
}

export function toCanonicalActionsScreen(
  actions: CanonicalAction[],
  familyFilter: string | null
): CanonicalActionsScreen {
  return {
    schema_version: ACTION_ONTOLOGY_SCHEMA_VERSION,
    total_count: actions.length,
    family_filter: familyFilter,
    actions: actions.map((action) => ({
      action_id: action.id,
      name: action.name,
      category: action.category,
      action_type: action.actionType,
      description: action.description,
      required_skills: action.requiredSkills,
      required_resources: action.requiredResources,
      preconditions: action.preconditions,
      evidence_requirements: action.evidenceRequirements,
      risk_signals: action.riskSignals,
      contract_hints: action.contractHints,
      execution_hints: action.executionHints,
      trust_signals: action.trustSignals,
      related_action_ids: action.relatedActionIds,
    })),
    read_only: true,
  };
}

export function toActionRelationshipsScreen(
  actionId: string | null,
  relationships: ActionRelationship[]
): ActionRelationshipsScreen {
  return {
    schema_version: ACTION_ONTOLOGY_SCHEMA_VERSION,
    action_id: actionId,
    relationship_count: relationships.length,
    relationships: relationships.map((relationship) => ({
      relationship_id: relationship.relationshipId,
      source_action_id: relationship.sourceActionId,
      target_action_id: relationship.targetActionId,
      relationship_type: relationship.relationshipType,
      description: relationship.description,
    })),
    read_only: true,
  };
}

export function toActionOntologyValidationScreen(
  validation: ActionOntologyValidation
): ActionOntologyValidationScreen {
  return {
    schema_version: ACTION_ONTOLOGY_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}

export function toActionOntologySummaryScreen(
  summary: ActionOntologySummary
): ActionOntologySummaryScreen {
  return {
    schema_version: ACTION_ONTOLOGY_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function collectActionOntologyPaths(): string[] {
  return [
    "docs/action-intelligence/CH4-C2-Action-Ontology-Engine.md",
    "src/action-ontology/module.ts",
    "src/api/routes/action-ontology.ts",
    "src/bootstrap/intelligence.ts",
    "src/bootstrap/routes.ts",
    "test/ch4-c2-action-ontology.test.ts",
    "scripts/verify-ch4-c2.sh",
  ];
}

export { FAMILY_LABELS };
