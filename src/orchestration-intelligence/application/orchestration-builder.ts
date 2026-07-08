import type { EvolutionIntelligenceOutput } from "../../evolution-intelligence/domain/evolution-context.js";
import type { OptimizationIntelligenceOutput } from "../../optimization-intelligence/domain/optimization-context.js";
import type { LearningIntelligenceOutput } from "../../learning-intelligence/domain/learning-context.js";
import type { StrategyIntelligenceOutput } from "../../strategy-intelligence/domain/strategy-context.js";
import type { PredictionIntelligenceOutput } from "../../prediction-intelligence/domain/prediction-context.js";
import type {
  ChainTraceEntry,
  OrchestrationLayer,
  CrossEngineCoordination,
  UnifiedIntelligenceSnapshot,
  OrchestrationReadiness,
  OrchestrationRecommendation,
  OrchestrationConfidence,
} from "../domain/orchestration-context.js";
import type { OrchestrationConfidenceLevel } from "../domain/orchestration-intelligence-schema.js";

interface ChainRefs {
  intentRef: string;
  canonicalActionId: string;
  planId: string;
  pricingRef: string;
  contractRef: string;
  executionGuidanceId: string;
  outcomeEvaluationId: string;
  trustRecommendationId: string;
  decisionRecommendationId: string;
  recommendationOutputId: string;
  insightOutputId: string;
  predictionOutputId: string;
  strategyOutputId: string;
  learningOutputId: string;
  optimizationOutputId: string;
  evolutionOutputId: string;
}

function buildChainRefs(evolution: EvolutionIntelligenceOutput): ChainRefs {
  return {
    intentRef: `intent-${evolution.canonicalActionId}`,
    canonicalActionId: evolution.canonicalActionId,
    planId: evolution.planId,
    pricingRef: `pricing-${evolution.planId}`,
    contractRef: `contract-${evolution.executionGuidanceId}`,
    executionGuidanceId: evolution.executionGuidanceId,
    outcomeEvaluationId: evolution.outcomeEvaluationId,
    trustRecommendationId: evolution.trustRecommendationId,
    decisionRecommendationId: evolution.decisionRecommendationId,
    recommendationOutputId: evolution.recommendationOutputId,
    insightOutputId: evolution.insightOutputId,
    predictionOutputId: evolution.predictionOutputId,
    strategyOutputId: evolution.strategyOutputId,
    learningOutputId: evolution.learningOutputId,
    optimizationOutputId: evolution.optimizationOutputId,
    evolutionOutputId: evolution.outputId,
  };
}

export class ChainTraceBuilder {
  build(
    evolution: EvolutionIntelligenceOutput,
    strategy: StrategyIntelligenceOutput,
    learning: LearningIntelligenceOutput,
    optimization: OptimizationIntelligenceOutput,
    prediction: PredictionIntelligenceOutput
  ): ChainTraceEntry[] {
    const refs = buildChainRefs(evolution);

    return [
      { step: 1, engineKey: "intent", layerLabel: "Intent Intelligence (C1)", outputRef: refs.intentRef, status: "linked", confidenceScore: 70 },
      { step: 2, engineKey: "canonical_action", layerLabel: "Action Ontology (C2)", outputRef: refs.canonicalActionId, status: "active", confidenceScore: 75 },
      { step: 3, engineKey: "action_plan", layerLabel: "Action Planning (C3)", outputRef: refs.planId, status: "active", confidenceScore: 78 },
      { step: 4, engineKey: "dynamic_pricing", layerLabel: "Dynamic Pricing (C4)", outputRef: refs.pricingRef, status: "linked", confidenceScore: 72 },
      { step: 5, engineKey: "contract_intelligence", layerLabel: "Contract Intelligence (C5)", outputRef: refs.contractRef, status: "linked", confidenceScore: 74 },
      { step: 6, engineKey: "execution_intelligence", layerLabel: "Execution Intelligence (C6)", outputRef: refs.executionGuidanceId, status: "active", confidenceScore: 76 },
      { step: 7, engineKey: "outcome_intelligence", layerLabel: "Outcome Intelligence (C7)", outputRef: refs.outcomeEvaluationId, status: "active", confidenceScore: strategy.strategicConfidence.score },
      { step: 8, engineKey: "trust_intelligence", layerLabel: "Trust Intelligence (C8)", outputRef: refs.trustRecommendationId, status: "active", confidenceScore: 73 },
      { step: 9, engineKey: "decision_intelligence", layerLabel: "Decision Intelligence (C9)", outputRef: refs.decisionRecommendationId, status: "active", confidenceScore: 77 },
      { step: 10, engineKey: "recommendation_intelligence", layerLabel: "Recommendation Intelligence (C10)", outputRef: refs.recommendationOutputId, status: "active", confidenceScore: 79 },
      { step: 11, engineKey: "insight_intelligence", layerLabel: "Insight Intelligence (C11)", outputRef: refs.insightOutputId, status: "active", confidenceScore: 80 },
      { step: 12, engineKey: "prediction_intelligence", layerLabel: "Prediction Intelligence (C12)", outputRef: refs.predictionOutputId, status: "active", confidenceScore: prediction.predictionConfidence.score },
      { step: 13, engineKey: "strategy_intelligence", layerLabel: "Strategy Intelligence (C13)", outputRef: refs.strategyOutputId, status: "active", confidenceScore: strategy.strategicConfidence.score },
      { step: 14, engineKey: "learning_intelligence", layerLabel: "Learning Intelligence (C14)", outputRef: refs.learningOutputId, status: "active", confidenceScore: learning.learningConfidence.score },
      { step: 15, engineKey: "optimization_intelligence", layerLabel: "Optimization Intelligence (C15)", outputRef: refs.optimizationOutputId, status: "active", confidenceScore: optimization.optimizationConfidence.score },
      { step: 16, engineKey: "evolution_intelligence", layerLabel: "Evolution Intelligence (C16)", outputRef: refs.evolutionOutputId, status: "active", confidenceScore: evolution.evolutionConfidence.score },
    ];
  }
}

