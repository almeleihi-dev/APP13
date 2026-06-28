import { collectOperationsDependencyValidation } from "../../runtime-operations/application/operations-validator.js";
import { EXECUTIVE_MODULE_IDS } from "../domain/executive-overview.js";

let executiveDependencyCache: ReturnType<typeof buildExecutiveDependencySnapshot> | undefined;

function buildExecutiveDependencySnapshot() {
  const leafDeps = collectOperationsDependencyValidation();
  const operations = Object.values(leafDeps).every(Boolean);

  return {
    ...leafDeps,
    operations,
  };
}

export function collectExecutiveDependencyValidation() {
  executiveDependencyCache ??= buildExecutiveDependencySnapshot();
  return executiveDependencyCache;
}

export function validateExecutiveModuleCoverage(): boolean {
  return EXECUTIVE_MODULE_IDS.length === 17;
}
