import type { FastifyInstance } from "fastify";
import type { LivingPartnerEcosystemService } from "../../living-experience/partner-ecosystem/application/living-partner-ecosystem-service.js";
import type { LivingPartnerEcosystemSectionId } from "../../living-experience/partner-ecosystem/domain/partner-schema.js";
import { LIVING_PARTNER_ECOSYSTEM_SECTIONS } from "../../living-experience/partner-ecosystem/domain/partner-schema.js";
import { AppError } from "../../shared/errors/index.js";

const SECTION_ROUTE_MAP: Record<string, LivingPartnerEcosystemSectionId> = {
  best: "todays_best_partner",
  training: "training_partners",
  government: "government_partners",
  financial: "financial_partners",
  insurance: "insurance_partners",
  certification: "certification_partners",
  employment: "employment_partners",
  associations: "professional_associations",
  technology: "technology_partners",
  benefits: "partner_benefits",
  eligibility: "eligibility_analysis",
  connected: "connected_partners",
  next: "next_recommended_partner",
};

function parseSectionId(sectionId: string): LivingPartnerEcosystemSectionId {
  if (!LIVING_PARTNER_ECOSYSTEM_SECTIONS.includes(sectionId as LivingPartnerEcosystemSectionId)) {
    throw new AppError({
      type: "about:blank",
      title: "Not Found",
      status: 404,
      detail: `Unknown partner ecosystem section: ${sectionId}`,
      code: "NOT_FOUND",
    });
  }
  return sectionId as LivingPartnerEcosystemSectionId;
}

export async function registerLivingPartnerEcosystemRoutes(
  app: FastifyInstance,
  livingPartnerEcosystem: LivingPartnerEcosystemService
): Promise<void> {
  app.get(
    "/living-partner-ecosystem",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(livingPartnerEcosystem.getExperience(request.authContext!, query));
    }
  );

  app.get(
    "/living-partner-ecosystem/sections",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(livingPartnerEcosystem.getSections(request.authContext!, query));
    }
  );

  for (const [routeSuffix, sectionId] of Object.entries(SECTION_ROUTE_MAP)) {
    app.get(
      `/living-partner-ecosystem/${routeSuffix}`,
      { config: { authRequired: true } },
      async (request, reply) => {
        const query = request.query as { generated_at?: string };
        return reply.send(livingPartnerEcosystem.getSection(request.authContext!, sectionId, query));
      }
    );
  }

  app.post(
    "/living-partner-ecosystem/connect",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as {
        partner_id?: string;
        name?: string;
        category?: string;
        user_permission_granted?: boolean;
        generated_at?: string;
      };
      return reply.send(
        livingPartnerEcosystem.connectPartner(request.authContext!, {
          partner_id: body.partner_id ?? "",
          name: body.name ?? "Partner",
          category: body.category ?? "general",
          user_permission_granted: body.user_permission_granted ?? false,
          generated_at: body.generated_at,
        })
      );
    }
  );

  app.post(
    "/living-partner-ecosystem/refresh",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(livingPartnerEcosystem.refresh(request.authContext!, body));
    }
  );

  app.get(
    "/living-partner-ecosystem/statistics",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(livingPartnerEcosystem.getStatistics(request.authContext!));
    }
  );

  app.get(
    "/living-partner-ecosystem/section/:sectionId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { sectionId } = request.params as { sectionId: string };
      const query = request.query as { generated_at?: string };
      return reply.send(
        livingPartnerEcosystem.getSection(request.authContext!, parseSectionId(sectionId), query)
      );
    }
  );
}
