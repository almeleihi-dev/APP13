import {
  collectOperationsCenterDependencyValidation,
  validateOperationsCenterModuleCoverage,
} from "../../runtime-operations-center/application/operations-center-validator.js";
import { LAUNCH_CONTROL_CHECK_IDS } from "../domain/launch-control-checks.js";
import { LAUNCH_CONTROL_MODULE_IDS } from "../domain/launch-control-overview.js";

let launchControlDependencyCache: ReturnType<typeof buildLaunchControlDependencySnapshot> | undefined;

function buildLaunchControlDependencySnapshot() {
  const deps = collectOperationsCenterDependencyValidation();
  const allDepsValid = Object.values(deps).every(Boolean);
  return {
    ...deps,
    operationsCenter: allDepsValid && validateOperationsCenterModuleCoverage(),
  };
}

export function collectLaunchControlDependencyValidation() {
  launchControlDependencyCache ??= buildLaunchControlDependencySnapshot();
  return launchControlDependencyCache;
}

export function validateLaunchControlCheckCompleteness(): boolean {
  return LAUNCH_CONTROL_CHECK_IDS.length === 23;
}

export function validateLaunchControlModuleCoverage(): boolean {
  return LAUNCH_CONTROL_MODULE_IDS.length === 23;
}
