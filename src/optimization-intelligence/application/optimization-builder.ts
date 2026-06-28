import type { LearningIntelligenceOutput } from "../../learning-intelligence/domain/learning-context.js";
import type { StrategyIntelligenceOutput } from "../../strategy-intelligence/domain/strategy-context.js";
import type { PredictionIntelligenceOutput } from "../../prediction-intelligence/domain/prediction-context.js";
import type { OutcomeIntelligenceEvaluation } from "../../outcome-intelligence/domain/outcome-context.js";
import type {
  OptimizationRecommendation,
  EfficiencyImprovement,
  ResourceOptimization,
  BottleneckAnalysis,
  BottleneckEliminationPlan,
  PerformanceMaximizationOpportunity,
  SystemRefinementCycle,
  WorkflowOptimization,
  OptimizationConfidence,
} from "../domain/optimization-context.js";
import type { OptimizationConfidenceLevel } from "../domain/optimization-intelligence-schema.js";

export class OptimizationRecommendationsBuilder {
  build(learning: LearningIntelligenceOutput, strategy: StrategyIntelligenceOutput): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    for (const adaptation of learning.adaptationRecommendations.slice(0, 3)) {
      recommendations.push({
        recommendationId: `opt.${adaptation.recommendationId}`,
        title: adaptation.title,
        description: adaptation.description,
        category: "refinement",
        priority: adaptation.priority,
        projectedImpact: `Triggered by: ${adaptation.trigger}`,
      });
    }

    for (const improvement of learning.performanceImprovementOpportunities.slice(0, 2)) {
      recommendations.push({
        recommendationId: `opt.${improvement.opportunityId}`,
        title: improvement.title,
        description: improvement.description,
        category: "performance",
        priority: improvement.priority,
        projectedImpact: improvement.projectedGain,
      });
    }

    for (const opt of strategy.priorityOptimizations.slice(0, 2)) {
      recommendations.push({
        recommendationId: `opt.${opt.optimizationId}`,
        title: opt.title,
        description: opt.description,
        category: "efficiency",
        priority: opt.impactScore >= 70 ? "high" : "medium",
        projectedImpact: `Impact score ${opt.impactScore}/100`,
      });
    }

    return recommendations;
  }
}

export class EfficiencyImprovementsBuilder {
  build(learning: LearningIntelligenceOutput, strategy: StrategyIntelligenceOutput): EfficiencyImprovement[] {
    const improvements: EfficiencyImprovement[] = [];

    for (const lesson of learning.lessonsLearned.slice(0, 2)) {
      improvements.push({
        improvementId: `eff.${lesson.lessonId}`,
        title: lesson.title,
        description: lesson.description,
        targetArea: lesson.sourcePhase.includes("outcome") ? "verification" : "execution",
        efficiencyGain: lesson.applicability,
        priority: "medium",
      });
    }

    for (const phase of strategy.longTermRoadmap.phases.slice(0, 2)) {
      improvements.push({
        improvementId: `eff.${phase.phaseId}`,
        title: `Streamline: ${phase.title}`,
        description: phase.description,
        targetArea: "planning",
        efficiencyGain: `Reduce ${phase.horizonDays}-day horizon friction`,
        priority: "high",
      });
    }

    return improvements;
  }
}

export class ResourceOptimizationsBuilder {
  build(strategy: StrategyIntelligenceOutput, evaluation: OutcomeIntelligenceEvaluation): ResourceOptimization[] {
    const optimizations: ResourceOptimization[] = [
      {
        resourceId: "resource.time",
        label: "Time allocation optimization",
        description: "Rebalance milestone durations based on priority optimization signals.",
        resourceType: "time",
        optimizationAction: "Compress low-impact phases; extend high-impact verification windows.",
        savingsEstimate: `${strategy.priorityOptimizations.length} priority slots rebalanced`,
      },
      {
        resourceId: "resource.attention",
        label: "Attention focus optimization",
        description: "Concentrate effort on pursue-quadrant strategic opportunities.",
        resourceType: "attention",
        optimizationAction: "Deprioritize low-impact contingency monitoring.",
        savingsEstimate: `${strategy.strategicOpportunityMatrix.filter((e) => e.quadrant === "pursue").length} high-value targets`,
      },
    ];

    if (evaluation.goalAchievementAnalysis.gapCount >= 1) {
      optimizations.push({
        resourceId: "resource.capacity",
        label: "Capacity reallocation",
        description: evaluation.goalAchievementAnalysis.summary,
        resourceType: "capacity",
        optimizationAction: "Shift capacity from completed milestones to gap-closing activities.",
        savingsEstimate: `${evaluation.goalAchievementAnalysis.gapCount} gap(s) addressable`,
      });
    }

    return optimizations;
  }
}

