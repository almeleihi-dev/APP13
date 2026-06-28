import type { AuthContext } from "../../shared/auth/index.js";
import type { ExecutionIntelligenceEngineService } from "../../execution-intelligence/application/execution-intelligence-service.js";
import type { ExecutionIntelligenceQuery } from "../../execution-intelligence/application/execution-intelligence-service.js";
import {
  createExecutionIntelligenceRepository,
  type ExecutionIntelligenceRepository,
} from "../../execution-intelligence/infrastructure/execution-intelligence-repository.js";
import { createExecutionIntelligenceEngineService } from "../../execution-intelligence/application/execution-intelligence-service.js";
import type { ActionPlan } from "../../action-planning/domain/action-plan.js";
import type { CanonicalAction } from "../../action-ontology/domain/canonical-action.js";
import type { ContractIntelligenceRecommendation } from "../../contract-intelligence/domain/contract-context.js";
import type { ExecutionIntelligenceGuidance } from "../../execution-intelligence/domain/execution-context.js";
import type { OutcomeIntelligenceContext } from "../domain/outcome-context.js";

export interface UpstreamOutcomeInputs {
  guidance: ExecutionIntelligenceGuidance;
  contract: ContractIntelligenceRecommendation;
  plan: ActionPlan;
  canonicalAction: CanonicalAction;
}

export class OutcomeIntelligenceRepository {
  private readonly executionRepository: ExecutionIntelligenceRepository;
  private readonly executionIntelligenceEngine: ExecutionIntelligenceEngineService;

  constructor(deps?: {
    executionRepository?: ExecutionIntelligenceRepository;
    executionIntelligenceEngine?: ExecutionIntelligenceEngineService;
  }) {
    this.executionRepository = deps?.executionRepository ?? createExecutionIntelligenceRepository();
    this.executionIntelligenceEngine =
      deps?.executionIntelligenceEngine ??
      createExecutionIntelligenceEngineService({ repository: this.executionRepository });
  }

  listOutcomeScenarios() {
    return this.executionRepository.listExecutionScenarios();
  }

  resolveUpstream(
    authContext: AuthContext,
    context: OutcomeIntelligenceContext,
    query: ExecutionIntelligenceQuery
  ): UpstreamOutcomeInputs {
    const { contract, plan, canonicalAction } = this.executionRepository.resolveUpstream(
      authContext,
      {
        scenarioId: context.scenarioId,
        canonicalActionId: context.canonicalActionId,
        urgency: context.urgency,
        distanceBand: context.distanceBand,
        rawIntent: context.rawIntent,
        source: context.source ?? "outcome-intelligence",
      },
      query
    );

    const roadmap = this.executionIntelligenceEngine.getRoadmap(authContext, query);
    const sequencing = this.executionIntelligenceEngine.getSequencing(authContext, query);
    const checkpoints = this.executionIntelligenceEngine.getCheckpoints(authContext, query);
    const acceptance = this.executionIntelligenceEngine.getAcceptance(authContext, query);
    const explanation = this.executionIntelligenceEngine.getExplanation(authContext, query);

    const guidance: ExecutionIntelligenceGuidance = {
      guidanceId: roadmap.guidance_id,
      contractRecommendationId: contract.recommendationId,
      planId: plan.planId,
      canonicalActionId: plan.canonicalActionId,
      scenarioId: contract.scenarioId,
      goal: plan.goal,
      executionRoadmap: roadmap.execution_roadmap,
      orderedMilestones: roadmap.ordered_milestones,
      taskSequencing: sequencing.task_sequencing,
      responsibilityMatrix: sequencing.responsibility_matrix,
      stageEvidence: checkpoints.stage_evidence,
      verificationCheckpoints: checkpoints.verification_checkpoints,
      qualityCheckpoints: checkpoints.quality_checkpoints,
      escrowReleaseCheckpoints: checkpoints.escrow_release_checkpoints,
      acceptanceWorkflow: acceptance.acceptance_workflow,
      exceptionHandling: acceptance.exception_handling,
      recoveryRecommendations: acceptance.recovery_recommendations,
      progressModel: acceptance.progress_model,
      confidence: explanation.confidence,
      explanation: explanation.explanation,
      readOnly: true,
    };

    return { guidance, contract, plan, canonicalAction };
  }
}

export function createOutcomeIntelligenceRepository(
  deps?: ConstructorParameters<typeof OutcomeIntelligenceRepository>[0]
): OutcomeIntelligenceRepository {
  return new OutcomeIntelligenceRepository(deps);
}
