import type { FastifyInstance } from "fastify";
import type { ContractExperienceService } from "../../runtime-experience/contract/application/contract-experience-service.js";
import { isContractScreenId } from "../../runtime-experience/contract/domain/contract-screen.js";
import { AppError } from "../../shared/errors/index.js";

export async function registerContractExperienceRoutes(
  app: FastifyInstance,
  contractExperience: ContractExperienceService
): Promise<void> {
  app.get(
    "/contract-experience",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string; reduced_motion?: string };
      return reply.send(
        contractExperience.getExperience(request.authContext!, {
          generated_at: query.generated_at,
          reduced_motion: query.reduced_motion === "true",
        })
      );
    }
  );

  app.post(
    "/contract-experience/enter",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as {
        generated_at?: string;
        need_handoff?: {
          opportunity_id?: string;
          action_summary?: string;
          location?: string;
          schedule?: string;
          notes?: string;
          estimated_cost?: number;
        };
      };
      return reply.send(
        contractExperience.enterFromActionPreview(request.authContext!, {
          generated_at: body.generated_at,
          need_handoff: body.need_handoff
            ? {
                opportunityId: body.need_handoff.opportunity_id,
                actionSummary: body.need_handoff.action_summary ?? "",
                location: body.need_handoff.location ?? "",
                schedule: body.need_handoff.schedule ?? "",
                notes: body.need_handoff.notes ?? "",
                estimatedCost: body.need_handoff.estimated_cost ?? 0,
              }
            : undefined,
        })
      );
    }
  );

  app.get("/contract-experience/flow", { config: { authRequired: true } }, async (_request, reply) =>
    reply.send(contractExperience.getFlow())
  );

  app.get("/contract-experience/validate", { config: { authRequired: true } }, async (_request, reply) =>
    reply.send(contractExperience.validateRuntime())
  );

  const screenRoutes: Array<{ path: string; handler: keyof ContractExperienceService }> = [
    { path: "/contract-experience/home", handler: "getHome" },
    { path: "/contract-experience/review", handler: "getReview" },
    { path: "/contract-experience/parties", handler: "getParties" },
    { path: "/contract-experience/terms", handler: "getTerms" },
    { path: "/contract-experience/timeline", handler: "getTimeline" },
    { path: "/contract-experience/cost", handler: "getCost" },
    { path: "/contract-experience/confirmation", handler: "getConfirmation" },
    { path: "/contract-experience/status", handler: "getStatus" },
  ];

  for (const route of screenRoutes) {
    app.get(route.path, { config: { authRequired: true } }, async (request, reply) => {
      const query = request.query as { generated_at?: string };
      const method = contractExperience[route.handler] as (
        auth: NonNullable<typeof request.authContext>,
        input?: { generated_at?: string }
      ) => unknown;
      return reply.send(method(request.authContext!, query));
    });
  }

  app.post(
    "/contract-experience/confirm",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { confirmed?: boolean; generated_at?: string };
      if (body.confirmed !== true) {
        throw new AppError({
          type: "about:blank",
          title: "Validation Error",
          status: 400,
          detail: "Contract confirmation requires confirmed: true",
          code: "VALIDATION_ERROR",
        });
      }
      return reply.send(
        contractExperience.confirmContract(request.authContext!, {
          confirmed: true,
          generated_at: body.generated_at,
        })
      );
    }
  );

  app.post(
    "/contract-experience/transition/start",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(contractExperience.startTransition(request.authContext!, body));
    }
  );

  app.post(
    "/contract-experience/transition/advance",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { progress?: number; generated_at?: string };
      return reply.send(
        contractExperience.advanceTransition(request.authContext!, {
          progress: body.progress ?? 0,
          generated_at: body.generated_at,
        })
      );
    }
  );

  app.get(
    "/contract-experience/screen/:screenId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { screenId } = request.params as { screenId: string };
      if (!isContractScreenId(screenId)) {
        throw new AppError({
          type: "about:blank",
          title: "Not Found",
          status: 404,
          detail: `Unknown contract screen: ${screenId}`,
          code: "NOT_FOUND",
        });
      }
      const query = request.query as { generated_at?: string; reduced_motion?: string };
      return reply.send(
        contractExperience.getScreen(request.authContext!, screenId, {
          generated_at: query.generated_at,
          reduced_motion: query.reduced_motion === "true",
        })
      );
    }
  );
}
