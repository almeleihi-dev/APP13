import type { AiDecisionIntelligenceExperienceOutput } from "../../ai-decision-intelligence-experience/domain/ai-decision-intelligence-experience-context.js";
import { UPSTREAM_MODULE_ID } from "../domain/ai-strategic-intelligence-experience-schema.js";
import type {
  StrategicCheck,
  StrategicContext,
  StrategyDashboard,
  StrategicGoals,
  StrategicGoal,
  StrategicScenarios,
  StrategicScenario,
  StrategicPriorities,
  StrategicPriority,
  RiskLandscape,
  RiskLandscapeItem,
  OpportunityLandscape,
  OpportunityLandscapeItem,
  ExecutionRoadmap,
  RoadmapStep,
  StrategicConfidence,
  DelegationStrategicIntelligence,
  StrategicExplanation,
} from "../domain/ai-strategic-intelligence-experience-context.js";
import type { StrategicIntelligenceConfidenceLevel } from "../domain/ai-strategic-intelligence-experience-schema.js";

function check(
  id: string,
  label: string,
  passed: boolean,
  score: number,
  detail: string
): StrategicCheck {
  return { checkId: id, label, passed, score, detail };
}

export class StrategicContextBuilder {
  build(decision: AiDecisionIntelligenceExperienceOutput): StrategicContext {
    const ctx = decision.decisionContext;

    return {
      contextId: `strategic-context-${decision.outputId}`,
      decisionIntelligenceOutputId: decision.outputId,
      orchestrationOutputId: ctx.orchestrationOutputId,
      executiveIntelligenceOutputId: ctx.executiveIntelligenceOutputId,
      foundationOutputId: ctx.foundationOutputId,
      scenarioId: decision.scenarioId,
      canonicalActionId: decision.canonicalActionId,
      goal: decision.goal,
      experienceMode: "read_only",
    };
  }
}

export class StrategyDashboardBuilder {
  build(decision: AiDecisionIntelligenceExperienceOutput): StrategyDashboard {
    const dash = decision.decisionDashboard;

    return {
      dashboardId: `strategy-dashboard-${decision.outputId}`,
      headline: `Strategy Dashboard — ${decision.goal}`,
      goal: decision.goal,
      healthScore: dash.healthScore,
      goalCount: decision.decisionOptions.options.length,
      scenarioCount: decision.decisionTree.nodes.filter((n) => n.parentNodeId !== null).length,
      roadmapStepCount: decision.decisionRecommendations.recommendations.length,
      readOnly: true,
      summary: `Read-only strategy dashboard — ${decision.decisionOptions.options.length} goals, ${decision.decisionTree.nodes.length - 1} scenarios, ${decision.decisionRecommendations.recommendations.length} roadmap steps, health ${dash.healthScore}/100.`,
    };
  }
}

export class StrategicGoalsBuilder {
  build(decision: AiDecisionIntelligenceExperienceOutput): StrategicGoals {
    const goals: StrategicGoal[] = decision.decisionOptions.options.map((opt) => ({
      goalId: `goal-${opt.optionId}`,
      sequence: opt.sequence,
      title: opt.title,
      detail: `Strategic goal: ${opt.detail}`,
    }));

    return {
      goalsId: `goals-${decision.outputId}`,
      goals,
      summary: `${goals.length} read-only strategic goals from decision options.`,
    };
  }
}

export class StrategicScenariosBuilder {
  build(decision: AiDecisionIntelligenceExperienceOutput): StrategicScenarios {
    const scenarios: StrategicScenario[] = decision.decisionTree.nodes
      .filter((n) => n.parentNodeId !== null)
      .map((node) => ({
        scenarioId: `scenario-${node.nodeId}`,
        sequence: node.sequence,
        title: node.label,
        detail: `Strategic scenario: ${node.detail}`,
      }));

    return {
      scenariosId: `scenarios-${decision.outputId}`,
      scenarios,
      summary: `${scenarios.length} read-only strategic scenarios from decision tree branches.`,
    };
  }
}

export class StrategicPrioritiesBuilder {
  build(decision: AiDecisionIntelligenceExperienceOutput): StrategicPriorities {
    const priorities: StrategicPriority[] = decision.priorityMatrix.items.map((item) => ({
      priorityId: `strategic-priority-${item.itemId}`,
      sequence: item.sequence,
      title: item.title,
      impactScore: item.impactScore,
      urgencyScore: item.urgencyScore,
      quadrant: item.quadrant,
    }));

    return {
      prioritiesId: `priorities-${decision.outputId}`,
      priorities,
      summary: `${priorities.length} read-only strategic priorities from priority matrix.`,
    };
  }
}

export class RiskLandscapeBuilder {
  build(decision: AiDecisionIntelligenceExperienceOutput): RiskLandscape {
    const items: RiskLandscapeItem[] = decision.riskAnalysis.factors.map((factor) => ({
      itemId: `landscape-risk-${factor.riskId}`,
      sequence: factor.sequence,
      label: factor.label,
      detail: factor.detail,
      level: factor.level,
    }));

    return {
      landscapeId: `risk-landscape-${decision.outputId}`,
      items,
      riskScore: decision.riskAnalysis.riskScore,
      summary: `${items.length} read-only risk landscape items from decision risk analysis.`,
    };
  }
}

