import type { FastifyInstance } from "fastify";
import type { LivingProfessionalSimulatorService } from "../../living-experience/professional-simulator/application/living-professional-simulator-service.js";
import type { LivingProfessionalSimulatorSectionId } from "../../living-experience/professional-simulator/domain/simulator-schema.js";
import { LIVING_PROFESSIONAL_SIMULATOR_SECTIONS } from "../../living-experience/professional-simulator/domain/simulator-schema.js";
import { AppError } from "../../shared/errors/index.js";

const SECTION_ROUTE_MAP: Record<string, LivingProfessionalSimulatorSectionId> = {
  summary: "simulation_summary",
  ask: "ask_what_if",
  career: "career_simulator",
  learning: "learning_simulator",
  income: "income_simulator",
  reputation: "reputation_simulator",
  time: "time_simulator",
  risks: "risk_simulator",
  opportunities: "opportunity_simulator",
  alternatives: "alternative_scenarios",
  assumptions: "assumptions",
  confidence: "confidence_explanation",
  history: "simulation_history",
};

function parseSectionId(sectionId: string): LivingProfessionalSimulatorSectionId {
  if (!LIVING_PROFESSIONAL_SIMULATOR_SECTIONS.includes(sectionId as LivingProfessionalSimulatorSectionId)) {
    throw new AppError({
      type: "about:blank",
      title: "Not Found",
      status: 404,
      detail: `Unknown professional simulator section: ${sectionId}`,
      code: "NOT_FOUND",
    });
  }
  return sectionId as LivingProfessionalSimulatorSectionId;
}

export async function registerLivingProfessionalSimulatorRoutes(
  app: FastifyInstance,
  livingProfessionalSimulator: LivingProfessionalSimulatorService
): Promise<void> {
  app.get(
    "/living-professional-simulator",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(livingProfessionalSimulator.getExperience(request.authContext!, query));
    }
  );

  app.get(
    "/living-professional-simulator/sections",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(livingProfessionalSimulator.getSections(request.authContext!, query));
    }
  );

  for (const [routeSuffix, sectionId] of Object.entries(SECTION_ROUTE_MAP)) {
    app.get(
      `/living-professional-simulator/${routeSuffix}`,
      { config: { authRequired: true } },
      async (request, reply) => {
        const query = request.query as { generated_at?: string };
        return reply.send(livingProfessionalSimulator.getSection(request.authContext!, sectionId, query));
      }
    );
  }

  app.post(
    "/living-professional-simulator/ask",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { question?: string; generated_at?: string };
      return reply.send(
        livingProfessionalSimulator.ask(request.authContext!, {
          question: body.question ?? "",
          generated_at: body.generated_at,
        })
      );
    }
  );

  app.post(
    "/living-professional-simulator/accept",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as {
        record_id?: string;
        scenario?: string;
        outcome?: string;
        generated_at?: string;
      };
      return reply.send(
        livingProfessionalSimulator.acceptSimulation(request.authContext!, {
          record_id: body.record_id ?? "",
          scenario: body.scenario ?? "",
          outcome: body.outcome,
          generated_at: body.generated_at,
        })
      );
    }
  );

  app.post(
    "/living-professional-simulator/ignore",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as {
        record_id?: string;
        scenario?: string;
        generated_at?: string;
      };
      return reply.send(
        livingProfessionalSimulator.ignoreSimulation(request.authContext!, {
          record_id: body.record_id ?? "",
          scenario: body.scenario ?? "",
          generated_at: body.generated_at,
        })
      );
    }
  );

  app.post(
    "/living-professional-simulator/refresh",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(livingProfessionalSimulator.refresh(request.authContext!, body));
    }
  );

  app.get(
    "/living-professional-simulator/statistics",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(livingProfessionalSimulator.getStatistics(request.authContext!));
    }
  );

  app.get(
    "/living-professional-simulator/section/:sectionId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { sectionId } = request.params as { sectionId: string };
      const query = request.query as { generated_at?: string };
      return reply.send(
        livingProfessionalSimulator.getSection(request.authContext!, parseSectionId(sectionId), query)
      );
    }
  );
}
