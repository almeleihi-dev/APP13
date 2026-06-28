import type { ActionDecomposition } from "../domain/action-intent.js";
import type { ScenarioSeed } from "../domain/scenario-seeds.js";
import { buildExecutionPathForScenario } from "./action-execution-path-builder.js";

export class ActionDecomposer {
  decompose(seed: ScenarioSeed): ActionDecomposition {
    const executionPath = buildExecutionPathForScenario(seed);

    return {
      goal: seed.goal,
      category: seed.goal.category,
      steps: seed.steps,
      resources: seed.resources,
      skills: seed.skills,
      timeBand: seed.timeBand,
      riskSignals: seed.riskSignals,
      executionPath,
    };
  }
}

export function createActionDecomposer(): ActionDecomposer {
  return new ActionDecomposer();
}