export class BottleneckAnalysesBuilder {
  build(learning: LearningIntelligenceOutput, prediction: PredictionIntelligenceOutput): BottleneckAnalysis[] {
    const analyses: BottleneckAnalysis[] = [];

    for (const gap of learning.knowledgeGaps.slice(0, 3)) {
      analyses.push({
        bottleneckId: `bn.${gap.gapId}`,
        label: gap.label,
        description: gap.description,
        severity: gap.severity === "high" ? "high" : gap.severity === "medium" ? "medium" : "low",
        affectedPhase: gap.category,
        rootCause: gap.description,
      });
    }

    if (
      prediction.riskEvolutionForecast.projectedRiskLevel === "high" ||
      prediction.riskEvolutionForecast.currentRiskLevel === "high"
    ) {
      analyses.push({
        bottleneckId: "bn.risk_trajectory",
        label: "Risk evolution bottleneck",
        description: prediction.riskEvolutionForecast.summary,
        severity:
          prediction.riskEvolutionForecast.projectedRiskLevel === "high" ? "critical" : "high",
        affectedPhase: "execution",
        rootCause: prediction.riskEvolutionForecast.summary,
      });
    }

    return analyses;
  }
}

export class BottleneckEliminationPlansBuilder {
  build(bottlenecks: BottleneckAnalysis[]): BottleneckEliminationPlan[] {
    return bottlenecks.slice(0, 4).map((bottleneck) => ({
      planId: `plan.${bottleneck.bottleneckId}`,
      title: `Eliminate: ${bottleneck.label}`,
      description: `Structured plan to resolve ${bottleneck.label} bottleneck.`,
      targetBottleneckId: bottleneck.bottleneckId,
      steps: [
        `Diagnose root cause: ${bottleneck.rootCause}`,
        `Apply targeted optimization in ${bottleneck.affectedPhase} phase`,
        "Validate resolution against success probability projection",
      ],
      expectedResolution:
        bottleneck.severity === "critical" || bottleneck.severity === "high"
          ? "High-priority resolution within next optimization cycle"
          : "Incremental resolution through continuous refinement",
    }));
  }
}

export class PerformanceMaximizationOpportunitiesBuilder {
  build(
    learning: LearningIntelligenceOutput,
    strategy: StrategyIntelligenceOutput,
    prediction: PredictionIntelligenceOutput
  ): PerformanceMaximizationOpportunity[] {
    const opportunities: PerformanceMaximizationOpportunity[] = [];

    for (const improvement of learning.performanceImprovementOpportunities) {
      opportunities.push({
        opportunityId: improvement.opportunityId,
        title: improvement.title,
        description: improvement.description,
        metric: "Performance gain",
        projectedGain: improvement.projectedGain,
        priority: improvement.priority,
      });
    }

    for (const entry of strategy.strategicOpportunityMatrix.filter((e) => e.quadrant === "pursue").slice(0, 2)) {
      opportunities.push({
        opportunityId: `perf.${entry.entryId}`,
        title: entry.title,
        description: entry.description,
        metric: "Strategic impact",
        projectedGain: `${entry.impact} impact / ${entry.effort} effort`,
        priority: entry.impact === "high" ? "high" : "medium",
      });
    }

    opportunities.push({
      opportunityId: "perf.success_projection",
      title: "Success probability maximization",
      description: prediction.successProbabilityProjection.rationale,
      metric: "Success probability",
      projectedGain: `${prediction.successProbabilityProjection.projectedScore}% projected success`,
      priority: prediction.successProbabilityProjection.projectedScore >= 75 ? "high" : "medium",
    });

    return opportunities;
  }
}

