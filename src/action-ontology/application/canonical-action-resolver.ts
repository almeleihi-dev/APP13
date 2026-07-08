import type { CanonicalAction } from "../domain/canonical-action.js";
import {
  getCanonicalActionById,
  listCanonicalActions,
} from "../domain/ontology-seeds.js";

export class CanonicalActionResolver {
  resolveById(actionId: string): CanonicalAction | undefined {
    return getCanonicalActionById(actionId);
  }

  resolveByFamily(familyId: CanonicalAction["category"]): CanonicalAction[] {
    return listCanonicalActions().filter((action) => action.category === familyId);
  }

  resolveAll(): CanonicalAction[] {
    return listCanonicalActions();
  }
}

export function createCanonicalActionResolver(): CanonicalActionResolver {
  return new CanonicalActionResolver();
}
