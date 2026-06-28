import type { FastifyInstance } from "fastify";
import type { NeedExperienceService } from "../../runtime-experience/need/application/need-experience-service.js";
import { isNeedScreenId } from "../../runtime-experience/need/domain/need-screen.js";
import { AppError } from "../../shared/errors/index.js";

export async function registerNeedExperienceRoutes(
  app: FastifyInstance,
  needExperience: NeedExperienceService
): Promise<void> {
  app.get(
    "/need-experience",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string; reduced_motion?: string };
      return reply.send(
        needExperience.getExperience(request.authContext!, {
          generated_at: query.generated_at,
          reduced_motion: query.reduced_motion === "true",
        })
      );
    }
  );

  app.get(
    "/need-experience/flow",
    { config: { authRequired: true } },
    async (_request, reply) => reply.send(needExperience.getFlow())
  );

  app.get(
    "/need-experience/validate",
    { config: { authRequired: true } },
    async (_request, reply) => reply.send(needExperience.validateRuntime())
  );

  app.get(
    "/need-experience/home",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(needExperience.getHome(request.authContext!, query));
    }
  );

  app.get(
    "/need-experience/search",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(needExperience.getSearch(request.authContext!, query));
    }
  );

  app.get(
    "/need-experience/opportunities",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string; keyword?: string; category?: string };
      return reply.send(needExperience.getOpportunities(request.authContext!, query));
    }
  );

  app.get(
    "/need-experience/request",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string; opportunity_id?: string };
      return reply.send(needExperience.getRequest(request.authContext!, query));
    }
  );

  app.get(
    "/need-experience/transition",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string; progress?: string };
      return reply.send(
        needExperience.getTransition(request.authContext!, {
          generated_at: query.generated_at,
          progress: query.progress ? Number(query.progress) : undefined,
        })
      );
    }
  );

  app.post(
    "/need-experience/search",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as {
        keyword?: string;
        category?: string;
        generated_at?: string;
      };
      return reply.send(
        needExperience.performSearch(request.authContext!, {
          keyword: body.keyword ?? "",
          category: body.category,
          generated_at: body.generated_at,
        })
      );
    }
  );

  app.post(
    "/need-experience/request/continue",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(needExperience.continueRequest(request.authContext!, body));
    }
  );

  app.post(
    "/need-experience/transition/advance",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { progress?: number; generated_at?: string };
      return reply.send(
        needExperience.advanceTransition(request.authContext!, {
          progress: body.progress ?? 0,
          generated_at: body.generated_at,
        })
      );
    }
  );

  app.get(
    "/need-experience/screen/:screenId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { screenId } = request.params as { screenId: string };
      if (!isNeedScreenId(screenId)) {
        throw new AppError({
          type: "about:blank",
          title: "Not Found",
          status: 404,
          detail: `Unknown need screen: ${screenId}`,
          code: "NOT_FOUND",
        });
      }
      const query = request.query as { generated_at?: string; reduced_motion?: string };
      return reply.send(
        needExperience.getScreen(request.authContext!, screenId, {
          generated_at: query.generated_at,
          reduced_motion: query.reduced_motion === "true",
        })
      );
    }
  );
}
