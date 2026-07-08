import type { FastifyInstance } from "fastify";
import type { LivingProfessionalGoalsService } from "../../living-experience/professional-goals/application/living-professional-goals-service.js";
import type { LivingProfessionalGoalsSectionId } from "../../living-experience/professional-goals/domain/goals-schema.js";
import { LIVING_PROFESSIONAL_GOALS_SECTIONS } from "../../living-experience/professional-goals/domain/goals-schema.js";
import { AppError } from "../../shared/errors/index.js";

const SECTION_ROUTE_MAP: Record<string, LivingProfessionalGoalsSectionId> = {
  summary: "goals_summary",
  vision: "life_vision",
  "one-year": "one_year_goals",
  "three-years": "three_year_goals",
  "five-years": "five_year_goals",
  milestones: "professional_milestones",
  skills: "skill_development_goals",
  financial: "financial_goals",
  business: "business_leadership_goals",
  progress: "goal_progress",
  recommendations: "goal_recommendations",
  confidence: "confidence_explanation",
  history: "goals_history",
};

function parseSectionId(sectionId: string): LivingProfessionalGoalsSectionId {
  if (!LIVING_PROFESSIONAL_GOALS_SECTIONS.includes(sectionId as LivingProfessionalGoalsSectionId)) {
    throw new AppError({
      type: "about:blank",
      title: "Not Found",
      status: 404,
      detail: `Unknown professional goals section: ${sectionId}`,
      code: "NOT_FOUND",
    });
  }
  return sectionId as LivingProfessionalGoalsSectionId;
}

export async function registerLivingProfessionalGoalsRoutes(
  app: FastifyInstance,
  livingProfessionalGoals: LivingProfessionalGoalsService
): Promise<void> {
  app.get(
    "/living-professional-goals",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(livingProfessionalGoals.getExperience(request.authContext!, query));
    }
  );

  app.get(
    "/living-professional-goals/sections",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(livingProfessionalGoals.getSections(request.authContext!, query));
    }
  );

  for (const [routeSuffix, sectionId] of Object.entries(SECTION_ROUTE_MAP)) {
    app.get(
      `/living-professional-goals/${routeSuffix}`,
      { config: { authRequired: true } },
      async (request, reply) => {
        const query = request.query as { generated_at?: string };
        return reply.send(livingProfessionalGoals.getSection(request.authContext!, sectionId, query));
      }
    );
  }

  app.post(
    "/living-professional-goals/accept",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as {
        record_id?: string;
        goal_title?: string;
        outcome?: string;
        generated_at?: string;
      };
      return reply.send(
        livingProfessionalGoals.acceptGoal(request.authContext!, {
          record_id: body.record_id ?? "",
          goal_title: body.goal_title ?? "",
          outcome: body.outcome,
          generated_at: body.generated_at,
        })
      );
    }
  );

  app.post(
    "/living-professional-goals/ignore",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as {
        record_id?: string;
        goal_title?: string;
        generated_at?: string;
      };
      return reply.send(
        livingProfessionalGoals.ignoreGoal(request.authContext!, {
          record_id: body.record_id ?? "",
          goal_title: body.goal_title ?? "",
          generated_at: body.generated_at,
        })
      );
    }
  );

  app.post(
    "/living-professional-goals/refresh",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(livingProfessionalGoals.refresh(request.authContext!, body));
    }
  );

  app.get(
    "/living-professional-goals/statistics",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(livingProfessionalGoals.getStatistics(request.authContext!));
    }
  );

  app.get(
    "/living-professional-goals/section/:sectionId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { sectionId } = request.params as { sectionId: string };
      const query = request.query as { generated_at?: string };
      return reply.send(
        livingProfessionalGoals.getSection(request.authContext!, parseSectionId(sectionId), query)
      );
    }
  );
}
