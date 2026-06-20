import type { FastifyInstance } from "fastify";
import type { VerificationService } from "../../identity/application/verification-service.js";

export async function registerVerificationRoutes(
  app: FastifyInstance,
  verification: VerificationService
): Promise<void> {
  app.get(
    "/v1/verifications/me",
    { config: { authRequired: true } },
    async (request, reply) => {
      const result = await verification.getMyVerification(
        request.authContext!.userId
      );
      return reply.send(result);
    }
  );

  app.post(
    "/v1/verifications/t1/start",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as { redirect_url?: string };
      const result = await verification.startT1(
        request.authContext!.userId,
        body.redirect_url
      );
      return reply.send(result);
    }
  );

  app.post(
    "/v1/verifications/t1/complete",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as { session_id: string };
      const result = await verification.completeT1(
        request.authContext!.userId,
        body.session_id
      );
      return reply.send(result);
    }
  );

  app.post(
    "/v1/verifications/t1/webhook",
    {
      config: { authRequired: false, authenticate: false },
    },
    async (request, reply) => {
      const signature = request.headers["x-kyc-signature"];
      const rawBody = JSON.stringify(request.body ?? {});
      verification.verifyWebhookSignature(
        rawBody,
        typeof signature === "string" ? signature : undefined
      );
      const body = request.body as {
        session_id: string;
        result: "approved" | "rejected" | "expired";
        idempotency_key: string;
      };
      await verification.handleT1Webhook(body);
      return reply.status(200).send({ status: "ok" });
    }
  );

  app.post(
    "/v1/credentials",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as {
        credential_type: string;
        issuer: string;
        credential_number?: string;
        expires_at?: string | null;
      };
      const credential = await verification.createCredential(
        request.authContext!.userId,
        body
      );
      return reply.status(201).send(credential);
    }
  );

  app.get(
    "/v1/credentials/me",
    { config: { authRequired: true } },
    async (request, reply) => {
      const result = await verification.listMyCredentials(
        request.authContext!.userId
      );
      return reply.send(result);
    }
  );
}
