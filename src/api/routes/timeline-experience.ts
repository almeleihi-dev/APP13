import type { FastifyInstance } from "fastify";
import type { TimelineExperienceService } from "../../runtime-experience/timeline/application/timeline-experience-service.js";
export async function registerTimelineExperienceRoutes(
  app: FastifyInstance,
  timelineExperience: TimelineExperienceService
): Promise<void> {
  app.get(
    "/timeline-experience",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string; reduced_motion?: string };
      return reply.send(
        timelineExperience.getExperience(request.authContext!, {
          generated_at: query.generated_at,
          reduced_motion: query.reduced_motion === "true",
        })
      );
    }
  );

  app.get(
    "/timeline-experience/history",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string; filter?: string };
      return reply.send(
        timelineExperience.getHistory(request.authContext!, {
          generated_at: query.generated_at,
          filter: query.filter,
        })
      );
    }
  );

  app.get(
    "/timeline-experience/detail/:id",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const query = request.query as { generated_at?: string };
      return reply.send(
        timelineExperience.getDetail(request.authContext!, id, query)
      );
    }
  );

  app.get(
    "/timeline-experience/progress",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(timelineExperience.getProgress(request.authContext!, query));
    }
  );

  app.get(
    "/timeline-experience/filters",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(timelineExperience.getFilters(request.authContext!, query));
    }
  );

  app.get(
    "/timeline-experience/validate",
    { config: { authRequired: true } },
    async (_request, reply) => reply.send(timelineExperience.validateRuntime())
  );

  app.post(
    "/timeline-experience/refresh",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(timelineExperience.refresh(request.authContext!, body));
    }
  );

  app.get(
    "/timeline-experience/home",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(timelineExperience.getHome(request.authContext!, query));
    }
  );
}
