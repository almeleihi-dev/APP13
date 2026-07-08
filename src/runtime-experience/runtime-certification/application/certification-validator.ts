import { collectOperationsDependencyValidation } from "../../runtime-operations/application/operations-validator.js";
import { CERTIFICATION_CHECK_IDS } from "../domain/certification-checks.js";
import { CERTIFICATION_MODULE_IDS } from "../domain/certification-overview.js";

let certificationDependencyCache: ReturnType<typeof buildCertificationDependencySnapshot> | undefined;

function buildCertificationDependencySnapshot() {
  const leafDeps = collectOperationsDependencyValidation();
  const operations = Object.values(leafDeps).every(Boolean);
  const executive = operations;
  const readiness = operations && executive;

  return {
    ...leafDeps,
    operations,
    executive,
    readiness,
  };
}

export function collectCertificationDependencyValidation() {
  certificationDependencyCache ??= buildCertificationDependencySnapshot();
  return certificationDependencyCache;
}

export function validateCertificationCheckCompleteness(): boolean {
  return CERTIFICATION_CHECK_IDS.length === 19;
}

export function validateCertificationModuleCoverage(): boolean {
  return CERTIFICATION_MODULE_IDS.length === 19;
}
