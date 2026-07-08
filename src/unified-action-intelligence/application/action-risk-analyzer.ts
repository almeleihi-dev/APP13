import type { ActionRiskSignal } from "../domain/action-intent.js";
import type { ScenarioSeed } from "../domain/scenario-seeds.js";

export class ActionRiskAnalyzer {
  analyze(seed: ScenarioSeed): ActionRiskSignal[] {
    return seed.riskSignals.map((signal) => ({ ...signal }));
  }

  highestSeverity(signals: ActionRiskSignal[]): ActionRiskSignal["severity"] {
    if (signals.some((signal) => signal.severity === "high")) {
      return "high";
    }
    if (signals.some((signal) => signal.severity === "medium")) {
      return "medium";
    }
    return "low";
  }
}

export function createActionRiskAnalyzer(): ActionRiskAnalyzer {
  return new ActionRiskAnalyzer();
}
