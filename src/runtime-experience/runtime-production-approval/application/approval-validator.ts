import {
  collectFinalReadinessDependencyValidation,
  validateFinalReadinessCheckCompleteness,
  validateFinalReadinessModuleCoverage,
} from "../../runtime-final-readiness/application/final-readiness-validator.js";
import { APPROVAL_CHECK_IDS } from "../domain/approval-checks.js";
import { APPROVAL_MODULE_IDS } from "../domain/approval-overview.js";

let approvalDependencyCache: ReturnType<typeof buildApprovalDependencySnapshot> | undefined;

function buildApprovalDependencySnapshot() {
  const deps = collectFinalReadinessDependencyValidation();
  const allDepsValid = Object.values(deps).every(Boolean);
  return {
    ...deps,
    finalReadiness:
      allDepsValid &&
      validateFinalReadinessCheckCompleteness() &&
      validateFinalReadinessModuleCoverage(),
  };
}

export function collectApprovalDependencyValidation() {
  approvalDependencyCache ??= buildApprovalDependencySnapshot();
  return approvalDependencyCache;
}

export function validateApprovalCheckCompleteness(): boolean {
  return APPROVAL_CHECK_IDS.length === 21;
}

export function validateApprovalModuleCoverage(): boolean {
  return APPROVAL_MODULE_IDS.length === 21;
}
