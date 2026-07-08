import type { FastifyInstance } from "fastify";
import type { LivingProfessionalImpactService } from "../../living-experience/professional-impact/application/living-professional-impact-service.js";
import type { LivingProfessionalImpactSectionId } from "../../living-experience/professional-impact/domain/impact-schema.js";
import { LIVING_PROFESSIONAL_IMPACT_SECTIONS } from "../../living-experience/professional-impact/domain/impact-schema.js";
import { AppError } from "../../shared/errors/index.js";

const SECTION_ROUTE_MAP: Record<string, LivingProfessionalImpactSectionId> = {
  summary: "professional_impact_summary",
  today: "todays_impact",
  weekly: "weekly_impact",
  monthly: "monthly_growth",
  value: "professional_value",
  income: "income_impact",
  knowledge: "knowledge_impact",
  trust: "trust_impact",
  community: "community_impact",
  career: "career_impact",
  opportunity: "opportunity_impact",
  projection: "future_projection",
  lifetime: "lifetime_impact",
};

function parseSectionId(sectionId: string): LivingProfessionalImpactSectionId {
  if (!LIVING_PROFESSIONAL_IMPACT_SECTIONS.includes(sectionId as LivingProfessionalImpactSectionId)) {
    throw new AppError({
      type: "about:blank",
      title: "Not Found",
      status: 404,
      detail: `Unknown professional impact section: ${sectionId}`,
      code: "NOT_FOUND",
    });
  }
  return sectionId as LivingProfessionalImpactSectionId;
}

export async function registerLivingProfessionalImpactRoutes(
  app: FastifyInstance,
  livingProfessionalImpact: LivingProfessionalImpactService
): Promise<void> {
  app.get(
    "/living-professional-impact",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(livingProfessionalImpact.getExperience(request.authContext!, query));
    }
  );

  app.get(
    "/living-professional-impact/sections",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(livingProfessionalImpact.getSections(request.authContext!, query));
    }
  );

  for (const [routeSuffix, sectionId] of Object.entries(SECTION_ROUTE_MAP)) {
    app.get(
      `/living-professional-impact/${routeSuffix}`,
      { config: { authRequired: true } },
      async (request, reply) => {
        const query = request.query as { generated_at?: string };
        return reply.send(livingProfessionalImpact.getSection(request.authContext!, sectionId, query));
      }
    );
  }

  app.post(
    "/living-professional-impact/refresh",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(livingProfessionalImpact.refresh(request.authContext!, body));
    }
  );

  app.get(
    "/living-professional-impact/statistics",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(livingProfessionalImpact.getStatistics(request.authContext!));
    }
  );

  app.get(
    "/living-professional-impact/section/:sectionId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { sectionId } = request.params as { sectionId: string };
      const query = request.query as { generated_at?: string };
      return reply.send(
        livingProfessionalImpact.getSection(request.authContext!, parseSectionId(sectionId), query)
      );
    }
  );
}
