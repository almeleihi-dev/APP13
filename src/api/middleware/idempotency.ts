import type { FastifyReply, FastifyRequest } from "fastify";
import type { IdempotencyService } from "../../platform/idempotency/index.js";
import { hashRequestBody } from "../../platform/idempotency/index.js";

const IDEMPOTENCY_HEADER = "idempotency-key";

export function createIdempotencyPreHandler(service: IdempotencyService) {
  return async function idempotencyPreHandler(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    if (!["POST", "PUT", "PATCH"].includes(request.method)) {
      return;
    }

    const rawKey = request.headers[IDEMPOTENCY_HEADER];
    const key = service.validateKey(
      typeof rawKey === "string" ? rawKey : undefined,
      request.requestId
    );
    request.idempotencyKey = key;

    const body =
      typeof request.body === "string"
        ? request.body
        : JSON.stringify(request.body ?? {});
    const requestHash = hashRequestBody(body);
    request.idempotencyRequestHash = requestHash;

    const replay = await service.begin(key, requestHash, request.requestId);
    if (replay) {
      request.idempotencyReplay = true;
      for (const [header, value] of Object.entries(replay.headers)) {
        reply.header(header, value);
      }
      reply.status(replay.statusCode).send(JSON.parse(replay.body));
    }
  };
}

export function createIdempotencyOnSend(service: IdempotencyService) {
  return async function idempotencyOnSend(
    request: FastifyRequest,
    reply: FastifyReply,
    payload: unknown
  ): Promise<unknown> {
    if (
      !request.idempotencyKey ||
      request.idempotencyReplay ||
      !request.idempotencyRequestHash
    ) {
      return payload;
    }

    if (reply.statusCode >= 200 && reply.statusCode < 300) {
      const body =
        typeof payload === "string"
          ? payload
          : JSON.stringify(payload ?? {});
      await service.complete(
        request.idempotencyKey,
        request.idempotencyRequestHash,
        reply.statusCode,
        { "content-type": "application/json" },
        body
      );
    }

    return payload;
  };
}
