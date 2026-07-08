import type { FastifyInstance } from "fastify";
import type { LivingProfessionalIntelligenceService } from "../../living-experience/professional-intelligence/application/living-professional-intelligence-service.js";
import type { LivingProfessionalIntelligenceSectionId } from "../../living-experience/professional-intelligence/domain/intelligence-schema.js";
import { LIVING_PROFESSIONAL_INTELLIGENCE_SECTIONS } from "../../living-experience/professional-intelligence/domain/intelligence-schema.js";
import { AppError } from "../../shared/errors/index.js";

const SECTION_ROUTE_MAP: Record<string, LivingProfessionalIntelligenceSectionId> = {
  summary: "intelligence_summary",
  ask: "ask_anything",
  "best-decision": "todays_best_decision",
  analysis: "professional_analysis",
  opportunities: "professional_opportunities_analysis",
  risks: "professional_risks",
  strengths: "professional_strengths_analysis",
  gaps: "professional_gaps",
  "next-steps": "recommended_next_steps",
  alternatives: "alternative_paths",
  simulator: "decision_simulator",
  confidence: "confidence_explanation",
  history: "professional_intelligence_history",
};

function parseSectionId(sectionId: string): LivingProfessionalIntelligenceSectionId {
  if (!LIVING_PROFESSIONAL_INTELLIGENCE_SECTIONS.includes(sectionId as LivingProfessionalIntelligenceSectionId)) {
    throw new AppError({
      type: "about:blank",
      title: "Not Found",
      status: 404,
      detail: `Unknown professional intelligence section: ${sectionId}`,
      code: "NOT_FOUND",
    });
  }
  return sectionId as LivingProfessionalIntelligenceSectionId;
}

export async function registerLivingProfessionalIntelligenceRoutes(
  app: FastifyInstance,
  livingProfessionalIntelligence: LivingProfessionalIntelligenceService
): Promise<void> {
  app.get(
    "/living-professional-intelligence",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(livingProfessionalIntelligence.getExperience(request.authContext!, query));
    }
  );

  app.get(
    "/living-professional-intelligence/sections",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(livingProfessionalIntelligence.getSections(request.authContext!, query));
    }
  );

  for (const [routeSuffix, sectionId] of Object.entries(SECTION_ROUTE_MAP)) {
    app.get(
      `/living-professional-intelligence/${routeSuffix}`,
      { config: { authRequired: true } },
      async (request, reply) => {
        const query = request.query as { generated_at?: string };
        return reply.send(livingProfessionalIntelligence.getSection(request.authContext!, sectionId, query));
      }
    );
  }

  app.post(
    "/living-professional-intelligence/ask",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { question?: string; generated_at?: string };
      return reply.send(
        livingProfessionalIntelligence.ask(request.authContext!, {
          question: body.question ?? "",
          generated_at: body.generated_at,
        })
      );
    }
  );

  app.post(
    "/living-professional-intelligence/accept",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as {
        record_id?: string;
        recommendation?: string;
        outcome?: string;
        generated_at?: string;
      };
      return reply.send(
        livingProfessionalIntelligence.acceptRecommendation(request.authContext!, {
          record_id: body.record_id ?? "",
          recommendation: body.recommendation ?? "",
          outcome: body.outcome,
          generated_at: body.generated_at,
        })
      );
    }
  );

  app.post(
    "/living-professional-intelligence/ignore",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as {
        record_id?: string;
        recommendation?: string;
        generated_at?: string;
      };
      return reply.send(
        livingProfessionalIntelligence.ignoreRecommendation(request.authContext!, {
          record_id: body.record_id ?? "",
          recommendation: body.recommendation ?? "",
          generated_at: body.generated_at,
        })
      );
    }
  );

  app.post(
    "/living-professional-intelligence/refresh",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(livingProfessionalIntelligence.refresh(request.authContext!, body));
    }
  );

  app.get(
    "/living-professional-intelligence/statistics",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(livingProfessionalIntelligence.getStatistics(request.authContext!));
    }
  );

  app.get(
    "/living-professional-intelligence/section/:sectionId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { sectionId } = request.params as { sectionId: string };
      const query = request.query as { generated_at?: string };
      return reply.send(
        livingProfessionalIntelligence.getSection(request.authContext!, parseSectionId(sectionId), query)
      );
    }
  );
}
