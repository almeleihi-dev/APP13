import type { FastifyInstance } from "fastify";
import type { ProfessionalHomeService } from "../../living-experience/professional-home/application/professional-home-service.js";
import type { ProfessionalHomeSectionId } from "../../living-experience/professional-home/domain/professional-home-schema.js";

const SECTION_ROUTE_MAP: Record<string, ProfessionalHomeSectionId> = {
  greeting: "greeting",
  "todays-best-step": "todays_best_step",
  "best-opportunity": "best_opportunity",
  passport: "professional_passport",
  "live-frame": "live_frame",
  journey: "professional_journey",
  "develop-me": "develop_me",
  "learn-by-action": "learn_by_action",
  "my-team": "my_team",
  "expert-recommendations": "expert_recommendations",
  "knowledge-highlights": "knowledge_highlights",
  "marketplace-snapshot": "marketplace_snapshot",
  "weekly-progress": "weekly_progress",
};

export async function registerProfessionalHomeRoutes(
  app: FastifyInstance,
  professionalHome: ProfessionalHomeService
): Promise<void> {
  app.get(
    "/professional-home",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(professionalHome.getHome(request.authContext!, query));
    }
  );

  app.get(
    "/professional-home/sections",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(professionalHome.getSections(request.authContext!, query));
    }
  );

  for (const [routeSuffix, sectionId] of Object.entries(SECTION_ROUTE_MAP)) {
    app.get(
      `/professional-home/${routeSuffix}`,
      { config: { authRequired: true } },
      async (request, reply) => {
        const query = request.query as { generated_at?: string };
        return reply.send(professionalHome.getSection(request.authContext!, sectionId, query));
      }
    );
  }

  app.post(
    "/professional-home/refresh",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(professionalHome.refresh(request.authContext!, body));
    }
  );

  app.get(
    "/professional-home/statistics",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(professionalHome.getStatistics(request.authContext!));
    }
  );
}