export class OpportunityLandscapeBuilder {
  build(decision: AiDecisionIntelligenceExperienceOutput): OpportunityLandscape {
    const opportunities: OpportunityLandscapeItem[] =
      decision.opportunityAnalysis.opportunities.map((opp) => ({
        itemId: `landscape-opp-${opp.opportunityId}`,
        sequence: opp.sequence,
        title: opp.title,
        detail: opp.detail,
      }));

    return {
      landscapeId: `opportunity-landscape-${decision.outputId}`,
      opportunities,
      opportunityScore: decision.opportunityAnalysis.opportunityScore,
      summary: `${opportunities.length} read-only opportunity landscape items from decision opportunity analysis.`,
    };
  }
}

export class ExecutionRoadmapBuilder {
  build(decision: AiDecisionIntelligenceExperienceOutput): ExecutionRoadmap {
    const steps: RoadmapStep[] = decision.decisionRecommendations.recommendations.map((rec) => ({
      stepId: `roadmap-${rec.recommendationId}`,
      sequence: rec.sequence,
      title: rec.title,
      detail: `Roadmap step: ${rec.detail}`,
    }));

    return {
      roadmapId: `roadmap-${decision.outputId}`,
      steps,
      summary: `${steps.length} read-only execution roadmap steps from decision recommendations.`,
    };
  }
}

export class StrategicConfidenceBuilder {
  build(decision: AiDecisionIntelligenceExperienceOutput): StrategicConfidence {
    let score = 36;
    score += Math.min(decision.decisionConfidence.score * 0.36, 34);
    score += Math.min(decision.decisionDashboard.healthScore * 0.1, 10);
    score = Math.min(98, Math.max(40, Math.round(score)));

    const level: StrategicIntelligenceConfidenceLevel =
      score >= 80 ? "high" : score >= 60 ? "medium" : "low";

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "AI Strategic Intelligence Experience meets high-confidence criteria from decision intelligence."
          : level === "medium"
            ? "Strategic intelligence viable with conditional decision intelligence requiring review."
            : "Limited strategic intelligence confidence — treat outputs as advisory only.",
      decisionConfidenceScore: decision.decisionConfidence.score,
    };
  }
}

export class DelegationStrategicIntelligenceBuilder {
  build(decision: AiDecisionIntelligenceExperienceOutput): DelegationStrategicIntelligence {
    const checks: StrategicCheck[] = [
      check(
        "del.upstream",
        "Sole upstream delegation",
        !!decision.outputId,
        decision.outputId ? 100 : 0,
        `Delegates exclusively to ${UPSTREAM_MODULE_ID} AI Decision Intelligence Experience.`
      ),
      check(
        "del.trace",
        "Decision intelligence traceability",
        !!decision.orchestrationOutputId,
        decision.orchestrationOutputId ? 95 : 0,
        `Decision intelligence ${decision.outputId} → orchestration ${decision.orchestrationOutputId}.`
      ),
      check(
        "del.nodup",
        "No duplicated business logic",
        true,
        100,
        "Strategic intelligence builders format decision intelligence output only."
      ),
    ];

    return {
      delegationId: "strategic.delegation",
      soleUpstream: "CH5-X14 AI Decision Intelligence Experience",
      noDuplicatedLogic: true,
      decisionIntelligenceOutputId: decision.outputId,
      checks,
      summary: "Delegation strategic intelligence — sole upstream X14, no duplicated logic.",
    };
  }
}

export class StrategicExplanationBuilder {
  build(input: {
    outputId: string;
    goal: string;
    dashboard: StrategyDashboard;
    goals: StrategicGoals;
    roadmap: ExecutionRoadmap;
    strategicConfidenceScore: number;
  }): StrategicExplanation {
    return {
      explanationId: `strategic-explanation-${input.outputId}`,
      headline: `AI Strategic Intelligence for "${input.goal}"`,
      summary: `Read-only strategic intelligence (confidence ${input.strategicConfidenceScore}/100) — ${input.dashboard.goalCount} goals, ${input.dashboard.scenarioCount} scenarios, ${input.dashboard.roadmapStepCount} roadmap steps, health ${input.dashboard.healthScore}/100.`,
      dashboardSummary: input.dashboard.summary,
      goalsSummary: input.goals.summary,
      roadmapSummary: input.roadmap.summary,
    };
  }
}

export function createStrategicContextBuilder(): StrategicContextBuilder {
  return new StrategicContextBuilder();
}
export function createStrategyDashboardBuilder(): StrategyDashboardBuilder {
  return new StrategyDashboardBuilder();
}
export function createStrategicGoalsBuilder(): StrategicGoalsBuilder {
  return new StrategicGoalsBuilder();
}
export function createStrategicScenariosBuilder(): StrategicScenariosBuilder {
  return new StrategicScenariosBuilder();
}
export function createStrategicPrioritiesBuilder(): StrategicPrioritiesBuilder {
  return new StrategicPrioritiesBuilder();
}
export function createRiskLandscapeBuilder(): RiskLandscapeBuilder {
  return new RiskLandscapeBuilder();
}
export function createOpportunityLandscapeBuilder(): OpportunityLandscapeBuilder {
  return new OpportunityLandscapeBuilder();
}
export function createExecutionRoadmapBuilder(): ExecutionRoadmapBuilder {
  return new ExecutionRoadmapBuilder();
}
export function createStrategicConfidenceBuilder(): StrategicConfidenceBuilder {
  return new StrategicConfidenceBuilder();
}
export function createDelegationStrategicIntelligenceBuilder(): DelegationStrategicIntelligenceBuilder {
  return new DelegationStrategicIntelligenceBuilder();
}
export function createStrategicExplanationBuilder(): StrategicExplanationBuilder {
  return new StrategicExplanationBuilder();
}
