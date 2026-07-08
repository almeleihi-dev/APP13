import type { ExecutionScenarioId } from "../domain/execution-intelligence-schema.js";
import {
  CONTRACT_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForContract,
} from "../../contract-intelligence/application/c4-contract-bridge.js";

export const EXECUTION_SCENARIO_TO_CANONICAL = CONTRACT_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForExecution(input: {
  scenarioId?: ExecutionScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: ExecutionScenarioId | null } {
  return resolveCanonicalActionIdForContract(input);
}
