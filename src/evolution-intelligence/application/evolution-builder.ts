import type { OptimizationIntelligenceOutput } from "../../optimization-intelligence/domain/optimization-context.js";
import type { StrategyIntelligenceOutput } from "../../strategy-intelligence/domain/strategy-context.js";
import type { LearningIntelligenceOutput } from "../../learning-intelligence/domain/learning-context.js";
import type { PredictionIntelligenceOutput } from "../../prediction-intelligence/domain/prediction-context.js";
import type {
  CapabilityEvolution,
  MaturityProgression,
  StrategicTransformation,
  ResilienceGrowth,
  EvolutionaryPlanningCycle,
  EvolutionRecommendation,
  EvolutionTrajectory,
  EvolutionConfidence,
} from "../domain/evolution-context.js";
import type {
  EvolutionConfidenceLevel,
  EvolutionMaturityLevel,
} from "../domain/evolution-intelligence-schema.js";

const MATURITY_ORDER: EvolutionMaturityLevel[] = [
  "emerging",
  "developing",
  "established",
  "advanced",
  "transformative",
];

function nextMaturityLevel(current: EvolutionMaturityLevel): EvolutionMaturityLevel {
  const index = MATURITY_ORDER.indexOf(current);
  return MATURITY_ORDER[Math.min(index + 1, MATURITY_ORDER.length - 1)];
}

export class CapabilityEvolutionsBuilder {
  build(
    optimization: OptimizationIntelligenceOutput,
    strategy: StrategyIntelligenceOutput
  ): CapabilityEvolution[] {
    const evolutions: CapabilityEvolution[] = [];

    for (const improvement of optimization.efficiencyImprovements.slice(0, 2)) {
      evolutions.push({
        capabilityId: `cap.${improvement.improvementId}`,
        title: improvement.title,
        description: improvement.description,
        currentLevel: "developing",
        targetLevel: "established",
        horizonDays: 90,
        priority: improvement.priority,
      });
    }

    for (const phase of strategy.longTermRoadmap.phases.slice(0, 2)) {
      evolutions.push({
        capabilityId: `cap.${phase.phaseId}`,
        title: `Evolve: ${phase.title}`,
        description: phase.description,
        currentLevel: "established",
        targetLevel: "advanced",
        horizonDays: phase.horizonDays,
        priority: "high",
      });
    }

    return evolutions;
  }
}

export class MaturityProgressionsBuilder {
  build(
    optimization: OptimizationIntelligenceOutput,
    learning: LearningIntelligenceOutput
  ): MaturityProgression[] {
    const progressions: MaturityProgression[] = [
      {
        progressionId: "mat.optimization",
        domain: "optimization",
        currentMaturity: "developing",
        nextMilestone: "established",
        description: `${optimization.optimizationRecommendations.length} optimization recommendations inform maturity progression.`,
        readinessScore: Math.min(100, optimization.optimizationConfidence.score),
      },
      {
        progressionId: "mat.learning",
        domain: "learning",
        currentMaturity: learning.learningConfidence.level === "high" ? "advanced" : "developing",
        nextMilestone: nextMaturityLevel(
          learning.learningConfidence.level === "high" ? "advanced" : "developing"
        ),
        description: `${learning.learningInsights.length} learning insights drive adaptive maturity.`,
        readinessScore: learning.learningConfidence.score,
      },
      {
        progressionId: "mat.strategy",
        domain: "strategy",
        currentMaturity: "established",
        nextMilestone: "advanced",
        description: "Strategic roadmap phases anchor long-term capability evolution.",
        readinessScore: Math.min(100, optimization.optimizationConfidence.score + 10),
      },
    ];

    return progressions;
  }
}

