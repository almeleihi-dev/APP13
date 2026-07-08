import type { FastifyInstance } from "fastify";
import type { LivingProfessionalIdentityService } from "../../living-experience/professional-identity/application/living-professional-identity-service.js";
import type { LivingProfessionalIdentitySectionId } from "../../living-experience/professional-identity/domain/identity-schema.js";
import { LIVING_PROFESSIONAL_IDENTITY_SECTIONS } from "../../living-experience/professional-identity/domain/identity-schema.js";
import { AppError } from "../../shared/errors/index.js";

const SECTION_ROUTE_MAP: Record<string, LivingProfessionalIdentitySectionId> = {
  summary: "identity_summary",
  dna: "professional_dna",
  passport: "professional_passport",
  frame: "live_frame",
  journey: "professional_journey",
  impact: "professional_impact",
  skills: "verified_skills",
  strengths: "professional_strengths",
  opportunities: "professional_opportunities",
  reputation: "professional_reputation",
  network: "professional_network",
  future: "future_identity",
  sharing: "identity_sharing",
};

function parseSectionId(sectionId: string): LivingProfessionalIdentitySectionId {
  if (!LIVING_PROFESSIONAL_IDENTITY_SECTIONS.includes(sectionId as LivingProfessionalIdentitySectionId)) {
    throw new AppError({
      type: "about:blank",
      title: "Not Found",
      status: 404,
      detail: `Unknown professional identity section: ${sectionId}`,
      code: "NOT_FOUND",
    });
  }
  return sectionId as LivingProfessionalIdentitySectionId;
}

export async function registerLivingProfessionalIdentityRoutes(
  app: FastifyInstance,
  livingProfessionalIdentity: LivingProfessionalIdentityService
): Promise<void> {
  app.get(
    "/living-professional-identity",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(livingProfessionalIdentity.getExperience(request.authContext!, query));
    }
  );

  app.get(
    "/living-professional-identity/sections",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(livingProfessionalIdentity.getSections(request.authContext!, query));
    }
  );

  for (const [routeSuffix, sectionId] of Object.entries(SECTION_ROUTE_MAP)) {
    app.get(
      `/living-professional-identity/${routeSuffix}`,
      { config: { authRequired: true } },
      async (request, reply) => {
        const query = request.query as { generated_at?: string };
        return reply.send(livingProfessionalIdentity.getSection(request.authContext!, sectionId, query));
      }
    );
  }

  app.post(
    "/living-professional-identity/sharing-permissions",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as {
        public_view?: boolean;
        partner_view?: boolean;
        employer_view?: boolean;
        government_verification?: boolean;
        generated_at?: string;
      };
      return reply.send(livingProfessionalIdentity.updateSharingPermissions(request.authContext!, body));
    }
  );

  app.post(
    "/living-professional-identity/refresh",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(livingProfessionalIdentity.refresh(request.authContext!, body));
    }
  );

  app.get(
    "/living-professional-identity/statistics",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(livingProfessionalIdentity.getStatistics(request.authContext!));
    }
  );

  app.get(
    "/living-professional-identity/section/:sectionId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { sectionId } = request.params as { sectionId: string };
      const query = request.query as { generated_at?: string };
      return reply.send(
        livingProfessionalIdentity.getSection(request.authContext!, parseSectionId(sectionId), query)
      );
    }
  );
}
