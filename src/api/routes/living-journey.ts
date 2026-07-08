import type { FastifyInstance } from "fastify";
import type { LivingJourneyService } from "../../living-experience/professional-journey/application/living-journey-service.js";
import type { LivingJourneySectionId } from "../../living-experience/professional-journey/domain/journey-schema.js";
import { LIVING_JOURNEY_SECTIONS } from "../../living-experience/professional-journey/domain/journey-schema.js";
import { AppError } from "../../shared/errors/index.js";

const SECTION_ROUTE_MAP: Record<string, LivingJourneySectionId> = {
  overview: "journey_overview",
  "current-position": "current_position",
  "past-milestones": "past_milestones",
  "todays-position": "todays_position",
  "future-milestones": "future_milestones",
  timeline: "professional_timeline",
  progress: "journey_progress",
  goals: "professional_goals",
  roadmap: "career_roadmap",
  achievements: "achievements",
  challenges: "challenges",
  "next-step": "recommended_next_step",
  projection: "future_projection",
};

function parseSectionId(sectionId: string): LivingJourneySectionId {
  if (!LIVING_JOURNEY_SECTIONS.includes(sectionId as LivingJourneySectionId)) {
    throw new AppError({
      type: "about:blank",
      title: "Not Found",
      status: 404,
      detail: `Unknown journey section: ${sectionId}`,
      code: "NOT_FOUND",
    });
  }
  return sectionId as LivingJourneySectionId;
}

export async function registerLivingJourneyRoutes(
  app: FastifyInstance,
  livingJourney: LivingJourneyService
): Promise<void> {
  app.get(
    "/living-journey",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(livingJourney.getJourney(request.authContext!, query));
    }
  );

  app.get(
    "/living-journey/sections",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(livingJourney.getSections(request.authContext!, query));
    }
  );

  for (const [routeSuffix, sectionId] of Object.entries(SECTION_ROUTE_MAP)) {
    app.get(
      `/living-journey/${routeSuffix}`,
      { config: { authRequired: true } },
      async (request, reply) => {
        const query = request.query as { generated_at?: string };
        return reply.send(livingJourney.getSection(request.authContext!, sectionId, query));
      }
    );
  }

  app.get(
    "/living-journey/partnerships",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(livingJourney.getPartnerships(request.authContext!, query));
    }
  );

  app.post(
    "/living-journey/refresh",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(livingJourney.refresh(request.authContext!, body));
    }
  );

  app.get(
    "/living-journey/statistics",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(livingJourney.getStatistics(request.authContext!));
    }
  );

  app.get(
    "/living-journey/section/:sectionId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { sectionId } = request.params as { sectionId: string };
      const query = request.query as { generated_at?: string };
      return reply.send(
        livingJourney.getSection(request.authContext!, parseSectionId(sectionId), query)
      );
    }
  );
}
