import type { FastifyInstance } from "fastify";
import type { LivingProfessionalCommunityService } from "../../living-experience/professional-community/application/living-professional-community-service.js";
import type { LivingProfessionalCommunitySectionId } from "../../living-experience/professional-community/domain/community-schema.js";
import { LIVING_PROFESSIONAL_COMMUNITY_SECTIONS } from "../../living-experience/professional-community/domain/community-schema.js";
import { AppError } from "../../shared/errors/index.js";

const SECTION_ROUTE_MAP: Record<string, LivingProfessionalCommunitySectionId> = {
  overview: "community_overview",
  highlight: "todays_community_highlight",
  groups: "professional_groups",
  nearby: "nearby_professionals",
  qa: "questions_and_answers",
  knowledge: "knowledge_contributions",
  helpful: "helpful_contributions",
  experts: "expert_discussions",
  challenges: "community_challenges",
  events: "professional_events",
  collaboration: "collaboration_requests",
  reputation: "community_reputation",
  next: "next_recommended_community_action",
};

function parseSectionId(sectionId: string): LivingProfessionalCommunitySectionId {
  if (!LIVING_PROFESSIONAL_COMMUNITY_SECTIONS.includes(sectionId as LivingProfessionalCommunitySectionId)) {
    throw new AppError({
      type: "about:blank",
      title: "Not Found",
      status: 404,
      detail: `Unknown professional community section: ${sectionId}`,
      code: "NOT_FOUND",
    });
  }
  return sectionId as LivingProfessionalCommunitySectionId;
}

export async function registerLivingProfessionalCommunityRoutes(
  app: FastifyInstance,
  livingProfessionalCommunity: LivingProfessionalCommunityService
): Promise<void> {
  app.get(
    "/living-professional-community",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(livingProfessionalCommunity.getExperience(request.authContext!, query));
    }
  );

  app.get(
    "/living-professional-community/sections",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(livingProfessionalCommunity.getSections(request.authContext!, query));
    }
  );

  for (const [routeSuffix, sectionId] of Object.entries(SECTION_ROUTE_MAP)) {
    app.get(
      `/living-professional-community/${routeSuffix}`,
      { config: { authRequired: true } },
      async (request, reply) => {
        const query = request.query as { generated_at?: string };
        return reply.send(livingProfessionalCommunity.getSection(request.authContext!, sectionId, query));
      }
    );
  }

  app.post(
    "/living-professional-community/refresh",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(livingProfessionalCommunity.refresh(request.authContext!, body));
    }
  );

  app.get(
    "/living-professional-community/statistics",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(livingProfessionalCommunity.getStatistics(request.authContext!));
    }
  );

  app.get(
    "/living-professional-community/section/:sectionId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { sectionId } = request.params as { sectionId: string };
      const query = request.query as { generated_at?: string };
      return reply.send(
        livingProfessionalCommunity.getSection(request.authContext!, parseSectionId(sectionId), query)
      );
    }
  );
}
