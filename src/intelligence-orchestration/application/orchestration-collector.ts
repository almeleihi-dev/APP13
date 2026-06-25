import type { AuthContext } from "../../shared/auth/index.js";
import type { PersonalAssistantService } from "../../personal-assistant/application/personal-assistant-service.js";
import type { DevelopMeService } from "../../develop-me/application/develop-me-service.js";
import type { LearnByActionService } from "../../learn-by-action/application/learn-by-action-service.js";
import type { ExpertNetworkService } from "../../expert-network/application/expert-network-service.js";
import type { TeamBuilderService } from "../../team-builder/application/team-builder-service.js";
import type { KnowledgeBankService } from "../../knowledge-bank/application/knowledge-bank-service.js";
import type { MarketplaceCompilationService } from "../../marketplace-compilation/application/marketplace-compilation-service.js";
import type { IntelligentPricingService } from "../../intelligent-pricing/application/intelligent-pricing-service.js";
import type { IntelligentCommissionService } from "../../intelligent-commission/application/intelligent-commission-service.js";
import type { ActionBlueprintService } from "../../action-blueprint/application/action-blueprint-service.js";
import type { UnifiedContext } from "../domain/orchestration-context.js";
import {
  createEngineContribution,
  type EngineContribution,
} from "../domain/orchestration-pipeline.js";

export interface OrchestrationEngineDeps {
  personalAssistant: PersonalAssistantService;
  developMe: DevelopMeService;
  learnByAction: LearnByActionService;
  expertNetwork: ExpertNetworkService;
  teamBuilder: TeamBuilderService;
  knowledgeBank: KnowledgeBankService;
  marketplaceCompilation: MarketplaceCompilationService;
  intelligentPricing: IntelligentPricingService;
  intelligentCommission: IntelligentCommissionService;
  actionBlueprint: ActionBlueprintService;
}

