import {
  collectApprovalDependencyValidation,
  validateApprovalCheckCompleteness,
  validateApprovalModuleCoverage,
} from "../../runtime-production-approval/application/approval-validator.js";
import { OPERATIONS_CENTER_MODULE_IDS } from "../domain/operations-center-overview.js";

let operationsCenterDependencyCache: ReturnType<typeof buildOperationsCenterDependencySnapshot> | undefined;

function buildOperationsCenterDependencySnapshot() {
  const deps = collectApprovalDependencyValidation();
  const allDepsValid = Object.values(deps).every(Boolean);
  return {
    ...deps,
    productionApproval:
      allDepsValid &&
      validateApprovalCheckCompleteness() &&
      validateApprovalModuleCoverage(),
  };
}

export function collectOperationsCenterDependencyValidation() {
  operationsCenterDependencyCache ??= buildOperationsCenterDependencySnapshot();
  return operationsCenterDependencyCache;
}

export function validateOperationsCenterModuleCoverage(): boolean {
  return OPERATIONS_CENTER_MODULE_IDS.length === 22;
}
