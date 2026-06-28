import type { FastifyInstance } from "fastify";
import type { LivingProfessionalTimelineService } from "../../living-experience/professional-timeline/application/living-professional-timeline-service.js";
import type { LivingProfessionalTimelineSectionId } from "../../living-experience/professional-timeline/domain/timeline-schema.js";
import { LIVING_PROFESSIONAL_TIMELINE_SECTIONS } from "../../living-experience/professional-timeline/domain/timeline-schema.js";
import { AppError } from "../../shared/errors/index.js";

const SECTION_ROUTE_MAP: Record<string, LivingProfessionalTimelineSectionId> = {
  summary: "timeline_summary",
  beginning: "professional_beginning",
  education: "education_learning_timeline",
  career: "career_timeline",
  skills: "skills_evolution",
  achievements: "achievement_timeline",
  financial: "financial_timeline",
  leadership: "leadership_timeline",
  "turning-points": "major_turning_points",
  future: "future_timeline_projection",
  insights: "timeline_insights",
  confidence: "confidence_explanation",
  history: "timeline_history",
};

function parseSectionId(sectionId: string): LivingProfessionalTimelineSectionId {
  if (!LIVING_PROFESSIONAL_TIMELINE_SECTIONS.includes(sectionId as LivingProfessionalTimelineSectionId)) {
    throw new AppError({
      type: "about:blank",
      title: "Not Found",
      status: 404,
      detail: `Unknown professional timeline section: ${sectionId}`,
      code: "NOT_FOUND",
    });
  }
  return sectionId as LivingProfessionalTimelineSectionId;
}

export async function registerLivingProfessionalTimelineRoutes(
  app: FastifyInstance,
  livingProfessionalTimeline: LivingProfessionalTimelineService
): Promise<void> {
  app.get(
    "/living-professional-timeline",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(livingProfessionalTimeline.getExperience(request.authContext!, query));
    }
  );

  app.get(
    "/living-professional-timeline/sections",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(livingProfessionalTimeline.getSections(request.authContext!, query));
    }
  );

  for (const [routeSuffix, sectionId] of Object.entries(SECTION_ROUTE_MAP)) {
    app.get(
      `/living-professional-timeline/${routeSuffix}`,
      { config: { authRequired: true } },
      async (request, reply) => {
        const query = request.query as { generated_at?: string };
        return reply.send(livingProfessionalTimeline.getSection(request.authContext!, sectionId, query));
      }
    );
  }

  app.post(
    "/living-professional-timeline/accept",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as {
        record_id?: string;
        insight_title?: string;
        outcome?: string;
        generated_at?: string;
      };
      return reply.send(
        livingProfessionalTimeline.acceptInsight(request.authContext!, {
          record_id: body.record_id ?? "",
          insight_title: body.insight_title ?? "",
          outcome: body.outcome,
          generated_at: body.generated_at,
        })
      );
    }
  );

  app.post(
    "/living-professional-timeline/ignore",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as {
        record_id?: string;
        insight_title?: string;
        generated_at?: string;
      };
      return reply.send(
        livingProfessionalTimeline.ignoreInsight(request.authContext!, {
          record_id: body.record_id ?? "",
          insight_title: body.insight_title ?? "",
          generated_at: body.generated_at,
        })
      );
    }
  );

  app.post(
    "/living-professional-timeline/refresh",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(livingProfessionalTimeline.refresh(request.authContext!, body));
    }
  );

  app.get(
    "/living-professional-timeline/statistics",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(livingProfessionalTimeline.getStatistics(request.authContext!));
    }
  );

  app.get(
    "/living-professional-timeline/section/:sectionId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { sectionId } = request.params as { sectionId: string };
      const query = request.query as { generated_at?: string };
      return reply.send(
        livingProfessionalTimeline.getSection(request.authContext!, parseSectionId(sectionId), query)
      );
    }
  );
}