export function collectEngineContributions(input: {
  authContext: AuthContext;
  context: UnifiedContext;
  engines: OrchestrationEngineDeps;
}): EngineContribution[] {
  const { authContext, context, engines } = input;
  const contributions: EngineContribution[] = [];
  const required = new Set(context.requiredEngines);

  if (required.has("personal_assistant")) {
    try {
      const today = engines.personalAssistant.getToday(authContext);
      contributions.push(
        createEngineContribution({
          engineId: "personal_assistant",
          contributed: true,
          confidenceScore: Number(today.readiness_score ?? 75),
          summary: String(today.headline),
          payload: today as unknown as Record<string, unknown>,
          collectedAt: context.generatedAt,
        })
      );
    } catch {
      contributions.push(skipped("personal_assistant", context.generatedAt));
    }
  }

  if (required.has("develop_me")) {
    try {
      const overview = engines.developMe.getOverview(authContext);
      contributions.push(
        createEngineContribution({
          engineId: "develop_me",
          contributed: true,
          confidenceScore: Number(overview.readiness_score ?? 70),
          summary: String(overview.headline),
          payload: overview as unknown as Record<string, unknown>,
          collectedAt: context.generatedAt,
        })
      );
    } catch {
      contributions.push(skipped("develop_me", context.generatedAt));
    }
  }

  if (required.has("learn_by_action")) {
    try {
      const overview = engines.learnByAction.getOverview(authContext);
      contributions.push(
        createEngineContribution({
          engineId: "learn_by_action",
          contributed: true,
          confidenceScore: 78,
          summary: String(overview.headline),
          payload: overview as unknown as Record<string, unknown>,
          collectedAt: context.generatedAt,
        })
      );
    } catch {
      contributions.push(skipped("learn_by_action", context.generatedAt));
    }
  }

  if (required.has("expert_network")) {
    try {
      const overview = engines.expertNetwork.getOverview(authContext);
      contributions.push(
        createEngineContribution({
          engineId: "expert_network",
          contributed: true,
          confidenceScore: Number(overview.average_trust_score ?? 80),
          summary: String(overview.headline),
          payload: overview as unknown as Record<string, unknown>,
          collectedAt: context.generatedAt,
        })
      );
    } catch {
      contributions.push(skipped("expert_network", context.generatedAt));
    }
  }

  if (required.has("team_builder")) {
    try {
      const overview = engines.teamBuilder.getOverview(authContext, context.listingId);
      contributions.push(
        createEngineContribution({
          engineId: "team_builder",
          contributed: true,
          confidenceScore: Number(overview.completion_confidence ?? 75),
          summary: String(overview.headline),
          payload: overview as unknown as Record<string, unknown>,
          collectedAt: context.generatedAt,
        })
      );
    } catch {
      contributions.push(skipped("team_builder", context.generatedAt));
    }
  }

  if (required.has("knowledge_bank")) {
    try {
      const overview = engines.knowledgeBank.getOverview(authContext);
      contributions.push(
        createEngineContribution({
          engineId: "knowledge_bank",
          contributed: true,
          confidenceScore: 92,
          summary: String(overview.headline),
          payload: overview as unknown as Record<string, unknown>,
          collectedAt: context.generatedAt,
        })
      );
    } catch {
      contributions.push(skipped("knowledge_bank", context.generatedAt));
    }
  }

  if (required.has("marketplace_compilation")) {
    try {
      const center = engines.marketplaceCompilation.getCenter(authContext);
      contributions.push(
        createEngineContribution({
          engineId: "marketplace_compilation",
          contributed: true,
          confidenceScore: 85,
          summary: String(center.overview.headline),
          payload: center.overview as unknown as Record<string, unknown>,
          collectedAt: context.generatedAt,
        })
      );
    } catch {
      contributions.push(skipped("marketplace_compilation", context.generatedAt));
    }
  }

  if (required.has("intelligent_pricing")) {
    try {
      const center = engines.intelligentPricing.getCenter(authContext);
      contributions.push(
        createEngineContribution({
          engineId: "intelligent_pricing",
          contributed: true,
          confidenceScore: 88,
          summary: String(center.overview.headline),
          payload: center.overview as unknown as Record<string, unknown>,
          collectedAt: context.generatedAt,
        })
      );
    } catch {
      contributions.push(skipped("intelligent_pricing", context.generatedAt));
    }
  }

  if (required.has("intelligent_commission")) {
    try {
      const center = engines.intelligentCommission.getCenter(authContext);
      contributions.push(
        createEngineContribution({
          engineId: "intelligent_commission",
          contributed: true,
          confidenceScore: 86,
          summary: String(center.overview.headline),
          payload: center.overview as unknown as Record<string, unknown>,
          collectedAt: context.generatedAt,
        })
      );
    } catch {
      contributions.push(skipped("intelligent_commission", context.generatedAt));
    }
  }

  if (required.has("action_blueprint")) {
    try {
      const overview = engines.actionBlueprint.getOverview(authContext);
      contributions.push(
        createEngineContribution({
          engineId: "action_blueprint",
          contributed: true,
          confidenceScore: 90,
          summary: String(overview.headline),
          payload: overview as unknown as Record<string, unknown>,
          collectedAt: context.generatedAt,
        })
      );
    } catch {
      contributions.push(skipped("action_blueprint", context.generatedAt));
    }
  }

  for (const engineId of ["execution_blueprint", "tekrr_intelligence", "validation", "governance"] as const) {
    if (!required.has(engineId)) continue;
    contributions.push(
      createEngineContribution({
        engineId,
        contributed: true,
        confidenceScore: 80,
        summary: `${engineId.replace(/_/g, " ")} context included via Knowledge Bank lineage.`,
        payload: { referenced_via: "knowledge_bank" },
        collectedAt: context.generatedAt,
      })
    );
  }

  return contributions.sort((left, right) => left.engineId.localeCompare(right.engineId));
}

function skipped(
  engineId: EngineContribution["engineId"],
  collectedAt: string
): EngineContribution {
  return createEngineContribution({
    engineId,
    contributed: false,
    confidenceScore: 0,
    summary: "Engine did not contribute to this orchestration.",
    payload: {},
    collectedAt,
  });
}
