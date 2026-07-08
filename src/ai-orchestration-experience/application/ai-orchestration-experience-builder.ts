import type { AiExecutiveIntelligenceExperienceOutput } from "../../ai-executive-intelligence-experience/domain/ai-executive-intelligence-experience-context.js";
import { UPSTREAM_MODULE_ID } from "../domain/ai-orchestration-experience-schema.js";
import type {
  OrchestrationCheck,
  OrchestrationContext,
  OrchestrationDashboard,
  IntelligencePipeline,
  PipelineStage,
  ModuleCoordination,
  CoordinatedModule,
  DependencyGraph,
  DependencyNode,
  DependencyEdge,
  ExecutionFlow,
  ExecutionFlowStep,
  SynchronizationStatus,
  SynchronizationItem,
  SystemHealth,
  OrchestrationReadiness,
  OrchestrationConfidence,
  DelegationOrchestration,
  OrchestrationExplanation,
} from "../domain/ai-orchestration-experience-context.js";
import type {
  OrchestrationStatusLevel,
  OrchestrationConfidenceLevel,
} from "../domain/ai-orchestration-experience-schema.js";

function mapExecutiveStatus(status: string): OrchestrationStatusLevel {
  if (status === "executive_ready") return "orchestration_ready";
  if (status === "conditional") return "conditional";
  if (status === "pending") return "pending";
  return "not_ready";
}

function check(
  id: string,
  label: string,
  passed: boolean,
  score: number,
  detail: string
): OrchestrationCheck {
  return { checkId: id, label, passed, score, detail };
}

export class OrchestrationContextBuilder {
  build(executive: AiExecutiveIntelligenceExperienceOutput): OrchestrationContext {
    const ctx = executive.executiveContext;

    return {
      contextId: `orchestration-context-${executive.outputId}`,
      executiveIntelligenceOutputId: executive.outputId,
      predictiveIntelligenceOutputId: ctx.predictiveIntelligenceOutputId,
      recommendationIntelligenceOutputId: ctx.recommendationIntelligenceOutputId,
      insightGenerationOutputId: ctx.insightGenerationOutputId,
      adaptiveCoachingOutputId: ctx.adaptiveCoachingOutputId,
      progressIntelligenceOutputId: ctx.progressIntelligenceOutputId,
      executionCompanionOutputId: ctx.executionCompanionOutputId,
      actionPlanningOutputId: ctx.actionPlanningOutputId,
      decisionSupportOutputId: ctx.decisionSupportOutputId,
      guidanceOutputId: ctx.guidanceOutputId,
      conversationOutputId: ctx.conversationOutputId,
      foundationOutputId: ctx.foundationOutputId,
      scenarioId: executive.scenarioId,
      canonicalActionId: executive.canonicalActionId,
      goal: executive.goal,
      experienceMode: "read_only",
    };
  }
}

export class OrchestrationDashboardBuilder {
  build(executive: AiExecutiveIntelligenceExperienceOutput): OrchestrationDashboard {
    const healthScore = Math.min(
      98,
      Math.max(
        40,
        Math.round(
          executive.executiveReadiness.readinessScore * 0.5 +
            executive.executiveConfidence.score * 0.35 +
            (100 - executive.executiveRisks.risks.length * 5) * 0.15
        )
      )
    );

    return {
      dashboardId: `orchestration-dashboard-${executive.outputId}`,
      headline: `Orchestration Dashboard — ${executive.goal}`,
      goal: executive.goal,
      pipelineStageCount: 12,
      coordinationModuleCount:
        executive.strategicPriorities.priorities.length +
        executive.criticalDecisions.decisions.length,
      dependencyNodeCount: 12,
      healthScore,
      readOnly: true,
      summary: `Read-only orchestration dashboard — 12 pipeline stages, ${executive.strategicPriorities.priorities.length + executive.criticalDecisions.decisions.length} coordinated modules, health ${healthScore}/100.`,
    };
  }
}