export class StrategicTransformationsBuilder {
  build(
    optimization: OptimizationIntelligenceOutput,
    strategy: StrategyIntelligenceOutput,
    prediction: PredictionIntelligenceOutput
  ): StrategicTransformation[] {
    const transformations: StrategicTransformation[] = [];

    for (const workflow of optimization.workflowOptimizations.slice(0, 2)) {
      transformations.push({
        transformationId: `trans.${workflow.workflowId}`,
        title: workflow.label,
        description: workflow.description,
        fromState: workflow.currentState,
        toState: workflow.optimizedState,
        horizonDays: 180,
        priority: workflow.impactScore >= 70 ? "high" : "medium",
      });
    }

    for (const entry of strategy.strategicOpportunityMatrix.filter((e) => e.quadrant === "pursue").slice(0, 2)) {
      transformations.push({
        transformationId: `trans.${entry.entryId}`,
        title: entry.title,
        description: entry.description,
        fromState: "Current strategic posture",
        toState: `${entry.impact} impact opportunity realized`,
        horizonDays: 365,
        priority: entry.impact === "high" ? "high" : "medium",
      });
    }

    transformations.push({
      transformationId: "trans.success_trajectory",
      title: "Success trajectory transformation",
      description: prediction.successProbabilityProjection.rationale,
      fromState: `${prediction.successProbabilityProjection.baselineScore}% baseline success`,
      toState: `${prediction.successProbabilityProjection.projectedScore}% projected success`,
      horizonDays: prediction.successProbabilityProjection.horizonDays,
      priority: prediction.successProbabilityProjection.projectedScore >= 75 ? "high" : "medium",
    });

    return transformations;
  }
}

export class ResilienceGrowthBuilder {
  build(
    optimization: OptimizationIntelligenceOutput,
    strategy: StrategyIntelligenceOutput,
    learning: LearningIntelligenceOutput
  ): ResilienceGrowth[] {
    const growth: ResilienceGrowth[] = [];

    for (const plan of optimization.bottleneckEliminationPlans.slice(0, 2)) {
      growth.push({
        resilienceId: `res.${plan.planId}`,
        label: plan.title,
        description: plan.description,
        growthArea: "recovery",
        currentStrength: 55,
        targetStrength: 80,
      });
    }

    for (const contingency of strategy.contingencyStrategies.slice(0, 2)) {
      growth.push({
        resilienceId: `res.${contingency.contingencyId}`,
        label: contingency.trigger,
        description: contingency.response,
        growthArea: "contingency",
        currentStrength: 60,
        targetStrength: 85,
      });
    }

    for (const adaptation of learning.adaptationRecommendations.slice(0, 1)) {
      growth.push({
        resilienceId: `res.${adaptation.recommendationId}`,
        label: adaptation.title,
        description: adaptation.description,
        growthArea: "adaptation",
        currentStrength: 50,
        targetStrength: 75,
      });
    }

    if (optimization.bottleneckAnalyses.some((b) => b.severity === "critical" || b.severity === "high")) {
      growth.push({
        resilienceId: "res.prevention",
        label: "Proactive prevention strengthening",
        description: "Elevate prevention capabilities to reduce high-severity bottleneck recurrence.",
        growthArea: "prevention",
        currentStrength: 45,
        targetStrength: 70,
      });
    }

    return growth;
  }
}

export class EvolutionaryPlanningCyclesBuilder {
  build(): EvolutionaryPlanningCycle[] {
    return [
      {
        cycleId: "epc.assess",
        phase: "assess",
        title: "Assess current evolutionary state",
        description: "Evaluate capability maturity, optimization signals, and resilience posture from C1–C15.",
        order: 1,
      },
      {
        cycleId: "epc.envision",
        phase: "envision",
        title: "Envision future capability state",
        description: "Define strategic transformations and long-term evolution trajectories.",
        order: 2,
      },
      {
        cycleId: "epc.evolve",
        phase: "evolve",
        title: "Execute evolutionary changes",
        description: "Apply capability evolutions, maturity progressions, and resilience growth plans.",
        order: 3,
      },
      {
        cycleId: "epc.integrate",
        phase: "integrate",
        title: "Integrate evolutionary gains",
        description: "Embed evolved capabilities into continuous learning and optimization cycles.",
        order: 4,
      },
    ];
  }
}

