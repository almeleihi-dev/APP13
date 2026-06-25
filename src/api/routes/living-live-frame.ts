import type { FastifyInstance } from "fastify";
import type { LivingLiveFrameService } from "../../living-experience/live-frame/application/living-live-frame-service.js";
import type { LivingLiveFrameSectionId } from "../../living-experience/live-frame/domain/live-frame-schema.js";
import { LIVING_LIVE_FRAME_SECTIONS } from "../../living-experience/live-frame/domain/live-frame-schema.js";
import { AppError } from "../../shared/errors/index.js";

const SECTION_ROUTE_MAP: Record<string, LivingLiveFrameSectionId> = {
  current: "current_live_frame",
  meaning: "frame_meaning",
  "trust-score": "trust_score",
  history: "frame_history",
  progress: "progress",
  "positive-drivers": "positive_drivers",
  "negative-drivers": "negative_drivers",
  growth: "professional_growth",
  recommendations: "recommendations",
  timeline: "timeline",
  achievements: "achievements",
  evidence: "verified_evidence",
  projection: "future_projection",
};

function parseSectionId(sectionId: string): LivingLiveFrameSectionId {
  if (!LIVING_LIVE_FRAME_SECTIONS.includes(sectionId as LivingLiveFrameSectionId)) {
    throw new AppError({
      type: "about:blank",
      title: "Not Found",
      status: 404,
      detail: `Unknown live frame section: ${sectionId}`,
      code: "NOT_FOUND",
    });
  }
  return sectionId as LivingLiveFrameSectionId;
}

export async function registerLivingLiveFrameRoutes(
  app: FastifyInstance,
  livingLiveFrame: LivingLiveFrameService
): Promise<void> {
  app.get(
    "/living-live-frame",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(livingLiveFrame.getFrame(request.authContext!, query));
    }
  );

  app.get(
    "/living-live-frame/sections",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(livingLiveFrame.getSections(request.authContext!, query));
    }
  );

  for (const [routeSuffix, sectionId] of Object.entries(SECTION_ROUTE_MAP)) {
    app.get(
      `/living-live-frame/${routeSuffix}`,
      { config: { authRequired: true } },
      async (request, reply) => {
        const query = request.query as { generated_at?: string };
        return reply.send(livingLiveFrame.getSection(request.authContext!, sectionId, query));
      }
    );
  }

  app.post(
    "/living-live-frame/refresh",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(livingLiveFrame.refresh(request.authContext!, body));
    }
  );

  app.get(
    "/living-live-frame/statistics",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(livingLiveFrame.getStatistics(request.authContext!));
    }
  );

  app.get(
    "/living-live-frame/section/:sectionId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { sectionId } = request.params as { sectionId: string };
      const query = request.query as { generated_at?: string };
      return reply.send(
        livingLiveFrame.getSection(request.authContext!, parseSectionId(sectionId), query)
      );
    }
  );
}
