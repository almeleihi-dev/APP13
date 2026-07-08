import type { StrategyExplanation } from "../domain/strategy-context.js";
import type {
  StrategicObjective,
  LongTermRoadmap,
  ScenarioPlan,
  StrategicRiskMitigation,
  StrategicOpportunityMatrixEntry,
  ContingencyStrategy,
} from "../domain/strategy-context.js";

export class StrategyExplanationBuilder {
  build(input: {
    outputId: string;
    goal: string;
    objectives: StrategicObjective[];
    roadmap: LongTermRoadmap;
    scenarios: ScenarioPlan[];
    mitigations: StrategicRiskMitigation[];
    opportunities: StrategicOpportunityMatrixEntry[];
    contingencies: ContingencyStrategy[];
    strategicConfidenceScore: number;
  }): StrategyExplanation {
    const pursueCount = input.opportunities.filter((o) => o.quadrant === "pursue").length;

    return {
      explanationId: `explanation-${input.outputId}`,
      headline: `Strategic plan for "${input.goal}"`,
      summary: `${input.objectives.length} objectives, ${input.scenarios.length} scenario plans (confidence ${input.strategicConfidenceScore}/100) — read-only strategy intelligence from the complete C1–C12 chain.`,
      objectiveSummary: `Primary objectives: ${input.objectives.map((o) => o.title).join(", ")}.`,
      roadmapSummary: input.roadmap.summary,
      riskSummary: `${input.mitigations.length} strategic risk mitigations; ${input.contingencies.length} contingency strategies defined.`,
      opportunitySummary: `${input.opportunities.length} matrix entries; ${pursueCount} marked pursue.`,
      scenarioSummary: `Scenario planning covers ${input.scenarios.filter((s) => s.strategicFit === "primary").length} primary and ${input.scenarios.filter((s) => s.strategicFit !== "primary").length} alternative paths.`,
    };
  }
}

export function createStrategyExplanationBuilder(): StrategyExplanationBuilder {
  return new StrategyExplanationBuilder();
}
