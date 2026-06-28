import type { OptimizationExplanation } from "../domain/optimization-context.js";
import type {
  OptimizationRecommendation,
  EfficiencyImprovement,
  BottleneckAnalysis,
  PerformanceMaximizationOpportunity,
  SystemRefinementCycle,
  WorkflowOptimization,
} from "../domain/optimization-context.js";

export class OptimizationExplanationBuilder {
  build(input: {
    outputId: string;
    goal: string;
    recommendations: OptimizationRecommendation[];
    efficiency: EfficiencyImprovement[];
    bottlenecks: BottleneckAnalysis[];
    performance: PerformanceMaximizationOpportunity[];
    cycles: SystemRefinementCycle[];
    workflows: WorkflowOptimization[];
    optimizationConfidenceScore: number;
  }): OptimizationExplanation {
    return {
      explanationId: `explanation-${input.outputId}`,
      headline: `Optimization intelligence for "${input.goal}"`,
      summary: `${input.recommendations.length} optimization recommendations, ${input.bottlenecks.length} bottlenecks identified (confidence ${input.optimizationConfidenceScore}/100) — read-only optimization intelligence from the complete C1–C14 chain.`,
      efficiencySummary: `${input.efficiency.length} efficiency improvements targeting execution, planning, and verification workflows.`,
      bottleneckSummary: `${input.bottlenecks.length} bottlenecks analyzed with structured elimination plans.`,
      performanceSummary: `${input.performance.length} performance maximization opportunities from learning and strategy signals.`,
      refinementSummary: `${input.cycles.length}-phase system refinement cycle; ${input.workflows.length} workflow optimizations proposed.`,
    };
  }
}

export function createOptimizationExplanationBuilder(): OptimizationExplanationBuilder {
  return new OptimizationExplanationBuilder();
}
