import type { FastifyInstance } from "fastify";
import type { LivingProfessionalAchievementsService } from "../../living-experience/professional-achievements/application/living-professional-achievements-service.js";
import type { LivingProfessionalAchievementsSectionId } from "../../living-experience/professional-achievements/domain/achievements-schema.js";
import { LIVING_PROFESSIONAL_ACHIEVEMENTS_SECTIONS } from "../../living-experience/professional-achievements/domain/achievements-schema.js";
import { AppError } from "../../shared/errors/index.js";

const SECTION_ROUTE_MAP: Record<string, LivingProfessionalAchievementsSectionId> = {
  summary: "achievements_summary",
  milestones: "professional_milestones",
  certifications: "certifications",
  awards: "awards_honors",
  badges: "professional_badges",
  records: "career_records",
  skills: "skill_achievements",
  financial: "financial_achievements",
  leadership: "leadership_achievements",
  timeline: "achievement_timeline",
  recommendations: "recommended_next_achievements",
  confidence: "confidence_explanation",
  history: "achievement_history",
};

function parseSectionId(sectionId: string): LivingProfessionalAchievementsSectionId {
  if (!LIVING_PROFESSIONAL_ACHIEVEMENTS_SECTIONS.includes(sectionId as LivingProfessionalAchievementsSectionId)) {
    throw new AppError({
      type: "about:blank",
      title: "Not Found",
      status: 404,
      detail: `Unknown professional achievements section: ${sectionId}`,
      code: "NOT_FOUND",
    });
  }
  return sectionId as LivingProfessionalAchievementsSectionId;
}

export async function registerLivingProfessionalAchievementsRoutes(
  app: FastifyInstance,
  livingProfessionalAchievements: LivingProfessionalAchievementsService
): Promise<void> {
  app.get(
    "/living-professional-achievements",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(livingProfessionalAchievements.getExperience(request.authContext!, query));
    }
  );

  app.get(
    "/living-professional-achievements/sections",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(livingProfessionalAchievements.getSections(request.authContext!, query));
    }
  );

  for (const [routeSuffix, sectionId] of Object.entries(SECTION_ROUTE_MAP)) {
    app.get(
      `/living-professional-achievements/${routeSuffix}`,
      { config: { authRequired: true } },
      async (request, reply) => {
        const query = request.query as { generated_at?: string };
        return reply.send(livingProfessionalAchievements.getSection(request.authContext!, sectionId, query));
      }
    );
  }

  app.post(
    "/living-professional-achievements/accept",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as {
        record_id?: string;
        achievement_title?: string;
        outcome?: string;
        generated_at?: string;
      };
      return reply.send(
        livingProfessionalAchievements.acceptAchievement(request.authContext!, {
          record_id: body.record_id ?? "",
          achievement_title: body.achievement_title ?? "",
          outcome: body.outcome,
          generated_at: body.generated_at,
        })
      );
    }
  );

  app.post(
    "/living-professional-achievements/ignore",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as {
        record_id?: string;
        achievement_title?: string;
        generated_at?: string;
      };
      return reply.send(
        livingProfessionalAchievements.ignoreAchievement(request.authContext!, {
          record_id: body.record_id ?? "",
          achievement_title: body.achievement_title ?? "",
          generated_at: body.generated_at,
        })
      );
    }
  );

  app.post(
    "/living-professional-achievements/refresh",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(livingProfessionalAchievements.refresh(request.authContext!, body));
    }
  );

  app.get(
    "/living-professional-achievements/statistics",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(livingProfessionalAchievements.getStatistics(request.authContext!));
    }
  );

  app.get(
    "/living-professional-achievements/section/:sectionId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { sectionId } = request.params as { sectionId: string };
      const query = request.query as { generated_at?: string };
      return reply.send(
        livingProfessionalAchievements.getSection(request.authContext!, parseSectionId(sectionId), query)
      );
    }
  );
}
