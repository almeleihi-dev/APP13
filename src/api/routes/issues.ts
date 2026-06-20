import type { FastifyInstance } from "fastify";
import type { IssueService } from "../../complaint/application/issue-service.js";

export async function registerIssueRoutes(
  app: FastifyInstance,
  issues: IssueService
): Promise<void> {
  app.post(
    "/v1/issues",
    { config: { authRequired: true, revalidateIdentity: true } },
    async (request, reply) => {
      const body = request.body as {
        contract_id: string;
        description: string;
        dimensions?: Array<{ tekrr_dimension: string }>;
        milestone_ids?: string[];
        idempotency_key?: string;
      };
      const result = await issues.createIssue(request.authContext!.userId, {
        contract_id: body.contract_id,
        description: body.description,
        dimensions: body.dimensions,
        milestone_ids: body.milestone_ids,
        idempotency_key: body.idempotency_key ?? request.idempotencyKey!,
      });
      return reply.status(201).send(result);
    }
  );

  app.get(
    "/v1/issues/:issueId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { issueId } = request.params as { issueId: string };
      return reply.send(await issues.getIssue(issueId, request.authContext!.userId));
    }
  );
}
