import { ACTION_FAMILIES, ACTION_ONTOLOGY_SCHEMA_VERSION } from "../domain/action-ontology-schema.js";
import type { ActionOntologyValidation, CanonicalAction } from "../domain/canonical-action.js";

export class ActionOntologyValidator {
  validateCatalog(actions: CanonicalAction[]): ActionOntologyValidation {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    for (const action of actions) {
      if (!action.id) missingFields.push(`${action.name}:id`);
      if (action.requiredSkills.length === 0) missingFields.push(`${action.id}:skills`);
      if (action.requiredResources.length === 0) missingFields.push(`${action.id}:resources`);
      if (action.preconditions.length === 0) missingFields.push(`${action.id}:preconditions`);
      if (action.evidenceRequirements.length === 0) missingFields.push(`${action.id}:evidence`);
      if (action.riskSignals.length === 0) warnings.push(`${action.id}: no risk signals`);
      if (action.relatedActionIds.length === 0) warnings.push(`${action.id}: no related actions`);
    }

    const familiesPresent = new Set(actions.map((action) => action.category));
    for (const family of ACTION_FAMILIES) {
      if (!familiesPresent.has(family)) {
        missingFields.push(`family:${family}`);
      }
    }

    const requiredChecks = actions.length * 5 + ACTION_FAMILIES.length;
    const failedChecks = missingFields.length;
    const completenessScore = Math.max(
      0,
      Math.round(((requiredChecks - failedChecks) / requiredChecks) * 100)
    );

    const valid = missingFields.length === 0 && completenessScore >= 90;

    return {
      valid,
      completenessScore,
      actionCount: actions.length,
      familyCount: familiesPresent.size,
      missingFields,
      warnings,
      summary: valid
        ? `Action ontology catalog valid (${actions.length} actions, ${familiesPresent.size} families).`
        : `Action ontology catalog incomplete: ${missingFields.length} missing requirement(s).`,
    };
  }

  validateAction(action: CanonicalAction): ActionOntologyValidation {
    return this.validateCatalog([action]);
  }
}

export function createActionOntologyValidator(): ActionOntologyValidator {
  return new ActionOntologyValidator();
}

export function buildOntologySchemaVersion(): string {
  return ACTION_ONTOLOGY_SCHEMA_VERSION;
}