export class IntelligencePipelineBuilder {
  build(executive: AiExecutiveIntelligenceExperienceOutput): IntelligencePipeline {
    const ctx = executive.executiveContext;
    const stageDefs: Array<{ label: string; outputId: string }> = [
      { label: "AI Experience Foundation", outputId: ctx.foundationOutputId },
      { label: "AI Conversation Experience", outputId: ctx.conversationOutputId },
      { label: "AI Guidance Experience", outputId: ctx.guidanceOutputId },
      { label: "AI Decision Support Experience", outputId: ctx.decisionSupportOutputId },
      { label: "AI Action Planning Experience", outputId: ctx.actionPlanningOutputId },
      { label: "AI Execution Companion Experience", outputId: ctx.executionCompanionOutputId },
      { label: "AI Progress Intelligence Experience", outputId: ctx.progressIntelligenceOutputId },
      { label: "AI Adaptive Coaching Experience", outputId: ctx.adaptiveCoachingOutputId },
      { label: "AI Insight Generation Experience", outputId: ctx.insightGenerationOutputId },
      {
        label: "AI Recommendation Intelligence Experience",
        outputId: ctx.recommendationIntelligenceOutputId,
      },
      {
        label: "AI Predictive Intelligence Experience",
        outputId: ctx.predictiveIntelligenceOutputId,
      },
      {
        label: "AI Executive Intelligence Experience",
        outputId: executive.outputId,
      },
    ];

    const stages: PipelineStage[] = stageDefs.map((def, index) => ({
      stageId: `pipeline-stage-${index + 1}`,
      sequence: index + 1,
      moduleLabel: def.label,
      outputId: def.outputId,
      status: def.outputId ? ("linked" as const) : ("pending" as const),
    }));

    return {
      pipelineId: `pipeline-${executive.outputId}`,
      stages,
      summary: `${stages.length} read-only intelligence pipeline stages from executive intelligence trace.`,
    };
  }
}

export class ModuleCoordinationBuilder {
  build(executive: AiExecutiveIntelligenceExperienceOutput): ModuleCoordination {
    const priorityModules: CoordinatedModule[] = executive.strategicPriorities.priorities.map(
      (p) => ({
        moduleId: `coord-${p.priorityId}`,
        sequence: p.sequence,
        label: p.title,
        detail: p.detail,
        role: "priority" as const,
      })
    );
    const decisionModules: CoordinatedModule[] = executive.criticalDecisions.decisions.map(
      (d) => ({
        moduleId: `coord-${d.decisionId}`,
        sequence: d.sequence + priorityModules.length,
        label: d.title,
        detail: d.detail,
        role: "decision" as const,
      })
    );

    const modules = [...priorityModules, ...decisionModules];

    return {
      coordinationId: `coordination-${executive.outputId}`,
      modules,
      summary: `${modules.length} read-only coordinated modules from strategic priorities and critical decisions.`,
    };
  }
}

export class DependencyGraphBuilder {
  build(executive: AiExecutiveIntelligenceExperienceOutput): DependencyGraph {
    const ctx = executive.executiveContext;
    const nodeDefs: Array<{ label: string; outputId: string }> = [
      { label: "foundation", outputId: ctx.foundationOutputId },
      { label: "conversation", outputId: ctx.conversationOutputId },
      { label: "guidance", outputId: ctx.guidanceOutputId },
      { label: "decision_support", outputId: ctx.decisionSupportOutputId },
      { label: "action_planning", outputId: ctx.actionPlanningOutputId },
      { label: "execution_companion", outputId: ctx.executionCompanionOutputId },
      { label: "progress_intelligence", outputId: ctx.progressIntelligenceOutputId },
      { label: "adaptive_coaching", outputId: ctx.adaptiveCoachingOutputId },
      { label: "insight_generation", outputId: ctx.insightGenerationOutputId },
      { label: "recommendation_intelligence", outputId: ctx.recommendationIntelligenceOutputId },
      { label: "predictive_intelligence", outputId: ctx.predictiveIntelligenceOutputId },
      { label: "executive_intelligence", outputId: executive.outputId },
    ];

    const nodes: DependencyNode[] = nodeDefs.map((def, index) => ({
      nodeId: `node-${def.label}`,
      sequence: index + 1,
      label: def.label,
      outputId: def.outputId,
    }));

    const edges: DependencyEdge[] = nodes.slice(1).map((node, index) => ({
      edgeId: `edge-${nodes[index]!.nodeId}-${node.nodeId}`,
      fromNodeId: nodes[index]!.nodeId,
      toNodeId: node.nodeId,
    }));

    return {
      graphId: `graph-${executive.outputId}`,
      nodes,
      edges,
      summary: `${nodes.length} read-only dependency nodes with ${edges.length} upstream edges.`,
    };
  }
}