export class OrchestrationLayersBuilder {
  build(chainTrace: ChainTraceEntry[]): OrchestrationLayer[] {
    return chainTrace.map((entry, index) => ({
      layerId: `layer.${entry.engineKey}`,
      engineKey: entry.engineKey,
      label: entry.layerLabel,
      outputRef: entry.outputRef,
      status: entry.status,
      confidenceScore: entry.confidenceScore,
      upstreamRef: index > 0 ? chainTrace[index - 1]!.outputRef : null,
    }));
  }
}

export class CrossEngineCoordinationBuilder {
  build(chainTrace: ChainTraceEntry[]): CrossEngineCoordination[] {
    const coordinations: CrossEngineCoordination[] = [];

    for (let i = 1; i < chainTrace.length; i++) {
      const source = chainTrace[i - 1]!;
      const target = chainTrace[i]!;
      coordinations.push({
        coordinationId: `coord.${source.engineKey}.${target.engineKey}`,
        sourceLayer: source.engineKey,
        targetLayer: target.engineKey,
        description: `${source.layerLabel} feeds ${target.layerLabel} via ${target.outputRef}.`,
        syncStatus: target.confidenceScore >= 75 ? "synchronized" : "aligned",
      });
    }

    return coordinations;
  }
}

export class UnifiedIntelligenceSnapshotsBuilder {
  build(
    evolution: EvolutionIntelligenceOutput,
    optimization: OptimizationIntelligenceOutput,
    learning: LearningIntelligenceOutput,
    strategy: StrategyIntelligenceOutput,
    prediction: PredictionIntelligenceOutput
  ): UnifiedIntelligenceSnapshot[] {
    return [
      {
        snapshotId: "snap.evolution",
        engineKey: "evolution_intelligence",
        label: "Evolution Intelligence",
        confidenceScore: evolution.evolutionConfidence.score,
        signalCount: evolution.capabilityEvolutions.length + evolution.strategicTransformations.length,
        summary: `${evolution.capabilityEvolutions.length} capability evolutions, ${evolution.resilienceGrowth.length} resilience growth areas.`,
      },
      {
        snapshotId: "snap.optimization",
        engineKey: "optimization_intelligence",
        label: "Optimization Intelligence",
        confidenceScore: optimization.optimizationConfidence.score,
        signalCount: optimization.optimizationRecommendations.length,
        summary: `${optimization.efficiencyImprovements.length} efficiency improvements, ${optimization.bottleneckAnalyses.length} bottlenecks.`,
      },
      {
        snapshotId: "snap.learning",
        engineKey: "learning_intelligence",
        label: "Learning Intelligence",
        confidenceScore: learning.learningConfidence.score,
        signalCount: learning.learningInsights.length,
        summary: `${learning.knowledgeGaps.length} knowledge gaps, ${learning.adaptationRecommendations.length} adaptations.`,
      },
      {
        snapshotId: "snap.strategy",
        engineKey: "strategy_intelligence",
        label: "Strategy Intelligence",
        confidenceScore: strategy.strategicConfidence.score,
        signalCount: strategy.strategicObjectives.length,
        summary: `${strategy.strategicObjectives.length} objectives, ${strategy.contingencyStrategies.length} contingencies.`,
      },
      {
        snapshotId: "snap.prediction",
        engineKey: "prediction_intelligence",
        label: "Prediction Intelligence",
        confidenceScore: prediction.predictionConfidence.score,
        signalCount: prediction.whatIfAnalysis.length,
        summary: `${prediction.successProbabilityProjection.projectedScore}% projected success.`,
      },
    ];
  }
}

