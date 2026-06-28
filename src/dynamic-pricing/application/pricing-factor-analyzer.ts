import type { ActionPlan } from "../../action-planning/domain/action-plan.js";
import type { CanonicalAction } from "../../action-ontology/domain/canonical-action.js";
import type { PricingFactor } from "../domain/pricing-context.js";
import type { DistanceBand, UrgencyLevel } from "../domain/dynamic-pricing-schema.js";
import {
  getCategoryBaseRate,
  PRICING_REFERENCE_VALUES,
} from "../domain/pricing-reference-values.js";

export interface PricingAnalysisInput {
  plan: ActionPlan;
  canonicalAction: CanonicalAction;
  urgency: UrgencyLevel;
  distanceBand: DistanceBand;
  marketLabel: string;
}

export interface PricingAnalysisResult {
  factors: PricingFactor[];
  complexityScore: number;
  highRiskCount: number;
  mediumRiskCount: number;
  parallelOpportunityCount: number;
  sequentialBottleneckCount: number;
}

export class PricingFactorAnalyzer {
  analyze(input: PricingAnalysisInput): PricingAnalysisResult {
    const { plan, canonicalAction, urgency, distanceBand, marketLabel } = input;
    const refs = PRICING_REFERENCE_VALUES;
    const categoryRate = getCategoryBaseRate(plan.category);

    const taskCount = plan.tasks.length;
    const stageCount = plan.stages.length;
    const skillCount = plan.requiredSkills.length;
    const resourceCount = plan.requiredResources.length;
    const dependencyCount = plan.dependencies.length;
    const parallelCount = plan.parallelGroups.length;
    const sequentialCount = plan.sequentialGroups.length;
    const avgHours = (plan.timeline.minHours + plan.timeline.maxHours) / 2;

    const highRiskCount = canonicalAction.riskSignals.filter((s) => s.severity === "high").length;
    const mediumRiskCount = canonicalAction.riskSignals.filter((s) => s.severity === "medium").length;

    const complexityScore = Math.min(
      100,
      Math.round(
        stageCount * 5 +
          taskCount * 3 +
          dependencyCount * 4 +
          plan.decisionPoints.length * 6 +
          (plan.timeline.maxHours - plan.timeline.minHours) * 2 +
          highRiskCount * 10 +
          mediumRiskCount * 5
      )
    );

    const factors: PricingFactor[] = [
      {
        factorId: "factor.planning_complexity",
        label: "Planning complexity",
        category: "complexity",
        weight: 0.18,
        contributionMin: complexityScore * 0.8,
        contributionMax: complexityScore * 1.1,
        unit: "score",
        trace: `${stageCount} stages, ${taskCount} tasks, complexity score ${complexityScore}`,
      },
      {
        factorId: "factor.stage_count",
        label: "Number of stages",
        category: "complexity",
        weight: 0.08,
        contributionMin: stageCount * refs.stageWeight,
        contributionMax: stageCount * refs.stageWeight * 1.05,
        unit: "SAR",
        trace: `${stageCount} execution stages from action plan`,
      },
      {
        factorId: "factor.task_count",
        label: "Number of tasks",
        category: "complexity",
        weight: 0.1,
        contributionMin: taskCount * refs.taskWeight,
        contributionMax: taskCount * refs.taskWeight * 1.05,
        unit: "SAR",
        trace: `${taskCount} discrete tasks in execution plan`,
      },
      {
        factorId: "factor.timeline",
        label: "Estimated timeline",
        category: "timeline",
        weight: 0.15,
        contributionMin: plan.timeline.minHours * categoryRate.hourlyRate,
        contributionMax: plan.timeline.maxHours * categoryRate.hourlyRate,
        unit: "SAR",
        trace: `Timeline ${plan.timeline.minHours}–${plan.timeline.maxHours} hours (avg ${avgHours.toFixed(1)}h)`,
      },
      {
        factorId: "factor.required_skills",
        label: "Required skills",
        category: "skills",
        weight: 0.1,
        contributionMin: skillCount * refs.skillWeight,
        contributionMax: skillCount * refs.skillWeight * 1.08,
        unit: "SAR",
        trace: `${skillCount} skills: ${plan.requiredSkills.map((s) => s.name).join(", ")}`,
      },
      {
        factorId: "factor.required_resources",
        label: "Required resources",
        category: "resources",
        weight: 0.08,
        contributionMin: resourceCount * refs.resourceWeight,
        contributionMax: resourceCount * refs.resourceWeight * 1.06,
        unit: "SAR",
        trace: `${resourceCount} resources required for execution`,
      },
      {
        factorId: "factor.parallel_execution",
        label: "Parallel execution opportunities",
        category: "parallel",
        weight: 0.05,
        contributionMin: parallelCount > 0 ? -parallelCount * 15 : 0,
        contributionMax: parallelCount > 0 ? -parallelCount * 10 : 0,
        unit: "SAR",
        trace: `${parallelCount} parallel groups reduce sequential labor cost`,
      },
      {
        factorId: "factor.sequential_bottlenecks",
        label: "Sequential bottlenecks",
        category: "sequential",
        weight: 0.07,
        contributionMin: dependencyCount * refs.dependencyWeight,
        contributionMax: sequentialCount * refs.dependencyWeight * 1.2,
        unit: "SAR",
        trace: `${dependencyCount} dependencies across ${sequentialCount} sequential groups`,
      },
      {
        factorId: "factor.risk_level",
        label: "Risk level",
        category: "risk",
        weight: 0.12,
        contributionMin:
          highRiskCount * refs.riskWeightHigh + mediumRiskCount * refs.riskWeightMedium,
        contributionMax:
          highRiskCount * refs.riskWeightHigh * 1.1 +
          mediumRiskCount * refs.riskWeightMedium * 1.05,
        unit: "SAR",
        trace: `${highRiskCount} high-risk and ${mediumRiskCount} medium-risk signals`,
      },
      {
        factorId: "factor.urgency",
        label: "Urgency",
        category: "urgency",
        weight: 0.06,
        contributionMin: 0,
        contributionMax: 0,
        unit: "multiplier",
        trace: `Urgency level ${urgency} applies ${refs.urgencyMultipliers[urgency]}× multiplier`,
      },
      {
        factorId: "factor.distance_band",
        label: "Distance band",
        category: "distance",
        weight: 0.04,
        contributionMin: 0,
        contributionMax: 0,
        unit: "multiplier",
        trace: `Distance band ${distanceBand} applies ${refs.distanceMultipliers[distanceBand]}× multiplier`,
      },
      {
        factorId: "factor.trust_recommendation",
        label: "Trust recommendation",
        category: "trust",
        weight: 0.04,
        contributionMin: canonicalAction.trustSignals.length * 5,
        contributionMax: canonicalAction.trustSignals.length * 8,
        unit: "SAR",
        trace: `${canonicalAction.trustSignals.length} trust safeguards recommended`,
      },
      {
        factorId: "factor.market_category",
        label: "Market category",
        category: "market",
        weight: 0.03,
        contributionMin: 0,
        contributionMax: 0,
        unit: "category",
        trace: `Market category: ${marketLabel} (${plan.category})`,
      },
      {
        factorId: "factor.difficulty_level",
        label: "Difficulty level",
        category: "difficulty",
        weight: 0.1,
        contributionMin: complexityScore * 0.5,
        contributionMax: complexityScore * 0.75,
        unit: "SAR",
        trace: `Difficulty derived from complexity score ${complexityScore}`,
      },
    ];

    return {
      factors,
      complexityScore,
      highRiskCount,
      mediumRiskCount,
      parallelOpportunityCount: parallelCount,
      sequentialBottleneckCount: dependencyCount,
    };
  }
}

export function createPricingFactorAnalyzer(): PricingFactorAnalyzer {
  return new PricingFactorAnalyzer();
}
