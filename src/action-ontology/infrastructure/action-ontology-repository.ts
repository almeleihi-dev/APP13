import { ACTION_FAMILIES } from "../domain/action-ontology-schema.js";
import type { CanonicalAction } from "../domain/canonical-action.js";
import {
  getCanonicalActionById,
  getPrimaryActionForFamily,
  listCanonicalActions,
} from "../domain/ontology-seeds.js";
import { collectActionOntologyPaths } from "../domain/action-ontology-screens.js";
import type { ActionFamilyId } from "../domain/action-ontology-schema.js";

export class ActionOntologyRepository {
  listActions(): CanonicalAction[] {
    return listCanonicalActions();
  }

  getActionById(actionId: string): CanonicalAction | undefined {
    return getCanonicalActionById(actionId);
  }

  getActionsByFamily(familyId: ActionFamilyId): CanonicalAction[] {
    return listCanonicalActions().filter((action) => action.category === familyId);
  }

  getPrimaryActionsByFamily(): Array<{ familyId: ActionFamilyId; primaryActionId: string }> {
    return ACTION_FAMILIES.map((familyId) => ({
      familyId,
      primaryActionId: getPrimaryActionForFamily(familyId)?.id ?? "",
    }));
  }

  getActionCount(): number {
    return listCanonicalActions().length;
  }

  getFamilyCount(): number {
    return ACTION_FAMILIES.length;
  }

  getArtifactPaths(rootDir: string): string[] {
    return collectActionOntologyPaths().map((relativePath) =>
      relativePath.startsWith("/") ? relativePath : `${rootDir}/${relativePath}`
    );
  }
}

export function createActionOntologyRepository(): ActionOntologyRepository {
  return new ActionOntologyRepository();
}