export class SystemRefinementCyclesBuilder {
  build(): SystemRefinementCycle[] {
    return [
      {
        cycleId: "src.measure",
        phase: "measure",
        title: "Measure system performance",
        description: "Collect efficiency, resource, and bottleneck signals from the C1–C14 chain.",
        order: 1,
      },
      {
        cycleId: "src.identify",
        phase: "identify",
        title: "Identify optimization targets",
        description: "Map bottlenecks, knowledge gaps, and performance opportunities.",
        order: 2,
      },
      {
        cycleId: "src.optimize",
        phase: "optimize",
        title: "Apply optimizations",
        description: "Execute efficiency improvements, resource reallocation, and workflow changes.",
        order: 3,
      },
      {
        cycleId: "src.sustain",
        phase: "sustain",
        title: "Sustain improvements",
        description: "Embed refinements into continuous learning and strategy adjustment cycles.",
        order: 4,
      },
    ];
  }
}

export class WorkflowOptimizationsBuilder {
  build(learning: LearningIntelligenceOutput, strategy: StrategyIntelligenceOutput): WorkflowOptimization[] {
    const workflows: WorkflowOptimization[] = [];

    for (const pattern of learning.learningPatterns.slice(0, 2)) {
      workflows.push({
        workflowId: `wf.${pattern.patternId}`,
        label: pattern.label,
        description: pattern.description,
        currentState: `Pattern type: ${pattern.patternType} (confidence ${pattern.confidence})`,
        optimizedState: "Apply pattern-driven workflow streamlining",
        impactScore: Math.min(100, Math.round(pattern.confidence * 0.8)),
      });
    }

    for (const loop of learning.feedbackLoops.slice(0, 2)) {
      workflows.push({
        workflowId: `wf.${loop.loopId}`,
        label: loop.label,
        description: loop.description,
        currentState: `Frequency: ${loop.frequency}; metric: ${loop.metric}`,
        optimizedState: "Tighten feedback loop cadence for faster optimization response",
        impactScore: 65,
      });
    }

    if (strategy.contingencyStrategies.length > 0) {
      workflows.push({
        workflowId: "wf.contingency",
        label: "Contingency response workflow",
        description: "Streamline contingency trigger-to-response pipeline.",
        currentState: `${strategy.contingencyStrategies.length} contingency strategies defined`,
        optimizedState: "Pre-authorized response paths reduce decision latency",
        impactScore: 72,
      });
    }

    return workflows;
  }
}

export class OptimizationConfidenceBuilder {
  build(input: {
    learning: LearningIntelligenceOutput;
    recommendationCount: number;
    bottleneckCount: number;
  }): OptimizationConfidence {
    let score = 40;
    score += Math.min(input.learning.learningConfidence.score * 0.25, 22);
    score += Math.min(input.recommendationCount * 4, 16);
    score -= Math.min(input.bottleneckCount * 3, 15);
    score = Math.min(95, Math.max(35, Math.round(score)));

    const level: OptimizationConfidenceLevel = score >= 80 ? "high" : score >= 60 ? "medium" : "low";

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "Strong learning signals support confident optimization intelligence."
          : level === "medium"
            ? "Optimization viable; bottlenecks may require targeted elimination."
            : "Limited optimization confidence — treat recommendations as advisory only.",
      learningConfidenceScore: input.learning.learningConfidence.score,
      structuralOptimizationScore: Math.min(
        100,
        score + input.recommendationCount * 3 - input.bottleneckCount * 2
      ),
    };
  }
}

export function createOptimizationRecommendationsBuilder(): OptimizationRecommendationsBuilder {
  return new OptimizationRecommendationsBuilder();
}
export function createEfficiencyImprovementsBuilder(): EfficiencyImprovementsBuilder {
  return new EfficiencyImprovementsBuilder();
}
export function createResourceOptimizationsBuilder(): ResourceOptimizationsBuilder {
  return new ResourceOptimizationsBuilder();
}
export function createBottleneckAnalysesBuilder(): BottleneckAnalysesBuilder {
  return new BottleneckAnalysesBuilder();
}
export function createBottleneckEliminationPlansBuilder(): BottleneckEliminationPlansBuilder {
  return new BottleneckEliminationPlansBuilder();
}
export function createPerformanceMaximizationOpportunitiesBuilder(): PerformanceMaximizationOpportunitiesBuilder {
  return new PerformanceMaximizationOpportunitiesBuilder();
}
export function createSystemRefinementCyclesBuilder(): SystemRefinementCyclesBuilder {
  return new SystemRefinementCyclesBuilder();
}
export function createWorkflowOptimizationsBuilder(): WorkflowOptimizationsBuilder {
  return new WorkflowOptimizationsBuilder();
}
export function createOptimizationConfidenceBuilder(): OptimizationConfidenceBuilder {
  return new OptimizationConfidenceBuilder();
}
