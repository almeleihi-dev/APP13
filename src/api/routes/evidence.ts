import type { FastifyInstance } from "fastify";
import type { ExecutionService } from "../../execution/application/execution-service.js";

export async function registerEvidenceRoutes(
  app: FastifyInstance,
  execution: ExecutionService
): Promise<void> {
  app.post(
    "/v1/contracts/:contractId/milestones/:milestoneId/evidence/upload-intent",
    { config: { authRequired: true, revalidateIdentity: true } },
    async (request, reply) => {
      const { contractId, milestoneId } = request.params as {
        contractId: string;
        milestoneId: string;
      };
      const body = request.body as {
        evidence_type: string;
        content_hash: string;
        filename?: string;
        content_type?: string;
        storage_key?: string;
        idempotency_key?: string;
      };
      return reply.send(
        await execution.createEvidenceUploadIntent(
          contractId,
          milestoneId,
          request.authContext!.userId,
          {
            evidence_type: body.evidence_type as never,
            content_hash: body.content_hash,
            filename: body.filename,
            content_type: body.content_type,
            storage_key: body.storage_key,
            idempotency_key: body.idempotency_key ?? request.idempotencyKey!,
          }
        )
      );
    }
  );

  app.post(
    "/v1/contracts/:contractId/milestones/:milestoneId/evidence",
    { config: { authRequired: true, revalidateIdentity: true } },
    async (request, reply) => {
      const { contractId, milestoneId } = request.params as {
        contractId: string;
        milestoneId: string;
      };
      const body = request.body as {
        intent_id: string;
        storage_key: string;
        content_hash: string;
        evidence_type: string;
        metadata?: Record<string, unknown>;
        idempotency_key?: string;
      };
      const result = await execution.confirmEvidence(
        contractId,
        milestoneId,
        request.authContext!.userId,
        {
          intent_id: body.intent_id,
          storage_key: body.storage_key,
          content_hash: body.content_hash,
          evidence_type: body.evidence_type as never,
          metadata: body.metadata,
          idempotency_key: body.idempotency_key ?? request.idempotencyKey!,
        }
      );
      return reply.status(201).send(result);
    }
  );

  app.get(
    "/v1/contracts/:contractId/evidence",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { contractId } = request.params as { contractId: string };
      return reply.send(
        await execution.listContractEvidence(contractId, request.authContext!.userId)
      );
    }
  );

  app.get(
    "/v1/contracts/:contractId/milestones/:milestoneId/evidence",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { contractId, milestoneId } = request.params as {
        contractId: string;
        milestoneId: string;
      };
      return reply.send(
        await execution.listMilestoneEvidence(
          contractId,
          milestoneId,
          request.authContext!.userId
        )
      );
    }
  );

  app.get(
    "/v1/evidence/:evidenceId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { evidenceId } = request.params as { evidenceId: string };
      return reply.send(await execution.getEvidence(evidenceId, request.authContext!.userId));
    }
  );

  app.get(
    "/v1/evidence/:evidenceId/download",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { evidenceId } = request.params as { evidenceId: string };
      return reply.send(
        await execution.getEvidenceDownloadUrl(evidenceId, request.authContext!.userId)
      );
    }
  );

  app.post(
    "/v1/contracts/:contractId/attestations/:attestationId/evidence",
    { config: { authRequired: true, revalidateIdentity: true } },
    async (request, reply) => {
      const { contractId, attestationId } = request.params as {
        contractId: string;
        attestationId: string;
      };
      const body = request.body as { evidence_ids: string[]; idempotency_key?: string };
      return reply.send(
        await execution.linkAttestationEvidence(
          contractId,
          attestationId,
          request.authContext!.userId,
          {
            evidence_ids: body.evidence_ids,
            idempotency_key: body.idempotency_key ?? request.idempotencyKey!,
          }
        )
      );
    }
  );

  app.post(
    "/v1/contracts/:contractId/attestations/:attestationId/milestones",
    { config: { authRequired: true, revalidateIdentity: true } },
    async (request, reply) => {
      const { contractId, attestationId } = request.params as {
        contractId: string;
        attestationId: string;
      };
      const body = request.body as { milestone_ids: string[]; idempotency_key?: string };
      return reply.send(
        await execution.linkAttestationMilestones(
          contractId,
          attestationId,
          request.authContext!.userId,
          {
            milestone_ids: body.milestone_ids,
            idempotency_key: body.idempotency_key ?? request.idempotencyKey!,
          }
        )
      );
    }
  );
}
