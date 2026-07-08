import type { FastifyInstance } from "fastify";
import type { LivingProfessionalCareerEngineService } from "../../living-experience/professional-career-engine/application/living-professional-career-engine-service.js";
import type { LivingProfessionalCareerEngineSectionId } from "../../living-experience/professional-career-engine/domain/career-engine-schema.js";
import { LIVING_PROFESSIONAL_CAREER_ENGINE_SECTIONS } from "../../living-experience/professional-career-engine/domain/career-engine-schema.js";
import { AppError } from "../../shared/errors/index.js";

const SECTION_ROUTE_MAP: Record<string, LivingProfessionalCareerEngineSectionId> = {
  summary: "career_engine_summary",
  current: "current_career_position",
  readiness: "career_readiness",
  opportunities: "career_opportunities",
  risks: "career_risks",
  growth: "career_growth_strategy",
  skills: "skill_evolution_strategy",
  financial: "financial_career_strategy",
  leadership: "leadership_strategy",
  decision: "career_decision_engine",
  recommendations: "recommended_next_career_moves",
  confidence: "confidence_explanation",
  history: "career_engine_history",
};

function parseSectionId(sectionId: string): LivingProfessionalCareerEngineSectionId {
  if (!LIVING_PROFESSIONAL_CAREER_ENGINE_SECTIONS.includes(sectionId as LivingProfessionalCareerEngineSectionId)) {
    throw new AppError({
      type: "about:blank",
      title: "Not Found",
      status: 404,
      detail: `Unknown career engine section: ${sectionId}`,
      code: "NOT_FOUND",
    });
  }
  return sectionId as LivingProfessionalCareerEngineSectionId;
}

export async function registerLivingProfessionalCareerEngineRoutes(
  app: FastifyInstance,
  livingProfessionalCareerEngine: LivingProfessionalCareerEngineService
): Promise<void> {
  app.get(
    "/living-professional-career-engine",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(livingProfessionalCareerEngine.getExperience(request.authContext!, query));
    }
  );

  app.get(
    "/living-professional-career-engine/sections",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(livingProfessionalCareerEngine.getSections(request.authContext!, query));
    }
  );

  for (const [routeSuffix, sectionId] of Object.entries(SECTION_ROUTE_MAP)) {
    app.get(
      `/living-professional-career-engine/${routeSuffix}`,
      { config: { authRequired: true } },
      async (request, reply) => {
        const query = request.query as { generated_at?: string };
        return reply.send(livingProfessionalCareerEngine.getSection(request.authContext!, sectionId, query));
      }
    );
  }

  app.post(
    "/living-professional-career-engine/accept",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as {
        record_id?: string;
        insight_title?: string;
        outcome?: string;
        generated_at?: string;
      };
      return reply.send(
        livingProfessionalCareerEngine.acceptInsight(request.authContext!, {
          record_id: body.record_id ?? "",
          insight_title: body.insight_title ?? "",
          outcome: body.outcome,
          generated_at: body.generated_at,
        })
      );
    }
  );

  app.post(
    "/living-professional-career-engine/ignore",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as {
        record_id?: string;
        insight_title?: string;
        generated_at?: string;
      };
      return reply.send(
        livingProfessionalCareerEngine.ignoreInsight(request.authContext!, {
          record_id: body.record_id ?? "",
          insight_title: body.insight_title ?? "",
          generated_at: body.generated_at,
        })
      );
    }
  );

  app.post(
    "/living-professional-career-engine/refresh",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(livingProfessionalCareerEngine.refresh(request.authContext!, body));
    }
  );

  app.get(
    "/living-professional-career-engine/statistics",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(livingProfessionalCareerEngine.getStatistics(request.authContext!));
    }
  );

  app.get(
    "/living-professional-career-engine/section/:sectionId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { sectionId } = request.params as { sectionId: string };
      const query = request.query as { generated_at?: string };
      return reply.send(
        livingProfessionalCareerEngine.getSection(request.authContext!, parseSectionId(sectionId), query)
      );
    }
  );
}