export class ExecutionFlowBuilder {
  build(executive: AiExecutiveIntelligenceExperienceOutput): ExecutionFlow {
    const steps: ExecutionFlowStep[] = executive.criticalDecisions.decisions.map((d) => ({
      stepId: `flow-${d.decisionId}`,
      sequence: d.sequence,
      title: d.title,
      detail: `Execution step: ${d.detail}`,
    }));

    return {
      flowId: `flow-${executive.outputId}`,
      steps,
      summary: `${steps.length} read-only execution flow steps from critical decisions.`,
    };
  }
}

export class SynchronizationStatusBuilder {
  build(executive: AiExecutiveIntelligenceExperienceOutput): SynchronizationStatus {
    const items: SynchronizationItem[] = executive.executiveAlerts.alerts.map((alert) => ({
      syncId: `sync-${alert.alertId}`,
      sequence: alert.sequence,
      label: alert.label,
      detail: alert.detail,
      status:
        alert.severity === "low"
          ? ("synchronized" as const)
          : alert.severity === "medium"
            ? ("watch" as const)
            : ("desync" as const),
    }));

    return {
      statusId: `sync-status-${executive.outputId}`,
      items,
      summary: `${items.length} read-only synchronization items from executive alerts.`,
    };
  }
}

export class SystemHealthBuilder {
  build(executive: AiExecutiveIntelligenceExperienceOutput): SystemHealth {
    const highRisks = executive.executiveRisks.risks.filter((r) => r.level === "high").length;
    let score = 50;
    score += Math.min(executive.executiveReadiness.readinessScore * 0.3, 30);
    score += Math.min(executive.executiveConfidence.score * 0.15, 15);
    score -= highRisks * 5;
    score = Math.min(98, Math.max(40, Math.round(score)));

    const level: SystemHealth["level"] =
      score >= 75 ? "healthy" : score >= 55 ? "degraded" : "critical";

    return {
      healthId: `health-${executive.outputId}`,
      score,
      level,
      riskCount: executive.executiveRisks.risks.length,
      opportunityCount: executive.executiveOpportunities.opportunities.length,
      summary: `System health ${score}/100 (${level}) — ${executive.executiveRisks.risks.length} risks, ${executive.executiveOpportunities.opportunities.length} opportunities.`,
    };
  }
}

export class OrchestrationReadinessBuilder {
  build(executive: AiExecutiveIntelligenceExperienceOutput): OrchestrationReadiness {
    const readiness = executive.executiveReadiness;
    const level = mapExecutiveStatus(readiness.level);
    const orchestrationReady = readiness.executiveReady && readiness.readinessScore >= 50;

    return {
      readinessId: "orchestration.readiness",
      level,
      readinessScore: readiness.readinessScore,
      orchestrationReady,
      checks: readiness.checks.map((c) =>
        check(c.checkId, c.label, c.passed, c.score, c.detail)
      ),
      summary: `Orchestration readiness — ${readiness.readinessScore}/100, orchestration ${orchestrationReady ? "ready" : "pending"}.`,
    };
  }
}

export class OrchestrationConfidenceBuilder {
  build(executive: AiExecutiveIntelligenceExperienceOutput): OrchestrationConfidence {
    let score = 36;
    score += Math.min(executive.executiveConfidence.score * 0.36, 34);
    score += Math.min(executive.executiveReadiness.readinessScore * 0.1, 10);
    score = Math.min(98, Math.max(40, Math.round(score)));

    const level: OrchestrationConfidenceLevel =
      score >= 80 ? "high" : score >= 60 ? "medium" : "low";

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "AI Orchestration Experience meets high-confidence criteria from executive intelligence."
          : level === "medium"
            ? "Orchestration viable with conditional executive intelligence requiring review."
            : "Limited orchestration confidence — treat outputs as advisory only.",
      executiveConfidenceScore: executive.executiveConfidence.score,
    };
  }
}

