import type { FastifyInstance } from "fastify";
import type { AuthService } from "../../identity/application/auth-service.js";
import type { RegistrationService } from "../../identity/application/auth-service.js";

export interface AuthRouteDeps {
  auth: AuthService;
  registration: RegistrationService;
}

export async function registerAuthRoutes(
  app: FastifyInstance,
  deps: AuthRouteDeps
): Promise<void> {
  app.post(
    "/v1/auth/register/customer",
    { config: { authRequired: false } },
    async (request, reply) => {
      const body = request.body as {
        email: string;
        password: string;
        display_name: string;
      };
      const tokens = await deps.registration.registerCustomer({
        email: body.email,
        password: body.password,
        displayName: body.display_name,
      });
      return reply.status(201).send(tokens);
    }
  );

  app.post(
    "/v1/auth/register/provider",
    { config: { authRequired: false } },
    async (request, reply) => {
      const body = request.body as {
        email: string;
        password: string;
        display_name: string;
        business_name: string;
        primary_trade: string;
      };
      const tokens = await deps.registration.registerProvider({
        email: body.email,
        password: body.password,
        displayName: body.display_name,
        businessName: body.business_name,
        primaryTrade: body.primary_trade,
      });
      return reply.status(201).send(tokens);
    }
  );

  app.post(
    "/v1/auth/login",
    { config: { authRequired: false } },
    async (request, reply) => {
      const body = request.body as { email: string; password: string };
      const tokens = await deps.auth.login(body.email, body.password);
      return reply.send(tokens);
    }
  );

  app.post(
    "/v1/auth/token/refresh",
    { config: { authRequired: false } },
    async (request, reply) => {
      const body = request.body as { refresh_token?: string };
      if (!body.refresh_token) {
        return reply.status(400).send({ title: "refresh_token required" });
      }
      const tokens = await deps.auth.refresh(body.refresh_token);
      return reply.send(tokens);
    }
  );

  app.post(
    "/v1/auth/logout",
    { config: { authRequired: true } },
    async (request, reply) => {
      if (request.sessionId) {
        await deps.auth.logout(request.sessionId);
      }
      return reply.status(204).send();
    }
  );

  app.post(
    "/v1/auth/password-reset/request",
    { config: { authRequired: false } },
    async (request, reply) => {
      const body = request.body as { email: string };
      await deps.auth.requestPasswordReset(body.email);
      return reply.status(202).send();
    }
  );

  app.post(
    "/v1/auth/password-reset/confirm",
    { config: { authRequired: false } },
    async (request, reply) => {
      const body = request.body as { token: string; password: string };
      await deps.auth.confirmPasswordReset(body.token, body.password);
      return reply.status(200).send({ status: "ok" });
    }
  );

  app.post(
    "/v1/auth/verify-email/request",
    { config: { authRequired: true } },
    async (request, reply) => {
      await deps.auth.requestEmailVerification(request.authContext!.userId);
      return reply.status(202).send();
    }
  );

  app.post(
    "/v1/auth/verify-email/confirm",
    { config: { authRequired: false } },
    async (request, reply) => {
      const body = request.body as { token: string };
      await deps.auth.confirmEmailVerification(body.token);
      return reply.status(200).send({ status: "verified" });
    }
  );

  app.post(
    "/v1/auth/verify-phone/request",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as { phone: string };
      await deps.auth.requestPhoneVerification(
        request.authContext!.userId,
        body.phone
      );
      return reply.status(202).send();
    }
  );

  app.post(
    "/v1/auth/verify-phone/confirm",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as { otp: string };
      await deps.auth.confirmPhoneVerification(
        request.authContext!.userId,
        body.otp
      );
      return reply.status(200).send({ status: "verified" });
    }
  );

  app.get(
    "/v1/auth/session",
    { config: { authRequired: true } },
    async (request, reply) => {
      const ctx = request.authContext!;
      return reply.send({
        user_id: ctx.userId,
        session_id: request.sessionId,
        roles: ctx.roles,
        tier: ctx.tier,
        expires_at: undefined,
      });
    }
  );
}
