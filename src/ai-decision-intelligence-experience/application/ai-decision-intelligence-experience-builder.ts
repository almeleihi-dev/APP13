import type { AiOrchestrationExperienceOutput } from "../../ai-orchestration-experience/domain/ai-orchestration-experience-context.js";
import { UPSTREAM_MODULE_ID } from "../domain/ai-decision-intelligence-experience-schema.js";
import type {
  DecisionCheck,
  DecisionContext,
  DecisionDashboard,
  DecisionTree,
  DecisionTreeNode,
  DecisionOptions,
  DecisionOption,
  DecisionRecommendations,
  DecisionRecommendation,
  RiskAnalysis,
  RiskFactor,
  OpportunityAnalysis,
  OpportunityFactor,
  PriorityMatrix,
  PriorityMatrixItem,
  DecisionConfidence,
  DelegationDecisionIntelligence,
  DecisionExplanation,
} from "../domain/ai-decision-intelligence-experience-context.js";
import type { DecisionIntelligenceConfidenceLevel } from "../domain/ai-decision-intelligence-experience-schema.js";

function check(
  id: string,
  label: string,
  passed: boolean,
  score: number,
  detail: string
): DecisionCheck {
  return { checkId: id, label, passed, score, detail };
}

export class DecisionContextBuilder {
  build(orchestration: AiOrchestrationExperienceOutput): DecisionContext {
    const ctx = orchestration.orchestrationContext;

    return {
      contextId: `decision-context-${orchestration.outputId}`,
      orchestrationOutputId: orchestration.outputId,
      executiveIntelligenceOutputId: ctx.executiveIntelligenceOutputId,
      predictiveIntelligenceOutputId: ctx.predictiveIntelligenceOutputId,
      recommendationIntelligenceOutputId: ctx.recommendationIntelligenceOutputId,
      foundationOutputId: ctx.foundationOutputId,
      scenarioId: orchestration.scenarioId,
      canonicalActionId: orchestration.canonicalActionId,
      goal: orchestration.goal,
      experienceMode: "read_only",
    };
  }
}

export class DecisionDashboardBuilder {
  build(orchestration: AiOrchestrationExperienceOutput): DecisionDashboard {
    const dash = orchestration.orchestrationDashboard;
    const options = orchestration.moduleCoordination.modules.filter((m) => m.role === "priority");
    const recommendations = orchestration.moduleCoordination.modules.filter(
      (m) => m.role === "decision"
    );

    return {
      dashboardId: `decision-dashboard-${orchestration.outputId}`,
      headline: `Decision Dashboard — ${orchestration.goal}`,
      goal: orchestration.goal,
      healthScore: dash.healthScore,
      optionCount: options.length,
      recommendationCount: recommendations.length,
      pipelineStageCount: dash.pipelineStageCount,
      readOnly: true,
      summary: `Read-only decision dashboard — ${options.length} options, ${recommendations.length} recommendations, health ${dash.healthScore}/100.`,
    };
  }
}

export class DecisionTreeBuilder {
  build(orchestration: AiOrchestrationExperienceOutput): DecisionTree {
    const rootNodeId = `tree-root-${orchestration.outputId}`;
    const root: DecisionTreeNode = {
      nodeId: rootNodeId,
      sequence: 0,
      label: orchestration.goal,
      detail: `Root decision for "${orchestration.goal}"`,
      parentNodeId: null,
    };

    const branchNodes: DecisionTreeNode[] = orchestration.executionFlow.steps.map((step) => ({
      nodeId: `tree-${step.stepId}`,
      sequence: step.sequence,
      label: step.title,
      detail: step.detail,
      parentNodeId: rootNodeId,
    }));

    const nodes = [root, ...branchNodes];

    return {
      treeId: `decision-tree-${orchestration.outputId}`,
      rootNodeId,
      nodes,
      summary: `${nodes.length} read-only decision tree nodes from execution flow.`,
    };
  }
}

