import { CH3_RUNTIME_MODULE_IDS, CH3_RUNTIME_MODULE_REGISTRY } from "./runtime-completion-report.js";

export const CH3_RUNTIME_API_ENDPOINT_COUNT = CH3_RUNTIME_MODULE_IDS.reduce(
  (sum, id) => sum + CH3_RUNTIME_MODULE_REGISTRY[id].apiEndpointCount,
  0
);

export const CH3_RUNTIME_TEST_SUITE_COUNT = 26;

export const CH3_RUNTIME_VERIFICATION_SCRIPT_COUNT = 26;

export interface RuntimeStatistics {
  moduleCount: number;
  apiEndpointCount: number;
  testSuiteCount: number;
  verificationScriptCount: number;
  chapterRange: "CH3-X5 through CH3-X30";
  completionLayerEndpoints: number;
  readOnly: true;
  delegated: true;
}

export function buildRuntimeStatistics(): RuntimeStatistics {
  return {
    moduleCount: CH3_RUNTIME_MODULE_IDS.length,
    apiEndpointCount: CH3_RUNTIME_API_ENDPOINT_COUNT,
    testSuiteCount: CH3_RUNTIME_TEST_SUITE_COUNT,
    verificationScriptCount: CH3_RUNTIME_VERIFICATION_SCRIPT_COUNT,
    chapterRange: "CH3-X5 through CH3-X30",
    completionLayerEndpoints: 8,
    readOnly: true,
    delegated: true,
  };
}
