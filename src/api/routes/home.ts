import type { FastifyInstance, FastifyRequest } from "fastify";
import type { HomeExperienceService } from "../../experience/application/home-experience-service.js";
import type { BrowserSurfaceService } from "../../browser-surface/application/browser-surface-service.js";
import { BROWSER_SURFACE_ROUTE_CONFIG } from "../../browser-surface/domain/browser-surface.js";
import type { AppConfig } from "../../shared/config/index.js";
import type { JwtService } from "../../identity/infrastructure/jwt-service.js";
import type { SessionStore } from "../../identity/infrastructure/session-store.js";
import { createAuthenticateMiddleware } from "../middleware/authenticate.js";
import { unauthorized } from "../../shared/errors/index.js";

export interface HomeRoutesDeps {
  homeExperience: HomeExperienceService;
  browserSurface: BrowserSurfaceService;
  jwt: JwtService;
  sessions: SessionStore;
  config: AppConfig;
}

function isHomeRoutesDeps(deps: HomeExperienceService | HomeRoutesDeps): deps is HomeRoutesDeps {
  return typeof deps === "object" && deps !== null && "browserSurface" in deps;
}

function wantsBrowserHtml(request: FastifyRequest): boolean {
  const accept = request.headers.accept ?? "";
  if (accept.includes("application/json")) {
    return false;
  }
  if (request.authContext) {
    return false;
  }
  const secFetchDest = request.headers["sec-fetch-dest"];
  if (secFetchDest === "document" || secFetchDest === "iframe") {
    return true;
  }
  if (accept.includes("text/html")) {
    return true;
  }
  return !request.headers.authorization;
}

export async function registerHomeRoutes(
  app: FastifyInstance,
  homeExperienceOrDeps: HomeExperienceService | HomeRoutesDeps
): Promise<void> {
  const homeExperience = isHomeRoutesDeps(homeExperienceOrDeps)
    ? homeExperienceOrDeps.homeExperience
    : homeExperienceOrDeps;
  const browserSurface = isHomeRoutesDeps(homeExperienceOrDeps)
    ? homeExperienceOrDeps.browserSurface
    : undefined;
  const authenticateJson =
    browserSurface && isHomeRoutesDeps(homeExperienceOrDeps)
      ? createAuthenticateMiddleware({
          jwt: homeExperienceOrDeps.jwt,
          sessions: homeExperienceOrDeps.sessions,
          config: homeExperienceOrDeps.config,
        })
      : null;

  app.get(
    "/home",
    {
      config: browserSurface ? BROWSER_SURFACE_ROUTE_CONFIG : { authRequired: true },
      ...(browserSurface && authenticateJson
        ? {
            preHandler: async (request, reply) => {
              if (!wantsBrowserHtml(request)) {
                await authenticateJson(request, reply);
                if (!request.authContext) {
                  throw unauthorized(request.requestId);
                }
              }
            },
          }
        : {}),
    },
    async (request, reply) => {
      if (browserSurface && wantsBrowserHtml(request)) {
        return reply
          .type("text/html; charset=utf-8")
          .send(browserSurface.getHomeHubHtml());
      }
      return reply.send(await homeExperience.getHome(request.authContext!));
    }
  );

  app.get("/home/customer", { config: { authRequired: true } }, async (request, reply) => {
    return reply.send(await homeExperience.getCustomerHome(request.authContext!));
  });

  app.get("/home/provider", { config: { authRequired: true } }, async (request, reply) => {
    return reply.send(await homeExperience.getProviderHome(request.authContext!));
  });
}
