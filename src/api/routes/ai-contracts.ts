import type { FastifyInstance } from "fastify";
import type { ContractIntelligenceService } from "../../contract/intelligence/contract-intelligence-service.js";

export async function registerAiContractRoutes(
  app: FastifyInstance,
  intelligence: ContractIntelligenceService
): Promise<void> {
  app.post(
    "/ai/contracts/generate",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as {
        profession?: string;
        requirement_text?: string;
        contract_value?: number;
        currency?: string;
        ai1_result?: Record<string, unknown>;
        ai2_result?: Record<string, unknown>;
      };

      const result = intelligence.generate({
        profession: body.profession,
        requirement_text: body.requirement_text,
        contract_value: body.contract_value,
        currency: body.currency,
        ai1_result: body.ai1_result,
        ai2_result: body.ai2_result,
      });

      return reply.send(result);
    }
  );
}
