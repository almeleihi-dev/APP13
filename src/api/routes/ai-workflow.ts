import type { FastifyInstance } from "fastify";
import type { WorkflowIntelligenceService } from "../../orchestrator/intelligence/workflow-intelligence-service.js";
import type { WorkflowAnalyzeInput } from "../../orchestrator/intelligence/types.js";

export async function registerAiWorkflowRoutes(
  app: FastifyInstance,
  intelligence: WorkflowIntelligenceService
): Promise<void> {
  app.post(
    "/ai/workflow/analyze",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as Partial<WorkflowAnalyzeInput>;

      const result = intelligence.analyze({
        profession: body.profession,
        requirement_text: body.requirement_text ?? "",
        customer_budget: body.customer_budget,
        customer_days: body.customer_days,
        providers: body.providers ?? [],
      });

      return reply.send(result);
    }
  );
}