export class EvolutionRecommendationsBuilder {
  build(optimization: OptimizationIntelligenceOutput): EvolutionRecommendation[] {
    const recommendations: EvolutionRecommendation[] = [];

    for (const rec of optimization.optimizationRecommendations.slice(0, 3)) {
      recommendations.push({
        recommendationId: `evo.${rec.recommendationId}`,
        title: rec.title,
        description: rec.description,
        category: rec.category === "refinement" ? "planning" : "capability",
        priority: rec.priority,
        projectedImpact: rec.projectedImpact,
      });
    }

    for (const perf of optimization.performanceMaximizationOpportunities.slice(0, 2)) {
      recommendations.push({
        recommendationId: `evo.${perf.opportunityId}`,
        title: perf.title,
        description: perf.description,
        category: "transformation",
        priority: perf.priority,
        projectedImpact: perf.projectedGain,
      });
    }

    return recommendations;
  }
}

export class EvolutionTrajectoriesBuilder {
  build(
    optimization: OptimizationIntelligenceOutput,
    prediction: PredictionIntelligenceOutput
  ): EvolutionTrajectory[] {
    const trajectories: EvolutionTrajectory[] = [
      {
        trajectoryId: "traj.optimization",
        label: "Optimization evolution trajectory",
        description: `${optimization.systemRefinementCycles.length}-phase refinement cycle drives incremental evolution.`,
        direction: optimization.optimizationConfidence.score >= 70 ? "ascending" : "stable",
        confidence: optimization.optimizationConfidence.score,
      },
      {
        trajectoryId: "traj.success",
        label: "Success evolution trajectory",
        description: prediction.successProbabilityProjection.rationale,
        direction:
          prediction.successProbabilityProjection.projectedScore >
          prediction.successProbabilityProjection.baselineScore
            ? "ascending"
            : "stable",
        confidence: prediction.successProbabilityProjection.projectedScore,
      },
    ];

    if (optimization.bottleneckAnalyses.length >= 3) {
      trajectories.push({
        trajectoryId: "traj.transformative",
        label: "Transformative evolution trajectory",
        description: "Multiple bottlenecks signal need for transformative capability evolution.",
        direction: "transformative",
        confidence: Math.min(90, optimization.optimizationConfidence.score + 10),
      });
    }

    return trajectories;
  }
}

export class EvolutionConfidenceBuilder {
  build(input: {
    optimization: OptimizationIntelligenceOutput;
    capabilityCount: number;
    transformationCount: number;
  }): EvolutionConfidence {
    let score = 42;
    score += Math.min(input.optimization.optimizationConfidence.score * 0.22, 20);
    score += Math.min(input.capabilityCount * 5, 15);
    score += Math.min(input.transformationCount * 3, 12);
    score = Math.min(95, Math.max(35, Math.round(score)));

    const level: EvolutionConfidenceLevel = score >= 80 ? "high" : score >= 60 ? "medium" : "low";

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "Strong optimization signals support confident evolution intelligence."
          : level === "medium"
            ? "Evolution viable; maturity progression may require targeted investment."
            : "Limited evolution confidence — treat recommendations as advisory only.",
      optimizationConfidenceScore: input.optimization.optimizationConfidence.score,
      structuralEvolutionScore: Math.min(
        100,
        score + input.capabilityCount * 4 + input.transformationCount * 2
      ),
    };
  }
}

export function createCapabilityEvolutionsBuilder(): CapabilityEvolutionsBuilder {
  return new CapabilityEvolutionsBuilder();
}
export function createMaturityProgressionsBuilder(): MaturityProgressionsBuilder {
  return new MaturityProgressionsBuilder();
}
export function createStrategicTransformationsBuilder(): StrategicTransformationsBuilder {
  return new StrategicTransformationsBuilder();
}
export function createResilienceGrowthBuilder(): ResilienceGrowthBuilder {
  return new ResilienceGrowthBuilder();
}
export function createEvolutionaryPlanningCyclesBuilder(): EvolutionaryPlanningCyclesBuilder {
  return new EvolutionaryPlanningCyclesBuilder();
}
export function createEvolutionRecommendationsBuilder(): EvolutionRecommendationsBuilder {
  return new EvolutionRecommendationsBuilder();
}
export function createEvolutionTrajectoriesBuilder(): EvolutionTrajectoriesBuilder {
  return new EvolutionTrajectoriesBuilder();
}
export function createEvolutionConfidenceBuilder(): EvolutionConfidenceBuilder {
  return new EvolutionConfidenceBuilder();
}
