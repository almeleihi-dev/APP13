import type { FastifyInstance } from "fastify";
import type { LivingProfessionalCoachService } from "../../living-experience/professional-coach/application/living-professional-coach-service.js";
import type { LivingProfessionalCoachSectionId } from "../../living-experience/professional-coach/domain/coach-schema.js";
import { LIVING_PROFESSIONAL_COACH_SECTIONS } from "../../living-experience/professional-coach/domain/coach-schema.js";
import { AppError } from "../../shared/errors/index.js";

const SECTION_ROUTE_MAP: Record<string, LivingProfessionalCoachSectionId> = {
  briefing: "morning_briefing",
  "best-action": "todays_one_best_action",
  priorities: "priority_planner",
  opportunity: "opportunity_advisor",
  risks: "professional_risk_alerts",
  learning: "learning_coach",
  career: "career_coach",
  community: "community_coach",
  partner: "partner_coach",
  reflection: "productivity_reflection",
  forecast: "todays_achievement_forecast",
  tomorrow: "tomorrow_preparation",
  memory: "coach_memory",
};

function parseSectionId(sectionId: string): LivingProfessionalCoachSectionId {
  if (!LIVING_PROFESSIONAL_COACH_SECTIONS.includes(sectionId as LivingProfessionalCoachSectionId)) {
    throw new AppError({
      type: "about:blank",
      title: "Not Found",
      status: 404,
      detail: `Unknown professional coach section: ${sectionId}`,
      code: "NOT_FOUND",
    });
  }
  return sectionId as LivingProfessionalCoachSectionId;
}

export async function registerLivingProfessionalCoachRoutes(
  app: FastifyInstance,
  livingProfessionalCoach: LivingProfessionalCoachService
): Promise<void> {
  app.get(
    "/living-professional-coach",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(livingProfessionalCoach.getExperience(request.authContext!, query));
    }
  );

  app.get(
    "/living-professional-coach/sections",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(livingProfessionalCoach.getSections(request.authContext!, query));
    }
  );

  for (const [routeSuffix, sectionId] of Object.entries(SECTION_ROUTE_MAP)) {
    app.get(
      `/living-professional-coach/${routeSuffix}`,
      { config: { authRequired: true } },
      async (request, reply) => {
        const query = request.query as { generated_at?: string };
        return reply.send(livingProfessionalCoach.getSection(request.authContext!, sectionId, query));
      }
    );
  }

  app.post(
    "/living-professional-coach/accept",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as {
        recommendation?: string;
        outcome?: string;
        generated_at?: string;
      };
      return reply.send(
        livingProfessionalCoach.acceptRecommendation(request.authContext!, {
          recommendation: body.recommendation ?? "",
          outcome: body.outcome,
          generated_at: body.generated_at,
        })
      );
    }
  );

  app.post(
    "/living-professional-coach/refresh",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(livingProfessionalCoach.refresh(request.authContext!, body));
    }
  );

  app.get(
    "/living-professional-coach/statistics",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(livingProfessionalCoach.getStatistics(request.authContext!));
    }
  );

  app.get(
    "/living-professional-coach/section/:sectionId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { sectionId } = request.params as { sectionId: string };
      const query = request.query as { generated_at?: string };
      return reply.send(
        livingProfessionalCoach.getSection(request.authContext!, parseSectionId(sectionId), query)
      );
    }
  );
}