export class DelegationOrchestrationBuilder {
  build(executive: AiExecutiveIntelligenceExperienceOutput): DelegationOrchestration {
    const checks: OrchestrationCheck[] = [
      check(
        "del.upstream",
        "Sole upstream delegation",
        !!executive.outputId,
        executive.outputId ? 100 : 0,
        `Delegates exclusively to ${UPSTREAM_MODULE_ID} AI Executive Intelligence Experience.`
      ),
      check(
        "del.trace",
        "Executive intelligence traceability",
        !!executive.predictiveIntelligenceOutputId,
        executive.predictiveIntelligenceOutputId ? 95 : 0,
        `Executive intelligence ${executive.outputId} → predictive intelligence ${executive.predictiveIntelligenceOutputId}.`
      ),
      check(
        "del.nodup",
        "No duplicated business logic",
        true,
        100,
        "Orchestration builders format executive intelligence output only."
      ),
    ];

    return {
      delegationId: "orchestration.delegation",
      soleUpstream: "CH5-X12 AI Executive Intelligence Experience",
      noDuplicatedLogic: true,
      executiveIntelligenceOutputId: executive.outputId,
      checks,
      summary: "Delegation orchestration — sole upstream X12, no duplicated logic.",
    };
  }
}

export class OrchestrationExplanationBuilder {
  build(input: {
    outputId: string;
    goal: string;
    dashboard: OrchestrationDashboard;
    pipeline: IntelligencePipeline;
    readiness: OrchestrationReadiness;
    orchestrationConfidenceScore: number;
  }): OrchestrationExplanation {
    return {
      explanationId: `orchestration-explanation-${input.outputId}`,
      headline: `AI Orchestration for "${input.goal}"`,
      summary: `Read-only orchestration (confidence ${input.orchestrationConfidenceScore}/100) — ${input.pipeline.stages.length} pipeline stages, ${input.dashboard.coordinationModuleCount} coordinated modules, health ${input.dashboard.healthScore}/100.`,
      dashboardSummary: input.dashboard.summary,
      pipelineSummary: input.pipeline.summary,
      readinessSummary: input.readiness.summary,
    };
  }
}

export function createOrchestrationContextBuilder(): OrchestrationContextBuilder {
  return new OrchestrationContextBuilder();
}
export function createOrchestrationDashboardBuilder(): OrchestrationDashboardBuilder {
  return new OrchestrationDashboardBuilder();
}
export function createIntelligencePipelineBuilder(): IntelligencePipelineBuilder {
  return new IntelligencePipelineBuilder();
}
export function createModuleCoordinationBuilder(): ModuleCoordinationBuilder {
  return new ModuleCoordinationBuilder();
}
export function createDependencyGraphBuilder(): DependencyGraphBuilder {
  return new DependencyGraphBuilder();
}
export function createExecutionFlowBuilder(): ExecutionFlowBuilder {
  return new ExecutionFlowBuilder();
}
export function createSynchronizationStatusBuilder(): SynchronizationStatusBuilder {
  return new SynchronizationStatusBuilder();
}
export function createSystemHealthBuilder(): SystemHealthBuilder {
  return new SystemHealthBuilder();
}
export function createOrchestrationReadinessBuilder(): OrchestrationReadinessBuilder {
  return new OrchestrationReadinessBuilder();
}
export function createOrchestrationConfidenceBuilder(): OrchestrationConfidenceBuilder {
  return new OrchestrationConfidenceBuilder();
}
export function createDelegationOrchestrationBuilder(): DelegationOrchestrationBuilder {
  return new DelegationOrchestrationBuilder();
}
export function createOrchestrationExplanationBuilder(): OrchestrationExplanationBuilder {
  return new OrchestrationExplanationBuilder();
}