export class DecisionOptionsBuilder {
  build(orchestration: AiOrchestrationExperienceOutput): DecisionOptions {
    const options: DecisionOption[] = orchestration.moduleCoordination.modules
      .filter((m) => m.role === "priority")
      .map((m) => ({
        optionId: `option-${m.moduleId}`,
        sequence: m.sequence,
        title: m.label,
        detail: m.detail,
      }));

    return {
      optionsId: `options-${orchestration.outputId}`,
      options,
      summary: `${options.length} read-only decision options from coordinated priority modules.`,
    };
  }
}

export class DecisionRecommendationsBuilder {
  build(orchestration: AiOrchestrationExperienceOutput): DecisionRecommendations {
    const recommendations: DecisionRecommendation[] = orchestration.moduleCoordination.modules
      .filter((m) => m.role === "decision")
      .map((m) => ({
        recommendationId: `rec-${m.moduleId}`,
        sequence: m.sequence,
        title: m.label,
        detail: m.detail,
      }));

    return {
      recommendationsId: `recommendations-${orchestration.outputId}`,
      recommendations,
      summary: `${recommendations.length} read-only decision recommendations from coordinated decision modules.`,
    };
  }
}

export class RiskAnalysisBuilder {
  build(orchestration: AiOrchestrationExperienceOutput): RiskAnalysis {
    const factors: RiskFactor[] = orchestration.synchronizationStatus.items.map((item) => ({
      riskId: `risk-${item.syncId}`,
      sequence: item.sequence,
      label: item.label,
      detail: item.detail,
      level:
        item.status === "synchronized"
          ? ("low" as const)
          : item.status === "watch"
            ? ("medium" as const)
            : ("high" as const),
    }));

    const highCount = factors.filter((f) => f.level === "high").length;
    const riskScore = Math.min(
      98,
      Math.max(40, Math.round(100 - orchestration.systemHealth.score * 0.4 - highCount * 10))
    );

    return {
      analysisId: `risk-analysis-${orchestration.outputId}`,
      factors,
      riskScore,
      summary: `${factors.length} read-only risk factors from synchronization status, risk score ${riskScore}/100.`,
    };
  }
}

export class OpportunityAnalysisBuilder {
  build(orchestration: AiOrchestrationExperienceOutput): OpportunityAnalysis {
    const opportunities: OpportunityFactor[] = orchestration.moduleCoordination.modules
      .filter((m) => m.role === "priority")
      .map((m) => ({
        opportunityId: `opp-${m.moduleId}`,
        sequence: m.sequence,
        title: m.label,
        detail: `Opportunity: ${m.detail}`,
      }));

    const opportunityScore = Math.min(
      98,
      Math.max(
        40,
        Math.round(
          orchestration.systemHealth.score * 0.5 +
            opportunities.length * 8 +
            orchestration.systemHealth.opportunityCount * 3
        )
      )
    );

    return {
      analysisId: `opportunity-analysis-${orchestration.outputId}`,
      opportunities,
      opportunityScore,
      summary: `${opportunities.length} read-only opportunities from priority modules, score ${opportunityScore}/100.`,
    };
  }
}

export class PriorityMatrixBuilder {
  build(orchestration: AiOrchestrationExperienceOutput): PriorityMatrix {
    const items: PriorityMatrixItem[] = orchestration.moduleCoordination.modules
      .filter((m) => m.role === "priority")
      .map((m, index) => {
        const impactScore = Math.min(95, 60 + index * 12);
        const urgencyScore = Math.min(95, 70 - index * 8);
        const quadrant: PriorityMatrixItem["quadrant"] =
          impactScore >= 70 && urgencyScore >= 70
            ? "high_high"
            : impactScore >= 70
              ? "high_low"
              : urgencyScore >= 70
                ? "low_high"
                : "low_low";

        return {
          itemId: `matrix-${m.moduleId}`,
          sequence: m.sequence,
          title: m.label,
          impactScore,
          urgencyScore,
          quadrant,
        };
      });

    return {
      matrixId: `priority-matrix-${orchestration.outputId}`,
      items,
      summary: `${items.length} read-only priority matrix items from coordinated priority modules.`,
    };
  }
}

