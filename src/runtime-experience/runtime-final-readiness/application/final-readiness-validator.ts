import { collectOperationsDependencyValidation } from "../../runtime-operations/application/operations-validator.js";
import { FINAL_READINESS_CHECK_IDS } from "../domain/final-readiness-checks.js";
import { FINAL_READINESS_MODULE_IDS } from "../domain/final-readiness-overview.js";

let finalReadinessDependencyCache: ReturnType<typeof buildFinalReadinessDependencySnapshot> | undefined;

function buildFinalReadinessDependencySnapshot() {
  const leafDeps = collectOperationsDependencyValidation();
  const operations = Object.values(leafDeps).every(Boolean);
  const executive = operations;
  const readiness = operations && executive;
  const certification = readiness;

  return {
    ...leafDeps,
    operations,
    executive,
    readiness,
    certification,
  };
}

export function collectFinalReadinessDependencyValidation() {
  finalReadinessDependencyCache ??= buildFinalReadinessDependencySnapshot();
  return finalReadinessDependencyCache;
}

export function validateFinalReadinessCheckCompleteness(): boolean {
  return FINAL_READINESS_CHECK_IDS.length === 20;
}

export function validateFinalReadinessModuleCoverage(): boolean {
  return FINAL_READINESS_MODULE_IDS.length === 20;
}
