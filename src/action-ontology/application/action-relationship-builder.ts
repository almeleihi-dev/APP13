import type { ActionRelationship, CanonicalAction } from "../domain/canonical-action.js";
import type { RelationshipType } from "../domain/action-ontology-schema.js";
import { listCanonicalActions } from "../domain/ontology-seeds.js";

function inferRelationshipType(source: CanonicalAction, target: CanonicalAction): RelationshipType {
  if (source.category === "contract_preparation" && target.category !== "contract_preparation") {
    return "prepares_for";
  }
  if (source.category === "inspection_verification") {
    return "follows";
  }
  if (source.category === "scheduling_coordination") {
    return "enables";
  }
  if (source.category === "pricing_estimation") {
    return "requires";
  }
  return "related_to";
}

function describeRelationship(
  source: CanonicalAction,
  target: CanonicalAction,
  type: RelationshipType
): string {
  return `${source.name} ${type.replace(/_/g, " ")} ${target.name}`;
}

export class ActionRelationshipBuilder {
  buildForAction(actionId: string): ActionRelationship[] {
    const action = listCanonicalActions().find((entry) => entry.id === actionId);
    if (!action) {
      return [];
    }

    const relationships: ActionRelationship[] = [];
    for (const targetId of action.relatedActionIds) {
      const target = listCanonicalActions().find((entry) => entry.id === targetId);
      if (!target) {
        continue;
      }
      const relationshipType = inferRelationshipType(action, target);
      relationships.push({
        relationshipId: `rel.${action.id}.${targetId}`,
        sourceActionId: action.id,
        targetActionId: targetId,
        relationshipType,
        description: describeRelationship(action, target, relationshipType),
      });
    }

    return relationships.sort((left, right) =>
      left.relationshipId.localeCompare(right.relationshipId)
    );
  }

  buildAll(): ActionRelationship[] {
    const all: ActionRelationship[] = [];
    for (const action of listCanonicalActions()) {
      all.push(...this.buildForAction(action.id));
    }
    return all;
  }
}

export function createActionRelationshipBuilder(): ActionRelationshipBuilder {
  return new ActionRelationshipBuilder();
}
