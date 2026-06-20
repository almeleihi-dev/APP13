import type { FastifyReply, FastifyRequest } from "fastify";
import { randomUUID } from "node:crypto";
import { AppError, problem } from "../../shared/errors/index.js";

const REQUEST_ID_HEADER = "x-request-id";

export function requestIdMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): void {
  const incoming = request.headers[REQUEST_ID_HEADER];
  const requestId =
    typeof incoming === "string" && incoming.length > 0
      ? incoming
      : randomUUID();
  request.requestId = requestId;
  reply.header(REQUEST_ID_HEADER, requestId);
}

export function errorHandler(
  error: Error,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  const requestId = request.requestId;

  if (error instanceof AppError) {
    const body = {
      ...error.problem,
      request_id: requestId ?? error.problem.request_id,
    };
    reply.status(error.problem.status).type("application/problem+json").send(body);
    return;
  }

  request.log.error({ err: error }, "unhandled error");
  const body = problem({
    title: "Internal Server Error",
    status: 500,
    code: "INTERNAL_ERROR",
    engine: "platform",
    detail: "An unexpected error occurred",
    request_id: requestId,
  });
  reply.status(500).type("application/problem+json").send(body);
}

declare module "fastify" {
  interface FastifyRequest {
    requestId?: string;
    authContext?: import("../../shared/auth/index.js").AuthContext | null;
    idempotencyKey?: string;
    idempotencyRequestHash?: string;
    idempotencyReplay?: boolean;
  }
}
