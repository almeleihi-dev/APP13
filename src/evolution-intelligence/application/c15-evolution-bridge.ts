import type { EvolutionScenarioId } from "../domain/evolution-intelligence-schema.js";
import {
  OPTIMIZATION_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForOptimization,
} from "../../optimization-intelligence/application/c14-optimization-bridge.js";

export const EVOLUTION_SCENARIO_TO_CANONICAL = OPTIMIZATION_SCENARIO_TO_CANONICAL;

export function resolveCanonicalActionIdForEvolution(input: {
  scenarioId?: EvolutionScenarioId;
  canonicalActionId?: string;
}): { canonicalActionId: string; scenarioId: EvolutionScenarioId | null } {
  return resolveCanonicalActionIdForOptimization(input);
}