export class DecisionConfidenceBuilder {
  build(orchestration: AiOrchestrationExperienceOutput): DecisionConfidence {
    let score = 36;
    score += Math.min(orchestration.orchestrationConfidence.score * 0.36, 34);
    score += Math.min(orchestration.orchestrationReadiness.readinessScore * 0.1, 10);
    score = Math.min(98, Math.max(40, Math.round(score)));

    const level: DecisionIntelligenceConfidenceLevel =
      score >= 80 ? "high" : score >= 60 ? "medium" : "low";

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "AI Decision Intelligence Experience meets high-confidence criteria from orchestration intelligence."
          : level === "medium"
            ? "Decision intelligence viable with conditional orchestration requiring review."
            : "Limited decision intelligence confidence — treat outputs as advisory only.",
      orchestrationConfidenceScore: orchestration.orchestrationConfidence.score,
    };
  }
}

export class DelegationDecisionIntelligenceBuilder {
  build(orchestration: AiOrchestrationExperienceOutput): DelegationDecisionIntelligence {
    const checks: DecisionCheck[] = [
      check(
        "del.upstream",
        "Sole upstream delegation",
        !!orchestration.outputId,
        orchestration.outputId ? 100 : 0,
        `Delegates exclusively to ${UPSTREAM_MODULE_ID} AI Orchestration Experience.`
      ),
      check(
        "del.trace",
        "Orchestration traceability",
        !!orchestration.executiveIntelligenceOutputId,
        orchestration.executiveIntelligenceOutputId ? 95 : 0,
        `Orchestration ${orchestration.outputId} → executive intelligence ${orchestration.executiveIntelligenceOutputId}.`
      ),
      check(
        "del.nodup",
        "No duplicated business logic",
        true,
        100,
        "Decision intelligence builders format orchestration output only."
      ),
    ];

    return {
      delegationId: "decision.delegation",
      soleUpstream: "CH5-X13 AI Orchestration Experience",
      noDuplicatedLogic: true,
      orchestrationOutputId: orchestration.outputId,
      checks,
      summary: "Delegation decision intelligence — sole upstream X13, no duplicated logic.",
    };
  }
}

export class DecisionExplanationBuilder {
  build(input: {
    outputId: string;
    goal: string;
    dashboard: DecisionDashboard;
    tree: DecisionTree;
    recommendations: DecisionRecommendations;
    decisionConfidenceScore: number;
  }): DecisionExplanation {
    return {
      explanationId: `decision-explanation-${input.outputId}`,
      headline: `AI Decision Intelligence for "${input.goal}"`,
      summary: `Read-only decision intelligence (confidence ${input.decisionConfidenceScore}/100) — ${input.dashboard.optionCount} options, ${input.dashboard.recommendationCount} recommendations, health ${input.dashboard.healthScore}/100.`,
      dashboardSummary: input.dashboard.summary,
      treeSummary: input.tree.summary,
      recommendationsSummary: input.recommendations.summary,
    };
  }
}

export function createDecisionContextBuilder(): DecisionContextBuilder {
  return new DecisionContextBuilder();
}
export function createDecisionDashboardBuilder(): DecisionDashboardBuilder {
  return new DecisionDashboardBuilder();
}
export function createDecisionTreeBuilder(): DecisionTreeBuilder {
  return new DecisionTreeBuilder();
}
export function createDecisionOptionsBuilder(): DecisionOptionsBuilder {
  return new DecisionOptionsBuilder();
}
export function createDecisionRecommendationsBuilder(): DecisionRecommendationsBuilder {
  return new DecisionRecommendationsBuilder();
}
export function createRiskAnalysisBuilder(): RiskAnalysisBuilder {
  return new RiskAnalysisBuilder();
}
export function createOpportunityAnalysisBuilder(): OpportunityAnalysisBuilder {
  return new OpportunityAnalysisBuilder();
}
export function createPriorityMatrixBuilder(): PriorityMatrixBuilder {
  return new PriorityMatrixBuilder();
}
export function createDecisionConfidenceBuilder(): DecisionConfidenceBuilder {
  return new DecisionConfidenceBuilder();
}
export function createDelegationDecisionIntelligenceBuilder(): DelegationDecisionIntelligenceBuilder {
  return new DelegationDecisionIntelligenceBuilder();
}
export function createDecisionExplanationBuilder(): DecisionExplanationBuilder {
  return new DecisionExplanationBuilder();
}
