import type { FastifyInstance } from "fastify";
import type {
  ContractIntelligenceEngineService,
  ContractIntelligenceQuery,
} from "../../contract-intelligence/application/contract-intelligence-service.js";
import type { ContractScenarioId } from "../../contract-intelligence/domain/contract-intelligence-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

function parseQuery(query: Record<string, unknown>): ContractIntelligenceQuery {
  return {
    scenario_id: query.scenario_id as ContractScenarioId | undefined,
    canonical_action_id:
      typeof query.canonical_action_id === "string" ? query.canonical_action_id : undefined,
    urgency: query.urgency as UrgencyLevel | undefined,
    distance_band: query.distance_band as DistanceBand | undefined,
    intent: typeof query.intent === "string" ? query.intent : undefined,
  };
}

export async function registerContractIntelligenceRoutes(
  app: FastifyInstance,
  contractIntelligenceEngine: ContractIntelligenceEngineService
): Promise<void> {
  app.get(
    "/contract-intelligence",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(contractIntelligenceEngine.getHome(request.authContext!));
    }
  );

  app.get(
    "/contract-intelligence/recommendation",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        contractIntelligenceEngine.getRecommendation(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/contract-intelligence/structure",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        contractIntelligenceEngine.getStructure(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/contract-intelligence/parties",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        contractIntelligenceEngine.getParties(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/contract-intelligence/milestones",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        contractIntelligenceEngine.getMilestones(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/contract-intelligence/explanation",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        contractIntelligenceEngine.getExplanation(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/contract-intelligence/summary",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        contractIntelligenceEngine.getSummary(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );

  app.get(
    "/contract-intelligence/validate",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        contractIntelligenceEngine.validate(
          request.authContext!,
          parseQuery(request.query as Record<string, unknown>)
        )
      );
    }
  );
}
