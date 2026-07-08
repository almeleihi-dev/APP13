import type { ScenarioId } from "../domain/action-intelligence-schema.js";
import type { ActionIntent } from "../domain/action-intent.js";
import {
  getScenarioSeed,
  listScenarioSeeds,
  type ScenarioSeed,
} from "../domain/scenario-seeds.js";

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export class ActionIntentClassifier {
  classify(intent: ActionIntent): ScenarioSeed {
    if (intent.scenarioId) {
      return getScenarioSeed(intent.scenarioId);
    }

    const text = normalizeText(intent.rawText);
    let best: ScenarioSeed | undefined;
    let bestScore = 0;

    for (const seed of listScenarioSeeds()) {
      let score = 0;
      for (const keyword of seed.keywords) {
        if (text.includes(keyword)) {
          score += keyword.includes(" ") ? 3 : 1;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        best = seed;
      }
    }

    return best ?? listScenarioSeeds()[0]!;
  }

  resolveScenarioId(intent: ActionIntent): ScenarioId {
    return this.classify(intent).scenarioId;
  }
}

export function createActionIntentClassifier(): ActionIntentClassifier {
  return new ActionIntentClassifier();
}
