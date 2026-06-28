import type { FastifyInstance } from "fastify";
import type { LivingProfessionalAnalyticsService } from "../../living-experience/professional-analytics/application/living-professional-analytics-service.js";
import type { LivingProfessionalAnalyticsSectionId } from "../../living-experience/professional-analytics/domain/analytics-schema.js";
import { LIVING_PROFESSIONAL_ANALYTICS_SECTIONS } from "../../living-experience/professional-analytics/domain/analytics-schema.js";
import { AppError } from "../../shared/errors/index.js";

const SECTION_ROUTE_MAP: Record<string, LivingProfessionalAnalyticsSectionId> = {
  summary: "analytics_summary",
  growth: "professional_growth",
  performance: "performance_metrics",
  skills: "skills_analytics",
  financial: "financial_analytics",
  productivity: "productivity_analytics",
  opportunities: "opportunity_analytics",
  risks: "risk_analytics",
  achievements: "achievement_analytics",
  trends: "trend_analysis",
  insights: "recommended_insights",
  confidence: "confidence_explanation",
  history: "analytics_history",
};

function parseSectionId(sectionId: string): LivingProfessionalAnalyticsSectionId {
  if (!LIVING_PROFESSIONAL_ANALYTICS_SECTIONS.includes(sectionId as LivingProfessionalAnalyticsSectionId)) {
    throw new AppError({
      type: "about:blank",
      title: "Not Found",
      status: 404,
      detail: `Unknown professional analytics section: ${sectionId}`,
      code: "NOT_FOUND",
    });
  }
  return sectionId as LivingProfessionalAnalyticsSectionId;
}

export async function registerLivingProfessionalAnalyticsRoutes(
  app: FastifyInstance,
  livingProfessionalAnalytics: LivingProfessionalAnalyticsService
): Promise<void> {
  app.get(
    "/living-professional-analytics",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(livingProfessionalAnalytics.getExperience(request.authContext!, query));
    }
  );

  app.get(
    "/living-professional-analytics/sections",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(livingProfessionalAnalytics.getSections(request.authContext!, query));
    }
  );

  for (const [routeSuffix, sectionId] of Object.entries(SECTION_ROUTE_MAP)) {
    app.get(
      `/living-professional-analytics/${routeSuffix}`,
      { config: { authRequired: true } },
      async (request, reply) => {
        const query = request.query as { generated_at?: string };
        return reply.send(livingProfessionalAnalytics.getSection(request.authContext!, sectionId, query));
      }
    );
  }

  app.post(
    "/living-professional-analytics/accept",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as {
        record_id?: string;
        insight_title?: string;
        outcome?: string;
        generated_at?: string;
      };
      return reply.send(
        livingProfessionalAnalytics.acceptInsight(request.authContext!, {
          record_id: body.record_id ?? "",
          insight_title: body.insight_title ?? "",
          outcome: body.outcome,
          generated_at: body.generated_at,
        })
      );
    }
  );

  app.post(
    "/living-professional-analytics/ignore",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as {
        record_id?: string;
        insight_title?: string;
        generated_at?: string;
      };
      return reply.send(
        livingProfessionalAnalytics.ignoreInsight(request.authContext!, {
          record_id: body.record_id ?? "",
          insight_title: body.insight_title ?? "",
          generated_at: body.generated_at,
        })
      );
    }
  );

  app.post(
    "/living-professional-analytics/refresh",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(livingProfessionalAnalytics.refresh(request.authContext!, body));
    }
  );

  app.get(
    "/living-professional-analytics/statistics",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(livingProfessionalAnalytics.getStatistics(request.authContext!));
    }
  );

  app.get(
    "/living-professional-analytics/section/:sectionId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { sectionId } = request.params as { sectionId: string };
      const query = request.query as { generated_at?: string };
      return reply.send(
        livingProfessionalAnalytics.getSection(request.authContext!, parseSectionId(sectionId), query)
      );
    }
  );
}
