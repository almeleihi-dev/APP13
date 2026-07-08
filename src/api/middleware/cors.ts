import type { FastifyReply, FastifyRequest } from "fastify";

/**
 * Reality Bridge ET-1.5 — dependency-free CORS.
 *
 * Enables split frontend/backend deployment (SPA on a CDN, API on its own
 * origin) without adding a package. Allowed origins come from the
 * APP13_CORS_ORIGINS env var (comma-separated). When unset, same-origin is
 * assumed and no CORS headers are emitted (dev uses the Vite proxy).
 *
 * Set e.g. APP13_CORS_ORIGINS=https://anact.app,https://www.anact.app
 * Use "*" only for non-credentialed public APIs.
 */

const ALLOWED_HEADERS = [
  "authorization",
  "content-type",
  "idempotency-key",
  "x-request-id",
  "x-service-id",
].join(", ");

const ALLOWED_METHODS = "GET, POST, PUT, PATCH, DELETE, OPTIONS";

export function parseCorsOrigins(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
}

export function resolveAllowedOrigin(
  requestOrigin: string | undefined,
  allowList: string[]
): string | null {
  if (allowList.length === 0) return null; // same-origin mode: no CORS
  if (allowList.includes("*")) return "*";
  if (requestOrigin && allowList.includes(requestOrigin)) return requestOrigin;
  return null;
}

export function createCorsHook(allowList: string[]) {
  return async function corsHook(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const origin = request.headers.origin;
    const allowed = resolveAllowedOrigin(origin, allowList);

    if (allowed) {
      reply.header("access-control-allow-origin", allowed);
      reply.header("vary", "Origin");
      if (allowed !== "*") {
        reply.header("access-control-allow-credentials", "true");
      }
      reply.header("access-control-allow-methods", ALLOWED_METHODS);
      reply.header("access-control-allow-headers", ALLOWED_HEADERS);
      reply.header("access-control-max-age", "600");
    }

    // Short-circuit preflight before auth/idempotency pre-handlers run.
    if (request.method === "OPTIONS") {
      await reply.status(204).send();
    }
  };
}
