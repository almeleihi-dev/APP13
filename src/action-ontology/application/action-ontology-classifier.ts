import type { ActionFamilyId } from "../domain/action-ontology-schema.js";
import type { CanonicalAction } from "../domain/canonical-action.js";
import { listCanonicalActions } from "../domain/ontology-seeds.js";

export class ActionOntologyClassifier {
  classifyByFamily(familyId: ActionFamilyId): CanonicalAction[] {
    return listCanonicalActions().filter((action) => action.category === familyId);
  }

  classifyAction(action: CanonicalAction): {
    familyId: ActionFamilyId;
    actionType: CanonicalAction["actionType"];
  } {
    return {
      familyId: action.category,
      actionType: action.actionType,
    };
  }

  listFamiliesPresent(): ActionFamilyId[] {
    const families = new Set<ActionFamilyId>();
    for (const action of listCanonicalActions()) {
      families.add(action.category);
    }
    return [...families].sort();
  }
}

export function createActionOntologyClassifier(): ActionOntologyClassifier {
  return new ActionOntologyClassifier();
}
