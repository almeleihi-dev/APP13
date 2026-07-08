import {
  collectExecutiveLaunchDependencyValidation,
  validateExecutiveLaunchCheckCompleteness,
  validateExecutiveLaunchModuleCoverage,
} from "../../runtime-executive-launch-authority/application/executive-launch-validator.js";
import { CH3_RUNTIME_CHECK_IDS } from "../domain/runtime-completion-checks.js";
import { CH3_RUNTIME_MODULE_IDS } from "../domain/runtime-completion-report.js";

let runtimeCompletionDependencyCache: ReturnType<typeof buildRuntimeCompletionDependencySnapshot> | undefined;

function buildRuntimeCompletionDependencySnapshot() {
  const deps = collectExecutiveLaunchDependencyValidation();
  const allDepsValid = Object.values(deps).every(Boolean);
  return {
    ...deps,
    executiveLaunchAuthority:
      allDepsValid &&
      validateExecutiveLaunchCheckCompleteness() &&
      validateExecutiveLaunchModuleCoverage(),
  };
}

export function collectRuntimeCompletionDependencyValidation() {
  runtimeCompletionDependencyCache ??= buildRuntimeCompletionDependencySnapshot();
  return runtimeCompletionDependencyCache;
}

export function validateRuntimeCompletionCheckCompleteness(): boolean {
  return CH3_RUNTIME_CHECK_IDS.length === 26;
}

export function validateRuntimeCompletionModuleCoverage(): boolean {
  return CH3_RUNTIME_MODULE_IDS.length === 26;
}
