import {
  collectLaunchControlDependencyValidation,
  validateLaunchControlCheckCompleteness,
  validateLaunchControlModuleCoverage,
} from "../../runtime-launch-control/application/launch-control-validator.js";
import { LAUNCH_READINESS_CHECK_IDS } from "../domain/launch-readiness-checks.js";
import { LAUNCH_READINESS_MODULE_IDS } from "../domain/launch-readiness-overview.js";

let launchReadinessDependencyCache: ReturnType<typeof buildLaunchReadinessDependencySnapshot> | undefined;

function buildLaunchReadinessDependencySnapshot() {
  const deps = collectLaunchControlDependencyValidation();
  const allDepsValid = Object.values(deps).every(Boolean);
  return {
    ...deps,
    launchControl:
      allDepsValid &&
      validateLaunchControlCheckCompleteness() &&
      validateLaunchControlModuleCoverage(),
  };
}

export function collectLaunchReadinessDependencyValidation() {
  launchReadinessDependencyCache ??= buildLaunchReadinessDependencySnapshot();
  return launchReadinessDependencyCache;
}

export function validateLaunchReadinessCheckCompleteness(): boolean {
  return LAUNCH_READINESS_CHECK_IDS.length === 24;
}

export function validateLaunchReadinessModuleCoverage(): boolean {
  return LAUNCH_READINESS_MODULE_IDS.length === 24;
}
