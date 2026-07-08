import {
  collectLaunchReadinessDependencyValidation,
  validateLaunchReadinessCheckCompleteness,
  validateLaunchReadinessModuleCoverage,
} from "../../runtime-launch-readiness-authority/application/launch-readiness-validator.js";
import { EXECUTIVE_LAUNCH_CHECK_IDS } from "../domain/executive-launch-checks.js";
import { EXECUTIVE_LAUNCH_MODULE_IDS } from "../domain/executive-launch-overview.js";

let executiveLaunchDependencyCache: ReturnType<typeof buildExecutiveLaunchDependencySnapshot> | undefined;

function buildExecutiveLaunchDependencySnapshot() {
  const deps = collectLaunchReadinessDependencyValidation();
  const allDepsValid = Object.values(deps).every(Boolean);
  return {
    ...deps,
    launchReadinessAuthority:
      allDepsValid &&
      validateLaunchReadinessCheckCompleteness() &&
      validateLaunchReadinessModuleCoverage(),
  };
}

export function collectExecutiveLaunchDependencyValidation() {
  executiveLaunchDependencyCache ??= buildExecutiveLaunchDependencySnapshot();
  return executiveLaunchDependencyCache;
}

export function validateExecutiveLaunchCheckCompleteness(): boolean {
  return EXECUTIVE_LAUNCH_CHECK_IDS.length === 25;
}

export function validateExecutiveLaunchModuleCoverage(): boolean {
  return EXECUTIVE_LAUNCH_MODULE_IDS.length === 25;
}
