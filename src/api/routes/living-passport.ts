import type { FastifyInstance } from "fastify";
import type { LivingPassportService } from "../../living-experience/professional-passport/application/living-passport-service.js";
import type { LivingPassportSectionId } from "../../living-experience/professional-passport/domain/passport-schema.js";
import type { PartnerType } from "../../living-experience/professional-passport/domain/passport-schema.js";
import { LIVING_PASSPORT_SECTIONS, PARTNER_TYPES } from "../../living-experience/professional-passport/domain/passport-schema.js";
import { AppError } from "../../shared/errors/index.js";

const SECTION_ROUTE_MAP: Record<string, LivingPassportSectionId> = {
  identity: "professional_identity",
  score: "professional_score",
  "live-frame": "live_frame",
  skills: "verified_skills",
  actions: "unlocked_actions",
  roles: "professional_roles",
  credentials: "certificates_licenses",
  experience: "professional_experience",
  "trust-timeline": "trust_timeline",
  knowledge: "knowledge_contributions",
  impact: "professional_impact",
  journey: "career_journey",
  sharing: "sharing_verification",
};

function parseSectionId(sectionId: string): LivingPassportSectionId {
  if (!LIVING_PASSPORT_SECTIONS.includes(sectionId as LivingPassportSectionId)) {
    throw new AppError({
      type: "about:blank",
      title: "Not Found",
      status: 404,
      detail: `Unknown passport section: ${sectionId}`,
      code: "NOT_FOUND",
    });
  }
  return sectionId as LivingPassportSectionId;
}

function parsePartnerType(partnerType: string): PartnerType {
  if (!PARTNER_TYPES.includes(partnerType as PartnerType)) {
    throw new AppError({
      type: "about:blank",
      title: "Bad Request",
      status: 400,
      detail: `Unknown partner type: ${partnerType}`,
      code: "VALIDATION_ERROR",
    });
  }
  return partnerType as PartnerType;
}

export async function registerLivingPassportRoutes(
  app: FastifyInstance,
  livingPassport: LivingPassportService
): Promise<void> {
  app.get(
    "/living-passport",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(livingPassport.getPassport(request.authContext!, query));
    }
  );

  app.get(
    "/living-passport/sections",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(livingPassport.getSections(request.authContext!, query));
    }
  );

  for (const [routeSuffix, sectionId] of Object.entries(SECTION_ROUTE_MAP)) {
    app.get(
      `/living-passport/${routeSuffix}`,
      { config: { authRequired: true } },
      async (request, reply) => {
        const query = request.query as { generated_at?: string };
        return reply.send(livingPassport.getSection(request.authContext!, sectionId, query));
      }
    );
  }

  app.get(
    "/living-passport/partners",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(livingPassport.getPartners(request.authContext!));
    }
  );

  app.post(
    "/living-passport/partners/approve",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as { partner_type: string; partner_name: string };
      return reply.send(
        livingPassport.approvePartner(request.authContext!, {
          partner_type: parsePartnerType(body.partner_type),
          partner_name: body.partner_name,
        })
      );
    }
  );

  app.post(
    "/living-passport/partners/revoke",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = request.body as { partner_type: string; partner_name: string };
      return reply.send(
        livingPassport.revokePartner(request.authContext!, {
          partner_type: parsePartnerType(body.partner_type),
          partner_name: body.partner_name,
        })
      );
    }
  );

  app.post(
    "/living-passport/refresh",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(livingPassport.refresh(request.authContext!, body));
    }
  );

  app.get(
    "/living-passport/statistics",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(livingPassport.getStatistics(request.authContext!));
    }
  );

  // Support direct section id lookup for completeness
  app.get(
    "/living-passport/section/:sectionId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { sectionId } = request.params as { sectionId: string };
      const query = request.query as { generated_at?: string };
      return reply.send(
        livingPassport.getSection(request.authContext!, parseSectionId(sectionId), query)
      );
    }
  );
}
