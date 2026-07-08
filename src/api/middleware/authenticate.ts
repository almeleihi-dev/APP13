import type { FastifyReply, FastifyRequest } from "fastify";
import type { AppConfig } from "../../shared/config/index.js";
import { unauthorized } from "../../shared/errors/index.js";
import type { AuthContext } from "../../shared/auth/index.js";
import type { JwtService } from "../../identity/infrastructure/jwt-service.js";
import type { SessionStore } from "../../identity/infrastructure/session-store.js";
import { isBrowserStaticPath } from "../../browser-static/domain/browser-static.js";

export interface AuthenticateOptions {
  required?: boolean;
}

export function createAuthenticateMiddleware(deps: {
  jwt: JwtService;
  sessions: SessionStore;
  config: AppConfig;
}) {
  return async function authenticate(
    request: FastifyRequest,
    _reply: FastifyReply
  ): Promise<void> {
    if (isBrowserStaticPath(request.url.split("?")[0] ?? request.url)) {
      return;
    }
    if (request.routeOptions.config?.authenticate === false) {
      return;
    }
    if (request.routeOptions.config?.serviceAuth === true) {
      return;
    }
    const authHeader = request.headers.authorization;
    const cookieSessionId = request.cookies?.[deps.config.session.cookieName];

    let bearerToken: string | undefined;
    if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
      bearerToken = authHeader.slice(7);
    }

    if (!bearerToken && !cookieSessionId) {
      const required = request.routeOptions.config?.authRequired === true;
      if (required) {
        throw unauthorized(request.requestId);
      }
      request.authContext = null;
      return;
    }

    try {
      if (bearerToken) {
        const claims = await deps.jwt.verifyAccessToken(bearerToken);
        const session = await deps.sessions.getSession(claims.session_id);
        if (!session || session.userId !== claims.sub) {
          throw unauthorized(request.requestId);
        }
        request.authContext = toAuthContext(session);
        request.sessionId = session.sessionId;
        return;
      }

      if (cookieSessionId) {
        const session = await deps.sessions.getSession(cookieSessionId);
        if (!session) {
          throw unauthorized(request.requestId);
        }
        request.authContext = toAuthContext(session);
        request.sessionId = session.sessionId;
      }
    } catch {
      throw unauthorized(request.requestId);
    }
  };
}

function toAuthContext(session: {
  userId: string;
  roles: AuthContext["roles"];
  tier: AuthContext["tier"];
  status: AuthContext["status"];
  sessionId: string;
}): AuthContext {
  return {
    userId: session.userId,
    roles: session.roles,
    tier: session.tier,
    status: session.status as AuthContext["status"],
    sessionId: session.sessionId,
  };
}

declare module "fastify" {
  interface FastifyRequest {
    sessionId?: string;
  }
  interface FastifyContextConfig {
    authRequired?: boolean;
    authenticate?: boolean;
    serviceAuth?: boolean;
    revalidateIdentity?: boolean;
  }
}
