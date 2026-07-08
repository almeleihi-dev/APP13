import type { FastifyInstance } from "fastify";
import type { LivingOpportunitiesService } from "../../living-experience/opportunities/application/living-opportunities-service.js";
import type { LivingOpportunitiesSectionId } from "../../living-experience/opportunities/domain/opportunities-schema.js";
import { LIVING_OPPORTUNITIES_SECTIONS } from "../../living-experience/opportunities/domain/opportunities-schema.js";
import { AppError } from "../../shared/errors/index.js";

const SECTION_ROUTE_MAP: Record<string, LivingOpportunitiesSectionId> = {
  best: "todays_best_opportunity",
  recommended: "recommended_opportunities",
  nearby: "nearby_opportunities",
  marketplace: "marketplace_opportunities",
  government: "government_programs",
  training: "training_opportunities",
  funding: "funding_opportunities",
  team: "team_opportunities",
  expert: "expert_opportunities",
  growth: "growth_opportunities",
  history: "opportunity_history",
  saved: "saved_opportunities",
  tomorrow: "tomorrows_opportunity",
};

function parseSectionId(sectionId: string): LivingOpportunitiesSectionId {
  if (!LIVING_OPPORTUNITIES_SECTIONS.includes(sectionId as LivingOpportunitiesSectionId)) {
    throw new AppError({
      type: "about:blank",
      title: "Not Found",
      status: 404,
      detail: `Unknown opportunities section: ${sectionId}`,
      code: "NOT_FOUND",
    });
  }
  return sectionId as LivingOpportunitiesSectionId;
}

export async function registerLivingOpportunitiesRoutes(
  app: FastifyInstance,
  livingOpportunities: LivingOpportunitiesService
): Promise<void> {
  app.get(
    "/living-opportunities",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(livingOpportunities.getExperience(request.authContext!, query));
    }
  );

  app.get(
    "/living-opportunities/sections",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(livingOpportunities.getSections(request.authContext!, query));
    }
  );

  for (const [routeSuffix, sectionId] of Object.entries(SECTION_ROUTE_MAP)) {
    app.get(
      `/living-opportunities/${routeSuffix}`,
      { config: { authRequired: true } },
      async (request, reply) => {
        const query = request.query as { generated_at?: string };
        return reply.send(livingOpportunities.getSection(request.authContext!, sectionId, query));
      }
    );
  }

  app.get(
    "/living-opportunities/partnerships",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(livingOpportunities.getPartnerships(request.authContext!, query));
    }
  );

  app.post(
    "/living-opportunities/save",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as {
        opportunity_id?: string;
        title?: string;
        category?: string;
        reminder_enabled?: boolean;
        generated_at?: string;
      };
      return reply.send(
        livingOpportunities.saveOpportunity(request.authContext!, {
          opportunity_id: body.opportunity_id ?? "",
          title: body.title ?? "Saved opportunity",
          category: body.category ?? "saved",
          reminder_enabled: body.reminder_enabled,
          generated_at: body.generated_at,
        })
      );
    }
  );

  app.post(
    "/living-opportunities/refresh",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(livingOpportunities.refresh(request.authContext!, body));
    }
  );

  app.get(
    "/living-opportunities/statistics",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(livingOpportunities.getStatistics(request.authContext!));
    }
  );

  app.get(
    "/living-opportunities/section/:sectionId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { sectionId } = request.params as { sectionId: string };
      const query = request.query as { generated_at?: string };
      return reply.send(
        livingOpportunities.getSection(request.authContext!, parseSectionId(sectionId), query)
      );
    }
  );
}
