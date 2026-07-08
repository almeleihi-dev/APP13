import type { EvolutionExplanation } from "../domain/evolution-context.js";
import type {
  CapabilityEvolution,
  StrategicTransformation,
  ResilienceGrowth,
  EvolutionaryPlanningCycle,
  MaturityProgression,
  EvolutionTrajectory,
} from "../domain/evolution-context.js";

export class EvolutionExplanationBuilder {
  build(input: {
    outputId: string;
    goal: string;
    capabilities: CapabilityEvolution[];
    maturity: MaturityProgression[];
    transformations: StrategicTransformation[];
    resilience: ResilienceGrowth[];
    cycles: EvolutionaryPlanningCycle[];
    trajectories: EvolutionTrajectory[];
    evolutionConfidenceScore: number;
  }): EvolutionExplanation {
    return {
      explanationId: `explanation-${input.outputId}`,
      headline: `Evolution intelligence for "${input.goal}"`,
      summary: `${input.capabilities.length} capability evolutions, ${input.transformations.length} strategic transformations (confidence ${input.evolutionConfidenceScore}/100) — read-only evolution intelligence from the complete C1–C15 chain.`,
      capabilitySummary: `${input.capabilities.length} long-term capability evolutions across ${input.maturity.length} maturity progression domains.`,
      transformationSummary: `${input.transformations.length} strategic transformations with ${input.trajectories.length} evolution trajectories mapped.`,
      resilienceSummary: `${input.resilience.length} resilience growth areas identified for adaptive maturity progression.`,
      planningSummary: `${input.cycles.length}-phase evolutionary planning cycle for continuous capability development.`,
    };
  }
}

export function createEvolutionExplanationBuilder(): EvolutionExplanationBuilder {
  return new EvolutionExplanationBuilder();
}
