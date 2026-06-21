import type { FastifyInstance } from "fastify";
import type { SecurityAuthKernelService } from "../../security/auth-kernel-service.js";

export interface SecurityAuthRouteDeps {
  securityAuth: SecurityAuthKernelService;
}

export async function registerSecurityAuthRoutes(
  app: FastifyInstance,
  deps: SecurityAuthRouteDeps
): Promise<void> {
  app.post(
    "/auth/register",
    { config: { authRequired: false } },
    async (request, reply) => {
      const body = request.body as {
        email: string;
        password: string;
        display_name: string;
        role?: "customer" | "provider";
        business_name?: string;
        primary_trade?: string;
      };
      const tokens = await deps.securityAuth.register(
        {
          email: body.email,
          password: body.password,
          displayName: body.display_name,
          role: body.role ?? "customer",
          businessName: body.business_name,
          primaryTrade: body.primary_trade,
        },
        { ipAddress: request.ip, userAgent: request.headers["user-agent"] ?? null }
      );
      return reply.status(201).send(tokens);
    }
  );

  app.post(
    "/auth/login",
    { config: { authRequired: false } },
    async (request, reply) => {
      const body = request.body as { email: string; password: string };
      const tokens = await deps.securityAuth.login(body.email, body.password, {
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"] ?? null,
      });
      return reply.send(tokens);
    }
  );

  app.post(
    "/auth/refresh",
    { config: { authRequired: false } },
    async (request, reply) => {
      const body = request.body as { refresh_token?: string };
      if (!body.refresh_token) {
        return reply.status(400).send({ title: "refresh_token required" });
      }
      const tokens = await deps.securityAuth.refresh(body.refresh_token, {
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"] ?? null,
      });
      return reply.send(tokens);
    }
  );

  app.post(
    "/auth/logout",
    { config: { authRequired: true } },
    async (request, reply) => {
      if (request.sessionId) {
        await deps.securityAuth.logout(
          request.sessionId,
          request.authContext?.userId ?? null,
          { ipAddress: request.ip, userAgent: request.headers["user-agent"] ?? null }
        );
      }
      return reply.status(204).send();
    }
  );

  app.get(
    "/auth/me",
    { config: { authRequired: true } },
    async (request, reply) => {
      if (!request.sessionId) {
        return reply.status(401).send({ title: "Unauthorized" });
      }
      const profile = await deps.securityAuth.me(request.sessionId);
      return reply.send(profile);
    }
  );
}