export class OrchestrationReadinessBuilder {
  build(layers: OrchestrationLayer[], chainTrace: ChainTraceEntry[]): OrchestrationReadiness {
    const activeLayers = layers.filter((l) => l.status === "active").length;
    const totalLayers = layers.length;
    const layerCoverage = Math.round((activeLayers / totalLayers) * 100);
    const avgConfidence = Math.round(
      chainTrace.reduce((sum, e) => sum + e.confidenceScore, 0) / chainTrace.length
    );
    const overallScore = Math.round((layerCoverage + avgConfidence) / 2);

    const warnings: string[] = [];
    if (layerCoverage < 80) warnings.push("Some chain layers are linked rather than fully active.");
    if (avgConfidence < 65) warnings.push("Average chain confidence below optimal threshold.");

    return {
      readinessId: "readiness.orchestration",
      overallScore,
      layerCoverage,
      totalLayers,
      activeLayers,
      warnings,
      summary:
        warnings.length === 0
          ? `All ${totalLayers} intelligence layers orchestrated with ${overallScore}/100 readiness.`
          : `Orchestration readiness ${overallScore}/100 — ${warnings.length} advisory warning(s).`,
    };
  }
}

export class OrchestrationRecommendationsBuilder {
  build(
    evolution: EvolutionIntelligenceOutput,
    optimization: OptimizationIntelligenceOutput,
    readiness: OrchestrationReadiness
  ): OrchestrationRecommendation[] {
    const recommendations: OrchestrationRecommendation[] = [];

    if (readiness.overallScore < 75) {
      recommendations.push({
        recommendationId: "orch.readiness_boost",
        title: "Strengthen chain readiness",
        description: readiness.summary,
        affectedLayers: ["orchestration_intelligence", "evolution_intelligence"],
        priority: "high",
      });
    }

    for (const rec of evolution.evolutionRecommendations.slice(0, 2)) {
      recommendations.push({
        recommendationId: `orch.${rec.recommendationId}`,
        title: rec.title,
        description: rec.description,
        affectedLayers: ["evolution_intelligence", "optimization_intelligence"],
        priority: rec.priority === "critical" ? "critical" : rec.priority,
      });
    }

    for (const rec of optimization.optimizationRecommendations.slice(0, 1)) {
      recommendations.push({
        recommendationId: `orch.${rec.recommendationId}`,
        title: rec.title,
        description: rec.description,
        affectedLayers: ["optimization_intelligence", "learning_intelligence"],
        priority: rec.priority,
      });
    }

    return recommendations;
  }
}

export class OrchestrationConfidenceBuilder {
  build(input: {
    evolution: EvolutionIntelligenceOutput;
    readiness: OrchestrationReadiness;
    chainLayerCount: number;
  }): OrchestrationConfidence {
    let score = 45;
    score += Math.min(input.evolution.evolutionConfidence.score * 0.2, 18);
    score += Math.min(input.readiness.overallScore * 0.25, 22);
    score += Math.min(input.chainLayerCount * 1.5, 12);
    score = Math.min(95, Math.max(35, Math.round(score)));

    const level: OrchestrationConfidenceLevel = score >= 80 ? "high" : score >= 60 ? "medium" : "low";

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "Full C1–C16 chain orchestrated with high confidence and traceability."
          : level === "medium"
            ? "Chain orchestration viable; some layers may require attention."
            : "Limited orchestration confidence — treat unified outputs as advisory only.",
      evolutionConfidenceScore: input.evolution.evolutionConfidence.score,
      chainIntegrityScore: input.readiness.overallScore,
    };
  }
}

export function createChainTraceBuilder(): ChainTraceBuilder {
  return new ChainTraceBuilder();
}
export function createOrchestrationLayersBuilder(): OrchestrationLayersBuilder {
  return new OrchestrationLayersBuilder();
}
export function createCrossEngineCoordinationBuilder(): CrossEngineCoordinationBuilder {
  return new CrossEngineCoordinationBuilder();
}
export function createUnifiedIntelligenceSnapshotsBuilder(): UnifiedIntelligenceSnapshotsBuilder {
  return new UnifiedIntelligenceSnapshotsBuilder();
}
export function createOrchestrationReadinessBuilder(): OrchestrationReadinessBuilder {
  return new OrchestrationReadinessBuilder();
}
export function createOrchestrationRecommendationsBuilder(): OrchestrationRecommendationsBuilder {
  return new OrchestrationRecommendationsBuilder();
}
export function createOrchestrationConfidenceBuilder(): OrchestrationConfidenceBuilder {
  return new OrchestrationConfidenceBuilder();
}
