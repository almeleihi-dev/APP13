import {
  ACTION_FAMILIES,
  ACTION_ONTOLOGY_FIXED_TIMESTAMP,
  ACTION_ONTOLOGY_SCHEMA_VERSION,
  ONTOLOGY_CHAIN,
  type ActionFamilyId,
} from "../domain/action-ontology-schema.js";
import type { ActionOntologySummary, CanonicalAction } from "../domain/canonical-action.js";
import {
  C1_SCENARIO_TO_CANONICAL_ACTION,
  C1_SCENARIO_TO_FAMILY,
} from "./c1-ontology-bridge.js";
import type { ActionRelationship } from "../domain/canonical-action.js";

export class ActionOntologySummaryBuilder {
  build(input: {
    actions: CanonicalAction[];
    relationships: ActionRelationship[];
  }): ActionOntologySummary {
    const familyMap = new Map<ActionFamilyId, CanonicalAction[]>();
    for (const action of input.actions) {
      const existing = familyMap.get(action.category) ?? [];
      existing.push(action);
      familyMap.set(action.category, existing);
    }

    const families = ACTION_FAMILIES.map((familyId) => ({
      familyId,
      actionCount: familyMap.get(familyId)?.length ?? 0,
      primaryActionId: familyMap.get(familyId)?.[0]?.id ?? "",
    }));

    const c1ScenarioLinks = Object.entries(C1_SCENARIO_TO_CANONICAL_ACTION).map(
      ([scenarioId, canonicalActionId]) => ({
        scenarioId,
        canonicalActionId,
        familyId: C1_SCENARIO_TO_FAMILY[scenarioId as keyof typeof C1_SCENARIO_TO_FAMILY],
      })
    );

    return {
      schemaVersion: ACTION_ONTOLOGY_SCHEMA_VERSION,
      totalActions: input.actions.length,
      totalFamilies: familyMap.size,
      totalRelationships: input.relationships.length,
      families,
      c1ScenarioLinks,
      readOnly: true,
      ontologyChain: ONTOLOGY_CHAIN,
      generatedAt: ACTION_ONTOLOGY_FIXED_TIMESTAMP,
    };
  }
}

export function createActionOntologySummaryBuilder(): ActionOntologySummaryBuilder {
  return new ActionOntologySummaryBuilder();
}
