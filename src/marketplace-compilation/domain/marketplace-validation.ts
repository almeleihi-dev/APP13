import type { ActionBlueprint } from "../../action-blueprint/domain/action-blueprint.js";
import { validateBlueprint } from "../../action-blueprint/domain/action-blueprint.js";
import type { GlobalRegistryEntry } from "../../blueprint-governance/domain/blueprint-registry.js";
import type { MarketplaceValidationReport } from "./marketplace-listing.js";

export function validateForMarketplaceCompilation(input: {
  blueprint: ActionBlueprint;
  registryEntry?: GlobalRegistryEntry;
}): MarketplaceValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  const blueprintValidation = validateBlueprint(input.blueprint);
  if (!blueprintValidation.valid) {
    errors.push(blueprintValidation.summary);
  }
  if (!blueprintValidation.compilable) {
    errors.push("Blueprint is not compilable");
  }

  let governanceApproved = false;
  if (!input.registryEntry) {
    errors.push("Governance registry entry required for marketplace compilation");
  } else {
    if (input.registryEntry.status !== "published") {
      errors.push(`Governance status must be published, got ${input.registryEntry.status}`);
    } else {
      governanceApproved = true;
    }
    if (!input.registryEntry.marketplaceReadiness.ready) {
      warnings.push(...input.registryEntry.marketplaceReadiness.blockers);
    }
    const certOrder = ["unverified", "bronze", "silver", "gold", "platinum"];
    if (certOrder.indexOf(input.registryEntry.certificationLevel) < certOrder.indexOf("bronze")) {
      warnings.push("Certification below bronze — listing may have limited visibility");
    }
  }

  if (input.blueprint.scope.inclusions.length === 0) {
    warnings.push("Blueprint has no scope inclusions");
  }

  const valid = errors.length === 0;
  const compilable = valid && governanceApproved;

  return {
    valid,
    compilable,
    governanceApproved,
    errors,
    warnings,
    summary: compilable
      ? `Blueprint ${input.blueprint.blueprintId} approved for marketplace compilation.`
      : `Blueprint ${input.blueprint.blueprintId} failed marketplace compilation validation.`,
  };
}
