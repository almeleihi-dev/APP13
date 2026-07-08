import type { OrchestrationScenarioId } from "../domain/orchestration-intelligence-schema.js";
import {
  EVOLUTION_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForEvolution,
} from "../../evolution-intelligence/application/c15-evolution-bridge.js";

export const ORCHESTRATION_SCENARIO_TO_CANONICAL = EVOLUTION_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForOrchestration(input: {
  scenarioId?: OrchestrationScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: OrchestrationScenarioId | null } {
  return resolveCanonicalActionIdForEvolution(input);
}
