import type { FastifyReply, FastifyRequest } from "fastify";
import { authzService } from "../../platform/authz/index.js";
import { unauthorized } from "../../shared/errors/index.js";

export interface AuthOptions {
  required?: boolean;
}

export function createAuthzMiddleware(options: AuthOptions = { required: false }) {
  return async function authzMiddleware(
    request: FastifyRequest,
    _reply: FastifyReply
  ): Promise<void> {
    const authHeader = request.headers.authorization;
    if (!authHeader && options.required) {
      throw unauthorized(request.requestId);
    }

    // B2 will populate authContext from session/JWT validation
    request.authContext = null;

    if (options.required && !request.authContext) {
      throw unauthorized(request.requestId);
    }

    if (request.authContext) {
      authzService.requireAuthenticated(request.authContext);
    }
  };
}
