import type { FastifyInstance } from "fastify";
import type { LivingTodayIActedService } from "../../living-experience/today-i-acted/application/living-today-i-acted-service.js";
import type { LivingTodayIActedSectionId } from "../../living-experience/today-i-acted/domain/acted-schema.js";
import { LIVING_TODAY_I_ACTED_SECTIONS } from "../../living-experience/today-i-acted/domain/acted-schema.js";
import type { EvidenceAttachmentType } from "../../living-experience/today-i-acted/domain/acted-schema.js";
import { AppError } from "../../shared/errors/index.js";

const SECTION_ROUTE_MAP: Record<string, LivingTodayIActedSectionId> = {
  summary: "todays_summary",
  actions: "todays_actions",
  story: "todays_story",
  achievements: "todays_achievements",
  learning: "todays_learning",
  team: "todays_team",
  customers: "todays_customers",
  progress: "todays_progress",
  impact: "todays_impact",
  memory: "professional_memory",
  share: "share_story",
  "evidence-builder": "evidence_builder",
  tomorrow: "tomorrows_suggestion",
};

function parseSectionId(sectionId: string): LivingTodayIActedSectionId {
  if (!LIVING_TODAY_I_ACTED_SECTIONS.includes(sectionId as LivingTodayIActedSectionId)) {
    throw new AppError({
      type: "about:blank",
      title: "Not Found",
      status: 404,
      detail: `Unknown today-i-acted section: ${sectionId}`,
      code: "NOT_FOUND",
    });
  }
  return sectionId as LivingTodayIActedSectionId;
}

export async function registerLivingTodayIActedRoutes(
  app: FastifyInstance,
  livingTodayIActed: LivingTodayIActedService
): Promise<void> {
  app.get(
    "/living-today-i-acted",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(livingTodayIActed.getExperience(request.authContext!, query));
    }
  );

  app.get(
    "/living-today-i-acted/sections",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(livingTodayIActed.getSections(request.authContext!, query));
    }
  );

  for (const [routeSuffix, sectionId] of Object.entries(SECTION_ROUTE_MAP)) {
    app.get(
      `/living-today-i-acted/${routeSuffix}`,
      { config: { authRequired: true } },
      async (request, reply) => {
        const query = request.query as { generated_at?: string };
        return reply.send(livingTodayIActed.getSection(request.authContext!, sectionId, query));
      }
    );
  }

  app.get(
    "/living-today-i-acted/memory/search",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { q?: string };
      return reply.send(livingTodayIActed.searchMemory(request.authContext!, query.q ?? ""));
    }
  );

  app.post(
    "/living-today-i-acted/evidence-builder",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as {
        evidence_id?: string;
        user_permission_granted?: boolean;
        attachment_types?: EvidenceAttachmentType[];
        generated_at?: string;
      };
      return reply.send(
        livingTodayIActed.buildEvidence(request.authContext!, {
          evidence_id: body.evidence_id ?? "",
          user_permission_granted: body.user_permission_granted ?? false,
          attachment_types: body.attachment_types,
          generated_at: body.generated_at,
        })
      );
    }
  );

  app.post(
    "/living-today-i-acted/refresh",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(livingTodayIActed.refresh(request.authContext!, body));
    }
  );

  app.get(
    "/living-today-i-acted/statistics",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(livingTodayIActed.getStatistics(request.authContext!));
    }
  );

  app.get(
    "/living-today-i-acted/section/:sectionId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { sectionId } = request.params as { sectionId: string };
      const query = request.query as { generated_at?: string };
      return reply.send(
        livingTodayIActed.getSection(request.authContext!, parseSectionId(sectionId), query)
      );
    }
  );
}
