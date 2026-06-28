import { collectOperationsDependencyValidation } from "../../runtime-operations/application/operations-validator.js";
import { READINESS_CHECK_IDS } from "../domain/readiness-checks.js";
import { READINESS_MODULE_IDS } from "../domain/readiness-overview.js";

let readinessDependencyCache: ReturnType<typeof buildReadinessDependencySnapshot> | undefined;

function buildReadinessDependencySnapshot() {
  const leafDeps = collectOperationsDependencyValidation();
  const operations = Object.values(leafDeps).every(Boolean);
  const executive = operations;

  return {
    ...leafDeps,
    operations,
    executive,
  };
}

export function collectReadinessDependencyValidation() {
  readinessDependencyCache ??= buildReadinessDependencySnapshot();
  return readinessDependencyCache;
}

export function validateReadinessCheckCompleteness(): boolean {
  return READINESS_CHECK_IDS.length === 18;
}

export function validateReadinessModuleCoverage(): boolean {
  return READINESS_MODULE_IDS.length === 18;
}
